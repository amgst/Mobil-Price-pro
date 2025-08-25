import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const DATABASE_URL = 'postgresql://neondb_owner:npg_yxlY28rJcMFv@ep-rapid-wave-ad2jcb9p-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  
  try {
    console.log('🔌 Connecting to Neon database...');
    const sql = neon(DATABASE_URL);
    
    // Test basic connection
    console.log('✅ Testing basic connection...');
    const result = await sql`SELECT version()`;
    console.log('Database version:', result[0].version);
    
    // Read and execute the SQL file
    console.log('\n📋 Reading neon-database.sql file...');
    const sqlFilePath = path.join(__dirname, 'neon-database.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          // Use template literal to execute raw SQL
          await sql([statement]);
          if (i % 10 === 0) {
            console.log(`Executed ${i + 1}/${statements.length} statements...`);
          }
        } catch (error) {
          console.warn(`Warning on statement ${i + 1}:`, error.message);
        }
      }
    }
    
    console.log('\n✅ Database setup completed!');
    
    // Verify the data was imported
    console.log('\n📊 Verifying imported data...');
    const brandCount = await sql`SELECT COUNT(*) as count FROM brands`;
    const mobileCount = await sql`SELECT COUNT(*) as count FROM mobiles`;
    
    console.log(`Brands imported: ${brandCount[0].count}`);
    console.log(`Mobiles imported: ${mobileCount[0].count}`);
    
    // Show sample data
    const sampleBrands = await sql`SELECT name, slug FROM brands LIMIT 5`;
    const sampleMobiles = await sql`SELECT name, brand, price FROM mobiles LIMIT 5`;
    
    console.log('\nSample brands:', sampleBrands);
    console.log('Sample mobiles:', sampleMobiles);

    
    console.log('\n🎉 Database setup and verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
  }
}

setupDatabase();