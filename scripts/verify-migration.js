/**
 * SAC SHOP - Migration Verification Tool
 * Compares record counts and storage files between Cloud (source) and Self-Hosted (target) Supabase instances.
 */

const { createClient } = require('@supabase/supabase-js');

async function run() {
  console.log('==================================================');
  console.log('🔍 SAC SHOP - Migration Verification Tool');
  console.log('==================================================\n');

  const sourceUrl = process.argv[2] || process.env.SOURCE_SUPABASE_URL;
  const sourceKey = process.argv[3] || process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY;
  const targetUrl = process.argv[4] || process.env.TARGET_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const targetKey = process.argv[5] || process.env.TARGET_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!sourceUrl || !sourceKey || !targetUrl || !targetKey) {
    console.error('❌ Error: Missing configuration parameters.');
    console.log('\nUsage:');
    console.log('node scripts/verify-migration.js <SOURCE_URL> <SOURCE_KEY> <TARGET_URL> <TARGET_KEY>\n');
    process.exit(1);
  }

  console.log('Connecting to Source (Cloud)...');
  const sourceClient = createClient(sourceUrl, sourceKey, { auth: { persistSession: false } });
  
  console.log('Connecting to Target (Self-Hosted)...');
  const targetClient = createClient(targetUrl, targetKey, { auth: { persistSession: false } });

  const tables = ['settings', 'products', 'customers', 'orders', 'vip_offers', 'order_status_history'];
  
  console.log('\n📊 Database Tables Comparison:');
  console.log('--------------------------------------------------');
  console.log(pad('Table Name', 25) + ' | ' + pad('Source Count', 12) + ' | ' + pad('Target Count', 12) + ' | Status');
  console.log('--------------------------------------------------');

  for (const table of tables) {
    let sourceCount = 'N/A';
    let targetCount = 'N/A';
    let status = '❌ Error';

    try {
      const { count: srcCount, error: srcError } = await sourceClient
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (!srcError) sourceCount = srcCount;
    } catch (e) {
      sourceCount = 'Error';
    }

    try {
      const { count: tgtCount, error: tgtError } = await targetClient
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (!tgtError) targetCount = tgtCount;
    } catch (e) {
      targetCount = 'Error';
    }

    if (sourceCount !== 'Error' && targetCount !== 'Error') {
      if (sourceCount === targetCount) {
        status = '✅ Match';
      } else {
        status = '⚠️ Mismatch';
      }
    }

    console.log(
      pad(table, 25) + ' | ' + 
      pad(String(sourceCount), 12) + ' | ' + 
      pad(String(targetCount), 12) + ' | ' + 
      status
    );
  }

  console.log('\n👥 Auth Users Comparison:');
  console.log('--------------------------------------------------');
  let srcUsersCount = 'Error';
  let tgtUsersCount = 'Error';

  try {
    const { data: { users: srcUsers }, error: srcAuthErr } = await sourceClient.auth.admin.listUsers();
    if (!srcAuthErr) srcUsersCount = srcUsers.length;
  } catch (e) {}

  try {
    const { data: { users: tgtUsers }, error: tgtAuthErr } = await targetClient.auth.admin.listUsers();
    if (!tgtAuthErr) tgtUsersCount = tgtUsers.length;
  } catch (e) {}

  const authStatus = (srcUsersCount === tgtUsersCount && srcUsersCount !== 'Error') ? '✅ Match' : '⚠️ Mismatch/Check';
  console.log(
    pad('Auth Users (GoTrue)', 25) + ' | ' + 
    pad(String(srcUsersCount), 12) + ' | ' + 
    pad(String(tgtUsersCount), 12) + ' | ' + 
    authStatus
  );

  const buckets = ['products', 'orders'];
  console.log('\n📦 Storage Buckets Comparison:');
  console.log('--------------------------------------------------');
  console.log(pad('Bucket Name', 25) + ' | ' + pad('Source Files', 12) + ' | ' + pad('Target Files', 12) + ' | Status');
  console.log('--------------------------------------------------');

  for (const bucket of buckets) {
    let srcFilesCount = 'N/A';
    let tgtFilesCount = 'N/A';
    let status = '❌ Error';

    try {
      const srcFiles = await listAllFiles(sourceClient, bucket);
      srcFilesCount = srcFiles.length;
    } catch (e) {
      srcFilesCount = 'Error';
    }

    try {
      const tgtFiles = await listAllFiles(targetClient, bucket);
      tgtFilesCount = tgtFiles.length;
    } catch (e) {
      tgtFilesCount = 'Error';
    }

    if (srcFilesCount !== 'Error' && tgtFilesCount !== 'Error') {
      if (srcFilesCount === tgtFilesCount) {
        status = '✅ Match';
      } else {
        status = '⚠️ Mismatch';
      }
    }

    console.log(
      pad(bucket, 25) + ' | ' + 
      pad(String(srcFilesCount), 12) + ' | ' + 
      pad(String(tgtFilesCount), 12) + ' | ' + 
      status
    );
  }
  console.log('--------------------------------------------------\n');
}

async function listAllFiles(supabase, bucketName, folderPath = '') {
  let files = [];
  try {
    const { data, error } = await supabase.storage.from(bucketName).list(folderPath, {
      limit: 100,
      offset: 0
    });
    
    if (error) return [];
    
    for (const item of data || []) {
      const itemPath = folderPath ? `${folderPath}/${item.name}` : item.name;
      const isFolder = !item.id && (!item.metadata || Object.keys(item.metadata).length === 0);
      
      if (isFolder) {
        const subFiles = await listAllFiles(supabase, bucketName, itemPath);
        files = files.concat(subFiles);
      } else {
        files.push(itemPath);
      }
    }
  } catch (e) {
    return [];
  }
  return files;
}

function pad(str, length) {
  while (str.length < length) {
    str += ' ';
  }
  return str;
}

run().catch(console.error);
