const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const output = fs.createWriteStream('deploy-correct.zip');
const archive = archiver('zip', { 
  zlib: { level: 9 },
  // Force Unix-style paths and permissions
  store: false
});

output.on('close', () => {
  console.log(`✅ deploy-correct.zip criado: ${archive.pointer()} bytes`);
  console.log('📦 Estrutura Unix-friendly garantida');
});

archive.on('error', (err) => {
  throw err;
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  Warning:', err);
  } else {
    throw err;
  }
});

archive.pipe(output);

// Add directories with Unix-friendly paths (forward slashes)
// archiver automatically uses forward slashes internally
archive.directory('build/', 'build', {
  mode: 0o755 // Unix permissions: rwxr-xr-x
});

archive.directory('node_modules/', 'node_modules', {
  mode: 0o755
});

// Add files with proper Unix permissions
archive.file('package.json', { 
  name: 'package.json',
  mode: 0o644 // rw-r--r--
});

archive.file('package-lock.json', { 
  name: 'package-lock.json',
  mode: 0o644
});

archive.finalize();

