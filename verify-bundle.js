const fs = require('fs');
const t = fs.readFileSync('D:/work/cxmooc-desktop/app-inject.js', 'utf8');
console.log('bytes', Buffer.byteLength(t));
for (const k of ['字体解密', 'StartCatalogWatch', 'StartVideoGuard', '更改API', 'ai_key: ""', '==UserScript==']) {
  console.log(k, t.includes(k));
}