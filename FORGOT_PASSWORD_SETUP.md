# Forgot Password Setup Guide

This guide will help you set up the forgot password functionality with email sending capabilities.

## 🚀 Features Implemented

✅ **Complete Forgot Password Flow:**
- Email input modal
- OTP generation and verification (5-digit random code)
- Password reset with security validation
- Automatic redirect to admin login after successful reset

✅ **Backend Endpoints:**
- `POST /auth/forgot-password` - Send OTP to email
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/reset-password` - Reset password with new password

✅ **Frontend Components:**
- `ForgotPasswordModal` - Email input
- `OtpVerificationModal` - 5-digit OTP input with auto-focus
- `ResetPasswordModal` - New password input with validation

✅ **Email Service:**
- Nodemailer integration with SMTP
- Beautiful HTML email templates
- Fallback to console logging if SMTP not configured
- Professional email design with LANMIC branding

## 📧 SMTP Configuration

### Step 1: Create .env file
Copy the `env-template.txt` to `.env` in the backend directory:

```bash
cp env-template.txt .env
```

### Step 2: Configure SMTP Settings
Edit your `.env` file with your email provider settings:

```env
# SMTP Configuration for Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_NAME="LANMIC Admin"
SMTP_FROM_EMAIL="your-email@gmail.com"
```

### Step 3: Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASS`

### Step 4: Alternative Email Providers

#### Outlook/Hotmail:
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_SECURE=false
```

#### Yahoo:
```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT=587
SMTP_SECURE=false
```

#### Custom SMTP:
```env
SMTP_HOST="your-smtp-server.com"
SMTP_PORT=587
SMTP_SECURE=false
```

## 🗄️ Database Setup

The system automatically adds OTP fields to your user table:

```sql
ALTER TABLE users ADD COLUMN otp VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN otpExpiresAt DATETIME NULL;
```

To apply these changes, run:

```bash
cd backend
npx prisma db push
```

## 🧪 Testing the Flow

### 1. Start the Application
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

### 2. Test the Forgot Password Flow

#### Test Case 1: Invalid Email (Not in System)
1. Go to `/admin` login page
2. Click "Forgot password?" link
3. Enter an email that doesn't exist in the system
4. **Expected Result:** Error message "Email address not found in our system. Please check your email address or contact the administrator."

#### Test Case 2: Valid Email (In System)
1. Enter a valid email address that exists in your database
2. **Expected Result:** 
   - If SMTP configured: OTP sent via email
   - If SMTP not configured: Error message "Email service not configured. Please contact the administrator."
3. Enter the 5-digit OTP
4. Set a new password
5. Get redirected to admin login

### 3. Console Logs (Development Mode)
If SMTP fails, you'll see detailed logs:

```
=== OTP EMAIL (SMTP FAILED) ===
To: user@example.com
Subject: Password Reset OTP
OTP Code: 12345
Expires in: 10 minutes
Error: [SMTP Error Details]
===============================
```

## 🔒 Security Features

- **OTP Expiration:** 10 minutes
- **Password Requirements:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)
- **Email Validation:** Proper email format validation
- **Rate Limiting:** Built-in protection against spam
- **Secure OTP Generation:** Cryptographically secure random numbers

## 🎨 Email Templates

The system includes beautiful HTML email templates:

- **OTP Email:** Professional design with clear OTP display
- **Success Email:** Confirmation of password reset
- **Responsive Design:** Works on all email clients
- **LANMIC Branding:** Consistent with your brand

## 🚨 Troubleshooting

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Verify app password (for Gmail)
3. Check firewall/network restrictions
4. Review console logs for errors

### OTP Not Working
1. Check database connection
2. Verify OTP hasn't expired (10 minutes)
3. Ensure correct email address
4. Check console logs for errors

### Database Issues
1. Run `npx prisma db push` to sync schema
2. Check database connection string
3. Verify user table exists

## 📱 User Experience

The forgot password flow provides an excellent user experience:

1. **Simple Email Input:** Clean modal with validation
2. **OTP Input:** Auto-focusing 5-digit input with paste support
3. **Password Reset:** Clear password requirements and validation
4. **Success Feedback:** Automatic redirect to login
5. **Error Handling:** Clear error messages throughout

## 🔧 Customization

### Email Templates
Edit the HTML templates in `backend/src/auth/email.service.ts`:
- `getOtpEmailTemplate()`
- `getPasswordResetSuccessTemplate()`

### OTP Settings
Modify OTP settings in `backend/src/auth/auth.service.ts`:
- OTP length (currently 5 digits)
- Expiration time (currently 10 minutes)

### Password Requirements
Update validation in `backend/src/auth/dto/reset-password.dto.ts`

## 🎯 Next Steps

1. Configure your SMTP settings
2. Test the complete flow
3. Customize email templates if needed
4. Deploy to production with proper SMTP credentials

The forgot password functionality is now fully implemented and ready to use! 🎉
