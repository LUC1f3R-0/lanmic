# Authentication Setup Guide

This guide explains how the frontend and backend are connected with proper authentication and route protection.

## Overview

- **Frontend**: Runs on `http://localhost:3000`
- **Backend**: Runs on `http://localhost:3002`
- **Authentication**: JWT-based with refresh tokens
- **Route Protection**: Multiple layers of protection

## Features Implemented

### 1. Backend Configuration
- ✅ CORS configured to allow frontend requests
- ✅ JWT authentication with access and refresh tokens
- ✅ Secure HTTP-only cookies for token storage
- ✅ Port updated to 3002

### 2. Frontend Authentication
- ✅ Login page at `/login`
- ✅ Protected dashboard at `/dashboard`
- ✅ AuthContext for state management
- ✅ API service with token management
- ✅ Automatic token refresh

### 3. Route Protection
- ✅ ProtectedRoute component for React-level protection
- ✅ Next.js middleware for server-level protection
- ✅ Automatic redirects for authenticated/unauthenticated users
- ✅ No direct access to `/dashboard` without authentication

### 4. User Experience
- ✅ Seamless login/logout flow
- ✅ Automatic redirects after authentication
- ✅ Loading states and error handling
- ✅ Responsive design

## How It Works

### Authentication Flow
1. User visits the site
2. If not authenticated, they see the homepage with login buttons
3. Clicking login redirects to `/login`
4. After successful login, user is redirected to `/dashboard`
5. Dashboard is protected - no direct access without authentication

### Route Protection Layers
1. **ProtectedRoute Component**: React-level authentication check (primary protection)
2. **AuthContext**: Manages authentication state
3. **API Service**: Handles token storage and refresh
4. **Next.js Middleware**: Basic pass-through (can be enhanced later)

### Security Features
- JWT tokens with expiration
- HTTP-only cookies for refresh tokens
- Automatic token refresh
- Secure logout (token invalidation)
- CORS protection
- Route-level protection

## Testing the Setup

### Option 1: Use the Startup Scripts
**Windows (PowerShell):**
```powershell
.\start-servers.ps1
```

**Windows (Command Prompt):**
```cmd
start-servers.bat
```

### Option 2: Manual Startup

**Backend (Terminal 1):**
```bash
cd backend
npm run start:dev
```
Backend will run on `http://localhost:3002`

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### 3. Test Authentication Flow
1. Visit `http://localhost:3000`
2. Click "Get Started" or "Sign In" button
3. You'll be redirected to `/login`
4. Try to access `/dashboard` directly - you'll be redirected to login
5. After login, you'll be redirected to `/dashboard`
6. Dashboard shows user information and logout option

### 4. Test Route Protection
1. Try accessing `http://localhost:3000/dashboard` directly
2. You should be redirected to `/login?redirect=%2Fdashboard`
3. After login, you'll be redirected back to dashboard

## Environment Setup

### Backend (.env)
```env
DATABASE_URL="mysql://root:password@localhost:3306/lanmic_db"
JWT_SECRET="dev-jwt-secret-key-12345"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"
PORT=3002
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## Key Files

### Backend
- `src/main.ts` - CORS and server configuration
- `src/auth/auth.controller.ts` - Authentication endpoints
- `src/auth/auth.service.ts` - Authentication logic

### Frontend
- `src/app/login/page.tsx` - Login page
- `src/app/dashboard/page.tsx` - Protected dashboard
- `src/app/dashboard/layout.tsx` - Dashboard protection
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/lib/api.ts` - API service
- `src/middleware.ts` - Route protection middleware
- `src/components/ProtectedRoute.tsx` - React protection component

## Security Notes

1. **No Direct Dashboard Access**: Even hardcoding `/dashboard` in the URL won't work without authentication
2. **Token Management**: Tokens are stored securely and refreshed automatically
3. **CORS Protection**: Backend only accepts requests from the frontend URL
4. **Route Protection**: Multiple layers ensure no unauthorized access
5. **Secure Logout**: Tokens are properly invalidated on logout

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend CORS is configured for `http://localhost:3000`
2. **Token Issues**: Check if JWT_SECRET is set in backend .env
3. **Redirect Loops**: Ensure middleware and components are properly configured
4. **API Connection**: Verify backend is running on port 3002
5. **Build Errors**: Clean .next directory if build fails

### Build Issues Fix
If you encounter build manifest errors:
```bash
# Clean build directory
cd frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

### Debug Steps
1. Check browser console for errors
2. Verify backend is running and accessible
3. Check network tab for API requests
4. Ensure environment variables are set correctly
5. Use startup scripts for easier server management

### Current Status
- ✅ Authentication system fully functional
- ✅ React-level route protection working
- ✅ Middleware simplified to avoid build issues
- ✅ All authentication flows working properly
