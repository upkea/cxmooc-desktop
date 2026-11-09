const fs = require('fs');
const crypto = require('crypto');
const f = 'D:/work/cxmooc-desktop/release-ci/windows-installer/学习通学习辅助 Setup 0.1.0.exe';
const name = '学习通学习辅助 Setup 0.1.0.exe';
const buf = fs.readFileSync(f);
const sha512 = crypto.createHash('sha512').update(buf).digest('base64');
const yml = [
  'version: 0.1.0',
  'files:',
  '  - url: ' + name,
  '    sha512: ' + sha512,
  '    size: ' + buf.length,
  'path: ' + name,
  'sha512: ' + sha512,
  "releaseDate: '2026-11-09T18:10:00.000Z'",
  '',
].join('\n');
fs.writeFileSync('D:/work/cxmooc-desktop/release-ci/windows-installer/latest.yml', yml);
console.log('latest.yml written, size', buf.length, 'sha512', sha512.slice(0, 16) + '...');