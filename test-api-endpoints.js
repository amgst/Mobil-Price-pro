import fetch from 'node-fetch';

// Test the API endpoints
async function testAPIEndpoints() {
  const baseURL = 'https://mobile-price.com';
  
  console.log('🧪 Testing API endpoints...');
  console.log(`Base URL: ${baseURL}`);
  
  const endpoints = [
    '/api/brands',
    '/api/mobiles',
    '/api/brands/apple',
    '/api/mobiles/apple-iphone-16-pro'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing ${endpoint}...`);
      const response = await fetch(`${baseURL}${endpoint}`);
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Data length: ${Array.isArray(data) ? data.length : 'N/A'}`);
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('Sample data:', JSON.stringify(data[0], null, 2));
        } else if (data && typeof data === 'object') {
          console.log('Data:', JSON.stringify(data, null, 2));
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Error: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }
  
  console.log('\n🎉 API endpoint testing completed!');
}

testAPIEndpoints();