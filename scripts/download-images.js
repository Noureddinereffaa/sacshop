const fs = require('fs');
const path = require('path');
const https = require('https');

const backupDir = path.join(__dirname, '..', 'backup', 'storage');
const oldSupabaseUrl = 'https://rzttwmqdwhczsrwdonrl.supabase.co';

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

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        reject(new Error(`Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  const files = getAllFilesRecursively(backupDir);
  console.log(`Found ${files.length} files to check.`);
  
  for (const fileLocalPath of files) {
    // Relative path from backupDir
    const relativePath = path.relative(backupDir, fileLocalPath).replace(/\\/g, '/');
    const parts = relativePath.split('/');
    const bucket = parts[0];
    const filePath = parts.slice(1).join('/');
    
    const url = `${oldSupabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
    
    console.log(`Downloading ${relativePath}...`);
    try {
      await downloadFile(url, fileLocalPath);
      console.log('  -> OK');
    } catch (e) {
      console.log('  -> ERROR:', e.message);
    }
  }
  
  console.log('Finished downloading images.');
}

run();
