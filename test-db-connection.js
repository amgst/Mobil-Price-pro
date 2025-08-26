import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

async function testDbConnection() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set in the .env file.");
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Attempting to connect to the database...");
    const client = await pool.connect();
    console.log("Successfully connected to the database!");

    // Perform a simple query to verify the connection
    const result = await client.query("SELECT NOW() as current_time;");
    console.log("Query result:", result.rows[0].current_time);

    client.release();
    console.log("Connection released.");
  } catch (error) {
    console.error("Error connecting to or querying the database:", error);
  } finally {
    await pool.end();
    console.log("Pool closed.");
  }
}

testDbConnection();
