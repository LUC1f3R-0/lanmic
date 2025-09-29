# Quick Start Guide

## Single Command Database Setup

### 1. Configure Environment

First, make sure your `.env` file has the correct DATABASE_URL:

```env
DATABASE_URL="mysql://lanmic_db:lanmic_dbpass@localhost:3306/lanmic_db"
```

### 2. Run Setup

```bash
npm run setup
```

That's it! This single command will:
- ✅ Parse DATABASE_URL from your .env file
- ✅ Create MySQL database and user from the URL
- ✅ Grant all privileges to the user
- ✅ Sync database schema with Prisma schema
- ✅ Seed the database with admin user

## Login Credentials

After setup, login with:
- **Email**: `anonymous.inbox99@gmail.com`
- **Password**: `admin@pass`
- **Username**: `admin`

## If Setup Fails

If you encounter permission issues (common on Windows):

### Option 1: Run as Administrator
1. Close all terminals and VS Code
2. Right-click PowerShell → "Run as Administrator"
3. Navigate to backend directory
4. Run: `npm run setup`

### Option 2: Use Fallback
```bash
npm run db:generate
npm run db:setup:fallback
```

### Option 3: Manual Steps
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Next Steps

1. Start backend: `npm run start:dev`
2. Login with admin credentials
3. Verify email to activate account

## All Available Commands

- `npm run setup` - Complete setup (recommended)
- `npm run db:setup:fallback` - Fallback setup
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database
- `npm run db:reset` - Reset everything (WARNING: deletes all data)

For detailed troubleshooting, see `SETUP.md`.
