// 生成应用图标：绿色圆底 + 白色播放三角（16/32/48/256 多尺寸 ICO）
const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function render(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const c = size / 2;
  const R = size * 0.465;
  const cx = size * 0.535, cy = size * 0.5; // 三角中心稍偏右
  const h = size * 0.34;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const o = y * (size * 4 + 1) + 1 + x * 4;
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c);
      if (d > R) { raw[o] = raw[o + 1] = raw[o + 2] = 67; raw[o + 3] = 0; continue; }
      // 圆底渐变绿
      const t = d / R;
      raw[o] = Math.round(30 + 60 * t);
      raw[o + 1] = Math.round(170 + 50 * (1 - t));
      raw[o + 2] = Math.round(80 + 20 * (1 - t));
      raw[o + 3] = 255;
      // 白色播放三角（点在第 (cx, cy±h) 与 (cx+h, cy) 之间）
      const x0 = x + 0.5, y0 = y + 0.5;
      const p1 = { x: cx - h * 0.62, y: cy - h }, p2 = { x: cx - h * 0.62, y: cy + h }, p3 = { x: cx + h * 0.78, y: cy };
      const s1 = (p2.x - p1.x) * (y0 - p1.y) - (p2.y - p1.y) * (x0 - p1.x);
      const s2 = (p3.x - p2.x) * (y0 - p2.y) - (p3.y - p2.y) * (x0 - p2.x);
      const s3 = (p1.x - p3.x) * (y0 - p3.y) - (p1.y - p3.y) * (x0 - p3.x);
      if ((s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0)) {
        raw[o] = raw[o + 1] = raw[o + 2] = 255;
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const sizes = [16, 32, 48, 256];
const pngs = sizes.map((s) => ({ s, buf: render(s) }));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
const entries = [];
let offset = 6 + 16 * pngs.length;
for (const p of pngs) {
  const e = Buffer.alloc(16);
  e[0] = p.s >= 256 ? 0 : p.s; // 256 用 0 表示
  e[1] = p.s >= 256 ? 0 : p.s;
  e.writeUInt16LE(1, 4); // color count
  e.writeUInt16LE(32, 6); // bpp
  e.writeUInt32LE(p.buf.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += p.buf.length;
  entries.push(e);
}
const ico = Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]);
fs.mkdirSync('D:/work/cxmooc-desktop/build-resources', { recursive: true });
fs.writeFileSync('D:/work/cxmooc-desktop/build-resources/icon.ico', ico);
console.log('icon.ico written:', ico.length, 'bytes, sizes', sizes.join('/'));