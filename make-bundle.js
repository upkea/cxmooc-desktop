// 把「油猴版本脚本」拼成桌面版可注入 bundle：
//   头部文件（去掉 ==UserScript== 元信息块） + webpack 产物
// 产物 app-inject.js 由 main.js 注入页面
const fs = require('fs');
const path = require('path');

const headerFile = path.join(__dirname, 'vendor', 'cxmooc-header.js');
const bundleFile = path.join(__dirname, 'vendor', 'tampermonkey-cxmooc.js');
const outFile = path.join(__dirname, 'app-inject.js');

let header = fs.readFileSync(headerFile, 'utf8').replace(/^\uFEFF/, '');
let bundle = fs.readFileSync(bundleFile, 'utf8').replace(/^\uFEFF/, '');

// 去掉元信息块（/// ==UserScript== ... ==/UserScript== 注释）
header = header.replace(/\/\/\s*==UserScript==[\s\S]*?==\/UserScript==\s*/g, '');
// 去掉 webpack 产物的 sourceMappingURL
bundle = bundle.replace(/^\s*\/\/# sourceMappingURL=.*$/m, '');

const out = header.replace(/\s*$/, '\n') + '\n' + bundle;
fs.writeFileSync(outFile, out);
console.log('app-inject.js:', fs.statSync(outFile).size, 'bytes');