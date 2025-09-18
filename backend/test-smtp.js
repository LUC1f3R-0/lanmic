#!/usr/bin/env node

/**
 * SMTP Test Script
 * This script tests the SMTP configuration without starting the full application
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🧪 Testing SMTP Configuration...\n');

  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ SMTP configuration incomplete!');
    console.log('Missing required environment variables:');
    if (!process.env.SMTP_HOST) console.log('  - SMTP_HOST');
    if (!process.env.SMTP_PORT) console.log('  - SMTP_PORT');
    if (!process.env.SMTP_USER) console.log('  - SMTP_USER');
    if (!process.env.SMTP_PASS) console.log('  - SMTP_PASS');
    console.log('\nRun "node setup-smtp.js" to configure SMTP settings.');
    return;
  }

  console.log('📋 Current SMTP Configuration:');
  console.log(`Host: ${process.env.SMTP_HOST}`);
  console.log(`Port: ${process.env.SMTP_PORT}`);
  console.log(`Secure: ${process.env.SMTP_SECURE}`);
  console.log(`User: ${process.env.SMTP_USER}`);
  console.log(`From Email: ${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}\n`);

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });

    console.log('🔌 Testing SMTP connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Test sending an email
    const testEmail = await require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).question('Enter test email address (or press Enter to skip): ');

    if (testEmail.trim()) {
      console.log(`📧 Sending test email to ${testEmail}...`);
      
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'LANMIC Admin'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: testEmail,
        subject: 'SMTP Test Email - LANMIC Backend',
        html: `
          <h2>🎉 SMTP Configuration Test Successful!</h2>
          <p>This is a test email from your LANMIC backend.</p>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <hr>
          <p><small>Sent at: ${new Date().toISOString()}</small></p>
        `,
        text: 'SMTP Configuration Test Successful! This is a test email from your LANMIC backend.',
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Test email sent successfully!');
      console.log(`Message ID: ${result.messageId}`);
    } else {
      console.log('⏭️  Skipping test email send.');
    }

    console.log('\n🎉 SMTP configuration test completed successfully!');
    console.log('Your email service is ready to use.');

  } catch (error) {
    console.log('❌ SMTP test failed:');
    console.log(`Error: ${error.message}\n`);
    
    console.log('🔧 Troubleshooting tips:');
    console.log('1. Check your SMTP credentials');
    console.log('2. Verify your network connection');
    console.log('3. For Gmail, ensure you\'re using an App Password');
    console.log('4. Check if your email provider requires specific settings');
    console.log('5. Try running "node setup-smtp.js" to reconfigure');
  }
}

testSMTP().catch(console.error);
