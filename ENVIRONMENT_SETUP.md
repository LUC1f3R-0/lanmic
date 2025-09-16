# Environment Setup Guide

This guide explains how to set up environment variables for the LANMIC authentication system with axios integration.

## Frontend Environment Setup

### 1. Create Environment File

Create a `.env.local` file in the `frontend` directory with the following content:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3002

# Application Configuration
NEXT_PUBLIC_APP_NAME=LANMIC Polymers
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true

# Security Configuration
NEXT_PUBLIC_TOKEN_STORAGE_KEY=lanmic_access_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=lanmic_refresh_token

# Development Configuration
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### 2. Environment Variables Explained

#### API Configuration
- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:3002)

#### Application Configuration
- `NEXT_PUBLIC_APP_NAME`: Application name for branding
- `NEXT_PUBLIC_APP_VERSION`: Application version

#### Feature Flags
- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Enable analytics tracking (true/false)
- `NEXT_PUBLIC_ENABLE_DEBUG`: Enable debug logging (true/false)

#### Security Configuration
- `NEXT_PUBLIC_TOKEN_STORAGE_KEY`: localStorage key for access token
- `NEXT_PUBLIC_REFRESH_TOKEN_KEY`: localStorage key for refresh token

#### Development Configuration
- `NEXT_PUBLIC_DEV_MODE`: Development mode flag (true/false)
- `NEXT_PUBLIC_LOG_LEVEL`: Logging level (debug, info, warn, error)

## Backend Environment Setup

### 1. Create Environment File

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/lanmic_db"

# JWT Configuration
JWT_SECRET="dev-jwt-secret-key-12345"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# Application Configuration
PORT=3002
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

## Axios Integration Features

### 1. Automatic Token Management
- Automatic token attachment to requests
- Automatic token refresh on 401 errors
- Request queuing during token refresh

### 2. Error Handling
- Comprehensive error handling with axios
- Network error detection
- Server error parsing
- Automatic retry logic

### 3. Request/Response Interceptors
- Request logging in debug mode
- Response logging in debug mode
- Automatic authorization header injection
- Token refresh handling

### 4. Configuration Management
- Centralized configuration with type safety
- Environment variable validation
- Fallback values for all settings

## Usage Examples

### 1. Basic API Call
```typescript
import { apiService } from '@/lib/api';

// Login
const response = await apiService.login('user@example.com', 'password');

// Get user data
const user = await apiService.getUser();
```

### 2. Custom Axios Instance
```typescript
import { apiService } from '@/lib/api';

// Get axios instance for custom requests
const axiosInstance = apiService.getAxiosInstance();

// Custom request
const response = await axiosInstance.get('/custom-endpoint');
```

### 3. Configuration Access
```typescript
import { config, isDebugMode, getApiBaseURL } from '@/lib/config';

// Check if debug mode is enabled
if (isDebugMode()) {
  console.log('Debug mode is enabled');
}

// Get API base URL
const apiUrl = getApiBaseURL();
```

## Security Features

### 1. Token Storage
- Secure localStorage keys with custom names
- Automatic token cleanup on logout
- Token refresh with queue management

### 2. Request Security
- Automatic authorization headers
- CSRF protection through tokens
- Request timeout configuration

### 3. Error Security
- No sensitive data in error messages
- Proper error logging in debug mode
- Network error handling

## Development vs Production

### Development Mode
- Debug logging enabled
- Detailed error messages
- Console warnings for missing env vars
- Extended timeouts

### Production Mode
- Minimal logging
- Generic error messages
- Optimized performance
- Security-focused configuration

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the frontend directory
   - Restart the development server after changes
   - Check variable names start with `NEXT_PUBLIC_`

2. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check backend server is running
   - Ensure CORS is configured properly

3. **Token Issues**
   - Check localStorage keys are correct
   - Verify JWT_SECRET in backend
   - Clear localStorage if tokens are corrupted

### Debug Mode

Enable debug mode to see detailed logs:
```env
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_DEV_MODE=true
```

This will show:
- All API requests and responses
- Token refresh attempts
- Error details
- Configuration validation

## File Structure

```
frontend/
├── .env.local                 # Environment variables
├── src/
│   ├── lib/
│   │   ├── api.ts            # Axios-based API service
│   │   └── config.ts         # Configuration management
│   └── ...
└── env-template.txt          # Template for environment setup
```

## Next Steps

1. Copy the environment template to `.env.local`
2. Customize the values for your setup
3. Restart the development server
4. Test the authentication flow
5. Monitor debug logs if needed

The system now uses axios with comprehensive error handling, automatic token management, and secure configuration management!
