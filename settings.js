// 原生设置窗口逻辑：读写主进程统一配置，测试 AI 连接
(function () {
  var PROVIDERS = {
    zhipu: { base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
    siliconflow: { base: 'https://api.siliconflow.cn/v1', model: 'Qwen/Qwen2.5-7B-Instruct' },
    deepseek: { base: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
    custom: { base: '', model: '' }
  };
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    enable: $('ai-enable'), enableText: $('ai-enable-text'),
    provider: $('ai-provider'), key: $('ai-key'), base: $('ai-base'), model: $('ai-model'),
    status: $('ai-status'), save: $('btn-save'), test: $('btn-test'),
    open: $('btn-open'), docs: $('btn-docs'), repo: $('lnk-repo')
  };

  function setStatus(text, cls) {
    el.status.textContent = text;
    el.status.className = 'status ' + cls;
  }

  function formConf() {
    var base = el.base.value.trim().replace(/\/+$/, '');
    return {
      base: base,
      key: el.key.value.trim(),
      model: el.model.value.trim(),
      enable: el.enable.checked
    };
  }

  function matchProvider(base) {
    for (var k in PROVIDERS) {
      if (PROVIDERS[k].base && PROVIDERS[k].base === base) return k;
    }
    return 'custom';
  }

  function applyProvider(pid) {
    if (pid !== 'custom') {
      el.base.value = PROVIDERS[pid].base;
      el.model.value = PROVIDERS[pid].model;
    }
    var ro = pid !== 'custom';
    el.base.readOnly = ro;
    el.model.readOnly = ro;
    el.base.style.background = ro ? '#f2f3f5' : '#fff';
    el.model.style.background = ro ? '#f2f3f5' : '#fff';
  }

  function load() {
    var all = {};
    try { all = window.__cxCfgAll() || {}; } catch (e) { all = {}; }
    el.enable.checked = !(all.ai_enable === false || all.ai_enable === 'false');
    el.enableText.textContent = el.enable.checked ? '开启' : '关闭';
    el.enableText.className = 'status ' + (el.enable.checked ? 'ok' : 'bad');
    el.key.value = all.ai_key || '';
    var base = all.ai_base || '';
    el.base.value = base;
    el.model.value = all.ai_model || '';
    el.provider.value = matchProvider(base);
    applyProvider(el.provider.value);
    if (!base && !all.ai_model) {
      // 全新使用时给个友好的默认服务商
      el.provider.value = 'zhipu';
      applyProvider('zhipu');
    }
    if (all.ai_key) {
      setStatus('已保存的 Key 存在，点击「测试连接」验证', 'ok');
    } else {
      setStatus('还没填 API Key', 'bad');
    }
  }

  function save() {
    var c = formConf();
    try {
      window.__cxCfgSet('ai_enable', c.enable ? 'true' : 'false');
      window.__cxCfgSet('ai_base', c.base || PROVIDERS.zhipu.base);
      window.__cxCfgSet('ai_key', c.key);
      window.__cxCfgSet('ai_model', c.model || PROVIDERS.zhipu.model);
      el.enableText.textContent = c.enable ? '开启' : '关闭';
      el.enableText.className = 'status ' + (c.enable ? 'ok' : 'bad');
      if (!c.key) setStatus('已保存（Key 为空，答题不会生效）', 'bad');
      else setStatus('已保存', 'ok');
    } catch (e) {
      setStatus('保存失败：' + (e && e.message || e), 'bad');
    }
  }

  function test() {
    var c = formConf();
    if (!c.key) { setStatus('先填 API Key', 'bad'); return; }
    var url = (c.base || PROVIDERS.zhipu.base) + '/chat/completions';
    var t0 = Date.now();
    el.test.disabled = true;
    setStatus('检测中…', 'dim');
    window.__cxIpcRequest({
      url: url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + c.key },
      data: JSON.stringify({ model: c.model || 'x', max_tokens: 4, temperature: 0, messages: [{ role: 'user', content: 'ping' }] }),
      timeout: 15000
    }).then(function (res) {
      el.test.disabled = false;
      var ms = Date.now() - t0;
      if (res && res.error) { setStatus('网络错误：' + res.error, 'bad'); return; }
      var s = (res && res.status) || 0;
      if (s >= 200 && s < 300) { setStatus('连接成功 ' + ms + 'ms', 'ok'); return; }
      if (s === 401 || s === 403) { setStatus('Key 不对或无权限（HTTP ' + s + '）', 'bad'); return; }
      if (s === 404) { setStatus('接口地址不对（HTTP 404）', 'bad'); return; }
      if (s === 429) { setStatus('请求太频繁或额度用完（HTTP 429）', 'bad'); return; }
      setStatus('HTTP ' + s + ' ' + String((res && res.text) || '').slice(0, 60), 'bad');
    }).catch(function (e) {
      el.test.disabled = false;
      setStatus('网络错误：' + (e && e.message || e), 'bad');
    });
  }

  el.provider.addEventListener('change', function () { applyProvider(el.provider.value); });
  el.enable.addEventListener('change', function () {
    el.enableText.textContent = el.enable.checked ? '开启' : '关闭';
    el.enableText.className = 'status ' + (el.enable.checked ? 'ok' : 'bad');
  });
  el.save.addEventListener('click', save);
  el.test.addEventListener('click', test);
  el.open.addEventListener('click', function () {
    try { window.__cxInvoke('cx-open-main'); } catch (e) { /* ignore */ }
  });
  el.docs.addEventListener('click', function () {
    try { window.__cxInvoke('cx-open-url', 'https://github.com/upkea/cxmooc-desktop#readme'); } catch (e) { /* ignore */ }
  });
  el.repo.addEventListener('click', function (ev) {
    ev.preventDefault();
    try { window.__cxInvoke('cx-open-url', 'https://github.com/upkea/cxmooc-desktop'); } catch (e) { /* ignore */ }
  });

  load();
})();