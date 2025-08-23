// Simple test script to check if RapidAPI is working
require('dotenv').config();

async function testRapidAPI() {
  console.log('Testing RapidAPI connection...');
  
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey || rapidApiKey === 'your_rapidapi_key_here') {
    console.log('❌ RapidAPI Key Status: NOT CONFIGURED');
    console.log('Current key:', rapidApiKey);
    console.log('\nTo fix this:');
    console.log('1. Get a RapidAPI key from https://rapidapi.com/');
    console.log('2. Subscribe to GSMArena Parser API');
    console.log('3. Update RAPIDAPI_KEY in your .env file');
    return;
  }
  
  console.log('✅ RapidAPI Key Status: CONFIGURED');
  console.log('Key preview:', rapidApiKey.substring(0, 10) + '...');
  
  try {
    console.log('\nTesting API connection...');
    
    const response = await fetch('https://gsmarenaparser.p.rapidapi.com/api/values/availablebrands', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'gsmarenaparser.p.rapidapi.com'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection: SUCCESS');
      console.log('Available brands count:', Array.isArray(data) ? data.length : 'Unknown');
      console.log('Sample brands:', Array.isArray(data) ? data.slice(0, 5) : data);
    } else {
      console.log('❌ API Connection: FAILED');
      const errorText = await response.text();
      console.log('Error response:', errorText);
      
      if (response.status === 401) {
        console.log('\nThis usually means:');
        console.log('- Invalid API key');
        console.log('- API key not subscribed to GSMArena Parser');
      } else if (response.status === 429) {
        console.log('\nRate limit exceeded. Try again later.');
      }
    }
  } catch (error) {
    console.log('❌ API Connection: ERROR');
    console.log('Error:', error.message);
  }
}

testRapidAPI().catch(console.error);