// GM 垫片：让为油猴写的脚本在 Electron 页面环境里跑起来
// 由 main.js 在 document-start 注入（在用户脚本之前）
(function () {
  try {
    var w = window;
    if (typeof w.GM_xmlhttpRequest !== 'function') {
      // 跨域请求 → preload 的 IPC → 主进程 fetch
      w.GM_xmlhttpRequest = function (details) {
        details = details || {};
        var invoke = w.__cxIpcRequest;
        if (typeof invoke !== 'function') {
          if (details.onerror) details.onerror({ error: 'no ipc bridge' });
          return;
        }
        invoke(details)
          .then(function (res) {
            if (res && res.error) {
              if (details.onerror) details.onerror(res);
              return;
            }
            var resp = { readyState: 4, status: (res && res.status) || 0, responseText: (res && res.text) || '' };
            if (details.onreadystatechange) details.onreadystatechange(resp);
            if (details.onload) details.onload(resp);
          })
          .catch(function (e) {
            if (details.onerror) details.onerror(e);
          });
      };
    }
    if (typeof w.GM_setValue !== 'function') {
      w.GM_setValue = function (k, v) {
        try { w.localStorage && w.localStorage.setItem(k, String(v)); } catch (e) { /* ignore */ }
      };
    }
    if (typeof w.GM_getValue !== 'function') {
      w.GM_getValue = function (k, d) {
        try {
          var v = w.localStorage && w.localStorage.getItem(k);
          return v == null ? d : v;
        } catch (e) { return d; }
      };
    }
    if (typeof w.GM_notification !== 'function') {
      w.GM_notification = function (d) {
        try {
          var title = (d && d.title) || '网课小工具';
          var text = String((d && d.text) || '').slice(0, 120);
          new Notification(title, { body: text });
        } catch (e) { /* ignore */ }
      };
    }
    w.unsafeWindow = w;
    w.__cxInjected = true;
  } catch (e) {
    // ignore
  }
})();