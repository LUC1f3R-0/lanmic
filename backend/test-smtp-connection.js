const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTPConnection() {
  console.log('🔍 Testing SMTP Connection...\n');
  
  // Check if all required environment variables are present
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\nPlease check your .env file and ensure all SMTP variables are set.');
    return;
  }
  
  console.log('✅ All required environment variables found');
  console.log(`📧 SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`🔌 SMTP Port: ${process.env.SMTP_PORT}`);
  console.log(`🔐 SMTP User: ${process.env.SMTP_USER}`);
  console.log(`🔒 SMTP Pass: ${'*'.repeat(process.env.SMTP_PASS.length)}`);
  console.log(`🔒 SMTP Secure: ${process.env.SMTP_SECURE}`);
  console.log('');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    debug: true, // Enable debug mode
    logger: true, // Enable logging
  });
  
  try {
    console.log('🔄 Attempting to verify SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Test sending an email
    console.log('\n🔄 Testing email sending...');
    const testEmail = {
      from: `"${process.env.SMTP_FROM_NAME || 'Test'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'SMTP Test Email',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<p>This is a test email to verify SMTP configuration.</p>'
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${result.messageId}`);
    
  } catch (error) {
    console.log('❌ SMTP connection failed:');
    console.log(`   Error: ${error.message}`);
    
    // Provide specific troubleshooting based on error
    if (error.message.includes('Connection closed')) {
      console.log('\n🔧 Troubleshooting for "Connection closed" error:');
      console.log('   1. Check if you\'re using Gmail - you need an App Password, not your regular password');
      console.log('   2. Verify the SMTP_HOST and SMTP_PORT are correct');
      console.log('   3. Check if your network/firewall is blocking the connection');
      console.log('   4. For Gmail: Enable 2-factor authentication and generate an App Password');
    } else if (error.message.includes('Invalid login')) {
      console.log('\n🔧 Troubleshooting for "Invalid login" error:');
      console.log('   1. Verify your SMTP_USER and SMTP_PASS are correct');
      console.log('   2. For Gmail: Use an App Password, not your regular password');
      console.log('   3. Check if 2-factor authentication is enabled (required for Gmail)');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Troubleshooting for "ECONNREFUSED" error:');
      console.log('   1. Check if SMTP_HOST and SMTP_PORT are correct');
      console.log('   2. Verify your internet connection');
      console.log('   3. Check if your firewall is blocking the connection');
    }
  }
}

// Run the test
testSMTPConnection().catch(console.error);
