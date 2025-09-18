@echo off
setlocal enabledelayedexpansion

REM Database Setup Script for Windows CMD
REM Usage: setup-db.bat [--create-only] [--help]

set "CREATE_ONLY=false"
set "SHOW_HELP=false"

REM Parse command line arguments
:parse_args
if "%~1"=="--create-only" (
    set "CREATE_ONLY=true"
    shift
    goto :parse_args
)
if "%~1"=="--help" (
    set "SHOW_HELP=true"
    shift
    goto :parse_args
)
if "%~1"=="-h" (
    set "SHOW_HELP=true"
    shift
    goto :parse_args
)
if "%~1"=="" goto :end_parse
shift
goto :parse_args

:end_parse

if "%SHOW_HELP%"=="true" (
    echo.
    echo Database Setup Script
    echo.
    echo Usage: setup-db.bat [options]
    echo.
    echo Options:
    echo   --create-only    Only create the database, skip migrations and seeding
    echo   --help, -h       Show this help message
    echo.
    echo Examples:
    echo   setup-db.bat                    # Full setup (create + migrate + seed)
    echo   setup-db.bat --create-only      # Only create database
    echo   npm run db:create-only          # Using npm script
    echo   npm run db:setup                # Full setup using npm script
    echo.
    exit /b 0
)

REM Load environment variables from .env file
if exist ".env" (
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
)

if "%DATABASE_URL%"=="" (
    echo ❌ DATABASE_URL not found in environment variables
    echo Please make sure your .env file contains DATABASE_URL
    exit /b 1
)

echo 🚀 Starting database setup...
if "%CREATE_ONLY%"=="true" (
    echo    Mode: CREATE ONLY
) else (
    echo    Mode: FULL SETUP
)
echo.

REM Parse DATABASE_URL (basic parsing for MySQL)
REM Expected format: mysql://user:password@host:port/database
set "DB_URL=%DATABASE_URL%"
set "DB_URL=%DB_URL:mysql://=%"

for /f "tokens=1,2 delims=@" %%a in ("%DB_URL%") do (
    set "CREDENTIALS=%%a"
    set "HOST_DB=%%b"
)

for /f "tokens=1,2 delims=:" %%a in ("%CREDENTIALS%") do (
    set "DB_USER=%%a"
    set "DB_PASS=%%b"
)

for /f "tokens=1,2 delims=/" %%a in ("%HOST_DB%") do (
    set "HOST_PORT=%%a"
    set "DB_NAME=%%b"
)

for /f "tokens=1,2 delims=:" %%a in ("%HOST_PORT%") do (
    set "DB_HOST=%%a"
    set "DB_PORT=%%b"
)

if "%DB_PORT%"=="" set "DB_PORT=3306"

echo 🔧 Creating database...
echo    Host: %DB_HOST%:%DB_PORT%
echo    Database: %DB_NAME%
echo    User: %DB_USER%

REM Create database using MySQL command
mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% -e "CREATE DATABASE IF NOT EXISTS \`%DB_NAME%\`;" 2>nul
if errorlevel 1 (
    echo ❌ Failed to create database with password in command line
    echo 🔄 Trying alternative method...
    echo %DB_PASS% | mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p -e "CREATE DATABASE IF NOT EXISTS \`%DB_NAME%\`;" 2>nul
    if errorlevel 1 (
        echo ❌ Alternative method also failed
        echo.
        echo 💡 Manual database creation:
        echo    Connect to MySQL and run: CREATE DATABASE IF NOT EXISTS \`%DB_NAME%\`;
        exit /b 1
    )
)

echo ✅ Database created successfully!

if "%CREATE_ONLY%"=="true" (
    echo.
    echo 🎉 Database creation completed!
    echo 💡 Next steps:
    echo    - Run migrations: npm run db:migrate
    echo    - Generate client: npm run db:generate
    echo    - Seed database: npm run db:seed
    echo    - Or run full setup: npm run db:setup
    exit /b 0
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
cd ..
npx prisma generate
if errorlevel 1 (
    echo ❌ Prisma client generation failed. Exiting...
    exit /b 1
)
echo ✅ Prisma client generated successfully!

REM Run migrations
echo 🔄 Running database migrations...
npx prisma migrate deploy
if errorlevel 1 (
    echo ❌ Migration failed. Exiting...
    exit /b 1
)
echo ✅ Migrations completed successfully!

REM Seed database
echo 🌱 Seeding database...
npm run seed
if errorlevel 1 (
    echo ❌ Seeding failed. Exiting...
    exit /b 1
)
echo ✅ Database seeded successfully!

echo.
echo 🎉 Database setup completed successfully!
echo 💡 Your database is ready to use.
