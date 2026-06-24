/**
 * SAC SHOP - Supabase Self-Hosted Import Tool
 * This script imports storage files and database table data to the new self-hosted Supabase instance.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables if available
const dotenvPath = path.join(process.cwd(), '.env');
const dotenvLocalPath = path.join(process.cwd(), '.env.local');

if (fs.existsSync(dotenvLocalPath)) {
  require('dotenv').config({ path: dotenvLocalPath });
} else if (fs.existsSync(dotenvPath)) {
  require('dotenv').config({ path: dotenvPath });
}

async function run() {
  console.log('==================================================');
  console.log('🚀 SAC SHOP - Supabase Self-Hosted Import Tool');
  console.log('==================================================\n');

  // 1. Setup credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.argv[2] || 'http://supabasekong-x11r5k1z2xfuwwrv4ez3mjcl.195.201.119.89.sslip.io';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[3];

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Missing target Supabase URL or Service Role Key.');
    console.log('\nPlease provide them as environment variables or arguments:');
    console.log('Usage: node scripts/import-to-selfhosted.js <NEW_SUPABASE_URL> <NEW_SERVICE_ROLE_KEY>\n');
    process.exit(1);
  }

  console.log(`🔗 Target URL: ${supabaseUrl}`);
  console.log('🔑 Service Role Key: [PRESENT]');

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const backupDir = path.join(process.cwd(), 'backup');
  if (!fs.existsSync(backupDir)) {
    console.error(`❌ Error: Backup directory not found at ${backupDir}. Run export script first.`);
    process.exit(1);
  }

  // 2. Import Storage Files first
  const storageBackupDir = path.join(backupDir, 'storage');
  if (fs.existsSync(storageBackupDir)) {
    const buckets = fs.readdirSync(storageBackupDir);
    for (const bucket of buckets) {
      console.log(`\n📤 Importing Storage Bucket: ${bucket}...`);
      
      // Ensure bucket exists in self-hosted
      const { data: bucketInfo, error: getBucketError } = await supabase.storage.getBucket(bucket);
      if (getBucketError) {
        console.log(`   Creating bucket "${bucket}"...`);
        const { error: createBucketError } = await supabase.storage.createBucket(bucket, {
          public: true // Make buckets public as in original setup
        });
        if (createBucketError) {
          console.error(`   ❌ Failed to create bucket "${bucket}":`, createBucketError.message);
          continue;
        }
      }

      const bucketDir = path.join(storageBackupDir, bucket);
      const files = getAllFilesRecursively(bucketDir);
      console.log(`   Found ${files.length} files to upload.`);

      for (const relativePath of files) {
        const fileLocalPath = path.join(bucketDir, relativePath);
        const fileBuffer = fs.readFileSync(fileLocalPath);
        
        // Supabase expects forward slashes for paths in storage
        const storagePath = relativePath.replace(/\\/g, '/');
        console.log(`   Uploading ${storagePath}...`);

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(storagePath, fileBuffer, {
            upsert: true,
            contentType: getContentType(storagePath)
          });

        if (uploadError) {
          console.error(`   ❌ Failed to upload ${storagePath}:`, uploadError.message);
        } else {
          console.log(`   ✅ Uploaded ${storagePath}`);
        }
      }
    }
  }

  // 3. Import Database Table Data
  const dbBackupDir = path.join(backupDir, 'db');
  // Order is critical to satisfy foreign key constraints:
  // settings, products, customers, orders, vip_offers, order_status_history
  const tablesOrder = ['settings', 'products', 'customers', 'orders', 'vip_offers', 'order_status_history'];

  if (fs.existsSync(dbBackupDir)) {
    console.log('\n📤 Importing Database Tables...');
    for (const table of tablesOrder) {
      const filePath = path.join(dbBackupDir, `${table}.json`);
      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  Backup file for table "${table}" not found. Skipping.`);
        continue;
      }

      console.log(`   Importing table: ${table}...`);
      const records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (records.length === 0) {
        console.log(`   ℹ️  Table ${table} has 0 records. Skipping.`);
        continue;
      }

      // Batch insert in chunks of 100 to avoid request size limits
      const chunkSize = 100;
      let successCount = 0;

      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        
        // Before inserting orders, check if we need to temporarily disable triggers or deal with SERIAL sequences.
        // PostgREST upsert will insert with the IDs provided.
        const { error } = await supabase.from(table).upsert(chunk, { onConflict: getPrimaryKey(table) });

        if (error) {
          console.error(`   ❌ Error inserting chunk in ${table}:`, error.message);
          // Try individual inserts in case of single-row failures
          for (const item of chunk) {
            const { error: singleError } = await supabase.from(table).upsert(item, { onConflict: getPrimaryKey(table) });
            if (singleError) {
              console.error(`      ❌ Failed row insert:`, singleError.message, JSON.stringify(item));
            } else {
              successCount++;
            }
          }
        } else {
          successCount += chunk.length;
        }
      }
      console.log(`   ✅ Imported ${successCount}/${records.length} records into ${table}`);
      
      // Update serial sequence for orders since we inserted records with explicit order_number
      if (table === 'orders') {
        console.log('   Updating SERIAL sequence for orders table...');
        const { error: seqError } = await supabase.rpc('set_orders_sequence');
        if (seqError) {
          // If RPC doesn't exist, we will warn but it's usually resolved by the sequence setting in DB
          console.log(`   ⚠️  Could not auto-update order sequence via RPC (set_orders_sequence). Run SQL: "SELECT setval('orders_order_number_seq', (SELECT MAX(order_number) FROM orders));" in Supabase SQL Editor.`);
        } else {
          console.log('   ✅ Successfully updated order sequence.');
        }
      }
    }
  }

  // 4. Import Auth Users (Optional fallback, pg_restore is preferred for exact hash matching)
  const authFilePath = path.join(backupDir, 'auth_users.json');
  if (fs.existsSync(authFilePath)) {
    console.log('\n📤 Restoring Auth Users...');
    const users = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
    console.log(`   Found ${users.length} users to restore.`);

    let successUsers = 0;
    for (const user of users) {
      console.log(`   Restoring user: ${user.email}...`);
      
      // Check if user already exists
      const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
      const existing = existingUsers.find(u => u.email === user.email);
      
      if (existing) {
        console.log(`   ℹ️  User ${user.email} already exists, skipping creation.`);
        successUsers++;
        continue;
      }

      // Create user
      // Note: We cannot set the password hash directly through createClient Auth Admin API.
      // So we set a temporary password or they can use password recovery.
      // However, we can set user_metadata.
      const tempPassword = user.user_metadata?.phone || 'ChangeMe123!';
      const { error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: user.user_metadata,
        // We attempt to preserve UUID if supported by API, otherwise let Supabase generate a new one.
        id: user.id 
      });

      if (createError) {
        console.error(`   ❌ Failed to restore user ${user.email}:`, createError.message);
      } else {
        console.log(`   ✅ Restored user ${user.email}`);
        successUsers++;
      }
    }
    console.log(`   ✅ Restored ${successUsers}/${users.length} auth users.`);
    console.log('   ⚠️  NOTE: Users restored via API will need to use their phone number as a password (or the default "ChangeMe123!") unless pg_restore was used to copy encrypted password hashes directly.');
  }

  console.log('\n==================================================');
  console.log('🎉 Import completed successfully!');
  console.log('==================================================');
}

function getAllFilesRecursively(dir, relativePath = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const relPath = relativePath ? path.join(relativePath, file) : file;
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesRecursively(filePath, relPath));
    } else {
      results.push(relPath);
    }
  });
  return results;
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.pdf': return 'application/pdf';
    case '.json': return 'application/json';
    default: return 'application/octet-stream';
  }
}

function getPrimaryKey(table) {
  switch (table) {
    case 'settings': return 'key';
    default: return 'id';
  }
}

run().catch(console.error);
