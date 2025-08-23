import dotenv from "dotenv";
dotenv.config();

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "../shared/schema.js";

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

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
