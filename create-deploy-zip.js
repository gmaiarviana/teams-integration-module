const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream('deploy-correct.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ deploy-correct.zip criado: ${archive.pointer()} bytes`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory('build/', 'build');
archive.directory('node_modules/', 'node_modules');
archive.file('package.json', { name: 'package.json' });
archive.file('package-lock.json', { name: 'package-lock.json' });
archive.finalize();

