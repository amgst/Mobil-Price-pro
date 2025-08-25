import { neon } from '@neondatabase/serverless';

async function setupDatabase() {
  const DATABASE_URL = 'postgresql://neondb_owner:npg_yxlY28rJcMFv@ep-rapid-wave-ad2jcb9p-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  
  try {
    console.log('🔌 Connecting to Neon database...');
    const sql = neon(DATABASE_URL);
    
    // Test basic connection
    console.log('✅ Testing basic connection...');
    const result = await sql`SELECT version()`;
    console.log('Database version:', result[0].version.split(' ')[0]);
    
    // Drop existing tables if they exist
    console.log('\n🗑️ Dropping existing tables...');
    await sql`DROP TABLE IF EXISTS mobiles CASCADE`;
    await sql`DROP TABLE IF EXISTS brands CASCADE`;
    
    // Create brands table
    console.log('\n📋 Creating brands table...');
    await sql`
      CREATE TABLE brands (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        logo VARCHAR(255),
        "isVisible" BOOLEAN DEFAULT true,
        "phoneCount" VARCHAR(10) DEFAULT '0',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes for brands
    await sql`CREATE INDEX idx_brands_slug ON brands(slug)`;
    await sql`CREATE INDEX idx_brands_visible ON brands("isVisible")`;
    
    // Create mobiles table
    console.log('📋 Creating mobiles table...');
    await sql`
      CREATE TABLE mobiles (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        description TEXT,
        price VARCHAR(255),
        image TEXT,
        specs JSONB DEFAULT '{}',
        images JSONB DEFAULT '[]',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes for mobiles
    await sql`CREATE INDEX idx_mobiles_slug ON mobiles(slug)`;
    await sql`CREATE INDEX idx_mobiles_brand ON mobiles(brand)`;
    await sql`CREATE INDEX idx_mobiles_specs ON mobiles USING GIN (specs)`;
    
    console.log('✅ Tables created successfully!');
    
    // Insert sample brands
    console.log('\n📊 Inserting brands data...');
    const brands = [
      { id: '6c9a69db-5de3-41ba-adb0-c532fd527094', name: 'Apple', slug: 'apple', description: 'American multinational technology company', logo: '🍎' },
      { id: '57434b42-ce52-4e4c-ae06-a07a4cc2d307', name: 'Xiaomi', slug: 'xiaomi', description: 'Chinese electronics company', logo: 'X' },
      { id: '8587a9b7-8a8d-4640-adff-3221f021edd4', name: 'Google', slug: 'google', description: 'American multinational technology corporation', logo: 'G' },
      { id: '91fc14d0-5e48-480d-8bc6-58e03017fe03', name: 'Oppo', slug: 'oppo', description: 'Chinese consumer electronics company', logo: 'O' },
      { id: '4d3aa1ec-e111-4e98-82f4-f864408255bd', name: 'Realme', slug: 'realme', description: 'Chinese smartphone brand', logo: 'R' }
    ];
    
    for (const brand of brands) {
      await sql`
        INSERT INTO brands (id, name, slug, description, logo, "createdAt", "updatedAt")
        VALUES (${brand.id}, ${brand.name}, ${brand.slug}, ${brand.description}, ${brand.logo}, NOW(), NOW())
      `;
    }
    
    // Insert sample mobiles
    console.log('📊 Inserting mobiles data...');
    const mobiles = [
      { id: 'c400f56f-9b83-43b2-8e03-8313b80e0ba8', name: 'Apple iPad Air 13 (2025)', slug: 'apple-ipad-air-13-2025', brand: 'apple', price: 'Rs 119,000 - 139,000 (Est.)' },
      { id: 'fa5fc410-e060-4a11-87ac-218cf58300f2', name: 'Apple iPhone 16 Pro', slug: 'apple-iphone-16-pro', brand: 'apple', price: 'Rs 277,000 - 305,000 (Est.)' },
      { id: '0ea881a7-ee65-458c-bc4c-6e29bfdf24b6', name: 'Xiaomi Mix Flip 2', slug: 'xiaomi-mix-flip-2', brand: 'xiaomi', price: 'Rs 222,000 - 277,000 (Est.)' },
      { id: 'e9eeff96-f494-4733-8457-da8876d47bf1', name: 'Xiaomi Watch S4 41mm', slug: 'xiaomi-watch-s4-41mm', brand: 'xiaomi', price: 'Rs 41,000 - 69,000 (Est.)' },
      { id: '27d91742-8e80-4fc3-8487-ffa50eaf278e', name: 'Xiaomi Pad 7S Pro 12.5', slug: 'xiaomi-pad-7s-pro-125', brand: 'xiaomi', price: 'Rs 166,000 - 222,000 (Est.)' }
    ];
    
    for (const mobile of mobiles) {
      await sql`
        INSERT INTO mobiles (id, name, slug, brand, price, specs, images, "createdAt", "updatedAt")
        VALUES (${mobile.id}, ${mobile.name}, ${mobile.slug}, ${mobile.brand}, ${mobile.price}, '{}', '[]', NOW(), NOW())
      `;
    }
    
    console.log('✅ Sample data inserted successfully!');
    
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