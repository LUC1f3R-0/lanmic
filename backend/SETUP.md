# Database Setup Instructions

## Quick Setup (Single Command)

To set up the complete database with all tables and seed data, run:

```bash
npm run setup
```

This single command will:
1. ✅ Create MySQL database `lanmic_db`
2. ✅ Create database user `lanmic_db` with password `lanmic_dbpass`
3. ✅ Grant all privileges to the user
4. ✅ Sync database schema with Prisma schema
5. ✅ Seed the database with admin user

## Prerequisites

1. **MySQL Server**: Make sure MySQL server is running on `localhost:3306`
2. **MySQL Root Access**: Ensure MySQL root user is accessible (default: no password)
3. **Dependencies**: All npm dependencies must be installed (`npm install`)
4. **Environment File**: Create `.env` file with the following content:

```env
# Database Configuration (required)
DATABASE_URL="mysql://lanmic_db:lanmic_dbpass@localhost:3306/lanmic_db"

# MySQL Root Configuration (optional - defaults shown)
MYSQL_ROOT_HOST="localhost"
MYSQL_ROOT_PORT="3306"
MYSQL_ROOT_USER="root"
MYSQL_ROOT_PASSWORD=""
```

The setup script will automatically parse the `DATABASE_URL` to extract:
- Database name
- Database username
- Database password
- Database host
- Database port

You can optionally override the MySQL root connection settings using the `MYSQL_ROOT_*` environment variables.

## Admin Login Credentials

After setup, you can login with:
- **Email**: `anonymous.inbox99@gmail.com`
- **Password**: `admin@pass`
- **Username**: `admin`
- **Status**: Not verified (email verification required)

## Available Commands

### Main Setup Commands
- `npm run setup` - Complete database setup (recommended)
- `npm run db:setup:complete` - Same as above
- `npm run db:setup` - Same as above

### Fallback Commands (if main setup fails)
- `npm run db:setup:fallback` - Fallback setup (assumes Prisma client exists)
- `npm run db:create-only` - Only create database and user
- `npm run db:generate` - Generate Prisma client only
- `npm run db:migrate` - Run migrations only
- `npm run db:seed` - Seed database only

### Utility Commands
- `npm run db:seed:advanced` - Advanced seeding with sample data
- `npm run db:clear` - Clear all data
- `npm run db:reset` - Reset database (WARNING: deletes all data)
- `npm run db:studio` - Open Prisma Studio

## Troubleshooting

### Windows Permission Issues (Common)

If you encounter permission errors with Prisma client generation:

#### Option 1: Run as Administrator
1. Close all terminals and VS Code
2. Right-click PowerShell → "Run as Administrator"
3. Navigate to backend directory
4. Run: `npm run setup`

#### Option 2: Use Fallback Script
1. First generate Prisma client: `npm run db:generate`
2. Then run fallback setup: `npm run db:setup:fallback`

#### Option 3: Manual Steps
If all else fails, run these commands manually:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

#### Option 4: Use Alternative Terminal
- Use Git Bash instead of PowerShell
- Use WSL (Windows Subsystem for Linux)
- Use Command Prompt instead of PowerShell

### MySQL Connection Issues
- Ensure MySQL server is running
- Check if MySQL root user has proper privileges
- Verify the DATABASE_URL in your .env file
- Try connecting with MySQL client: `mysql -u root -p`

### Permission Issues
- Make sure MySQL root user can create databases and users
- Check if the user already exists and has correct permissions
- Verify MySQL service is running with proper permissions

### Migration Issues
- Ensure all dependencies are installed (`npm install`)
- Check if Prisma client is generated (`npm run db:generate`)
- Verify database connection string is correct
- Check if migrations folder exists in `prisma/migrations/`

## Database Schema

The setup creates the following tables:
- `users` - User accounts and authentication
- `refresh_tokens` - JWT refresh token management
- `blog_posts` - Blog content management
- `team_members` - Team member profiles
- `executive_leadership` - Executive leadership profiles

## Platform-Specific Notes

### Windows
- May require running PowerShell as Administrator
- Consider using Git Bash or WSL for better compatibility
- Antivirus software may interfere with file operations

### macOS/Linux
- Generally works without permission issues
- Ensure proper file permissions on project directory

## Next Steps

After successful setup:
1. Start your backend server: `npm run start:dev`
2. Access your application and login with admin credentials
3. Verify the admin email to activate the account
4. Begin using the platform!

## Support

If you continue to have issues:
1. Check the console output for specific error messages
2. Verify all prerequisites are met
3. Try the fallback commands
4. Consider using a different terminal or running as administrator
