/* ============================================================
 * 工具层 — DOM、日期、倒计时、艾宾浩斯排程、Mermaid、可选 LLM 调用
 * ========================================================== */
(function (global) {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function fmtDate(d) {
    const x = (d instanceof Date) ? d : new Date(d);
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  }
  function addDays(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return fmtDate(d);
  }
  function daysBetween(a, b) {
    const da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
  }

  // 艾宾浩斯间隔：第 1、2、4、7、15 天（与提示词 D1/D2/D4/D7/D15 对齐；不含当天，避免刚错题即"已复习"）
  function ebbinghaus(baseDate) {
    return [1, 2, 4, 7, 15].map(n => addDays(baseDate, n));
  }

  function uid() { return 'x' + Date.now() + Math.floor(Math.random() * 1000); }

  /* ---------------- 日志层（错误处理规范核心） ----------------
   * 统一日志：分级(DEBUG/INFO/WARN/ERROR) + 内存环形缓冲(最近 200 条)
   * 便于排查 localStorage 配额、LLM 调用、数据损坏等问题。
   */
  const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
  const _logBuf = [];
  function safeStringify(v) {
    try { return typeof v === 'string' ? v : JSON.stringify(v); }
    catch (e) { try { return String(v); } catch (_) { return '[Unserializable]'; } }
  }
  function log(level, ...args) {
    const threshold = LOG_LEVELS[global.ZK_LOG_LEVEL || 'INFO'] ?? LOG_LEVELS.INFO;
    const msg = args.map(a => (a && typeof a === 'object') ? safeStringify(a) : String(a)).join(' ');
    const entry = { t: new Date().toISOString(), level, msg };
    _logBuf.push(entry);
    if (_logBuf.length > 200) _logBuf.shift();
    global.ZK_LOG_BUFFER = _logBuf;
    if (LOG_LEVELS[level] >= threshold) {
      const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
      fn(`[ZK ${level}]`, ...args);
    }
  }
  const ZK_LOG = {
    debug: (...a) => log('DEBUG', ...a),
    info: (...a) => log('INFO', ...a),
    warn: (...a) => log('WARN', ...a),
    error: (...a) => log('ERROR', ...a),
    buffer: () => _logBuf.slice(),
    setLevel: (lv) => { global.ZK_LOG_LEVEL = lv; },
    dump: () => _logBuf.map(e => `${e.t} [${e.level}] ${e.msg}`).join('\n')
  };

  async function renderMermaid(container, code) {
    try {
      if (!global.mermaid) {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
        await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s); });
      }
      global.mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: { primaryColor: '#eaf2ff', lineColor: '#3b82f6' } });
      const id = 'mmd' + uid();
      const el = document.createElement('div');
      el.className = 'mermaid';
      el.id = id;
      el.textContent = code;
      container.innerHTML = '';
      container.appendChild(el);
      await global.mermaid.run({ nodes: [el] });
    } catch (e) {
      container.innerHTML = '<pre class="mermaid-fallback">' + esc(code) + '</pre><p class="muted">（Mermaid 在线渲染不可用，已展示文本结构）</p>';
    }
  }

  // 可选 AI 增强：未配置密钥时抛出 NO_KEY
  // 安全/健壮性：仅允许 https 端点；带 20s 超时与 AbortController；失败统一记录日志
  async function callLLM(systemPrompt, userPrompt) {
    const s = global.ZK_STORE.getSettings();
    if (!s.apiKey) { const e = new Error('NO_KEY'); ZK_LOG.warn('callLLM: 未配置 API Key，回退内置逻辑'); throw e; }
    let base = s.apiBase || 'https://api.openai.com/v1/chat/completions';
    if (!/^https:\/\//i.test(base)) { ZK_LOG.error('callLLM: 仅支持 https 端点，拒绝明文 http', base); throw new Error('INSECURE_ENDPOINT'); }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    const t0 = performance.now();
    try {
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.apiKey },
        body: JSON.stringify({
          model: s.apiModel || 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          temperature: 0.7
        }),
        signal: ctrl.signal
      });
      if (!res.ok) { ZK_LOG.error('callLLM: API 返回', res.status, base); throw new Error('API_ERR_' + res.status); }
      const j = await res.json();
      const content = (j.choices && j.choices[0] && j.choices[0].message.content) || '';
      ZK_LOG.info('callLLM: 成功', base, Math.round(performance.now() - t0) + 'ms', 'len=' + content.length);
      return content;
    } catch (e) {
      if (e.name === 'AbortError') { ZK_LOG.error('callLLM: 超时(20s)', base); throw new Error('TIMEOUT'); }
      ZK_LOG.error('callLLM: 调用失败', e.message || e);
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  function toast(msg, type) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = 'toast show ' + (type || '');
    setTimeout(() => { t.className = 'toast'; }, 2200);
  }

  /* ---------------- 一键导出 PDF（浏览器打印，零依赖、中文用系统字体、CSP 安全） ----------------
   * 思路：将待导出内容注入隐藏的 #print-root，切 body.printing 后调用 window.print()，
   *       由 @media print 样式仅渲染打印区（A4 规整排版）；用户可在打印对话框选"另存为 PDF"。
   */
  function printDoc(title, bodyHtml) {
    const root = document.getElementById('print-root');
    if (!root) { window.print(); return; }
    const stamp = fmtDate(new Date());
    root.innerHTML = '<div class="print-doc">' +
      '<div class="print-head">' +
        '<div class="print-brand">深圳中考 AI 复习系统</div>' +
        '<div class="print-meta">导出时间：' + stamp + '</div>' +
      '</div>' +
      '<h1 class="print-title">' + esc(title) + '</h1>' +
      bodyHtml +
      '<div class="print-foot">本资料为学习辅助内容，知识点与题型严格对标深圳中考指定教材版本；真题/模拟题为教学示例，请以官方发布为准。</div>' +
      '</div>';
    document.body.classList.add('printing');
    // 等待 DOM 重排后再唤起打印对话框
    setTimeout(() => {
      try { window.print(); } catch (e) { if (window.ZK_LOG) window.ZK_LOG.error('printDoc', e.message); }
      // 打印结束（或取消）后清理
      setTimeout(() => { document.body.classList.remove('printing'); root.innerHTML = ''; }, 200);
    }, 80);
  }

  global.ZK_UTIL = { $, $$, esc, fmtDate, addDays, daysBetween, ebbinghaus, uid, renderMermaid, callLLM, toast, safeStringify, printDoc };
  global.ZK_LOG = ZK_LOG;
})(window);
