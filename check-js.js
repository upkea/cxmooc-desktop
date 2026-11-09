const vm = require('vm');
const fs = require('fs');
const files = ['main.js', 'preload.js', 'shims.js', 'settings.js', 'config-store.js', 'make-bundle.js', 'make-tray.js', 'before-build.js'];
let bad = 0;
for (const f of files) {
  try {
    new vm.Script(fs.readFileSync('D:/work/cxmooc-desktop/' + f, 'utf8'), { filename: f });
    console.log(f, 'OK');
  } catch (e) {
    bad++;
    console.log(f, 'FAIL:', e.message.split('\n')[0]);
  }
}
process.exit(bad ? 1 : 0);