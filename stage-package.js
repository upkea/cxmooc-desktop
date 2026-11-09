const fs = require('fs');
const p = JSON.parse(fs.readFileSync('D:/work/cxmooc-desktop/package.json', 'utf8'));
delete p.devDependencies;
delete p.scripts;
delete p.build.npmRebuild;
p.build.electronDist = 'electron-dist';
fs.writeFileSync('D:/work/stage/appstage/package.json', JSON.stringify(p, null, 2));
console.log('stage package.json rewritten, build.beforeBuild =', p.build.beforeBuild);