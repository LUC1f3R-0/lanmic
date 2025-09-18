# SMTP Email Configuration Guide

This guide will help you set up SMTP email functionality for the LANMIC backend.

## Quick Setup

### Option 1: Interactive Setup (Recommended)
```bash
npm run smtp:setup
```

This will guide you through the setup process step by step.

### Option 2: Manual Setup
1. Create a `.env` file in the backend directory (if it doesn't exist)
2. Add the following SMTP configuration variables:

```env
# SMTP Configuration for Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME="LANMIC Admin"
SMTP_FROM_EMAIL=your-email@gmail.com
```

## Email Provider Setup

### Gmail Setup
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use your Gmail address and the app password (not your regular password)

**Gmail SMTP Settings:**
- Host: `smtp.gmail.com`
- Port: `587`
- Secure: `false`
- Username: Your Gmail address
- Password: Your App Password

### Outlook/Hotmail Setup
**Outlook SMTP Settings:**
- Host: `smtp-mail.outlook.com`
- Port: `587`
- Secure: `false`
- Username: Your Outlook email address
- Password: Your Outlook password

### Custom SMTP Server
Contact your email provider for the correct SMTP settings.

## Testing Your Configuration

After setting up SMTP, test your configuration:

```bash
npm run smtp:test
```

This will:
1. Verify your SMTP connection
2. Optionally send a test email
3. Show detailed error messages if something is wrong

## Troubleshooting

### Common Issues

**"Unexpected socket close" Error:**
- Check your SMTP credentials
- Verify your network connection
- For Gmail, ensure you're using an App Password, not your regular password
- Check if your email provider requires specific security settings

**"Authentication failed" Error:**
- Double-check your username and password
- For Gmail, make sure 2FA is enabled and you're using an App Password
- Try logging into your email account with the same credentials

**"Connection timeout" Error:**
- Check your internet connection
- Verify the SMTP host and port are correct
- Some networks block SMTP ports - try a different network

### Development Mode

If SMTP is not configured, the application will:
- Log email content to the console instead of sending emails
- Show clear messages about missing SMTP configuration
- Continue to function normally for other features

### Logs and Debugging

Check the backend logs for detailed SMTP information:
- Connection status
- Email sending attempts
- Error messages
- OTP codes (in development mode)

## Security Notes

- Never commit your `.env` file to version control
- Use App Passwords instead of your main email password
- Consider using environment-specific SMTP settings for production
- Regularly rotate your SMTP credentials

## Production Considerations

For production deployment:
1. Use a dedicated email service (SendGrid, Mailgun, etc.)
2. Set up proper DNS records (SPF, DKIM, DMARC)
3. Monitor email delivery rates
4. Implement rate limiting for email sending
5. Use environment variables for all sensitive configuration

## Support

If you continue to have issues:
1. Check the server logs for detailed error messages
2. Verify your SMTP settings with your email provider
3. Test with a different email provider
4. Check your network/firewall settings
