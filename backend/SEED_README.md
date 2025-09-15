# Admin User Seed Setup

This document explains how to create an admin user for the authentication system.

## Admin Credentials
- **Email**: admin@gmail.com
- **Password**: admin@pass
- **Username**: admin
- **Status**: Verified (can login without OTP verification)

## Setup Instructions

### 1. Environment Setup
**IMPORTANT**: You need to create a `.env` file in the backend directory with the following variables:

**Option 1**: Copy from template:
```bash
cp env-template.txt .env
```

**Option 2**: Create manually with these variables:
```env
DATABASE_URL="mysql://root:password@localhost:3306/lanmic_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

**Note**: The `.env` file is gitignored for security reasons, so you need to create it manually.

### 2. Database Setup
Ensure your MySQL database is running and accessible with the connection string in your `.env` file.

### 3. Run the Seed
Execute one of the following commands to create the admin user:

```bash
# Option 1: Using npm script
npm run seed

# Option 2: Using Prisma CLI
npx prisma db seed

# Option 3: Direct execution
node prisma/seed.js
```

### 4. Verify Admin User
After running the seed, you can verify the admin user was created by:

1. Using Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Or by testing the login endpoint with the admin credentials.

## Security Notes

- The admin password is hashed using bcrypt with 12 salt rounds (same as the auth service)
- The admin user is marked as verified, so they can login without OTP verification
- The seed uses `upsert` operation, so it's safe to run multiple times
- Change the default admin password in production environments

## Files Created

- `prisma/seed.js` - JavaScript seed file
- `prisma/seed.ts` - TypeScript seed file (alternative)
- Updated `package.json` with seed script

## Troubleshooting

If you encounter issues:

1. Check that your database connection is working
2. Ensure the `.env` file exists and has the correct DATABASE_URL
3. Make sure the database tables exist (run `npx prisma db push` if needed)
4. Check that the Prisma client is generated (`npx prisma generate`)
