#!/usr/bin/env bash

OUTPUT="auth-debug-bundle.txt"

rm -f "$OUTPUT"

echo "NESTJS AUTH / EMAIL VERIFY DEBUG BUNDLE" >> "$OUTPUT"
echo "Generated at: $(date)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "================ PROJECT STRUCTURE ================" >> "$OUTPUT"
find . \
  -path "./node_modules" -prune -o \
  -path "./dist" -prune -o \
  -path "./.git" -prune -o \
  -path "./uploads" -prune -o \
  -path "./coverage" -prune -o \
  -type f \
  \( -name "*.ts" -o -name "*.json" -o -name "*.prisma" \) \
  | sort >> "$OUTPUT"

echo "" >> "$OUTPUT"

echo "================ IMPORTANT ROOT FILES ================" >> "$OUTPUT"

ROOT_FILES=(
  "package.json"
  "tsconfig.json"
  "nest-cli.json"
  "prisma/schema.prisma"
)

for file in "${ROOT_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "" >> "$OUTPUT"
    echo "---------------- FILE: $file ----------------" >> "$OUTPUT"
    cat "$file" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  fi
done

echo "" >> "$OUTPUT"
echo "================ MATCHING SOURCE FILES ================" >> "$OUTPUT"

MATCHED_FILES=$(find ./src \
  -path "./src/**/*.spec.ts" -prune -o \
  -type f \
  -name "*.ts" \
  | xargs grep -ilE "login|logout|verify|verification|email|mail|smtp|nodemailer|token|jwt|admin|approve|approval|auth|guard|strategy|passport|bcrypt|reset|confirm" \
  | sort -u)

for file in $MATCHED_FILES; do
  echo "" >> "$OUTPUT"
  echo "---------------- FILE: $file ----------------" >> "$OUTPUT"
  sed -E \
    -e 's/(password|PASSWORD|secret|SECRET|token|TOKEN|key|KEY)([[:space:]]*[:=][[:space:]]*)["'\''][^"'\'']+["'\'']/\1\2"***MASKED***"/g' \
    "$file" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
done

echo "" >> "$OUTPUT"
echo "================ ENV EXAMPLE CHECK ================" >> "$OUTPUT"

if [ -f ".env.example" ]; then
  echo "Found .env.example:" >> "$OUTPUT"
  cat ".env.example" >> "$OUTPUT"
else
  echo "No .env.example found." >> "$OUTPUT"
  echo "Do NOT paste your real .env file." >> "$OUTPUT"
  echo "Instead, manually describe only variable names, like:" >> "$OUTPUT"
  echo "APP_URL=..." >> "$OUTPUT"
  echo "FRONTEND_URL=..." >> "$OUTPUT"
  echo "JWT_SECRET=***MASKED***" >> "$OUTPUT"
  echo "SMTP_HOST=..." >> "$OUTPUT"
  echo "SMTP_USER=***MASKED***" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"
echo "Done. Created: $OUTPUT"
