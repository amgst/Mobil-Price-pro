import type { Handler } from '@netlify/functions';
import serverless from 'serverless-http';
import express from 'express';
import app from '../../server/index.ts';

// Create a new Express app to act as a prefixer
const api = express();

// Mount the main app under the /api prefix
api.use('/api', app);

const handler = serverless(api, {
  binary: false
});

// Custom wrapper to handle body parsing
const wrappedHandler = async (event: any, context: any) => {
  try {
    console.log('Original path:', event.path);
    console.log('HTTP method:', event.httpMethod);
    console.log('Headers:', JSON.stringify(event.headers, null, 2));
    
    // Parse JSON body if it's a string
    if (event.body && typeof event.body === 'string') {
      try {
        event.body = JSON.parse(event.body);
        console.log('Parsed body:', event.body);
      } catch (e) {
        console.log('Failed to parse body as JSON:', e);
      }
    }
    
    const response = await handler(event, context);
    
    console.log('Response status:', (response as { statusCode?: number }).statusCode);
    console.log('Memory used:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
    
    return response;
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { wrappedHandler as handler };