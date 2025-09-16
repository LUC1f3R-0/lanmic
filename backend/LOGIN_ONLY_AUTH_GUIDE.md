# Login-Only Authentication System Guide

## Overview

This backend has been restructured to implement a **login-only authentication system** with maximum security using HTTP-only cookies. The system no longer supports user registration and instead relies on pre-seeded user data.

## Key Features

### 🔐 **Maximum Security Implementation**
- **HTTP-Only Cookies**: Access and refresh tokens stored in secure HTTP-only cookies
- **Secure Cookie Settings**: SameSite=strict, Secure in production, proper path settings
- **Comprehensive Security Headers**: XSS protection, CSRF protection, content type sniffing prevention
- **Token Rotation**: Automatic refresh token rotation for enhanced security
- **Account Status Management**: Users can be activated/deactivated

### 🍪 **Cookie-Based Authentication**
- **Access Token Cookie**: Short-lived (15 minutes) JWT stored in HTTP-only cookie
- **Refresh Token Cookie**: Long-lived (7 days) secure random token stored in HTTP-only cookie
- **Automatic Cookie Management**: Cookies are set, cleared, and rotated automatically
- **CORS Configuration**: Proper CORS settings for cookie-based authentication

## Database Schema

### Updated User Model
```prisma
model User {
  id            Int            @id @default(autoincrement())
  email         String         @unique
  username      String         @unique
  password      String         // Required, no longer optional
  isActive      Boolean        @default(true) // Replaces isVerified
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
}
```

### RefreshToken Model (Unchanged)
```prisma
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  expiresAt DateTime
  revoked   Boolean  @default(false)
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## API Endpoints

### 1. User Login
**POST** `/auth/login`

Authenticate user with email and password. Sets secure HTTP-only cookies.

**Request Body:**
```json
{
  "email": "admin@gmail.com",
  "password": "admin@pass"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "admin@gmail.com",
    "username": "admin",
    "isActive": true
  }
}
```

**Cookies Set:**
- `access_token`: HTTP-only JWT access token (15 minutes)
- `refresh_token`: HTTP-only refresh token (7 days)

### 2. Refresh Token
**POST** `/auth/refresh`

Generate new access and refresh tokens using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "abc123..."
}
```

**Response:**
```json
{
  "message": "Tokens refreshed successfully",
  "user": {
    "id": 1,
    "email": "admin@gmail.com",
    "username": "admin",
    "isActive": true
  }
}
```

**Cookies Updated:**
- New `access_token` and `refresh_token` cookies set

### 3. User Logout
**POST** `/auth/logout`

Revoke refresh token and clear all authentication cookies.

**Request Body:**
```json
{
  "refreshToken": "abc123..."
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `access_token` and `refresh_token` cookies removed

## Security Features

### 1. HTTP-Only Cookies
```typescript
const COOKIE_OPTIONS = {
  httpOnly: true,           // Prevents XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',       // CSRF protection
  path: '/',               // Available site-wide
};
```

### 2. Security Headers
```typescript
// XSS Protection
res.setHeader('X-XSS-Protection', '1; mode=block');

// Content Type Sniffing Prevention
res.setHeader('X-Content-Type-Options', 'nosniff');

// Clickjacking Protection
res.setHeader('X-Frame-Options', 'DENY');

// Referrer Policy
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

// Content Security Policy
res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
```

### 3. CORS Configuration
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
});
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/lanmic_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# Application
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Push schema changes to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed the database with admin user
npm run seed
```

### 3. Start the Application
```bash
npm run start:dev
```

### 4. Access Swagger Documentation
Open your browser and navigate to `http://localhost:3001/api`

## Default Admin User

The system comes with a pre-seeded admin user:

- **Email**: `admin@gmail.com`
- **Password**: `admin@pass`
- **Username**: `admin`
- **Status**: Active

## Frontend Integration

### 1. Login Request
```typescript
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    email: 'admin@gmail.com',
    password: 'admin@pass'
  })
});

const data = await response.json();
// Cookies are automatically set by the browser
```

### 2. Making Authenticated Requests
```typescript
const response = await fetch('http://localhost:3001/protected-route', {
  method: 'GET',
  credentials: 'include', // Include cookies
});

// The access token cookie is automatically sent
```

### 3. Token Refresh
```typescript
const response = await fetch('http://localhost:3001/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    refreshToken: 'your-refresh-token' // Get from cookie if needed
  })
});
```

### 4. Logout
```typescript
const response = await fetch('http://localhost:3001/auth/logout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    refreshToken: 'your-refresh-token'
  })
});

// Cookies are automatically cleared
```

## Security Best Practices

### 1. Production Deployment
- Use strong, unique JWT secrets
- Set `NODE_ENV=production`
- Use HTTPS (cookies will be secure)
- Configure proper CORS origins
- Use a production database

### 2. Token Management
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Old refresh tokens are automatically revoked
- Expired tokens are cleaned up periodically

### 3. User Management
- Users can be deactivated by setting `isActive: false`
- Deactivated users cannot log in
- All tokens for deactivated users should be revoked

## File Structure

```
src/
├── auth/
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   ├── auth-response.dto.ts
│   │   └── index.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── cookie.service.ts
├── guards/
│   └── jwt-auth.guard.ts
├── filters/
│   └── global-exception.filter.ts
├── database.service.ts
└── main.ts
```

## Testing the API

1. **Start the server:**
   ```bash
   npm run start:dev
   ```

2. **Open Swagger UI:**
   Navigate to `http://localhost:3001/api`

3. **Test the login flow:**
   - Login with admin credentials
   - Check browser cookies (should see access_token and refresh_token)
   - Test token refresh
   - Test logout (cookies should be cleared)

## Migration from Registration System

The following changes were made to remove registration:

### Removed Files:
- `register-email.dto.ts`
- `verify-otp.dto.ts`
- `register-details.dto.ts`

### Removed Endpoints:
- `POST /auth/register/email`
- `POST /auth/register/otp`
- `POST /auth/register/details`

### Updated Schema:
- Removed `isVerified`, `otpCode`, `otpExpiresAt` fields
- Added `isActive` field
- Made `username` and `password` required

### Updated Services:
- Simplified auth service for login-only flow
- Added cookie service for secure cookie management
- Updated JWT strategy for new user schema

This system provides enterprise-grade security with HTTP-only cookies, comprehensive security headers, and proper token management suitable for production use.
