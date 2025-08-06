const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testHealth() {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed:', data);
      return true;
    } else {
      console.log('❌ Health check failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testEmotionAnalysis() {
  try {
    console.log('🧠 Testing emotion analysis...');
    
    const testData = {
      text: "I am feeling very upset and angry about what happened at work today. This is completely unacceptable and I need help.",
      userEmail: "test@example.com"
    };
    
    const response = await fetch(`${API_BASE}/analyze-emotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Emotion analysis test passed:', data);
      return true;
    } else {
      console.log('❌ Emotion analysis test failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Emotion analysis test error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Running API Tests');
  console.log('==================');
  
  const healthOk = await testHealth();
  
  if (!healthOk) {
    console.log('❌ Health check failed. Make sure the server is running on port 3001');
    process.exit(1);
  }
  
  await testEmotionAnalysis();
  
  console.log('');
  console.log('🎉 Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testHealth, testEmotionAnalysis }; 