// config-store 单元自检：init / set / get / getAll / flush 落盘
const fs = require('fs');
const path = require('path');
const dir = 'D:/work/cxmooc-desktop/tmp/config-test-' + Date.now();
fs.mkdirSync(dir, { recursive: true });
const store = require('./config-store.js');
store.init(dir);
store.set('ai_key', 'sk-test');
store.set('ai_model', 'glm-4-flash');
store.flush();
const file = path.join(dir, 'cx-config.json');
const onDisk = JSON.parse(fs.readFileSync(file, 'utf8'));
const ok1 = store.get('ai_key') === 'sk-test';
const ok2 = JSON.stringify(onDisk) === JSON.stringify(store.getAll());
const ok3 = store.get('missing_key', 'def') === 'def';
console.log('set/get OK:', ok1, '| flush OK:', ok2, '| default OK:', ok3);
fs.rmSync(dir, { recursive: true, force: true });
process.exit(ok1 && ok2 && ok3 ? 0 : 1);