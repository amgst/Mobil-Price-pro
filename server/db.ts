import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "../shared/schema.js";

// Configure Neon for serverless environments
neonConfig.fetchConnectionCache = true;

// Only set WebSocket constructor in non-serverless environments
if (typeof window === 'undefined' && !process.env.VERCEL) {
  try {
    const ws = require("ws");
    neonConfig.webSocketConstructor = ws;
  } catch (error) {
    // WebSocket not available, continue without it
    console.warn('WebSocket constructor not available:', error.message);
  }
}

// Direct Neon database connection with proper SSL configuration for Vercel
const DATABASE_URL = "postgresql://neondb_owner:npg_yxlY28rJcMFv@ep-lively-unit-adtogwhk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });
