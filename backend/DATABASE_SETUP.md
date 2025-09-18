# Database Setup Guide

This guide explains how to set up the database for the Lanmic project using the provided scripts.

## Prerequisites

1. **MySQL Server**: Make sure MySQL is installed and running on your system
2. **Environment Variables**: Ensure your `.env` file contains the `DATABASE_URL`
3. **Node.js**: Node.js and npm should be installed

## Environment Configuration

Your `.env` file should contain:

```env
DATABASE_URL="mysql://lanmic_db:lanmic_dbpass@localhost:3306/lanmic_db"
```

## Available Commands

### Quick Commands (Recommended)

```bash
# Create database only (no migrations or seeding)
npm run db:create-only

# Full database setup (create + migrate + seed)
npm run db:setup

# Individual operations
npm run db:migrate    # Run migrations only
npm run db:generate   # Generate Prisma client only
npm run db:seed       # Seed database only
npm run db:reset      # Reset database (WARNING: deletes all data)
npm run db:studio     # Open Prisma Studio
```

### Direct Script Usage

#### Node.js Script (Cross-platform)
```bash
# Create database only
node scripts/setup-db.js --create-only

# Full setup
node scripts/setup-db.js

# Show help
node scripts/setup-db.js --help
```

#### PowerShell Script (Windows)
```powershell
# Create database only
.\scripts\setup-db.ps1 -CreateOnly

# Full setup
.\scripts\setup-db.ps1

# Show help
.\scripts\setup-db.ps1 -Help
```

#### Batch Script (Windows CMD)
```cmd
# Create database only
scripts\setup-db.bat --create-only

# Full setup
scripts\setup-db.bat

# Show help
scripts\setup-db.bat --help
```

## What Each Command Does

### `--create-only` / `db:create-only`
- ✅ Creates the MySQL database if it doesn't exist
- ❌ Skips migrations
- ❌ Skips seeding
- ❌ Skips Prisma client generation

**Use this when:**
- You only want to create the database
- You plan to run migrations and seeding separately
- You're setting up a fresh environment

### Full Setup (`db:setup`)
- ✅ Creates the MySQL database if it doesn't exist
- ✅ Generates Prisma client
- ✅ Runs database migrations
- ✅ Seeds the database with initial data

**Use this when:**
- Setting up the project for the first time
- You want a complete database setup

## Database Schema

The database includes the following tables:

- **users**: User accounts with authentication
- **refresh_tokens**: JWT refresh tokens for session management

## Troubleshooting

### Common Issues

1. **"DATABASE_URL not found"**
   - Make sure your `.env` file exists in the backend directory
   - Verify the `DATABASE_URL` is properly formatted

2. **"Failed to create database"**
   - Check if MySQL server is running
   - Verify the credentials in your `DATABASE_URL`
   - Ensure the MySQL user has CREATE DATABASE privileges

3. **"Migration failed"**
   - Make sure the database exists
   - Check if there are any existing tables that conflict
   - Try running `npm run db:reset` to start fresh (WARNING: deletes all data)

4. **"Prisma client generation failed"**
   - Make sure you're in the backend directory
   - Check if `node_modules` is properly installed
   - Try running `npm install` first

### Manual Database Creation

If the automated scripts fail, you can manually create the database:

1. Connect to MySQL:
   ```bash
   mysql -u lanmic_db -p
   ```

2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS lanmic_db;
   ```

3. Then run the remaining steps:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

## Development Workflow

### First Time Setup
```bash
# 1. Create database only
npm run db:create-only

# 2. Generate Prisma client
npm run db:generate

# 3. Run migrations
npm run db:migrate

# 4. Seed with initial data
npm run db:seed
```

### After Schema Changes
```bash
# 1. Create and apply migration
npx prisma migrate dev --name your_migration_name

# 2. Regenerate client
npm run db:generate
```

### Reset Everything
```bash
# WARNING: This deletes all data
npm run db:reset
```

## Production Deployment

For production environments:

1. **Create database manually** (for security)
2. **Run migrations only**:
   ```bash
   npm run db:migrate
   ```
3. **Seed if needed**:
   ```bash
   npm run db:seed
   ```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your MySQL server is running
3. Check the console output for specific error messages
4. Ensure all prerequisites are met
