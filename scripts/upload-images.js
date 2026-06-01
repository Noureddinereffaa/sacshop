const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const mime = require('mime-types');

// Get credentials from environment or fallback to user's Coolify credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabasekong-x11r5k1z2xfuwwrv4ez3mjcl.195.201.119.89.sslip.io';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3OTgzOTg4MCwiZXhwIjo0OTM1NTEzNDgwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.fjXyj4T4deGlG5sjmSSw3SZzMMy8MdriyUa3vIdCfKY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const backupDir = path.join(__dirname, '..', 'backup', 'storage');

function getAllFilesRecursively(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFilesRecursively(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });
  return arrayOfFiles;
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  return mime.lookup(filePath) || 'application/octet-stream';
}

async function run() {
  console.log(`Uploading to: ${supabaseUrl}`);
  
  if (!fs.existsSync(backupDir)) {
    console.log('No storage backup found.');
    return;
  }
  
  const files = getAllFilesRecursively(backupDir);
  console.log(`Found ${files.length} files to upload.`);

  for (const fileLocalPath of files) {
    const relativePath = path.relative(backupDir, fileLocalPath).replace(/\\/g, '/');
    const parts = relativePath.split('/');
    const bucket = parts[0];
    const storagePath = parts.slice(1).join('/');

    const fileBuffer = fs.readFileSync(fileLocalPath);
    
    console.log(`Uploading ${bucket}/${storagePath}...`);
    
    // Attempt upload
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        upsert: true,
        contentType: getContentType(storagePath)
      });
      
    if (uploadError) {
      // If bucket doesn't exist, try to create it then upload again
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('row level security')) {
         console.log(`Bucket ${bucket} missing or RLS error. Creating bucket...`);
         await supabase.storage.createBucket(bucket, { public: true });
         
         const { error: retryError } = await supabase.storage
          .from(bucket)
          .upload(storagePath, fileBuffer, {
            upsert: true,
            contentType: getContentType(storagePath)
          });
          
         if (retryError) {
            console.error(`  -> Failed: ${retryError.message}`);
         } else {
            console.log('  -> Uploaded (after creating bucket)');
         }
      } else {
        console.error(`  -> Failed: ${uploadError.message}`);
      }
    } else {
      console.log('  -> Uploaded');
    }
  }

  console.log('Upload complete!');
}

run();
