// cxmooc-desktop 主进程
// Electron 壳：内嵌学习通网页，注入现有用户脚本（shims + 无头 bundle）+ GM 垫片
const { app, BrowserWindow, session, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const IS_SMOKE = process.argv.includes('--smoke');

// 学习通用普通 Chrome UA 识别环境，伪装成常规浏览器避免被拦截
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const HOME_URL = 'https://i.chaoxing.com';

let win = null;

const LOG = [];
function log(...a) {
  const s = a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ');
  LOG.push(new Date().toISOString() + ' ' + s);
  console.log('[cxmooc]', s);
}
const flushTimer = setInterval(() => {
  if (LOG.length) {
    try {
      fs.appendFileSync(path.join(__dirname, IS_SMOKE ? 'smoke.log' : 'app.log'), LOG.join('\n') + '\n');
    } catch (e) { /* ignore */ }
    LOG.length = 0;
  }
}, 2000);

// 注入源码 = GM 垫片 + 无头部用户脚本（app-inject.js 由 make-bundle.js 生成）
function injectSource() {
  const shims = fs.readFileSync(path.join(__dirname, 'shims.js'), 'utf8');
  const body = fs.readFileSync(path.join(__dirname, 'app-inject.js'), 'utf8');
  return shims + '\n' + body;
}

function hookInjection(w) {
  // 通过 CDP 在每个新文档建立时（document-start）注入，保证脚本比页面 JS 先跑
  try {
    const dbg = w.webContents.debugger;
    dbg.attach('1.3');
    dbg.sendCommand('Page.enable');
    dbg.sendCommand('Page.addScriptToEvaluateOnNewDocument', { source: injectSource() });
    log('injection attached (document-start)');
  } catch (e) {
    log('debugger attach failed:', e.message);
  }
  // 兜底：dom-ready 时若没跑成功就再补一次
  w.webContents.on('dom-ready', () => {
    try {
      w.webContents.executeJavaScript('window.__cxInjected === true', true).then((ok) => {
        if (!ok) {
          w.webContents.executeJavaScript(injectSource(), true).catch(() => {});
        }
      }).catch(() => {});
    } catch (e) { /* ignore */ }
  });
  w.webContents.on('did-finish-load', () => log('load:', w.webContents.getURL()));
  w.webContents.on('did-fail-load', (e, code, desc, url) => log('fail-load:', code, desc || '', url || ''));
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 900,
    show: !IS_SMOKE,
    title: '学习通 · 学习辅助',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false, // MVP 阶段放开隔离，让脚本能直接操作 window；稳定后再收紧
      nodeIntegration: false,
      sandbox: false,          // preload 需要 ipcRenderer
    },
  });
  win.webContents.setUserAgent(CHROME_UA);
  hookInjection(win);
  // 弹窗一律交给系统浏览器，避免新窗口丢注入
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url && /^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.loadURL(HOME_URL).catch((e) => log('loadURL err:', e.message));

  if (IS_SMOKE) {
    setTimeout(async () => {
      try {
        const ok = await win.webContents.executeJavaScript(
          '({inj: window.__cxInjected === true, gm: typeof window.GM_xmlhttpRequest, gs: typeof window.GM_setValue, ua: navigator.userAgent.slice(0, 60)})',
          true
        );
        log('smoke check:', JSON.stringify(ok));
      } catch (e) {
        log('smoke check err:', e.message);
      }
      log('smoke done');
      app.quit();
    }, 30000);
  }
}

app.whenReady().then(() => {
  app.userAgentFallback = CHROME_UA;
  session.defaultSession.setUserAgent(CHROME_UA);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// GM_xmlhttpRequest → 主进程 fetch，绕开页面 CORS
ipcMain.handle('cx-request', async (e, details) => {
  try {
    details = details || {};
    const headers = Object.assign({}, details.headers || {});
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), details.timeout || 30000);
    const res = await fetch(details.url, {
      method: details.method || 'GET',
      headers: headers,
      body: details.data || null,
      signal: ctrl.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);
    const text = await res.text();
    return { status: res.status, text };
  } catch (err) {
    return { error: String((err && err.message) || err) };
  }
});