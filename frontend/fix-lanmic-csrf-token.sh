#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "$SCRIPT_DIR/package.json" && -f "$SCRIPT_DIR/src/lib/api.ts" ]]; then
  FRONTEND_DIR="$SCRIPT_DIR"
elif [[ -f "$PWD/package.json" && -f "$PWD/src/lib/api.ts" ]]; then
  FRONTEND_DIR="$PWD"
else
  echo "Error: Run this script from the Next.js frontend directory."
  exit 1
fi

cd "$FRONTEND_DIR"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$FRONTEND_DIR/.security-fix-backup/csrf-$TIMESTAMP"
mkdir -p "$BACKUP_DIR/src/lib"
cp -a src/lib/api.ts "$BACKUP_DIR/src/lib/api.ts"

python3 - <<'PY'
from pathlib import Path
import re

path = Path('src/lib/api.ts')
source = path.read_text(encoding='utf-8')

pattern = re.compile(
    r"""
    (?P<indent>^[ \t]*)
    private[ \t]+async[ \t]+ensureCsrfToken
    \(\)
    :[ \t]*Promise<string[ \t]*\|[ \t]*null>
    [ \t]*\{
    .*?
    ^(?P=indent)\}
    (?=\s*\n\s*private[ \t]+setupInterceptors)
    """,
    re.MULTILINE | re.DOTALL | re.VERBOSE,
)

replacement = """  private getRawCsrfTokenFromCookie(): string | null {
    const cookieValue = this.getCookie('csrf_token');

    if (!cookieValue) {
      return null;
    }

    // The backend stores the cookie as rawToken.signature.
    // Only rawToken must be sent in the X-CSRF-Token header.
    const [rawToken] = cookieValue.split('.');

    return rawToken || null;
  }

  private async ensureCsrfToken(): Promise<string> {
    const existingToken = this.getRawCsrfTokenFromCookie();

    if (existingToken) {
      return existingToken;
    }

    const response = await axios.get<{ csrfToken: string }>(
      `${config.api.baseURL}/auth/csrf-token`,
      {
        withCredentials: true,
      },
    );

    const csrfToken =
      response.data?.csrfToken || this.getRawCsrfTokenFromCookie();

    if (!csrfToken) {
      throw new Error('Unable to initialize CSRF protection');
    }

    return csrfToken;
  }"""

updated, count = pattern.subn(replacement, source, count=1)
if count != 1:
    raise SystemExit(
        'Could not find ensureCsrfToken() in src/lib/api.ts. No changes were written.'
    )

path.write_text(updated, encoding='utf-8')
print('Updated: src/lib/api.ts')
PY

npx prettier --write src/lib/api.ts
rm -rf .next
npx tsc --noEmit
npm run build

echo
echo "CSRF fix completed successfully."
echo "Backup: $BACKUP_DIR"
echo
echo "Restart with: npm run dev"
echo "If needed, clear stale cookies in DevTools Console:"
echo "document.cookie = 'csrf_token=; Max-Age=0; path=/';"
echo "document.cookie = 'csrf-token=; Max-Age=0; path=/';"
echo "location.reload();"
