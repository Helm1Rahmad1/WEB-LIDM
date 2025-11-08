import { sendVerificationEmail, sendWelcomeEmail } from '../src/services/emailService.js';

const testEmail = async () => {
  console.log('Testing Email Service...');
  
  // Test verification email
  console.log('\n1. Testing Verification Email...');
  try {
    const testToken = 'test-verification-token-' + Date.now();
    const result = await sendVerificationEmail('juarasatulidm2025@gmail.com', 'Test User', testToken);
    console.log('✅ Verification email result:', result);
  } catch (error) {
    console.log('❌ Verification email error:', error.message);
  }
  
  // Test welcome email
  console.log('\n2. Testing Welcome Email...');
  try {
    const result = await sendWelcomeEmail('juarasatulidm2025@gmail.com', 'Test User', 'murid');
    console.log('✅ Welcome email result:', result);
  } catch (error) {
    console.log('❌ Welcome email error:', error.message);
  }
};

testEmail().then(() => {
  console.log('\n✨ Email test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});