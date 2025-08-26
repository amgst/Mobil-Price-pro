import type { Handler } from '@netlify/functions';
import serverless from 'serverless-http';
import app from '../../server/index.ts';

const handler = serverless(app, {
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
    
    // Keep the full path including /api prefix for Express routing
    // The Express routes are defined with /api prefix, so we need to preserve it
    if (!event.path.startsWith('/api')) {
      event.path = `/api${event.path}`;
    }
    
    console.log('Transformed path:', event.path);
    
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