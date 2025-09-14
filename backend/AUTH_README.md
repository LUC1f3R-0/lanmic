# Authentication System Documentation

This document provides comprehensive information about the authentication system implemented in the Lanmic backend.

## Overview

The authentication system provides a complete user registration and login flow with OTP verification, JWT access tokens, and refresh tokens. It's built with NestJS, Prisma, and includes full Swagger documentation.

## Features

- **Email-based Registration**: Users register with email and receive OTP verification
- **OTP Verification**: 6-digit OTP sent to email with 5-minute expiry
- **Secure Password Storage**: Passwords are hashed using bcrypt
- **JWT Authentication**: Short-lived access tokens (15 minutes) and long-lived refresh tokens (7 days)
- **Token Refresh**: Automatic token rotation for enhanced security
- **User Verification**: Only verified users can log in
- **Comprehensive Validation**: Input validation using class-validator
- **Swagger Documentation**: Complete API documentation with examples

## Database Schema

### User Model
```prisma
model User {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  username     String?   @unique
  password     String?
  isVerified   Boolean   @default(false)
  otpCode      String?
  otpExpiresAt DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  refreshTokens RefreshToken[]
}
```

### RefreshToken Model
```prisma
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  expiresAt DateTime
  revoked   Boolean  @default(false)
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## API Endpoints

### 1. Send OTP for Registration
**POST** `/auth/register/email`

Send a 6-digit OTP to the user's email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully to your email",
  "expiresInMinutes": 5
}
```

### 2. Verify OTP
**POST** `/auth/register/otp`

Verify the OTP sent to the user's email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "canProceed": true
}
```

### 3. Complete Registration
**POST** `/auth/register/details`

Complete user registration by setting username and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Registration completed successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "isVerified": true
  }
}
```

### 4. User Login
**POST** `/auth/login`

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "isVerified": true
  }
}
```

### 5. Refresh Token
**POST** `/auth/refresh`

Generate new access and refresh tokens using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "isVerified": true
  }
}
```

### 6. User Logout
**POST** `/auth/logout`

Revoke the refresh token and log out the user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/lanmic_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# Application
PORT=3000
NODE_ENV=development

# Email Configuration (for OTP sending)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up Database:**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Start the Application:**
   ```bash
   npm run start:dev
   ```

5. **Access Swagger Documentation:**
   Open your browser and navigate to `http://localhost:3000/api`

## Security Features

- **Password Hashing**: Uses bcrypt with salt rounds of 12
- **JWT Security**: Short-lived access tokens with secure refresh token rotation
- **Input Validation**: Comprehensive validation using class-validator
- **OTP Expiry**: OTP codes expire after 5 minutes
- **Token Revocation**: Refresh tokens can be revoked on logout
- **User Verification**: Only verified users can access protected routes

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## Username Requirements

Usernames must meet the following criteria:
- Minimum 3 characters
- Maximum 20 characters
- Only letters, numbers, and underscores allowed

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid input, validation errors
- **401 Unauthorized**: Invalid credentials, expired tokens
- **404 Not Found**: User not found
- **409 Conflict**: User already exists, username taken

## Testing the API

1. **Start the server:**
   ```bash
   npm run start:dev
   ```

2. **Open Swagger UI:**
   Navigate to `http://localhost:3000/api`

3. **Test the flow:**
   - Send OTP to email
   - Verify OTP (check console for OTP code)
   - Complete registration
   - Login with credentials
   - Test token refresh
   - Test logout

## Production Considerations

1. **Environment Variables**: Use strong, unique JWT secrets
2. **Database**: Use a production MySQL database
3. **Email Service**: Implement a real email service for OTP delivery
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Logging**: Implement comprehensive logging
6. **Monitoring**: Add health checks and monitoring
7. **HTTPS**: Always use HTTPS in production

## File Structure

```
src/
├── auth/
│   ├── dto/
│   │   ├── auth-response.dto.ts
│   │   ├── login.dto.ts
│   │   ├── register-details.dto.ts
│   │   ├── register-email.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   ├── verify-otp.dto.ts
│   │   └── index.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── guards/
│   └── jwt-auth.guard.ts
├── app.module.ts
├── database.service.ts
└── main.ts
```

This authentication system provides a solid foundation for user management in your application with enterprise-grade security features.
