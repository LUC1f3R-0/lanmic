#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# LANMIC FRONTEND - REMOVE OBSOLETE API KEY + FIX CSRF COOKIE
# ============================================================
#
# Run from the Next.js frontend directory:
#
#   chmod +x fix-lanmic-frontend-cors.sh
#   ./fix-lanmic-frontend-cors.sh
#
# This script:
# - removes NEXT_PUBLIC_API_KEY from frontend env files
# - removes every x-api-key header from frontend source files
# - changes the CSRF cookie name from csrf-token to csrf_token
# - preserves all unrelated frontend code
# - creates a timestamped backup
# - removes the stale .next cache
# - runs the production build
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "$SCRIPT_DIR/package.json" && -d "$SCRIPT_DIR/src" ]]; then
  FRONTEND_DIR="$SCRIPT_DIR"
elif [[ -f "$PWD/package.json" && -d "$PWD/src" ]]; then
  FRONTEND_DIR="$PWD"
else
  echo "Error: Run this script from the Next.js frontend directory."
  exit 1
fi

cd "$FRONTEND_DIR"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$FRONTEND_DIR/.security-fix-backup/frontend-cors-$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

echo "LANMIC frontend root: $FRONTEND_DIR"
echo "Backup directory: $BACKUP_DIR"
echo ""

mapfile -d '' SOURCE_FILES < <(
  find src \
    -type f \
    \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) \
    -print0
)

ENV_FILES=(
  ".env"
  ".env.local"
  ".env.development"
  ".env.development.local"
  ".env.production"
  ".env.production.local"
  ".env.test"
  ".env.test.local"
  ".env.example"
)

backup_file() {
  local file="$1"

  if [[ -f "$file" ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp -a "$file" "$BACKUP_DIR/$file"
  fi
}

# Back up only files that actually contain values being changed.
for file in "${SOURCE_FILES[@]}"; do
  if grep -Eq 'NEXT_PUBLIC_API_KEY|x-api-key|csrf-token' "$file"; then
    backup_file "$file"
  fi
done

for file in "${ENV_FILES[@]}"; do
  if [[ -f "$file" ]] && grep -Eq '^[[:space:]]*NEXT_PUBLIC_API_KEY[[:space:]]*=' "$file"; then
    backup_file "$file"
  fi
done

python3 - <<'PY'
from __future__ import annotations

import re
from pathlib import Path

root = Path.cwd()
source_extensions = {".ts", ".tsx", ".js", ".jsx"}

changed: list[Path] = []

# Remove the public API key from every frontend environment file.
for name in (
    ".env",
    ".env.local",
    ".env.development",
    ".env.development.local",
    ".env.production",
    ".env.production.local",
    ".env.test",
    ".env.test.local",
    ".env.example",
):
    path = root / name

    if not path.exists():
        continue

    original = path.read_text(encoding="utf-8")
    updated = re.sub(
        r"(?m)^[ \t]*NEXT_PUBLIC_API_KEY[ \t]*=.*(?:\n|$)",
        "",
        original,
    )

    if updated != original:
        path.write_text(updated, encoding="utf-8")
        changed.append(path)

for path in (root / "src").rglob("*"):
    if not path.is_file() or path.suffix not in source_extensions:
        continue

    original = path.read_text(encoding="utf-8")
    updated = original

    # Remove object properties such as:
    # 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
    updated = re.sub(
        r"""(?mx)
        ^[ \t]*
        ['"]x-api-key['"]
        [ \t]*:[ \t]*
        process\.env\.NEXT_PUBLIC_API_KEY
        [ \t]*\|\|[ \t]*
        ['"]{2}
        [ \t]*,?
        [ \t]*(?:\/\/[^\n]*)?
        \n?
        """,
        "",
        updated,
    )

    # Remove object properties where the expression is split over lines.
    updated = re.sub(
        r"""(?mx)
        ^[ \t]*
        ['"]x-api-key['"]
        [ \t]*:
        [ \t]*\n
        [ \t]*process\.env\.NEXT_PUBLIC_API_KEY
        [ \t]*\|\|[ \t]*['"]{2}
        [ \t]*,?
        [ \t]*(?:\/\/[^\n]*)?
        \n?
        """,
        "",
        updated,
    )

    # Remove assignments such as:
    # requestConfig.headers['x-api-key'] =
    #   process.env.NEXT_PUBLIC_API_KEY || '';
    updated = re.sub(
        r"""(?mx)
        ^[ \t]*
        [A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*
        \.headers
        \[
          ['"]x-api-key['"]
        \]
        [ \t]*=
        [ \t]*(?:\n[ \t]*)?
        process\.env\.NEXT_PUBLIC_API_KEY
        [ \t]*\|\|[ \t]*['"]{2}
        [ \t]*;
        [ \t]*(?:\/\/[^\n]*)?
        \n?
        """,
        "",
        updated,
    )

    # Remove any remaining direct API-key header line that uses the public env var.
    updated = re.sub(
        r"""(?mx)
        ^[^\n]*
        x-api-key
        [^\n]*
        NEXT_PUBLIC_API_KEY
        [^\n]*
        \n?
        """,
        "",
        updated,
    )

    # The hardened backend writes the non-httpOnly CSRF cookie as csrf_token.
    updated = updated.replace("csrf-token", "csrf_token")

    # Remove obsolete comments referring to the removed public API key header.
    updated = re.sub(
        r"(?mi)^[ \t]*//[^\n]*(?:API key|x-api-key)[^\n]*\n?",
        "",
        updated,
    )

    if updated != original:
        path.write_text(updated, encoding="utf-8")
        changed.append(path)

if changed:
    print("Changed files:")
    for path in sorted(set(changed)):
        print(f"  - {path.relative_to(root)}")
else:
    print("No matching frontend source or env values required changes.")
PY

echo ""
echo "Checking that obsolete API-key code is gone..."

if grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=.git \
  --exclude-dir=.security-fix-backup \
  'NEXT_PUBLIC_API_KEY|x-api-key' \
  src .env* 2>/dev/null
then
  echo ""
  echo "Error: Some obsolete API-key references remain."
  echo "They are listed above. No build was attempted."
  exit 1
fi

echo "No NEXT_PUBLIC_API_KEY or x-api-key references remain."

echo ""
echo "Checking CSRF cookie name..."

if grep -RIn \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=.git \
  --exclude-dir=.security-fix-backup \
  'csrf-token' \
  src 2>/dev/null
then
  echo ""
  echo "Error: An old csrf-token cookie reference remains."
  exit 1
fi

echo "Frontend now uses csrf_token."

echo ""
echo "Removing stale Next.js build cache..."
rm -rf .next

echo ""
echo "Running TypeScript check..."
npx tsc --noEmit

echo ""
echo "Building Next.js frontend..."
npm run build

echo ""
echo "============================================================"
echo "Frontend CORS/API-key repair completed successfully."
echo "============================================================"
echo ""
echo "Backup created at:"
echo "  $BACKUP_DIR"
echo ""
echo "Your frontend environment file should now contain only:"
echo "  NEXT_PUBLIC_API_URL=http://localhost:3002"
echo ""
echo "Restart the frontend development server:"
echo "  npm run dev"
