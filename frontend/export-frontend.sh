#!/usr/bin/env bash

set -euo pipefail

# Get the directory where this script is located.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FRONTEND_DIR="$SCRIPT_DIR"
OUTPUT_FILE="$SCRIPT_DIR/react-frontend-codebase.txt"

echo "Starting React frontend export..."

# Delete the previous export if it exists.
rm -f "$OUTPUT_FILE"

{
    echo "================================================================================"
    echo "REACT FRONTEND CODEBASE EXPORT"
    echo "================================================================================"
    echo "Generated: $(date -Iseconds)"
    echo "Source directory: $FRONTEND_DIR"
    echo ""
    echo "Important:"
    echo "- node_modules, build files, images, fonts and secrets are excluded."
    echo "- .env.example is included when available."
    echo ""
} > "$OUTPUT_FILE"

find "$FRONTEND_DIR" \
    -type d \( \
        -name "node_modules" \
        -o -name "dist" \
        -o -name "build" \
        -o -name "coverage" \
        -o -name ".git" \
        -o -name ".idea" \
        -o -name ".vscode" \
        -o -name ".next" \
        -o -name ".vite" \
        -o -name ".cache" \
        -o -name ".parcel-cache" \
        -o -name ".turbo" \
        -o -name "tmp" \
        -o -name "temp" \
        -o -name "logs" \
        -o -name "log" \
    \) -prune \
    -o -type f \
    ! -name "export-frontend.sh" \
    ! -name "react-frontend-codebase.txt" \
    ! -name ".env" \
    ! -name ".env.local" \
    ! -name ".env.development" \
    ! -name ".env.production" \
    ! -name ".env.test" \
    ! -name ".env.staging" \
    ! -name "*.pem" \
    ! -name "*.key" \
    ! -name "*.crt" \
    ! -name "*.cer" \
    ! -name "*.p12" \
    ! -name "*.pfx" \
    ! -name "*.jks" \
    ! -name "*.keystore" \
    ! -name "*.log" \
    ! -name "*.zip" \
    ! -name "*.tar" \
    ! -name "*.gz" \
    ! -name "*.7z" \
    ! -name "*.rar" \
    ! -name "*.png" \
    ! -name "*.jpg" \
    ! -name "*.jpeg" \
    ! -name "*.gif" \
    ! -name "*.webp" \
    ! -name "*.bmp" \
    ! -name "*.svg" \
    ! -name "*.ico" \
    ! -name "*.pdf" \
    ! -name "*.doc" \
    ! -name "*.docx" \
    ! -name "*.xls" \
    ! -name "*.xlsx" \
    ! -name "*.mp3" \
    ! -name "*.mp4" \
    ! -name "*.avi" \
    ! -name "*.mov" \
    ! -name "*.mkv" \
    ! -name "*.woff" \
    ! -name "*.woff2" \
    ! -name "*.ttf" \
    ! -name "*.otf" \
    ! -name "*.eot" \
    ! -name "*.map" \
    -print0 |
sort -z |
while IFS= read -r -d '' FILE; do

    MIME_TYPE="$(file --brief --mime-type "$FILE")"

    case "$MIME_TYPE" in
        text/* | \
        application/json | \
        application/javascript | \
        application/xml | \
        application/yaml | \
        application/x-yaml | \
        application/toml)

            RELATIVE_PATH="${FILE#$FRONTEND_DIR/}"

            {
                echo ""
                echo "================================================================================"
                echo "FILE: $RELATIVE_PATH"
                echo "MIME TYPE: $MIME_TYPE"
                echo "================================================================================"
                echo ""
                cat "$FILE"
                echo ""
            } >> "$OUTPUT_FILE"
            ;;
    esac
done

FILE_COUNT="$(
    grep -c '^FILE: ' "$OUTPUT_FILE" 2>/dev/null || true
)"

FILE_SIZE="$(
    du -h "$OUTPUT_FILE" | cut -f1
)"

echo ""
echo "Frontend export completed successfully."
echo "Output file: $OUTPUT_FILE"
echo "Files included: $FILE_COUNT"
echo "Output size: $FILE_SIZE"
echo ""
echo "Review the generated file before sharing it."
echo "Remember that VITE_ environment values may be exposed in frontend code."
