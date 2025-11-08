const nodemailer = require('nodemailer');

// Test email configuration
const testEmailConfig = async () => {
  console.log('🔧 Testing Email Configuration...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
  
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true, // Enable debug output
    logger: true // Log to console
  });

  try {
    // Test connection
    console.log('📡 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    console.log('📧 Sending test email...');
    const testEmail = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: process.env.SMTP_USER, // Send to same email for testing
      subject: '✅ Test Email - LIDM System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #147E7E;">🎉 Email Test Successful!</h2>
          <p>Congratulations! Your LIDM email system is working properly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>SMTP Host: ${process.env.SMTP_HOST}</li>
            <li>SMTP Port: ${process.env.SMTP_PORT}</li>
            <li>From Email: ${process.env.FROM_EMAIL}</li>
            <li>Test Time: ${new Date().toLocaleString()}</li>
          </ul>
          <p style="color: #666;">If you received this email, your verification system should work!</p>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error);
    return false;
  }
};

// Run test
require('dotenv').config();
testEmailConfig().then(success => {
  if (success) {
    console.log('🎉 Email system is ready!');
  } else {
    console.log('❌ Email system needs fixing!');
  }
  process.exit(success ? 0 : 1);
});