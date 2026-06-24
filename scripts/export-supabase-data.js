/**
 * SAC SHOP - Direct PostgreSQL and Supabase Cloud Export Tool
 * This script exports all database tables, auth users, and storage files using direct database connection and API fallbacks.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const https = require('https');

async function run() {
  console.log('==================================================');
  console.log('🚀 SAC SHOP - Supabase Direct Export Tool');
  console.log('==================================================\n');

  // 1. Setup credentials
  const dbConnectionString = process.argv[2] || process.env.DATABASE_URL;

  if (!dbConnectionString || dbConnectionString.includes('[YOUR-PASSWORD]')) {
    console.error('❌ Error: Missing or invalid PostgreSQL connection string.');
    console.log('\nPlease provide the connection string with the actual password:');
    console.log('Usage: node scripts/export-supabase-data.js "postgresql://postgres:PASSWORD@db.rzttwmqdwhczsrwdonrl.supabase.co:5432/postgres"\n');
    process.exit(1);
  }

  // Parse project ref from connection string
  let projectRef = 'rzttwmqdwhczsrwdonrl';
  const refMatch = dbConnectionString.match(/@db\.([a-z0-9]+)\.supabase\.(co|in)/);
  if (refMatch) {
    projectRef = refMatch[1];
  }
  const supabaseUrl = `https://${projectRef}.supabase.co`;

  console.log(`🔗 Connecting to Database: db.${projectRef}.supabase.co`);
  console.log(`🔗 Supabase API URL: ${supabaseUrl}`);

  const client = new Client({
    connectionString: dbConnectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase external connections
  });

  const backupDir = path.join(process.cwd(), 'backup');
  const dbBackupDir = path.join(backupDir, 'db');
  const storageBackupDir = path.join(backupDir, 'storage');

  fs.mkdirSync(backupDir, { recursive: true });
  fs.mkdirSync(dbBackupDir, { recursive: true });
  fs.mkdirSync(storageBackupDir, { recursive: true });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL successfully!\n');

    // 2. Export Database Tables
    const tables = ['settings', 'products', 'customers', 'orders', 'vip_offers', 'order_status_history'];
    
    for (const table of tables) {
      console.log(`📥 Exporting table: public.${table}...`);
      try {
        const queryResult = await client.query(`SELECT * FROM public.${table}`);
        const rows = queryResult.rows;
        
        const filePath = path.join(dbBackupDir, `${table}.json`);
        fs.writeFileSync(filePath, JSON.stringify(rows, null, 2));
        console.log(`   ✅ Exported ${rows.length} records to db/${table}.json`);
      } catch (error) {
        console.error(`   ❌ Failed to export table public.${table}:`, error.message);
      }
    }

    // 3. Export Auth Users from auth.users schema
    console.log('\n📥 Exporting Auth Users from auth.users table...');
    try {
      const queryResult = await client.query('SELECT * FROM auth.users');
      const rows = queryResult.rows;
      
      const authFilePath = path.join(backupDir, 'auth_users.json');
      fs.writeFileSync(authFilePath, JSON.stringify(rows, null, 2));
      console.log(`   ✅ Exported ${rows.length} users to auth_users.json`);
    } catch (error) {
      console.error('   ❌ Failed to export Auth Users:', error.message);
    }

    // 4. Export Storage Files using DB metadata to fetch via HTTPS
    console.log('\n📥 Exporting Storage Files from storage.objects table...');
    try {
      const queryResult = await client.query(`
        SELECT obj.name, obj.bucket_id 
        FROM storage.objects obj
        JOIN storage.buckets buck ON obj.bucket_id = buck.id
      `);
      
      const objects = queryResult.rows;
      console.log(`   Found ${objects.length} storage objects in database.`);

      for (const obj of objects) {
        const bucket = obj.bucket_id;
        const filePath = obj.name;
        
        // Build public/private download URL
        const downloadUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
        console.log(`   Downloading ${bucket}/${filePath}...`);
        
        const bucketDestDir = path.join(storageBackupDir, bucket);
        fs.mkdirSync(bucketDestDir, { recursive: true });
        
        const fileDestPath = path.join(bucketDestDir, filePath);
        fs.mkdirSync(path.dirname(fileDestPath), { recursive: true });

        try {
          await downloadFile(downloadUrl, fileDestPath);
          console.log(`      ✅ Downloaded`);
        } catch (downloadError) {
          console.error(`      ❌ Download failed (restricted or missing):`, downloadError.message);
        }
      }
    } catch (error) {
      console.error('   ❌ Failed to list/download storage objects:', error.message);
    }

  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('\nTips:');
    console.log('1. Make sure your database password is correct.');
    console.log('2. If port 5432 is blocked by firewall, try connection pooler port 6543.');
    console.log('3. Ensure your IP is not blocked (Supabase has no IP whitelist by default, but local network might block external port 5432).');
  } finally {
    await client.end();
  }

  console.log('\n==================================================');
  console.log('🎉 Export completed!');
  console.log(`📂 Find all files in the directory: ${backupDir}`);
  console.log('==================================================');
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // delete local file
      reject(err);
    });
  });
}

run().catch(console.error);
