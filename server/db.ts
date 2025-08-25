import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../shared/schema.js";

// Configure Neon for serverless environments
neonConfig.fetchConnectionCache = true;

// Set WebSocket constructor for Node.js environments
if (
  typeof window === "undefined" &&
  !process.env.VERCEL &&
  !process.env.REPLIT_DEPLOYMENT
) {
  import("ws")
    .then(({ WebSocket }) => {
      neonConfig.webSocketConstructor = WebSocket;
    })
    .catch(() => {
      console.warn("WebSocket constructor not available, using HTTP fallback");
    });
}

// Lazy initialization to ensure environment variables are loaded
let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getPool() {
  if (!_pool) {
    // Get database URL from environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Add your Neon database URL to environment variables.",
      );
    }

    // Connection pool configuration optimized for serverless
    const poolConfig = {
      connectionString: process.env.DATABASE_URL,
      // Vercel serverless optimizations
      ...(process.env.VERCEL && {
        maxUses: 1,
        max: 1,
      }),
    };

    _pool = new Pool(poolConfig);
  }
  return _pool;
}

function getDb() {
  if (!_db) {
    _db = drizzle({ client: getPool(), schema });
  }
  return _db;
}

export const pool = new Proxy({} as Pool, {
  get(target, prop) {
    return getPool()[prop as keyof Pool];
  }
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  }
});
