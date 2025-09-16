# Token Security Implementation Guide

## Overview
Your authentication system now implements a secure **two-token system** with the following components:

### 1. Access Token (JWT)
- **Type**: JSON Web Token (JWT)
- **Lifetime**: 15 minutes (configurable via `ACCESS_TOKEN_EXPIRY`)
- **Purpose**: Short-lived token for API access
- **Storage**: Client-side (memory/localStorage)
- **Security Features**:
  - Contains token type validation (`type: 'access'`)
  - Includes issued timestamp (`iat`)
  - Uses HS256 algorithm
  - Automatically expires

### 2. Refresh Token
- **Type**: Cryptographically secure random string (64 hex characters)
- **Lifetime**: 7 days (configurable via `REFRESH_TOKEN_EXPIRY`)
- **Purpose**: Long-lived token for obtaining new access tokens
- **Storage**: Database (with metadata)
- **Security Features**:
  - Cryptographically secure generation using `crypto.randomBytes()`
  - Database storage with expiry tracking
  - Automatic rotation (old token revoked when new one issued)
  - Revocation capability

## Security Improvements Made

### 1. Enhanced JWT Strategy
```typescript
// Added token type validation
if (payload.type !== 'access') {
  throw new UnauthorizedException('Invalid token type');
}

// Added explicit algorithm specification
algorithms: ['HS256']

// Added additional expiry check
if (payload.exp < now) {
  throw new UnauthorizedException('Token has expired');
}
```

### 2. Improved Token Generation
```typescript
// Enhanced payload with type and timestamp
const payload = { 
  sub: userId, 
  type: 'access',
  iat: Math.floor(Date.now() / 1000)
};

// Cryptographically secure refresh token
private generateRandomToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}
```

### 3. Token Management Features
- **Token Rotation**: Old refresh tokens are revoked when new ones are issued
- **Cleanup Method**: `cleanupExpiredTokens()` for removing expired tokens
- **Bulk Revocation**: `revokeAllUserTokens()` for security incidents
- **Proper Logout**: Refresh token revocation on logout

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

## API Endpoints

### Authentication Flow
1. **POST /auth/login** - Returns both access and refresh tokens
2. **POST /auth/refresh** - Uses refresh token to get new access token
3. **POST /auth/logout** - Revokes refresh token

### Request/Response Examples

#### Login Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "isVerified": true
  }
}
```

#### Refresh Token Request
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

#### Logout Request
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

## Security Best Practices

### 1. Token Storage
- **Access Token**: Store in memory or secure HTTP-only cookies
- **Refresh Token**: Store in secure HTTP-only cookies or secure storage
- **Never store tokens in localStorage** for production apps

### 2. Token Transmission
- Always use HTTPS in production
- Include access token in Authorization header: `Bearer <token>`
- Send refresh token in request body for refresh/logout endpoints

### 3. Token Validation
- Access tokens are validated on every protected route
- Refresh tokens are validated only during refresh/logout
- Expired tokens are automatically rejected

### 4. Security Headers (Recommended)
Add these headers to your responses:
```typescript
// In your main.ts or middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

## Database Schema Requirements

Your Prisma schema should include:

```prisma
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}
```

## Monitoring and Maintenance

### 1. Regular Cleanup
Set up a cron job or scheduled task to clean expired tokens:
```typescript
// Call this periodically (e.g., daily)
await authService.cleanupExpiredTokens();
```

### 2. Security Monitoring
- Log failed authentication attempts
- Monitor for suspicious refresh token usage
- Implement rate limiting on auth endpoints

### 3. Incident Response
- Use `revokeAllUserTokens()` to immediately revoke all tokens for a compromised user
- Implement token blacklisting if needed

## Frontend Integration

### 1. Token Storage
```typescript
// Store access token in memory (recommended)
let accessToken: string | null = null;

// Store refresh token securely
const refreshToken = localStorage.getItem('refreshToken'); // Or secure cookie
```

### 2. Automatic Token Refresh
```typescript
// Interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const newTokens = await refreshAccessToken();
      // Retry original request
      return axios.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

## Conclusion

Your authentication system now implements industry-standard security practices with:
- ✅ Two-token system (access + refresh)
- ✅ Token rotation and revocation
- ✅ Cryptographically secure token generation
- ✅ Proper token validation
- ✅ Security headers and best practices
- ✅ Database-backed refresh token management

This implementation provides a robust, secure authentication system suitable for production use.
