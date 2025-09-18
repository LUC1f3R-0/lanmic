#!/usr/bin/env node

/**
 * SMTP Configuration Setup Script
 * This script helps you set up SMTP configuration for the email service
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupSMTP() {
  console.log('🔧 SMTP Configuration Setup for LANMIC Backend\n');
  console.log('This script will help you configure SMTP settings for email functionality.\n');

  const envPath = path.join(__dirname, '.env');
  let envContent = '';

  // Check if .env file exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found existing .env file');
  } else {
    console.log('⚠️  No .env file found. Creating a new one...');
    // Create basic .env content
    envContent = `# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/lanmic_db"

# JWT Configuration
JWT_SECRET="dev-jwt-secret-key-12345"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# Application Configuration
PORT=3002
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# SMTP Configuration for Email
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME="LANMIC Admin"
SMTP_FROM_EMAIL=
`;
  }

  console.log('\n📧 SMTP Configuration:');
  console.log('Choose your email provider:\n');
  console.log('1. Gmail (recommended for development)');
  console.log('2. Outlook/Hotmail');
  console.log('3. Custom SMTP server');
  console.log('4. Skip SMTP setup (emails will be logged to console only)\n');

  const choice = await question('Enter your choice (1-4): ');

  let smtpConfig = {};

  switch (choice) {
    case '1':
      console.log('\n📧 Gmail Configuration:');
      console.log('Note: You need to use an App Password, not your regular Gmail password.');
      console.log('To create an App Password:');
      console.log('1. Go to your Google Account settings');
      console.log('2. Security → 2-Step Verification → App passwords');
      console.log('3. Generate a new app password for "Mail"\n');
      
      smtpConfig = {
        host: 'smtp.gmail.com',
        port: '587',
        secure: 'false',
        user: await question('Enter your Gmail address: '),
        pass: await question('Enter your Gmail App Password: '),
        fromEmail: await question('Enter sender email (same as Gmail address): ')
      };
      break;

    case '2':
      console.log('\n📧 Outlook/Hotmail Configuration:');
      smtpConfig = {
        host: 'smtp-mail.outlook.com',
        port: '587',
        secure: 'false',
        user: await question('Enter your Outlook email address: '),
        pass: await question('Enter your Outlook password: '),
        fromEmail: await question('Enter sender email (same as Outlook address): ')
      };
      break;

    case '3':
      console.log('\n📧 Custom SMTP Configuration:');
      smtpConfig = {
        host: await question('Enter SMTP host: '),
        port: await question('Enter SMTP port (usually 587 or 465): '),
        secure: await question('Use SSL/TLS? (true/false): '),
        user: await question('Enter SMTP username: '),
        pass: await question('Enter SMTP password: '),
        fromEmail: await question('Enter sender email: ')
      };
      break;

    case '4':
      console.log('\n⏭️  Skipping SMTP setup. Email service will log to console only.');
      rl.close();
      return;

    default:
      console.log('\n❌ Invalid choice. Exiting...');
      rl.close();
      return;
  }

  // Update .env content
  envContent = envContent.replace(/SMTP_HOST=.*/, `SMTP_HOST="${smtpConfig.host}"`);
  envContent = envContent.replace(/SMTP_PORT=.*/, `SMTP_PORT=${smtpConfig.port}`);
  envContent = envContent.replace(/SMTP_SECURE=.*/, `SMTP_SECURE=${smtpConfig.secure}`);
  envContent = envContent.replace(/SMTP_USER=.*/, `SMTP_USER="${smtpConfig.user}"`);
  envContent = envContent.replace(/SMTP_PASS=.*/, `SMTP_PASS="${smtpConfig.pass}"`);
  envContent = envContent.replace(/SMTP_FROM_EMAIL=.*/, `SMTP_FROM_EMAIL="${smtpConfig.fromEmail}"`);

  // Write updated .env file
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ SMTP configuration saved to .env file!');
  console.log('\n📋 Configuration Summary:');
  console.log(`Host: ${smtpConfig.host}`);
  console.log(`Port: ${smtpConfig.port}`);
  console.log(`Secure: ${smtpConfig.secure}`);
  console.log(`User: ${smtpConfig.user}`);
  console.log(`From Email: ${smtpConfig.fromEmail}`);
  
  console.log('\n🚀 Next steps:');
  console.log('1. Restart your backend server');
  console.log('2. Test the email functionality by trying to reset a password');
  console.log('3. Check the server logs for SMTP connection status');
  
  console.log('\n💡 Tips:');
  console.log('- If emails fail, check your credentials and network connection');
  console.log('- For Gmail, make sure 2FA is enabled and you\'re using an App Password');
  console.log('- Check the server logs for detailed error messages');

  rl.close();
}

setupSMTP().catch(console.error);
