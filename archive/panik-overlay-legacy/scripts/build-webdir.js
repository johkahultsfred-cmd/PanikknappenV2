const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const webDir = path.join(root, 'www');

const filesToCopy = ['index.html', 'manifest.webmanifest', 'sw.js'];
const dirsToCopy = ['apps', 'assets'];

fs.rmSync(webDir, { recursive: true, force: true });
fs.mkdirSync(webDir, { recursive: true });

for (const file of filesToCopy) {
  const src = path.join(root, file);
  const dest = path.join(webDir, file);
  fs.copyFileSync(src, dest);
}

for (const dir of dirsToCopy) {
  const src = path.join(root, dir);
  const dest = path.join(webDir, dir);
  fs.cpSync(src, dest, { recursive: true });
}

console.log('OK: www är byggd för Capacitor sync');
