const axios = require('axios');

// Test the contact endpoint
async function testContactEndpoint() {
  try {
    console.log('Testing contact endpoint...');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      message: 'This is a test message from the contact form.'
    };

    const response = await axios.post('http://localhost:3002/contact', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Contact endpoint test successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Contact endpoint test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testContactEndpoint();
