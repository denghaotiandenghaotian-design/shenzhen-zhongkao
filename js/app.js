/* ============================================================
 * 深圳中考 AI 复习系统 — 应用主逻辑
 * 七模块：考点库 / 智能刷题 / 错题回顾 / 复习计划 / 思维导图 / 模拟考试 / 背诵打卡
 * 每模块均映射其提示词的【角色/输入/处理/输出/约束】五要素。
 * ========================================================== */
(function () {
  const U = window.ZK_UTIL, S = window.ZK_STORE, D = window.ZK_DATA, P = window.ZK_PROMPTS;
  const $ = U.$, $$ = U.$$;
  let view = 'overview';

  /* ---------------- 启动 ---------------- */
  // 座位模式已取消，全站为单一共享系统，直接进入。
  function init() {
    finishInit();
  }

  function finishInit() {
    $$('#nav .nav-item').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
    // 事件委托：处理动态生成的 data-go 跳转按钮（替代内联 onclick，配合 CSP）
    document.addEventListener('click', e => { const t = e.target.closest('[data-go]'); if (t) setView(t.dataset.go); });
    $('#btn-settings').addEventListener('click', openSettings);
    $('#settings-modal').addEventListener('click', e => { if (e.target.id === 'settings-modal' || e.target.dataset.close !== undefined) closeSettings(); });
    $('#btn-save-settings').addEventListener('click', saveSettings);
    $('#btn-reset').addEventListener('click', () => { if (confirm('确认重置本座位全部数据？将清空错题、计划、打卡与自定义考点（不影响其他座位）。')) { S.reset(); U.toast('已重置', 'ok'); closeSettings(); refreshCountdown(); render(); } });
    $('#btn-export-all').addEventListener('click', exportAll);
    $('#btn-import-all').addEventListener('click', () => $('#set-file').click());
    $('#set-file').addEventListener('change', importAll);
    $('#btn-backup-folder').addEventListener('click', backupToFolder);
    $('#nav .nav-item[data-view="overview"]').classList.add('active');
    refreshCountdown();
    render();
  }

  function setView(v) { view = v; $$('#nav .nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === v)); const t = { overview: '总览', bank: '考点库管理', practice: '智能刷题', wrong: '错题回顾', plan: '复习计划', mindmap: '知识点思维导图', exam: '模拟考试', recite: '背诵打卡', prompts: '提示词库', engwords: '英语单词记忆', classical: '文言文专项' }[v]; if (t) $('#view-title').textContent = t; render(); }

  function refreshCountdown() {
    const d = S.getSettings().examDate; const n = U.daysBetween(ZK_TODAY(), d);
    $('#countdown .cd-num').textContent = (n >= 0 ? n : 0);
  }

  /* ---------------- 设置 ---------------- */
  function openSettings() {
    const s = S.getSettings();
    $('#set-examDate').value = s.examDate; $('#set-dailyHours').value = s.dailyHours;
    $('#set-targetScore').value = s.targetScore; $('#set-targetSchool').value = s.targetSchool || '';
    $('#set-apiKey').value = s.apiKey || ''; $('#set-apiBase').value = s.apiBase || '';
    $('#set-apiModel').value = s.apiModel || '';
    $('#settings-modal').classList.remove('hidden');
  }
  function closeSettings() { $('#settings-modal').classList.add('hidden'); }
  function exportAll() {
    try {
      const data = JSON.stringify(S.exportAll(), null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '深圳中考复习数据_全量备份.json'; a.click();
      window.ZK_LOG && window.ZK_LOG.info('exportAll: 已导出全量备份', data.length + 'B');
      U.toast('已导出全部数据', 'ok');
    } catch (e) { U.toast('导出失败', 'err'); window.ZK_LOG && window.ZK_LOG.error('exportAll', e.message); }
  }
  async function backupToFolder() {
    if (!window.showDirectoryPicker) {
      U.toast('当前浏览器不支持直接写文件夹，请用「导出全部数据」下载后手动移入 D:\\考试', 'warn');
      window.ZK_LOG && window.ZK_LOG.warn('backupToFolder: 浏览器不支持 showDirectoryPicker');
      return;
    }
    try {
      const dir = await window.showDirectoryPicker();
      let target = dir, sub = '';
      try { target = await dir.getDirectoryHandle('backup', { create: true }); sub = 'backup\\'; } catch (e) { /* 退回根目录 */ }
      const data = JSON.stringify(S.exportAll(), null, 2);
      const fname = 'zk-backup-' + ZK_TODAY().replace(/-/g, '') + '.json';
      const fh = await target.getFileHandle(fname, { create: true });
      const w = await fh.createWritable();
      await w.write(data); await w.close();
      window.ZK_LOG && window.ZK_LOG.info('backupToFolder: 已写入', (sub || '') + fname);
      U.toast('已备份到所选文件夹：' + sub + fname, 'ok');
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      window.ZK_LOG && window.ZK_LOG.error('backupToFolder', e && e.message);
      U.toast('备份未完成：' + (e && e.message ? e.message : '已取消'), 'warn');
    }
  }
  function importAll(e) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const obj = JSON.parse(r.result);
        if (!obj || typeof obj !== 'object') throw new Error('INVALID');
        S.importAll(obj);
        window.ZK_LOG && window.ZK_LOG.info('importAll: 已导入备份');
        closeSettings(); refreshCountdown(); render(); U.toast('已导入备份', 'ok');
      } catch (err) { U.toast('备份文件解析失败', 'err'); window.ZK_LOG && window.ZK_LOG.error('importAll', err.message); }
    };
    r.readAsText(f);
  }
  function saveSettings() {
    const examDate = $('#set-examDate').value;
    if (!examDate || !/^\d{4}-\d{2}-\d{2}$/.test(examDate)) { U.toast('请填写有效的中考日期', 'warn'); return; }
    const dailyHours = Math.max(1, Math.min(12, +$('#set-dailyHours').value || 4));
    const targetScore = Math.max(0, Math.min(610, +$('#set-targetScore').value || 0));
    if (+$('#set-targetScore').value > 610) U.toast('目标分已按满分 610 截断', 'warn');
    S.setSettings({
      examDate, dailyHours, targetScore, targetSchool: $('#set-targetSchool').value,
      apiKey: $('#set-apiKey').value, apiBase: $('#set-apiBase').value, apiModel: $('#set-apiModel').value
    });
    window.ZK_LOG ? window.ZK_LOG.info('saveSettings: 设置已保存', { examDate, dailyHours, targetScore }) : null;
    closeSettings(); refreshCountdown(); U.toast('设置已保存', 'ok');
  }

  /* ---------------- 通用辅助 ---------------- */
  const freqClass = f => f === '高' ? 'high' : f === '中' ? 'mid' : 'low';
  const freqChip = f => `<span class="chip ${freqClass(f)}">${f === '高' ? '🔴高频' : f === '中' ? '🟡中频' : '🟢低频'}</span>`;
  const subjColor = s => (D.SUBJECTS[s] ? D.SUBJECTS[s].color : '#64748b');
  const subjChip = s => `<span class="chip sub" style="background:${subjColor(s)}">${s}</span>`;

  function subjectOptions(sel) {
    return Object.keys(D.SUBJECTS).map(s => `<option value="${s}" ${s === sel ? 'selected' : ''}>${s}（${D.SUBJECTS[s].version}）</option>`).join('');
  }

  /* ============================================================
   * 路由
   * ========================================================== */
  function render() {
    const map = {
      overview: renderOverview, bank: renderBank, practice: renderPractice, wrong: renderWrong,
      plan: renderPlan, mindmap: renderMindmap, exam: renderExam, past: renderPast,
      knowledge: renderKnowledge, teachers: renderTeachers, recite: renderRecite, prompts: renderPrompts,
      physvideo: renderPhysVideo, olympiad: renderOlympiad, physcourse: renderPhysCourse,
      engwords: renderEngWords, classical: renderClassical
    };
    (map[view] || renderOverview)();
  }

  /* ============================================================
   * 总览
   * ========================================================== */
  function renderOverview() {
    const pts = S.getPoints();
    const wrong = S.getWrong().length;
    const rec = S.getRecite(); const log = S.getReciteLog();
    const done = rec.filter(r => { const l = log[r.id]; return l && l.schedule && l.done && l.done.length === l.schedule.length; }).length;
    const reciteRate = rec.length ? Math.round(done / rec.length * 100) : 0;
    const plan = S.getPlan();

    const cards = Object.keys(D.SUBJECTS).map(s => {
      const sp = pts.filter(p => p.subject === s);
      const high = sp.filter(p => p.freq === '高').length;
      const v = D.SUBJECTS[s].version;
      return `<div class="stat" style="border-top:3px solid ${subjColor(s)}">
        <div class="num" style="color:${subjColor(s)}">${sp.length}</div>
        <div class="lbl"><b>${s}</b> · ${v}</div>
        <div class="muted small" style="margin-top:6px">高频考点 ${high} 个</div>
      </div>`;
    }).join('');

    $('#app').innerHTML = `
      <div class="grid grid-4" style="margin-bottom:16px">${cards}</div>
      <div class="grid grid-4">
        <div class="stat"><div class="num">${pts.length}</div><div class="lbl">考点库总数</div></div>
        <div class="stat"><div class="num" style="color:var(--danger)">${wrong}</div><div class="lbl">待巩固错题</div></div>
        <div class="stat"><div class="num" style="color:var(--ok)">${reciteRate}%</div><div class="lbl">背诵完成率 (${done}/${rec.length})</div><div class="bar"><span style="width:${reciteRate}%"></span></div></div>
        <div class="stat"><div class="num" style="color:var(--primary)">${plan ? '已生成' : '未生成'}</div><div class="lbl">复习计划</div></div>
      </div>
      <div class="card">
        <h3>🚀 快速开始</h3>
        <div class="grid grid-4">
          <button class="btn btn-ghost" data-go="practice">✍️ 开始刷题</button>
          <button class="btn btn-ghost" data-go="plan">🗓️ 生成复习计划</button>
          <button class="btn btn-ghost" data-go="mindmap">🧠 看知识导图</button>
          <button class="btn btn-ghost" data-go="recite">✅ 今日背诵打卡</button>
        </div>
        ${plan ? `<p class="muted small" style="margin-top:12px">当前计划：距中考 ${U.daysBetween(ZK_TODAY(), plan.examDate)} 天，目标 ${plan.target} 分。三阶段已排程至 ${plan.examDate}。</p>` : `<p class="muted small" style="margin-top:12px">提示：先到「设置 ⚙️」核对中考日期与目标分，再到「复习计划」一键生成三阶段方案。</p>`}
      </div>
      <div class="card">
        <h3>📜 教材版本铁律</h3>
        <p class="small">英语＝沪教版(牛津深圳版) ｜ 语文＝人教版 ｜ 数学＝北师大版 ｜ 物理＝人教版。所有模块生成内容均严格对齐上述版本与深圳新中考(总分610)结构。</p>
      </div>`;
    window.ZK = Object.assign(window.ZK || {}, { go: setView });
  }

  /* ============================================================
   * 模块一：考点库管理
   * ========================================================== */
  let bankFilter = { subject: '', freq: '', q: '' };
  function renderBank() {
    const pts = S.getPoints().filter(p => {
      if (bankFilter.subject && p.subject !== bankFilter.subject) return false;
      if (bankFilter.freq && p.freq !== bankFilter.freq) return false;
      if (bankFilter.q && !(p.name + p.chapter).includes(bankFilter.q)) return false;
      return true;
    });
    const high = S.getPoints().filter(p => p.freq === '高').slice(0, 3);

    const rows = pts.map(p => `<tr>
      <td class="muted small">${p.id}</td>
      <td>${subjChip(p.subject)}</td>
      <td>${U.esc(p.chapter)}<div class="muted small">${D.SUBJECTS[p.subject].version}</div></td>
      <td><b>${U.esc(p.name)}</b></td>
      <td>${freqChip(p.freq)}</td>
      <td>${p.level}</td>
      <td class="muted small">${p.types.join('、')}</td>
      <td class="muted small">${U.esc(p.trap || '—')}</td>
      <td><button class="btn btn-sm btn-ghost" data-edit="${p.id}">编辑</button> <button class="btn btn-sm btn-danger" data-del="${p.id}">删</button></td>
    </tr>`).join('');

    $('#app').innerHTML = `
      <div class="card">
        <h3>📚 考点库管理 <span class="muted small">｜ 角色：考点库管理专家 · 按指定版本建库/检索/导出</span></h3>
        <div class="toolbar">
          <div class="field"><label>学科</label><select id="bf-sub">${'<option value="">全部</option>' + Object.keys(D.SUBJECTS).map(s => `<option ${bankFilter.subject === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
          <div class="field"><label>频度</label><select id="bf-freq"><option value="">全部</option><option ${bankFilter.freq === '高' ? 'selected' : ''}>高</option><option ${bankFilter.freq === '中' ? 'selected' : ''}>中</option><option ${bankFilter.freq === '低' ? 'selected' : ''}>低</option></select></div>
          <div class="field" style="flex:1;min-width:180px"><label>搜索</label><input id="bf-q" placeholder="知识点/章节关键词" value="${U.esc(bankFilter.q)}"></div>
          <button class="btn btn-primary" id="bf-add">＋ 新增考点</button>
          <button class="btn btn-ghost" id="bf-export">导出JSON</button>
          <button class="btn btn-ghost" id="bf-import">导入</button>
          <input type="file" id="bf-file" accept="application/json" style="display:none">
        </div>
        <div class="warn-box" style="margin-bottom:12px"><b>🔴 高频 Top3 预警：</b> ${high.map(p => `${p.subject}·${U.esc(p.name)}`).join(' ｜ ') || '暂无'}</div>
        <div class="table-wrap"><table>
          <thead><tr><th>ID</th><th>学科</th><th>章节（版本）</th><th>知识点</th><th>频度</th><th>层级</th><th>题型</th><th>深圳常见陷阱</th><th>操作</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="9" class="empty">无匹配考点</td></tr>'}</tbody>
        </table></div>
        <p class="muted small" style="margin-top:10px">约束：章节精确对应指定版本，禁止跨版本；频度须有依据；单批建议≤30。新增/导入内容将本地持久化。</p>
      </div>`;

    $('#bf-sub').onchange = e => { bankFilter.subject = e.target.value; renderBank(); };
    $('#bf-freq').onchange = e => { bankFilter.freq = e.target.value; renderBank(); };
    $('#bf-q').oninput = e => { bankFilter.q = e.target.value; renderBank(); };
    $('#bf-add').onclick = () => openPointModal(null);
    $$('[data-edit]').forEach(b => b.onclick = () => openPointModal(b.dataset.edit));
    $$('[data-del]').forEach(b => b.onclick = () => { if (confirm('删除该考点？')) { S.deletePoint(b.dataset.del); renderBank(); } });
    $('#bf-export').onclick = exportPoints;
    $('#bf-import').onclick = () => $('#bf-file').click();
    $('#bf-file').onchange = importPoints;
  }

  function openPointModal(id) {
    const p = id ? S.getPoints().find(x => x.id === id) : null;
    const m = document.createElement('div'); m.className = 'modal'; m.id = 'pm';
    m.innerHTML = `<div class="modal-box"><div class="modal-head"><h3>${p ? '编辑考点' : '新增考点'}</h3><button class="icon-btn" data-x>✕</button></div>
      <div class="modal-body">
        <label class="field">学科<select id="pm-sub">${Object.keys(D.SUBJECTS).map(s => `<option ${p && p.subject === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
        <label class="field">章节<input id="pm-ch" value="${p ? U.esc(p.chapter) : ''}" placeholder="如：八上·第一章 机械运动"></label>
        <label class="field">知识点名称<input id="pm-name" value="${p ? U.esc(p.name) : ''}"></label>
        <div class="row">
          <label class="field" style="flex:1">频度<select id="pm-freq"><option ${p && p.freq === '高' ? 'selected' : ''}>高</option><option ${p && p.freq === '中' ? 'selected' : ''}>中</option><option ${p && p.freq === '低' ? 'selected' : ''}>低</option></select></label>
          <label class="field" style="flex:1">层级<select id="pm-level">${D.LEVELS.map(l => `<option ${p && p.level === l ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        </div>
        <label class="field">题型（逗号分隔）<input id="pm-type" value="${p ? p.types.join('、') : ''}"></label>
        <label class="field">深圳常见陷阱<input id="pm-trap" value="${p ? U.esc(p.trap || '') : ''}"></label>
        <div class="modal-actions"><button class="btn btn-primary" id="pm-save">保存</button></div>
      </div></div>`;
    document.body.appendChild(m);
    m.querySelector('[data-x]').onclick = () => m.remove();
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.querySelector('#pm-save').onclick = () => {
      const data = { subject: m.querySelector('#pm-sub').value, chapter: m.querySelector('#pm-ch').value, name: m.querySelector('#pm-name').value, freq: m.querySelector('#pm-freq').value, level: m.querySelector('#pm-level').value, types: m.querySelector('#pm-type').value.split(/[、,]/).map(s => s.trim()).filter(Boolean), trap: m.querySelector('#pm-trap').value };
      if (!data.name) { U.toast('请填写知识点名称', 'warn'); return; }
      if (p) S.updatePoint(id, data); else S.addPoint(data);
      m.remove(); renderBank(); U.toast('已保存', 'ok');
    };
  }

  function exportPoints() {
    const data = JSON.stringify(S.getPoints(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '深圳中考考点库.json'; a.click();
    U.toast('已导出', 'ok');
  }
  function importPoints(e) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const arr = JSON.parse(r.result); if (!Array.isArray(arr)) throw 0; let n = 0; arr.forEach(x => { if (x.subject && x.name && x.chapter) { S.addPoint({ chapter: x.chapter, name: x.name, freq: x.freq || '中', level: x.level || '理解', types: x.types || [], trap: x.trap || '' }); n++; } }); renderBank(); U.toast(`导入 ${n} 条`, 'ok'); } catch (err) { U.toast('JSON 解析失败', 'err'); } };
    r.readAsText(f);
  }

  /* ============================================================
   * 模块二：智能刷题
   * ========================================================== */
  let session = null;
  function renderPractice() {
    if (!session) {
      $('#app').innerHTML = `
      <div class="card">
        <h3>✍️ 智能刷题 <span class="muted small">｜ 角色：智能刷题教练 · 按版本与掌握度推送+引导解析</span></h3>
        <div class="field"><label>学科（版本固定）</label><select id="pr-sub">${subjectOptions('物理')}</select></div>
        <div class="row">
          <div class="field" style="flex:1"><label>题量（默认8，最多12）</label><input id="pr-num" type="number" min="1" max="12" value="8"></div>
          <div class="field" style="flex:1"><label>难度</label><select id="pr-diff"><option value="">全部</option><option value="易">基础</option><option value="中">中档</option><option value="高">压轴</option></select></div>
        </div>
        <div class="field"><label>聚焦考点（可选，留空随机）</label><select id="pr-point"><option value="">— 随机 —</option>${S.getPoints().filter(p=>p.subject==='物理').map(p=>`<option value="${p.id}">${U.esc(p.name)}</option>`).join('')}</select></div>
        <div class="row">
          <button class="btn btn-primary" id="pr-start">开始刷题</button>
          <button class="btn btn-ghost" id="pr-ai">✨ AI 出题（需配置密钥）</button>
        </div>
        <p class="muted small" style="margin-top:12px">约束：题型对标深圳中考（英语含听说、物理含实验探究），不超纲；解析讲推理链而非直接给答案；单组 8–12 题，压轴≤2。</p>
        <div id="pr-ai-box"></div>
      </div>`;
      const subSel = $('#pr-sub');
      subSel.onchange = () => { const s = subSel.value; $('#pr-point').innerHTML = '<option value="">— 随机 —</option>' + S.getPoints().filter(p => p.subject === s).map(p => `<option value="${p.id}">${U.esc(p.name)}</option>`).join(''); };
      $('#pr-start').onclick = startPractice;
      $('#pr-ai').onclick = aiPractice;
    } else {
      renderPracticeSession();
    }
  }

  function pickQuestions(subject, num, diff, pointId) {
    let qs = S.getQuestions().filter(q => q.subject === subject);
    if (pointId) qs = qs.filter(q => q.pointId === pointId);
    if (diff) qs = qs.filter(q => q.difficulty === diff);
    // 洗牌
    qs = qs.slice().sort(() => Math.random() - 0.5);
    if (qs.length > num) qs = qs.slice(0, num);
    return qs;
  }

  function startPractice() {
    const subject = $('#pr-sub').value;
    const num = Math.min(12, Math.max(1, +$('#pr-num').value || 8));
    const diff = $('#pr-diff').value; const pointId = $('#pr-point').value;
    const qs = pickQuestions(subject, num, diff, pointId);
    if (!qs.length) { U.toast('该条件下暂无可刷题（可去考点库补充或放宽筛选）', 'warn'); return; }
    session = { qs: qs.map(q => ({ ...q, userAns: null, revealed: false, added: false })), idx: 0, correct: 0 };
    renderPracticeSession();
  }

  function renderPracticeSession() {
    const q = session.qs[session.idx];
    const pt = S.getPoints().find(p => p.id === q.pointId);
    const progress = Math.round((session.idx) / session.qs.length * 100);
    let optsHtml = '';
    if (q.options) {
      optsHtml = q.options.map((o, i) => {
        let cls = 'opt'; const letter = String.fromCharCode(65 + i);
        if (q.revealed) { if (o === q.answer) cls += ' correct'; if (q.userAns === letter && q.userAns !== q.answer) cls += ' wrong'; }
        else if (q.userAns === letter) cls += ' sel';
        return `<button class="${cls}" data-opt="${letter}" ${q.revealed ? 'disabled' : ''}>${letter}. ${U.esc(o)}</button>`;
      }).join('');
    } else {
      optsHtml = `<div class="muted small">主观/开放型题目，请先在脑中作答，再点「对答案」查看评分要点与解析。</div>`;
    }

    $('#app').innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h3>✍️ 第 ${session.idx + 1} / ${session.qs.length} 题</h3>
          <button class="btn btn-ghost btn-sm" id="pr-quit">退出</button>
        </div>
        <div class="progress"><span style="width:${progress}%"></span></div>
        <div class="q-meta">${subjChip(q.subject)} ${freqChip(pt ? pt.freq : '中')} <span class="chip">难度:${q.difficulty}</span> <span class="chip ver">${U.esc(pt ? pt.chapter : '')}</span></div>
        <div class="q-stem">${U.esc(q.stem)}</div>
        <div id="pr-opts">${optsHtml}</div>
        <div id="pr-actions"></div>
      </div>`;

    $$('#pr-opts [data-opt]').forEach(b => b.onclick = () => { if (q.revealed) return; q.userAns = b.dataset.opt; renderPracticeSession(); });
    $('#pr-quit').onclick = () => { session = null; renderPractice(); };

    if (!q.revealed) {
      $('#pr-actions').innerHTML = q.options
        ? `<button class="btn btn-primary" id="pr-submit">提交本题</button>`
        : `<button class="btn btn-primary" id="pr-submit">对答案</button>`;
      $('#pr-submit').onclick = () => {
        if (q.options && !q.userAns) { U.toast('请选择一个选项', 'warn'); return; }
        q.revealed = true;
        const correct = q.options ? (q.userAns === q.answer) : null;
        if (correct !== null) { if (correct) session.correct++; S.recordPractice(q.pointId, correct); }
        renderPracticeSession();
      };
    } else {
      const correct = q.options ? (q.userAns === q.answer) : null;
      const badge = correct === null ? '' : (correct ? `<span class="chip status-doing" style="background:#dcfce7;color:#15803d">✔ 正确</span>` : `<span class="chip status-over">✘ 错误</span>`);
      const addBtn = (correct === false || correct === null) && !q.added
        ? `<button class="btn btn-danger btn-sm" id="pr-addwrong">＋ 加入错题本</button>` : (q.added ? `<span class="muted small">已加入错题本</span>` : '');
      $('#pr-actions').innerHTML = `
        <div class="analysis"><b>解析：</b>${U.esc(q.analysis)}</div>
        <div style="margin-top:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">${badge} ${addBtn}
          ${session.idx < session.qs.length - 1 ? '<button class="btn btn-primary" id="pr-next">下一题 →</button>' : '<button class="btn btn-primary" id="pr-finish">查看结果</button>'}</div>`;
      if (addBtn) $('#pr-addwrong').onclick = () => { addWrongFromQuestion(q); q.added = true; renderPracticeSession(); };
      if ($('#pr-next')) $('#pr-next').onclick = () => { session.idx++; renderPracticeSession(); };
      if ($('#pr-finish')) $('#pr-finish').onclick = finishPractice;
    }
  }

  function finishPractice() {
    const rate = Math.round(session.correct / session.qs.length * 100);
    const weak = session.qs.filter(q => q.options && q.userAns !== q.answer).map(q => { const p = S.getPoints().find(x => x.id === q.pointId); return p ? p.name : ''; }).filter(Boolean);
    $('#app').innerHTML = `
      <div class="card">
        <h3>📊 本次刷题结果</h3>
        <div class="stat" style="max-width:300px"><div class="num">${rate}%</div><div class="lbl">正确率（${session.correct}/${session.qs.length}）</div></div>
        ${weak.length ? `<div class="warn-box" style="margin-top:14px"><b>薄弱点：</b>${weak.join('、')}<br>建议到「错题回顾」巩固，或针对这些考点再刷一轮。</div>` : '<p class="muted" style="margin-top:14px">全部正确，掌握良好！</p>'}
        <div class="row" style="margin-top:16px"><button class="btn btn-primary" id="pr-again">再来一组</button><button class="btn btn-ghost" id="pr-back">返回</button></div>
      </div>`;
    $('#pr-again').onclick = () => { session = null; renderPractice(); };
    $('#pr-back').onclick = () => { session = null; renderPractice(); };
  }

  async function aiPractice() {
    const subject = $('#pr-sub').value;
    const box = $('#pr-ai-box') || (() => { const d = document.createElement('div'); d.id = 'pr-ai-box'; $('#app').appendChild(d); return d; })();
    box.innerHTML = '<p class="muted small">⏳ 正在调用大模型生成题目（使用「智能刷题」提示词）…</p>';
    try {
      const sys = P['智能刷题'].prompt;
      const user = `请为深圳中考${subject}（${D.SUBJECTS[subject].version}）生成 1 道典型选择题，含题干、4个选项、答案、解析（讲推理链）、对应章节与深圳考情出处。以 JSON 返回：{stem,options,answer,analysis,chapter}。`;
      const r = await U.callLLM(sys, user);
      box.innerHTML = `<div class="analysis"><b>✨ AI 生成：</b><br>${U.esc(r)}</div>`;
    } catch (e) {
      box.innerHTML = `<div class="warn-box">未配置有效 AI 密钥，已使用内置题库刷题。可在「设置 ⚙️」填入 OpenAI 兼容的 API Key 启用 AI 动态出题。</div>`;
    }
  }

  /* ============================================================
   * 模块三：错题回顾
   * ========================================================== */
  function addWrongFromQuestion(q) {
    const p = S.getPoints().find(x => x.id === q.pointId);
    const sched = U.ebbinghaus(ZK_TODAY());
    S.addWrong({ subject: q.subject, pointId: q.pointId, question: q.stem, userAnswer: q.userAns || '（主观题）', correctAnswer: q.answer || q.analysis, reason: '', nextReview: sched[0], reps: 0, schedule: sched, done: [], createdAt: ZK_TODAY() });
    U.toast('已加入错题本', 'ok');
  }

  function renderWrong() {
    const wrong = S.getWrong();
    const today = ZK_TODAY();
    const due = wrong.filter(w => !w.done || (w.schedule && w.nextReview && w.nextReview <= today && w.done.length < w.schedule.length));
    const reasons = ['概念模糊', '审题失误', '计算错误', '迁移不足', '表述不规范'];
    const rows = wrong.map(w => {
      const p = S.getPoints().find(x => x.id === w.pointId);
      const overdue = w.nextReview && w.nextReview < today && (!w.done || w.done.length < (w.schedule ? w.schedule.length : 1));
      const mastered = w.schedule && w.done && w.done.length >= w.schedule.length;
      const st = mastered ? '<span class="status-done">已掌握</span>' : overdue ? '<span class="status-over">逾期</span>' : '<span class="status-doing">复习中</span>';
      return `<tr>
        <td style="max-width:280px">${U.esc(w.question)}</td>
        <td>${subjChip(w.subject)}</td>
        <td class="muted small">${p ? U.esc(p.chapter) : '—'}<br>${p ? p.name : ''}</td>
        <td><select data-reason="${w.id}" class="reason-sel">${reasons.map(r => `<option ${w.reason === r ? 'selected' : ''}>${r}</option>`).join('')}</select></td>
        <td>${st}</td>
        <td class="muted small">${w.nextReview || '—'}</td>
        <td><button class="btn btn-sm btn-ghost" data-review="${w.id}">今日复习</button> <button class="btn btn-sm btn-danger" data-rm="${w.id}">删</button></td>
      </tr>`;
    }).join('');

    $('#app').innerHTML = `
      <div class="card">
        <h3>🔁 错题回顾 <span class="muted small">｜ 角色：错题诊断教练 · 错因归因+版本溯源+变式+间隔重复</span></h3>
        ${due.length ? `<div class="warn-box" style="margin-bottom:12px"><b>📅 今日待复习 ${due.length} 题</b>（按艾宾浩斯：当天/第2/4/7/15天）。点击「今日复习」标记过关并推进排程。</div>` : '<p class="muted small" style="margin-bottom:12px">暂无逾期复习，保持节奏！</p>'}
        <div class="table-wrap" style="max-height:520px"><table>
          <thead><tr><th>题目</th><th>学科</th><th>溯源（版本·章节）</th><th>错因</th><th>状态</th><th>下次复习</th><th>操作</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="7" class="empty">错题本为空，去刷题把错题加进来吧</td></tr>'}</tbody>
        </table></div>
        <p class="muted small" style="margin-top:10px">约束：溯源精确到版本章节；变式同考点不同情境；已掌握(连续2次对)自动移出。错因分类将用于「复习计划」优先级。</p>
      </div>`;

    $$('[data-reason]').forEach(s => s.onchange = e => { S.updateWrong(e.target.dataset.reason, { reason: e.target.value }); });
    $$('[data-rm]').forEach(b => b.onclick = () => { S.deleteWrong(b.dataset.rm); renderWrong(); });
    $$('[data-review]').forEach(b => b.onclick = () => {
      const w = S.getWrong().find(x => x.id === b.dataset.review); if (!w) return;
      if (!w.schedule) w.schedule = U.ebbinghaus(w.createdAt || ZK_TODAY());
      if (!w.done) w.done = [];
      // 标记最早的未复习槽位（允许提前复习；重复点击不会重复计数）
      const next = w.schedule.find(d => !w.done.includes(d));
      if (next && !w.done.includes(next)) { w.done.push(next); w.reps = (w.reps || 0) + 1; }
      const still = w.schedule.find(d => !w.done.includes(d));
      w.nextReview = still || '已掌握';
      S.updateWrong(w.id, w); renderWrong(); U.toast('已记录复习', 'ok');
    });
  }

  /* ============================================================
   * 模块四：复习计划生成
   * ========================================================== */
  function renderPlan() {
    const plan = S.getPlan();
    if (!plan) {
      const st = S.getSettings();
      $('#app').innerHTML = `
      <div class="card">
        <h3>🗓️ 复习计划生成 <span class="muted small">｜ 角色：复习规划师 · 三阶段可量化+对齐深圳中考节点</span></h3>
        <div class="row">
          <div class="field" style="flex:1"><label>中考日期</label><input id="pl-exam" type="date" value="${st.examDate}"></div>
          <div class="field" style="flex:1"><label>每日时长(小时)</label><input id="pl-hours" type="number" min="1" max="12" value="${st.dailyHours}"></div>
          <div class="field" style="flex:1"><label>目标总分</label><input id="pl-score" type="number" min="0" max="610" value="${st.targetScore}"></div>
        </div>
        <div class="field"><label>目标学校（选填）</label><input id="pl-school" value="${st.targetSchool || ''}"></div>
        <div class="field"><label>薄弱学科（多选，影响优先级）</label>
          <div id="pl-weak">${Object.keys(D.SUBJECTS).map(s => `<label style="display:inline-flex;gap:4px;margin-right:14px;font-weight:400"><input type="checkbox" value="${s}" style="width:auto"> ${s}</label>`).join('')}</div>
        </div>
        <button class="btn btn-primary" id="pl-gen">⚡ 一键生成复习计划</button>
        <p class="muted small" style="margin-top:12px">约束：节点对齐深圳中考真实时间表（听说/实验/体育/2次全真模拟）；任务映射到版本章节可勾选；日时长≤声明上限110%。</p>
      </div>`;
      $('#pl-gen').onclick = () => {
        const weak = $$('#pl-weak input:checked').map(c => c.value);
        S.setSettings({ examDate: $('#pl-exam').value, dailyHours: +$('#pl-hours').value, targetScore: +$('#pl-score').value, targetSchool: $('#pl-school').value });
        genPlan(weak);
      };
    } else {
      renderPlanResult(plan);
    }
  }

  function genPlan(weak) {
    const st = S.getSettings();
    const today = ZK_TODAY();
    const total = U.daysBetween(today, st.examDate);
    if (!isFinite(total) || total <= 0) { U.toast('中考日期无效或已过，请在「设置 ⚙️」核对', 'err'); window.ZK_LOG && window.ZK_LOG.warn('genPlan: 无效倒计时', st.examDate); return; }
    if (total <= 10) { U.toast('距中考不足10天，建议直接进入冲刺', 'warn'); }
    const baseEnd = U.addDays(today, Math.round(total * 0.5));
    const specEnd = U.addDays(today, Math.round(total * 0.8));
    const high = S.getPoints().filter(p => p.freq === '高');
    const weakSet = new Set(weak && weak.length ? weak : []);
    // 周计划
    const weeks = []; const subs = Object.keys(D.SUBJECTS);
    let wi = 0;
    let cur = today;
    while (U.daysBetween(cur, st.examDate) > 0 && weeks.length < 16) {
      const wkEnd = U.addDays(cur, 6);
      const focus = subs[wi % subs.length];
      const pts = high.filter(p => p.subject === focus).slice(0, 3).map(p => p.name);
      const isWeak = weakSet.has(focus);
      weeks.push({ start: cur, end: wkEnd > st.examDate ? st.examDate : wkEnd, focus, pts, isWeak });
      cur = U.addDays(wkEnd, 1); wi++;
    }
    // 里程碑（对齐深圳节点）
    const milestones = [
      { name: '🎤 英语听说模考', date: U.addDays(baseEnd, -7) },
      { name: '🧪 理化实验操作练习', date: U.addDays(specEnd, -12) },
      { name: '🏃 体育冲刺', date: U.addDays(specEnd, -5) },
      { name: '📝 全真模拟（一）', date: U.addDays(specEnd, 2) },
      { name: '📝 全真模拟（二）', date: U.addDays(st.examDate, -7) }
    ];
    const plan = {
      created: today, examDate: st.examDate, total, daily: st.dailyHours, target: st.targetScore, school: st.targetSchool,
      phases: [
        { name: '基础巩固期', start: today, end: baseEnd, pct: 50, color: '#3b82f6' },
        { name: '专题突破期', start: U.addDays(baseEnd, 1), end: specEnd, pct: 30, color: '#8b5cf6' },
        { name: '冲刺模拟期', start: U.addDays(specEnd, 1), end: st.examDate, pct: 20, color: '#f59e0b' }
      ],
      milestones, weeks,
      dailyTip: `每日 ${st.dailyHours}h：刷题×10 + 错题回顾×5 + 背诵打卡×1 + 薄弱科专题`
    };
    S.setPlan(plan); refreshCountdown(); renderPlan();
  }

  function renderPlanResult(plan) {
    const gantt = plan.phases.map(ph => {
      const w = U.daysBetween(ph.start, ph.end);
      const totW = U.daysBetween(plan.phases[0].start, plan.phases[2].end) || 1;
      const flex = (w / totW * 100);
      return `<div class="seg" style="flex:${flex};background:${ph.color}" title="${ph.name} ${ph.start}~${ph.end}">${ph.name}<br><small>${w}天</small></div>`;
    }).join('');
    const weeks = plan.weeks.map((w, i) => `<tr>
      <td>第${i + 1}周</td><td class="muted small">${w.start} ~ ${w.end}</td>
      <td>${subjChip(w.focus)} ${w.isWeak ? '<span class="chip high">薄弱</span>' : ''}</td>
      <td class="small">${w.pts.map(p => '·' + U.esc(p)).join('<br>') || '综合复盘'}</td>
      <td><input type="checkbox" style="width:auto"></td>
    </tr>`).join('');
    const ms = plan.milestones.map(m => `<div class="chip ver" style="margin:3px">${m.name} · ${m.date}</div>`).join('');

    $('#app').innerHTML = `
      <div class="card">
        <h3>🗓️ 复习计划 <span class="muted small">｜ 距中考 ${plan.total} 天 · 目标 ${plan.target} 分 ${plan.school ? '· ' + U.esc(plan.school) : ''}</span></h3>
        <div class="gantt">${gantt}</div>
        <div class="warn-box" style="margin:10px 0">⚠️ <b>关键节点（对齐深圳中考）：</b><br>${ms}</div>
        <p class="small"><b>每日任务：</b>${U.esc(plan.dailyTip)}</p>
        <button class="btn btn-ghost btn-sm" id="pl-regen">重新生成</button>
      </div>
      <div class="card">
        <h3>📅 周计划（勾选完成）</h3>
        <div class="table-wrap"><table>
          <thead><tr><th>周</th><th>日期</th><th>主攻学科</th><th>高频考点任务</th><th>完成</th></tr></thead>
          <tbody>${weeks}</tbody>
        </table></div>
        <p class="muted small" style="margin-top:10px">任务均映射指定版本章节（高频考点优先，薄弱学科加权）。每周保留1天弹性复盘。</p>
      </div>`;
    $('#pl-regen').onclick = () => { S.setPlan(null); renderPlan(); };
  }

  /* ============================================================
   * 模块五：知识点思维导图
   * ========================================================== */
  function renderMindmap() {
    $('#app').innerHTML = `
      <div class="card">
        <h3>🧠 知识点体系 <span class="muted small">｜ 角色：知识图谱架构师 · 章节树 + 关联图谱双视图</span></h3>
        <div class="toolbar">
          <select id="mm-sub">${subjectOptions('物理')}</select>
          <button class="btn btn-primary" id="mm-render">生成章节树</button>
          <button class="btn btn-ghost" id="mm-rel">生成关联图谱</button>
          <span class="muted small">章节树严格按版本目录；关联图谱展示知识点交叉引用与跨学科桥梁。</span>
        </div>
        <div class="mm-wrap" id="mm-out"><p class="muted">选择学科后点击「生成章节树」或「生成关联图谱」。</p></div>
        <p class="muted small" style="margin-top:10px">约束：主干严格按版本章节体系禁跨版本；层级≤4；考频有依据。关联图谱的「关联」指向有逻辑衔接的考点（含跨/同学科）。</p>
      </div>`;
    $('#mm-render').onclick = () => { U.renderMermaid($('#mm-out'), buildMindmap($('#mm-sub').value)); };
    $('#mm-rel').onclick = () => renderRelationGraph($('#mm-sub').value);
  }

  function renderRelationGraph(subject) {
    const pts = S.getPoints().filter(p => p.subject === subject);
    const ver = D.SUBJECTS[subject].version;
    const allById = Object.fromEntries(S.getPoints().map(p => [p.id, p]));
    const byCh = {};
    pts.forEach(p => { (byCh[p.chapter] = byCh[p.chapter] || []).push(p); });
    const dot = r => `<span class="rel-dot" style="background:${subjColor(r.subject)}" title="${r.subject}"></span>`;
    // 跨学科/跨模块桥梁
    const bridges = pts.filter(p => (p.related || []).some(id => allById[id] && allById[id].subject !== subject))
      .map(p => ({ from: p, to: (p.related || []).map(id => allById[id]).filter(x => x && x.subject !== subject) }));
    let html = `<div class="rel-head"><b>${subject}·${ver} 关联图谱</b> <span class="muted small">卡片含考频与主题标签；「关联」为逻辑衔接考点。</span></div>`;
    if (bridges.length) {
      html += `<div class="bridge-box"><b>🌉 跨学科 / 跨模块桥梁</b>` + bridges.map(b => `<div class="bridge"><span class="chip sub" style="background:${subjColor(subject)}">${U.esc(b.from.name)}</span> → ${b.to.map(r => `<span class="chip ver">${dot(r)}${U.esc(r.subject)}·${U.esc(r.name)}</span>`).join(' ')}</div>`).join('') + `</div>`;
    }
    html += `<div class="rel-grid">`;
    Object.keys(byCh).forEach(ch => {
      html += `<div class="rel-chapter"><div class="rel-ch-title">${U.esc(ch)}</div>`;
      byCh[ch].forEach(p => {
        const rels = (p.related || []).map(id => allById[id]).filter(Boolean);
        const relChips = rels.length ? rels.map(r => `<span class="rel-chip" title="${U.esc(r.subject + '·' + r.chapter)}">${dot(r)}${U.esc(r.name)}</span>`).join('') : '<span class="muted small">—</span>';
        html += `<div class="rel-card">
          <div class="rel-card-top">${freqChip(p.freq)}${p.tags && p.tags.length ? `<span class="chip low">${U.esc(p.tags[0])}</span>` : ''}</div>
          <div class="rel-name">${U.esc(p.name)}</div>
          <div class="rel-rel"><span class="muted small">关联：</span>${relChips}</div>
        </div>`;
      });
      html += `</div>`;
    });
    html += `</div>`;
    $('#mm-out').innerHTML = html;
  }

  function buildMindmap(subject) {
    const pts = S.getPoints().filter(p => p.subject === subject);
    const ver = D.SUBJECTS[subject].version;
    let code = 'graph TD\n';
    code += `  root((${subject}·${ver}))\n`;
    const map = {}, chapters = [];
    pts.forEach(p => { if (!map[p.chapter]) { map[p.chapter] = []; chapters.push(p.chapter); } map[p.chapter].push(p); });
    chapters.forEach((ch, i) => {
      const cid = 'c' + i;
      code += `  ${cid}["${ch}"]\n  root --> ${cid}\n`;
      map[ch].forEach(p => {
        const fs = p.freq === '高' ? '频:高' : p.freq === '中' ? '频:中' : '频:低';
        code += `  ${p.id}["${p.name} · ${fs}"]\n  ${cid} --> ${p.id}\n`;
      });
    });
    return code;
  }

  /* ============================================================
   * 模块六：模拟题板块（本地套卷 / 随机组卷 / 专项练习）
   * ========================================================== */
  let examSession = null;
  let examTab = 'mock';
  let examSub = '物理';
  function renderExam() {
    if (examSession) { renderExamSession(); return; }
    $('#app').innerHTML = `
      <div class="card">
        <h3>📝 模拟题板块 <span class="muted small">｜ 分学科模拟 + 随机组卷 + 专项练习 · 每套附标准答案，可一键导出PDF</span></h3>
        <div class="toolbar">
          <select id="ex-sub">${subjectOptions(examSub)}</select>
          <div class="tabs" id="ex-tabs">
            <button data-tab="mock" class="${examTab === 'mock' ? 'active' : ''}">📦 本地套卷</button>
            <button data-tab="random" class="${examTab === 'random' ? 'active' : ''}">🎲 随机组卷</button>
            <button data-tab="special" class="${examTab === 'special' ? 'active' : ''}">🎯 专项练习</button>
            <button data-tab="hist" class="${examTab === 'hist' ? 'active' : ''}">📈 历史（${S.getExamRecords().length}）</button>
          </div>
          <span class="spacer"></span>
          <span class="muted small no-print">每套含答案·可导出PDF</span>
        </div>
        <div id="ex-panel"></div>
        <div id="ex-ai-box"></div>
      </div>`;
    $('#ex-sub').value = examSub;
    $('#ex-sub').onchange = e => { examSub = e.target.value; renderExam(); };
    $('#ex-tabs').querySelectorAll('button').forEach(b => b.onclick = () => { examTab = b.dataset.tab; renderExam(); });
    if (examTab === 'hist') { showExamHistory(); return; }
    renderExamPanel();
  }

  function renderExamPanel() {
    const panel = $('#ex-panel'); if (!panel) return;
    const sub = examSub;
    if (examTab === 'mock') {
      panel.innerHTML = `
        <div class="mock-gen">
          <h4>📦 本地模拟卷 <span class="muted small">（无需密钥 · 每科 ${window.ZK_MOCK.SETS_PER_SUBJECT} 套，纯本地确定性生成）</span></h4>
          <div class="row">
            <div class="field" style="flex:1"><label>学科</label><select id="ex-msub">${subjectOptions(sub)}</select></div>
            <div class="field" style="flex:1"><label>套号（1–${window.ZK_MOCK.SETS_PER_SUBJECT}）</label><input id="ex-mset" type="number" min="1" max="${window.ZK_MOCK.SETS_PER_SUBJECT}" value="1"></div>
            <button class="btn btn-primary" id="ex-mock">🎯 生成并开考</button>
            <button class="btn btn-ghost" id="ex-ai">✨ AI 组卷（需密钥）</button>
          </div>
          <p class="muted small">同一套号结果可复现；跨套号因参数随机而各异。对标结构：数学 100 / 物理 70 / 英语笔试 75 / 语文 120 分。每套含标准答案与解析。</p>
        </div>`;
      $('#ex-msub').value = sub;
      $('#ex-mock').onclick = () => { const s = $('#ex-msub').value; const n = Math.max(1, Math.min(window.ZK_MOCK.SETS_PER_SUBJECT, +$('#ex-mset').value || 1)); startMock(s, n); };
      $('#ex-ai').onclick = aiExam;
    } else if (examTab === 'random') {
      panel.innerHTML = `
        <div class="mock-gen">
          <h4>🎲 随机组卷 <span class="muted small">（从学科题库随机抽取，每次不同）</span></h4>
          <div class="row">
            <div class="field" style="flex:1"><label>学科</label><select id="ex-rsub">${subjectOptions(sub)}</select></div>
            <div class="field" style="flex:1"><label>题量（10–25）</label><input id="ex-rnum" type="number" min="10" max="25" value="15"></div>
            <div class="field" style="flex:1"><label>难度（可选）</label><select id="ex-rdiff"><option value="">全部</option><option value="易">基础</option><option value="中">中档</option><option value="高">压轴</option></select></div>
            <button class="btn btn-primary" id="ex-rgen">🎲 随机生成开考</button>
          </div>
          <p class="muted small">随机抽取覆盖各题型板块，自动判分并给出分知识点得分率报告。</p>
        </div>`;
      $('#ex-rsub').value = sub;
      $('#ex-rgen').onclick = () => { const s = $('#ex-rsub').value; const n = Math.max(10, Math.min(25, +$('#ex-rnum').value || 15)); const d = $('#ex-rdiff').value; startRandom(s, n, d); };
    } else if (examTab === 'special') {
      const pts = S.getPoints().filter(p => p.subject === sub);
      panel.innerHTML = `
        <div class="mock-gen">
          <h4>🎯 专项练习 <span class="muted small">（按考点聚焦训练）</span></h4>
          <div class="row">
            <div class="field" style="flex:1"><label>学科</label><select id="ex-ssub">${subjectOptions(sub)}</select></div>
            <div class="field" style="flex:2"><label>聚焦考点</label><select id="ex-spt">${pts.map(p => `<option value="${p.id}">${U.esc(p.chapter)} · ${U.esc(p.name)}</option>`).join('')}</select></div>
            <button class="btn btn-primary" id="ex-sgen">🎯 生成专项卷</button>
          </div>
          <p class="muted small">围绕所选考点生成 6–10 道变式题，强化薄弱点；提交后显示解析与正确率。</p>
        </div>`;
      $('#ex-ssub').value = sub;
      $('#ex-ssub').onchange = () => { const s = $('#ex-ssub').value; const ps = S.getPoints().filter(p => p.subject === s); $('#ex-spt').innerHTML = ps.map(p => `<option value="${p.id}">${U.esc(p.chapter)} · ${U.esc(p.name)}</option>`).join(''); };
      $('#ex-sgen').onclick = () => { const s = $('#ex-ssub').value; const pid = $('#ex-spt').value; startSpecial(s, pid); };
    }
  }

  function startExam() {
    const subject = $('#ex-sub').value;
    const qs = S.getQuestions().filter(q => q.subject === subject);
    if (!qs.length) { U.toast('该学科暂无机考题，可改用下方「本地模拟卷」', 'warn'); return; }
    examSession = { mode: 'bank', subject, questions: qs.map(q => ({ ...q, userAns: null, selfCorrect: null, revealed: false, score: 10, section: '综合' })), idx: 0, finished: false };
    renderExamSession();
  }

  function startMock() {
    const subject = $('#ex-msub').value;
    const setNo = Math.max(1, Math.min(window.ZK_MOCK.SETS_PER_SUBJECT, +$('#ex-mset').value || 1));
    let ex;
    try { ex = window.ZK_MOCK.generateExam(subject, setNo); }
    catch (e) { U.toast('本地组卷失败：' + e.message, 'err'); window.ZK_LOG && window.ZK_LOG.error('startMock', e.message); return; }
    examSession = {
      mode: 'mock', setNo, subject, meta: ex.meta,
      questions: ex.questions.map(q => ({ ...q, userAns: null, selfCorrect: null, revealed: false })),
      idx: 0, finished: false
    };
    window.ZK_LOG && window.ZK_LOG.info('startMock', { subject, setNo, total: ex.meta.totalScore });
    renderExamSession();
  }

  function renderExamSession() {
    const q = examSession.questions[examSession.idx];
    if (examSession.finished) { renderExamReport(); return; }
    const sec = q.section || '综合';
    const score = q.score != null ? q.score : 10;
    const last = examSession.idx === examSession.questions.length - 1;
    const rel = q.pointId && S.getPoints().find(p => p.id === q.pointId);
    let opts = '';
    if (q.options) {
      opts = q.options.map((o, i) => { const L = String.fromCharCode(65 + i); const cls = 'opt' + (q.userAns === L && !q.revealed ? ' sel' : ''); return `<button class="${cls}" data-opt="${L}" ${q.revealed ? 'disabled' : ''}>${L}. ${U.esc(o)}</button>`; }).join('');
    } else {
      opts = `<div class="muted small">主观/开放型题目：请在纸上作答，完成后点下方「自评」选择是否正确。</div>`;
    }
    $('#app').innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center"><h3>📝 模拟考 · ${examSession.subject}${examSession.mode === 'mock' ? '（第 ' + examSession.setNo + ' 套）' : ''}（第 ${examSession.idx + 1}/${examSession.questions.length} 题）</h3><button class="btn btn-ghost btn-sm" id="ex-submit-all">交卷</button></div>
        <div class="q-meta">${subjChip(q.subject || examSession.subject)} <span class="chip">${U.esc(sec)}</span> <span class="chip">${score}分</span> <span class="chip">难度:${q.difficulty || '中'}</span> ${rel ? `<span class="chip ver">${U.esc(rel.chapter)}</span>` : ''}</div>
        <div class="q-stem">${U.esc(q.stem)}</div>
        <div id="ex-opts">${opts}</div>
        <div id="ex-act"></div>
      </div>`;
    $$('#ex-opts [data-opt]').forEach(b => b.onclick = () => { if (q.revealed) return; q.userAns = b.dataset.opt; renderExamSession(); });
    $('#ex-submit-all').onclick = () => { examSession.finished = true; renderExamSession(); };

    if (!q.revealed) {
      if (q.options) {
        $('#ex-act').innerHTML = `<button class="btn btn-primary" id="ex-next">${last ? '交卷并看解析' : '下一题 →'}</button>`;
        $('#ex-next').onclick = () => { q.revealed = true; renderExamSession(); };
      } else {
        $('#ex-act').innerHTML = `<button class="btn btn-ghost btn-sm" id="ex-yes">✔ 我答对了</button> <button class="btn btn-ghost btn-sm" id="ex-no">✘ 还需努力</button> ${last ? '' : '<button class="btn btn-primary" id="ex-next">下一题 →</button>'}`;
        $('#ex-yes').onclick = () => { q.selfCorrect = true; q.revealed = true; renderExamSession(); };
        $('#ex-no').onclick = () => { q.selfCorrect = false; q.revealed = true; renderExamSession(); };
        if ($('#ex-next')) $('#ex-next').onclick = () => { q.revealed = true; renderExamSession(); };
      }
    } else {
      const correct = q.options ? (q.userAns === q.answer) : (q.selfCorrect === true);
      const optsHtml = q.options ? q.options.map((o, i) => { const L = String.fromCharCode(65 + i); let cls = 'opt'; if (o === q.answer) cls += ' correct'; if (q.userAns === L && q.userAns !== q.answer) cls += ' wrong'; return `<button class="${cls}" disabled>${L}. ${U.esc(o)}</button>`; }).join('') : '';
      const badge = q.options
        ? (correct ? '<span class="chip" style="background:#dcfce7;color:#15803d">✔ 正确</span>' : '<span class="chip" style="background:#fee2e2;color:#b91c1c">✘ 错误</span>')
        : `<span class="chip" style="background:#dbeafe;color:#1d4ed8">自评：${q.selfCorrect ? '✔ 正确' : '✘ 待加强'}</span>`;
      $('#ex-opts').innerHTML = optsHtml || `<div class="muted small">${U.esc(q.answer || '（参见下方解析与参考答案）')}</div>`;
      $('#ex-act').innerHTML = `<div class="analysis"><b>解析：</b>${U.esc(q.analysis || '')}</div>
        <div style="margin-top:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">${badge} ${last ? '<button class="btn btn-primary" id="ex-next">查看报告</button>' : '<button class="btn btn-primary" id="ex-next">下一题 →</button>'}</div>`;
      $('#ex-next').onclick = nextExam;
    }
  }
  function nextExam() { if (examSession.idx < examSession.questions.length - 1) { examSession.idx++; renderExamSession(); } else { examSession.finished = true; renderExamSession(); } }

  function renderExamReport() {
    const qs = examSession.questions;
    let totalScore = 0, gotScore = 0;
    const bySec = {}, byCh = {};
    qs.forEach(q => {
      const sec = q.section || '综合'; const sc = (q.score != null ? q.score : 10);
      bySec[sec] = bySec[sec] || { t: 0, g: 0 }; bySec[sec].t += sc; totalScore += sc;
      const ok = q.options ? (q.userAns === q.answer) : (q.selfCorrect === true);
      if (ok) { bySec[sec].g += sc; gotScore += sc; }
      const p = S.getPoints().find(x => x.id === q.pointId); const ch = p ? p.chapter : '其他';
      byCh[ch] = byCh[ch] || { t: 0, c: 0 }; byCh[ch].t++; if (ok) byCh[ch].c++;
    });
    const pct = totalScore ? Math.round(gotScore / totalScore * 100) : 0;
    const secBars = Object.entries(bySec).map(([s, v]) => { const r = Math.round(v.g / v.t * 100); return `<div style="margin:8px 0"><div class="small">${U.esc(s)}：<b>${v.g}/${v.t}分</b></div><div class="bar"><span style="width:${r}%;background:${r < 60 ? 'var(--danger)' : r < 80 ? 'var(--warn)' : 'var(--ok)'}"></span></div></div>`; }).join('');
    const dimBars = Object.entries(byCh).map(([ch, v]) => { const r = Math.round(v.c / v.t * 100); return `<div style="margin:6px 0"><div class="small">${U.esc(ch)}：<b>${v.c}/${v.t}</b></div><div class="bar"><span style="width:${r}%;background:${r < 60 ? 'var(--danger)' : r < 80 ? 'var(--warn)' : 'var(--ok)'}"></span></div></div>`; }).join('');
    const weak = qs.filter(q => { const ok = q.options ? (q.userAns === q.answer) : (q.selfCorrect === true); return !ok; }).map(q => { const p = S.getPoints().find(x => x.id === q.pointId); return p ? p.name : ''; }).filter(Boolean);
    const correctCount = qs.filter(q => q.options ? (q.userAns === q.answer) : (q.selfCorrect === true)).length;
    S.addExamRecord({ subject: examSession.subject, date: ZK_TODAY(), score: gotScore, totalScore, pct, total: qs.length, correct: correctCount });
    $('#app').innerHTML = `
      <div class="card">
        <h3>📊 模拟考试成绩报告</h3>
        <div class="stat" style="max-width:360px"><div class="num" style="color:${pct >= 80 ? 'var(--ok)' : pct >= 60 ? 'var(--warn)' : 'var(--danger)'}">${gotScore}<span style="font-size:14px">/${totalScore}分</span></div><div class="lbl">${examSession.subject}${examSession.mode === 'mock' ? ' · 第' + examSession.setNo + '套' : ''} · 得分率 ${pct}%（正确 ${correctCount}/${qs.length}）</div></div>
        <div style="margin-top:14px"><b>各题型板块得分</b>${secBars}</div>
        <div style="margin-top:14px"><b>各知识维度得分率</b>${dimBars}</div>
        ${weak.length ? `<div class="warn-box" style="margin-top:12px"><b>失分 Top：</b>${weak.slice(0, 6).join('、')}<br><b>提分动作：</b>针对以上考点回到「智能刷题」「错题回顾」专项突破，并核对指定版本对应章节。</div>` : '<p class="muted" style="margin-top:12px">表现优秀，继续保持！</p>'}
        <div class="row" style="margin-top:14px"><button class="btn btn-primary" id="ex-again">再来一套</button><button class="btn btn-ghost" id="ex-back">返回</button><button class="btn btn-ghost no-print" id="ex-pdf">📄 导出本题卷PDF</button></div>
      </div>`;
    $('#ex-again').onclick = () => { examSession = null; renderExam(); };
    $('#ex-back').onclick = () => { examSession = null; renderExam(); };
    $('#ex-pdf').onclick = () => { U.printDoc('深圳中考模拟_' + examSession.subject + (examSession.mode === 'mock' ? ('第' + examSession.setNo + '套') : ''), buildExamPrintHtml()); };
  }

  function buildExamPrintHtml() {
    const qs = examSession.questions;
    let totalScore = 0, gotScore = 0; const bySec = {};
    qs.forEach(q => {
      const sc = q.score != null ? q.score : 10; const sec = q.section || '综合';
      bySec[sec] = bySec[sec] || { t: 0, g: 0 }; bySec[sec].t += sc; totalScore += sc;
      const ok = q.options ? (q.userAns === q.answer) : (q.selfCorrect === true);
      if (ok) { bySec[sec].g += sc; gotScore += sc; }
    });
    const pct = totalScore ? Math.round(gotScore / totalScore * 100) : 0;
    const modeTxt = examSession.mode === 'mock' ? ('第' + examSession.setNo + '套') : examSession.mode === 'random' ? '随机组卷' : '专项练习';
    let html = `<h2>成绩概览</h2><p>学科：${examSession.subject}　模式：${modeTxt}　得分：${gotScore}/${totalScore}（得分率 ${pct}%）</p>`;
    Object.entries(bySec).forEach(([s, v]) => { html += `<p>${U.esc(s)}：${v.g}/${v.t} 分</p>`; });
    html += `<h2>题目与解析</h2>`;
    qs.forEach((q, i) => {
      const opt = q.options ? q.options.map((o, j) => `${String.fromCharCode(65 + j)}. ${U.esc(o)}`).join('　') : '';
      html += `<div class="q-block"><div class="qh"><span class="qn">Q${i + 1}</span><span class="chip">${U.esc(q.section || '综合')}</span><span class="chip">${q.score}分</span></div><div class="q-stem">${U.esc(q.stem)}</div>${opt ? `<div class="muted small" style="margin-bottom:6px">${opt}</div>` : ''}<div class="q-answer"><b>答案：</b>${U.esc(q.answer != null ? q.answer : '（主观题见解析）')}</div><div class="q-analysis"><b>解析：</b>${U.esc(q.analysis || '')}</div></div>`;
    });
    return html;
  }

  /* ---------------- 随机组卷 / 专项练习 生成器 ---------------- */
  function lcg(seed) { let s = seed >>> 0; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
  function buildQuestions(subject, factories, n, scoreEach, seed) {
    const rng = lcg(seed);
    const pool = factories.slice().sort(() => rng() - 0.5);
    const qs = [];
    for (let i = 0; i < n; i++) {
      const f = pool[i % pool.length]; const q = f.make(rng);
      qs.push(Object.assign({ no: i + 1, qno: i + 1, subject, section: f.section, pointId: f.pointId, difficulty: f.difficulty, score: scoreEach }, q));
    }
    return qs;
  }
  function startRandom(subject, num, diff) {
    const banks = window.ZK_MOCK.BANKS[subject]; if (!banks) return;
    let fac = diff ? banks.filter(f => f.difficulty === diff) : banks;
    if (!fac.length) fac = banks;
    const scoreEach = Math.round(100 / num);
    const qs = buildQuestions(subject, fac, num, scoreEach, Math.floor(Math.random() * 1e9));
    examSession = { mode: 'random', subject, meta: { subject, version: D.SUBJECTS[subject].version, totalScore: scoreEach * num, label: '随机组卷' }, questions: qs.map(q => ({ ...q, userAns: null, selfCorrect: null, revealed: false })), idx: 0, finished: false };
    window.ZK_LOG && window.ZK_LOG.info('startRandom', { subject, num, diff });
    renderExamSession();
  }
  function startSpecial(subject, pointId) {
    const banks = window.ZK_MOCK.BANKS[subject]; if (!banks) return;
    let fac = banks.filter(f => f.pointId === pointId);
    if (!fac.length) fac = banks;
    const n = Math.min(10, Math.max(6, fac.length * 2));
    const seed = window.ZK_PAPERS.hashStr(subject + '#SP' + pointId);
    const qs = buildQuestions(subject, fac, n, 10, seed);
    const p = S.getPoints().find(x => x.id === pointId);
    examSession = { mode: 'special', subject, pointId, meta: { subject, version: D.SUBJECTS[subject].version, totalScore: 10 * n, label: '专项练习 · ' + (p ? p.name : '') }, questions: qs.map(q => ({ ...q, userAns: null, selfCorrect: null, revealed: false })), idx: 0, finished: false };
    window.ZK_LOG && window.ZK_LOG.info('startSpecial', { subject, pointId, n });
    renderExamSession();
  }

  function showExamHistory() {
    const recs = S.getExamRecords();
    $('#app').innerHTML = `<div class="card"><h3>📈 模拟考试历史（${recs.length}）</h3>${recs.length ? '<div class="table-wrap"><table><thead><tr><th>日期</th><th>学科</th><th>得分</th><th>满分</th><th>正确</th><th>得分率</th></tr></thead><tbody>' + recs.slice().reverse().map(r => `<tr><td>${r.date}</td><td>${subjChip(r.subject)}</td><td><b>${r.score}</b></td><td>${r.totalScore || r.total}</td><td>${r.correct}/${r.total}</td><td>${r.pct != null ? r.pct + '%' : '—'}</td></tr>`).join('') + '</tbody></table></div>' : '<p class="muted">暂无记录，先去组卷开考吧。</p>'}<div style="margin-top:12px"><button class="btn btn-ghost btn-sm" id="ex-back2">返回</button></div></div>`;
    $('#ex-back2').onclick = () => { examTab = 'mock'; renderExam(); };
  }

  async function aiExam() {
    const subject = $('#ex-sub').value;
    const box = $('#ex-ai-box') || (() => { const d = document.createElement('div'); d.id = 'ex-ai-box'; $('#app').appendChild(d); return d; })();
    box.innerHTML = '<p class="muted small">⏳ AI 组卷中（使用「模拟考试」提示词）…</p>';
    try {
      const r = await U.callLLM(P['模拟考试'].prompt, `为深圳中考${subject}（${D.SUBJECTS[subject].version}）命制一套微型模拟卷（3-5题），含题型、题干、答案、对应章节与深圳考情出处。`);
      box.innerHTML = `<div class="analysis"><b>✨ AI 组卷：</b><br>${U.esc(r)}</div>`;
    } catch (e) { box.innerHTML = `<div class="warn-box">未配置 AI 密钥。已用内置题库组卷；可在「设置 ⚙️」填入 API Key 启用 AI 动态组卷。</div>`; }
  }

  /* ============================================================
   * 模块七：背诵打卡
   * ========================================================== */
  function renderRecite() {
    $('#app').innerHTML = `
      <div class="card">
        <h3>✅ 背诵打卡 <span class="muted small">｜ 角色：背诵督学教练 · 篇目确权+艾宾浩斯排程+自测预警</span></h3>
        <div class="toolbar"><select id="rc-sub">${subjectOptions('语文')}</select><button class="btn btn-primary" id="rc-render">查看打卡</button></div>
        <div id="rc-out"><p class="muted">选择学科后点击「查看打卡」。</p></div>
        <p class="muted small" style="margin-top:10px">约束：篇目严格对应指定版本（语文必背古诗文/英语单元范文/物理实验步骤/数学公式定理）；自测可验证；未过关不跳过。</p>
      </div>`;
    $('#rc-render').onclick = () => renderReciteList($('#rc-sub').value);
  }

  function renderReciteList(subject) {
    const items = S.getRecite().filter(r => r.subject === subject);
    const log = S.getReciteLog();
    const today = ZK_TODAY();
    const out = items.map(it => {
      const l = log[it.id];
      let status, next, scheduleHtml = '';
      if (l && l.schedule) {
        const nd = l.schedule.find(d => !l.done.includes(d));
        next = nd || '已掌握';
        const overdue = nd && nd < today;
        status = l.done.length >= l.schedule.length ? '<span class="status-done">已掌握</span>' : (overdue ? '<span class="status-over">逾期</span>' : '<span class="status-doing">复习中</span>');
        scheduleHtml = l.schedule.map(d => `<span class="chip ${l.done.includes(d) ? 'low' : (d < today ? 'high' : '')}" style="margin:2px">${d}${l.done.includes(d) ? '✔' : ''}</span>`).join('');
      } else { status = '<span class="status-doing">未开始</span>'; next = '—'; }
      return `<div class="recite-item">
        <div class="info"><b>${U.esc(it.item)}</b> <span class="chip ver">${U.esc(it.version)}</span> <span class="muted small">${U.esc(it.unit)} · ${it.type}${it.must ? ' · 必背' : ''}</span>
          <div class="cal">下次复习：${next} ｜ 进度：${l ? l.done.length + '/' + (l.schedule ? l.schedule.length : 5) : '0/5'}</div>
          <div class="cal">${scheduleHtml}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">${status}<button class="btn btn-primary btn-sm" data-check="${it.id}">今日打卡</button></div>
      </div>`;
    }).join('');

    // 周统计
    const total = items.length;
    const mastered = items.filter(it => { const l = log[it.id]; return l && l.schedule && l.done && l.done.length >= l.schedule.length; }).length;
    const overdue = items.filter(it => { const l = log[it.id]; if (!l || !l.schedule) return false; const nd = l.schedule.find(d => !l.done.includes(d)); return nd && nd < today; }).length;
    const stat = `<div class="warn-box" style="margin-bottom:12px"><b>📊 本周统计：</b>完成 ${mastered}/${total} ｜ ${overdue ? `<span style="color:#b91c1c">${overdue} 项逾期，请优先补卡</span>` : '无逾期，节奏良好'}</div>`;

    $('#rc-out').innerHTML = stat + out;
    $$('[data-check]').forEach(b => b.onclick = () => {
      const id = b.dataset.check; const it = items.find(x => x.id === id);
      const l = log[id] || { base: today, schedule: U.ebbinghaus(today), done: [] };
      if (!l.base) { l.base = today; l.schedule = U.ebbinghaus(today); l.done = []; }
      const nd = l.schedule.find(d => !l.done.includes(d));
      if (nd && !l.done.includes(nd)) { l.done.push(nd); }
      S.setReciteItem(id, l);
      renderReciteList(subject); U.toast('打卡成功，已推进复习排程', 'ok');
    });
  }

  /* ============================================================
   * 提示词库
   * ========================================================== */
  function renderPrompts() {
    const keys = ['总控', '考点库管理', '智能刷题', '错题回顾', '复习计划', '思维导图', '模拟考试', '背诵打卡'];
    const blocks = keys.map(k => `<details class="prompt-block"><summary>${U.esc(P[k].title)} <button class="copy-btn" data-copy="${k}">复制</button></summary><pre>${U.esc(P[k].prompt)}</pre></details>`).join('');
    $('#app').innerHTML = `
      <div class="card">
        <h3>📜 提示词库 <span class="muted small">｜ 复刻《提示词清单》，可直接复制驱动对应 AI 复习功能；亦作 AI 增强模式 system prompt</span></h3>
        ${blocks}
        <p class="muted small" style="margin-top:10px">在「设置 ⚙️」配置 API Key 后，刷题/计划/模考模块将出现「✨ AI 生成」按钮，以上述提示词驱动大模型动态产出内容。</p>
      </div>`;
    $$('[data-copy]').forEach(b => b.onclick = (e) => { e.stopPropagation(); navigator.clipboard.writeText(P[b.dataset.copy].prompt).then(() => U.toast('已复制', 'ok')); });
  }

  /* ============================================================
   * 真题详解（近五年·仿真样卷）
   * ========================================================== */
  let ppCache = null;
  function renderPast() {
    $('#app').innerHTML = `
      <div class="card">
        <h3>📕 真题详解 <span class="muted small">｜ 近五年（2021–2025）全套仿真样卷 · 逐题答案+解析 · 按学科/年份检索</span></h3>
        <div class="section-bar">
          <div class="field" style="margin:0"><label>学科</label><select id="pp-sub">${subjectOptions('物理')}</select></div>
          <div class="field" style="margin:0"><label>年份</label><select id="pp-year">${window.ZK_PAPERS.PAST_YEARS.map(y => `<option>${y}</option>`).join('')}</select></div>
          <input id="pp-q" placeholder="搜索题面/解析关键词…" style="flex:1;min-width:160px;padding:9px 11px;border:1px solid var(--line);border-radius:9px">
          <button class="btn btn-primary" id="pp-open">查看真题</button>
          <button class="btn btn-ghost no-print" id="pp-pdf">导出PDF</button>
        </div>
        <p class="muted small" style="margin-top:4px">说明：受版权限制，本卷为<b>结构对标深圳中考的仿真样卷（非官方原题）</b>，每题附标准答案与逐题解析；如需真实原题可导入官方资料。选择学科+年份后点击「查看真题」。</p>
        <div id="pp-out"><p class="muted">选择学科与年份后点击「查看真题」。</p></div>
      </div>`;
    $('#pp-open').onclick = () => openPastPaper($('#pp-sub').value, +$('#pp-year').value, $('#pp-q').value);
    $('#pp-q').oninput = () => { if (ppCache) openPastPaper(ppCache.subject, ppCache.year, $('#pp-q').value); };
    $('#pp-pdf').onclick = () => { if (!ppCache) { U.toast('请先查看真题再导出', 'warn'); return; } U.printDoc('深圳中考' + ppCache.subject + ppCache.year + '真题(仿真)', buildPastHtml(ppCache.paper, $('#pp-q').value)); };
  }
  function openPastPaper(subject, year, qf) {
    let paper;
    try { paper = window.ZK_PAPERS.generatePastPaper(subject, year); }
    catch (e) { U.toast('生成失败：' + e.message, 'err'); return; }
    ppCache = { subject, year, paper };
    const q = (qf || '').trim().toLowerCase();
    const hit = q ? paper.questions.filter(x => x.stem.toLowerCase().includes(q) || (x.analysis || '').toLowerCase().includes(q)).length : paper.questions.length;
    $('#pp-out').innerHTML = `
      <div style="border:none;box-shadow:none;padding:0">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px">
          <div><b style="font-size:15px">${subject} · ${year} 年深圳中考（仿真）</b> ${subjChip(subject)} <span class="chip ver">${paper.meta.version}</span> <span class="chip">满分 ${paper.meta.totalScore}</span></div>
          <span class="muted small">${paper.meta.label}</span>
        </div>
        ${qf && qf.trim() ? `<div class="warn-box" style="margin-bottom:10px">搜索「${U.esc(qf)}」命中 ${hit} 题</div>` : ''}
        ${buildPastHtml(paper, qf)}
      </div>`;
  }
  function buildPastHtml(paper, qf) {
    const pts = S.getPoints();
    const q = (qf || '').trim().toLowerCase();
    let html = '';
    paper.sections.forEach(sec => {
      const qs = sec.questions.filter(x => !q || x.stem.toLowerCase().includes(q) || (x.analysis || '').toLowerCase().includes(q));
      if (!qs.length) return;
      html += `<h2>${U.esc(sec.name)}（每题 ${sec.score} 分）</h2>`;
      qs.forEach(x => {
        const p = pts.find(pp => pp.id === x.pointId);
        const opt = x.options ? x.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${U.esc(o)}`).join('　') : '';
        html += `<div class="q-block"><div class="qh"><span class="qn">Q${x.qno}</span><span class="chip">${U.esc(sec.name)}</span><span class="chip">${x.score}分</span>${p ? `<span class="chip ver">${U.esc(p.chapter)}</span>` : ''}</div><div class="q-stem">${U.esc(x.stem)}</div>${opt ? `<div class="muted small" style="margin-bottom:6px">${opt}</div>` : ''}<div class="q-answer"><b>答案：</b>${U.esc(x.answer != null ? x.answer : '（主观题见解析/评分要点）')}</div><div class="q-analysis"><b>解析：</b>${U.esc(x.analysis || '')}</div></div>`;
      });
    });
    if (!html) html = '<p class="muted">无匹配题目。</p>';
    return html;
  }

  /* ============================================================
   * 知识体系（初中全学科核心知识点结构化梳理 + 进度跟踪）
   * ========================================================== */
  let kpSub = '物理';
  function renderKnowledge() {
    const kp = S.getKpProgress();
    const pts = S.getPoints();
    const total = pts.length;
    const mastered = pts.filter(p => kp[p.id] === 'mastered').length;
    const learning = pts.filter(p => kp[p.id] === 'learning').length;
    const pct = total ? Math.round((mastered + learning * 0.5) / total * 100) : 0;
    $('#app').innerHTML = `
      <div class="card">
        <h3>📖 知识体系 <span class="muted small">｜ 初中全学科核心知识点结构化梳理 · 分类浏览 + 掌握进度跟踪</span></h3>
        <div class="kp-summary">
          <div class="stat"><div class="num">${total}</div><div class="lbl">核心知识点</div></div>
          <div class="stat"><div class="num" style="color:var(--ok)">${mastered}</div><div class="lbl">已掌握</div></div>
          <div class="stat"><div class="num" style="color:var(--primary)">${learning}</div><div class="lbl">学习中</div></div>
          <div class="stat"><div class="num">${pct}%</div><div class="lbl">整体掌握度</div><div class="kp-progress-bar"><span style="width:${pct}%"></span></div></div>
        </div>
        <div class="section-bar">
          <select id="kp-sub">${subjectOptions('物理')}</select>
          <span class="muted small">点击「学习中/已掌握」标记掌握状态（本地保存，与背诵打卡互补）。</span>
          <span class="spacer"></span>
          <button class="btn btn-ghost no-print" id="kp-pdf">导出PDF</button>
        </div>
        <div id="kp-out"></div>
      </div>`;
    $('#kp-sub').value = kpSub;
    $('#kp-sub').onchange = e => { kpSub = e.target.value; renderKnowledge(); };
    $('#kp-pdf').onclick = () => U.printDoc('知识体系_' + kpSub, buildKnowledgeHtml(kpSub));
    renderKnowledgeList(kpSub);
  }
  function renderKnowledgeList(sub) {
    const pts = S.getPoints().filter(p => p.subject === sub);
    const byCh = {};
    pts.forEach(p => { (byCh[p.chapter] = byCh[p.chapter] || []).push(p); });
    const kp = S.getKpProgress();
    const allById = Object.fromEntries(S.getPoints().map(p => [p.id, p]));
    let html = '';
    Object.keys(byCh).forEach(ch => {
      html += `<div class="kp-group"><div class="kp-group-title"><span>${U.esc(ch)}</span><span class="muted small">${byCh[ch].length} 个</span></div><div class="kp-list">`;
      byCh[ch].forEach(p => {
        const st = kp[p.id];
        const rels = (p.related || []).map(id => allById[id]).filter(Boolean);
        const relHtml = rels.length ? rels.map(r => `<span class="rel-chip" style="border-left:3px solid ${subjColor(r.subject)}">${U.esc(r.name)}</span>`).join('') : '<span class="muted small">—</span>';
        html += `<div class="kp-item">
          <div class="kp-name">${U.esc(p.name)} ${freqChip(p.freq)}</div>
          <div class="kp-tags">${p.tags && p.tags.length ? p.tags.map(t => `<span class="chip low">${U.esc(t)}</span>`).join('') : ''}<span class="chip">${p.level}</span></div>
          <div class="kp-rel"><b>关联：</b>${relHtml}</div>
          <div class="kp-prog" style="margin-top:8px">
            <button class="${st === 'learning' ? 'on-m' : ''}" data-kp="${p.id}" data-s="learning">学习中</button>
            <button class="${st === 'mastered' ? 'on-k' : ''}" data-kp="${p.id}" data-s="mastered">已掌握</button>
            ${st ? `<button data-kp="${p.id}" data-s="">清除</button>` : ''}
          </div>
        </div>`;
      });
      html += `</div></div>`;
    });
    $('#kp-out').innerHTML = html;
    $$('#kp-out [data-kp]').forEach(b => b.onclick = () => { S.setKpProgress(b.dataset.kp, b.dataset.s || undefined); U.toast('已更新掌握状态', 'ok'); renderKnowledge(); });
  }
  function buildKnowledgeHtml(sub) {
    const pts = S.getPoints().filter(p => p.subject === sub);
    const byCh = {}; pts.forEach(p => { (byCh[p.chapter] = byCh[p.chapter] || []).push(p); });
    const kp = S.getKpProgress();
    const allById = Object.fromEntries(S.getPoints().map(p => [p.id, p]));
    let html = `<p class="muted">学科：${sub}（${D.SUBJECTS[sub].version}）　共 ${pts.length} 个核心知识点</p>`;
    Object.keys(byCh).forEach(ch => {
      html += `<h2>${U.esc(ch)}</h2><div class="kp-list">`;
      byCh[ch].forEach(p => {
        const st = kp[p.id]; const stTxt = st === 'mastered' ? '✅ 已掌握' : st === 'learning' ? '🔵 学习中' : '⚪ 未学';
        const rels = (p.related || []).map(id => allById[id]).filter(Boolean);
        html += `<div class="kp-item"><div class="kp-name">${U.esc(p.name)} ${freqChip(p.freq)}</div><div class="kp-tags">${p.tags && p.tags.length ? p.tags.map(t => `<span class="chip low">${U.esc(t)}</span>`).join('') : ''}<span class="chip">${p.level}</span><span class="chip">${stTxt}</span></div>${rels.length ? `<div class="kp-rel"><b>关联：</b>${rels.map(r => U.esc(r.name)).join('、')}</div>` : ''}</div>`;
      });
      html += `</div>`;
    });
    return html;
  }

  /* ============================================================
   * 名师专栏（全网名师资源索引 + 搜索/分类）
   * ========================================================== */
  function renderTeachers() {
    $('#app').innerHTML = `
      <div class="card">
        <h3>🌟 名师专栏 <span class="muted small">｜ 全网名师资源索引 · 视频/图文 · 搜索 + 学科/形式筛选</span></h3>
        <div class="section-bar">
          <select id="tc-sub"><option value="">全部学科</option>${Object.keys(D.SUBJECTS).map(s => `<option>${s}</option>`).join('')}</select>
          <select id="tc-fmt"><option value="">全部形式</option><option value="视频">视频</option><option value="图文">图文</option><option value="音频">音频</option></select>
          <select id="tc-lv"><option value="">全部来源</option><option value="官方">官方平台</option><option value="公开">公开创作者</option></select>
          <input id="tc-q" placeholder="搜索名师/主题/平台…" style="flex:1;min-width:160px;padding:9px 11px;border:1px solid var(--line);border-radius:9px">
          <button class="btn btn-primary" id="tc-search">搜索</button>
          <button class="btn btn-ghost no-print" id="tc-pdf">导出清单PDF</button>
        </div>
        <p class="muted small">点击「打开讲解」跳转对应平台检索/观看；资源来自国家中小学智慧教育平台、国家教育资源公共服务平台与哔哩哔哩等公开渠道，本应用仅做合规索引。</p>
        <div id="tc-out"></div>
      </div>`;
    $('#tc-search').onclick = renderTeacherList;
    $('#tc-q').oninput = renderTeacherList;
    $('#tc-sub').onchange = renderTeacherList;
    $('#tc-fmt').onchange = renderTeacherList;
    $('#tc-lv').onchange = renderTeacherList;
    $('#tc-pdf').onclick = () => { const list = window.ZK_TEACHERS.searchTeachers($('#tc-q').value, { subject: $('#tc-sub').value, format: $('#tc-fmt').value, level: $('#tc-lv').value }); U.printDoc('名师资源清单', buildTeacherHtml(list)); };
    renderTeacherList();
  }
  function renderTeacherList() {
    const list = window.ZK_TEACHERS.searchTeachers($('#tc-q').value, { subject: $('#tc-sub').value, format: $('#tc-fmt').value, level: $('#tc-lv').value });
    if (!list.length) { $('#tc-out').innerHTML = '<p class="muted">无匹配资源，换个关键词或筛选条件试试。</p>'; return; }
    $('#tc-out').innerHTML = `<div class="teacher-grid">` + list.map(t => `
      <div class="teacher-card">
        <div class="tc-head"><div><div class="tc-name">${U.esc(t.teacher)}</div><div class="tc-org">${U.esc(t.org)} · ${U.esc(t.platform)}</div></div>${subjChip(t.subject)}</div>
        <div class="tc-topic"><b>专题：</b>${U.esc(t.topic)}</div>
        <div class="tc-desc">${U.esc(t.desc)}</div>
        <div class="tc-tags">${t.tags.map(x => `<span class="chip low">${U.esc(x)}</span>`).join('')}<span class="chip">${t.format}</span>${t.level === '官方' ? '<span class="chip high">官方</span>' : ''}</div>
        <div class="tc-actions"><button class="btn btn-primary btn-sm no-print" data-open="${U.esc(t.url)}">打开讲解 ↗</button></div>
      </div>`).join('') + `</div>`;
    $$('#tc-out [data-open]').forEach(b => b.onclick = () => { try { window.open(b.dataset.open, '_blank', 'noopener'); } catch (e) { location.href = b.dataset.open; } });
  }
  function buildTeacherHtml(list) {
    let html = `<p class="muted">共 ${list.length} 条名师资源</p><div class="teacher-grid">`;
    list.forEach(t => {
      html += `<div class="teacher-card"><div class="tc-head"><div><div class="tc-name">${U.esc(t.teacher)}</div><div class="tc-org">${U.esc(t.org)} · ${U.esc(t.platform)}</div></div></div><div class="tc-topic"><b>专题：</b>${U.esc(t.topic)}</div><div class="tc-desc">${U.esc(t.desc)}</div><div class="tc-tags">${t.tags.map(x => `<span class="chip low">${U.esc(x)}</span>`).join('')}<span class="chip">${t.format}</span>${t.level === '官方' ? '<span class="chip high">官方</span>' : ''}</div><div class="muted small" style="margin-top:6px">链接：${U.esc(t.url)}</div></div>`;
    });
    return html + `</div>`;
  }

  /* ============================================================
   * 扩展板块一：初二物理名师视频课程（人教版八上+八下）
   * ========================================================== */
  function renderPhysVideo() {
    const C = window.ZK_PHYSVIDEO;
    $('#app').innerHTML = `
      <div class="card">
        <h3>🎬 初二物理名师视频课程 <span class="muted small">｜ 人教版八上+八下 · 课程目录 + 合规平台讲解入口</span></h3>
        <div class="section-bar">
          <input id="pv-q" placeholder="搜索章节 / 课时 / 要点…" style="flex:1;min-width:160px;padding:9px 11px;border:1px solid var(--line);border-radius:9px">
          <button class="btn btn-primary" id="pv-search">搜索</button>
          <button class="btn btn-ghost no-print" id="pv-pdf">导出课程PDF</button>
        </div>
        <p class="muted small">本板块为课程索引：每课时提供 B站 / 国家中小学智慧教育平台 讲解入口（点击即在对应平台检索该主题名师视频）。本应用不托管视频。注：初二 = 八年级，覆盖八上 + 八下共 12 章。</p>
        <div id="pv-out"></div>
      </div>`;
    $('#pv-search').onclick = renderPhysVideoList;
    $('#pv-q').oninput = renderPhysVideoList;
    $('#pv-pdf').onclick = () => { const cc = C.searchCourse($('#pv-q').value); U.printDoc('初二物理名师视频课程目录', buildPhysVideoHtml(cc)); };
    renderPhysVideoList();
  }
  function renderPhysVideoList() {
    const c = window.ZK_PHYSVIDEO.searchCourse($('#pv-q').value);
    let html = '<div class="featured-row">' + c.featured.map(f => `
      <div class="teacher-card">
        <div class="tc-head"><div><div class="tc-name">${U.esc(f.name)}</div><div class="tc-org">${U.esc(f.org)} · ${U.esc(f.platform)}</div></div></div>
        <div class="tc-desc">${U.esc(f.desc)}</div>
        <div class="tc-tags">${f.tags.map(x => `<span class="chip low">${U.esc(x)}</span>`).join('')}</div>
        <div class="tc-actions"><button class="btn btn-primary btn-sm no-print" data-open="${U.esc(f.url)}">打开讲解 ↗</button></div>
      </div>`).join('') + '</div>';
    if (!c.chapters.length) { $('#pv-out').innerHTML = html + '<p class="muted">无匹配章节。</p>'; bindOpens(); return; }
    html += c.chapters.map(cp => `
      <div class="kp-group">
        <div class="kp-group-title">${U.esc(cp.ch)}<span class="muted small">${cp.lessons.length} 课时</span></div>
        <div class="lesson-list">${cp.lessons.map(l => `
          <div class="lesson-row">
            <div class="lesson-main">
              <div class="lesson-title">${U.esc(l.title)}</div>
              <div class="lesson-pts">${l.points.map(p => `<span class="chip low">${U.esc(p)}</span>`).join('')}</div>
            </div>
            <div class="vid-btns no-print">
              <button class="btn btn-ghost btn-sm" data-open="${U.esc(l.bili)}">B站讲解</button>
              <button class="btn btn-ghost btn-sm" data-open="${U.esc(l.zxx)}">智慧教育</button>
            </div>
          </div>`).join('')}</div>
      </div>`).join('');
    $('#pv-out').innerHTML = html;
    bindOpens();
  }
  function bindOpens() { $$('#pv-out [data-open]').forEach(b => b.onclick = () => { try { window.open(b.dataset.open, '_blank', 'noopener'); } catch (e) { location.href = b.dataset.open; } }); }
  function buildPhysVideoHtml(c) {
    let html = '<p class="muted">课程目录（人教版八年级物理 八上 + 八下）</p>';
    html += '<div class="featured-row">' + c.featured.map(f => `<div class="teacher-card"><div class="tc-name">${U.esc(f.name)}</div><div class="tc-org">${U.esc(f.org)} · ${U.esc(f.platform)}</div><div class="tc-desc">${U.esc(f.desc)}</div><div class="muted small">${U.esc(f.url)}</div></div>`).join('') + '</div>';
    c.chapters.forEach(cp => {
      html += `<div class="kp-group"><div class="kp-group-title">${U.esc(cp.ch)}</div><div class="lesson-list">` + cp.lessons.map(l => `<div class="lesson-row"><div class="lesson-main"><div class="lesson-title">${U.esc(l.title)}</div><div class="lesson-pts">${l.points.map(p => `<span class="chip low">${U.esc(p)}</span>`).join('')}</div></div></div>`).join('') + `</div></div>`;
    });
    return html;
  }

  /* ============================================================
   * 扩展板块二：初中奥数题及解析（8 主题 / 24 题，本地）
   * ========================================================== */
  function renderOlympiad() {
    const O = window.ZK_OLYMPIAD;
    $('#app').innerHTML = `
      <div class="card">
        <h3>🧮 初中奥数题及解析 <span class="muted small">｜ 8 大主题 · 24 道典型题 · 分步详解</span></h3>
        <div class="section-bar">
          <select id="ol-topic"><option value="">全部主题</option>${O.TOPICS.map(t => `<option>${t}</option>`).join('')}</select>
          <select id="ol-grade"><option value="">全部年级</option><option>七</option><option>八</option><option>九</option></select>
          <select id="ol-diff"><option value="">全部难度</option><option value="★">★ 入门</option><option value="★★">★★ 进阶</option><option value="★★★">★★★ 挑战</option></select>
          <input id="ol-q" placeholder="搜索题干 / 方法…" style="flex:1;min-width:140px;padding:9px 11px;border:1px solid var(--line);border-radius:9px">
          <button class="btn btn-primary" id="ol-search">搜索</button>
          <button class="btn btn-ghost no-print" id="ol-pdf">导出PDF</button>
        </div>
        <p class="muted small">每题附完整分步解析与答案，点击「显示解析」查看推导；支持按主题 / 年级 / 难度筛选。</p>
        <div id="ol-out"></div>
      </div>`;
    $('#ol-search').onclick = renderOlympiadList;
    $('#ol-q').oninput = renderOlympiadList;
    $('#ol-topic').onchange = renderOlympiadList;
    $('#ol-grade').onchange = renderOlympiadList;
    $('#ol-diff').onchange = renderOlympiadList;
    $('#ol-pdf').onclick = () => { const list = O.filterOlympic({ topic: $('#ol-topic').value, grade: $('#ol-grade').value, diff: $('#ol-diff').value, q: $('#ol-q').value }); U.printDoc('初中奥数题及解析', buildOlympiadHtml(list)); };
    renderOlympiadList();
  }
  function renderOlympiadList() {
    const list = window.ZK_OLYMPIAD.filterOlympic({ topic: $('#ol-topic').value, grade: $('#ol-grade').value, diff: $('#ol-diff').value, q: $('#ol-q').value });
    if (!list.length) { $('#ol-out').innerHTML = '<p class="muted">无匹配题目，换个条件试试。</p>'; return; }
    $('#ol-out').innerHTML = list.map(p => `
      <div class="prob-card">
        <div class="prob-top"><span class="chip ver">${U.esc(p.topic)}</span><span class="chip">${U.esc(p.grade)}年级</span><span class="chip mid">${U.esc(p.diff)}</span>${p.tags.map(x => `<span class="chip low">${U.esc(x)}</span>`).join('')}</div>
        <div class="q-stem">${U.esc(p.stem)}</div>
        <div class="prob-actions no-print"><button class="btn btn-ghost btn-sm" data-sol="${p.id}">显示解析</button></div>
        <div class="prob-sol" id="sol-${p.id}" style="display:none">
          <b>解析：</b><ol class="sol-steps">${p.solution.map(s => `<li>${U.esc(s)}</li>`).join('')}</ol>
          <div class="prob-ans"><b>答案：</b>${U.esc(p.answer)}</div>
        </div>
      </div>`).join('');
    $$('#ol-out [data-sol]').forEach(b => b.onclick = () => { const el = $('#sol-' + b.dataset.sol); const show = el.style.display === 'none'; el.style.display = show ? 'block' : 'none'; b.textContent = show ? '隐藏解析' : '显示解析'; });
  }
  function buildOlympiadHtml(list) {
    return '<p class="muted">共 ' + list.length + ' 道</p>' + list.map(p => `
      <div class="prob-card" style="margin-bottom:14px">
        <div class="prob-top"><span class="chip ver">${U.esc(p.topic)}</span><span class="chip">${U.esc(p.grade)}年级</span><span class="chip mid">${U.esc(p.diff)}</span></div>
        <div class="q-stem">${U.esc(p.stem)}</div>
        <div class="prob-sol"><b>解析：</b><ol class="sol-steps">${p.solution.map(s => `<li>${U.esc(s)}</li>`).join('')}</ol><div class="prob-ans"><b>答案：</b>${U.esc(p.answer)}</div></div>
      </div>`).join('');
  }

  /* ============================================================
   * 扩展板块三：初一到初三物理教程 + 配套练习（人教版）
   * ========================================================== */
  let pcState = { grade: '初二', tab: 'tut', setNo: 1, ex: null };
  function renderPhysCourse() {
    const PC = window.ZK_PHYSCOURSE;
    $('#app').innerHTML = `
      <div class="card">
        <h3>📘 初一到初三 物理教程与配套练习 <span class="muted small">｜ 人教版 · 每年级 5 套教程 + 5 套练习</span></h3>
        <div class="grade-tabs">${PC.GRADES.map(g => `<button class="gtab ${g === pcState.grade ? 'on' : ''}" data-grade="${g}">${g}</button>`).join('')}</div>
        <div class="warn-box" style="margin:10px 0">${U.esc(PC.GRADE_NOTE[pcState.grade])}</div>
        <div class="subtabs">
          <button class="stab ${pcState.tab === 'tut' ? 'on' : ''}" data-tab="tut">📖 教程（5 套）</button>
          <button class="stab ${pcState.tab === 'ex' ? 'on' : ''}" data-tab="ex">✍️ 配套练习（5 套）</button>
          <button class="btn btn-ghost btn-sm no-print" id="pc-pdf" style="margin-left:auto">导出PDF</button>
        </div>
        <div id="pc-out"></div>
      </div>`;
    $$('#app [data-grade]').forEach(b => b.onclick = () => { pcState.grade = b.dataset.grade; pcState.tab = 'tut'; pcState.ex = null; renderPhysCourse(); });
    $$('#app [data-tab]').forEach(b => b.onclick = () => { pcState.tab = b.dataset.tab; pcState.ex = null; renderPhysCourse(); });
    $('#pc-pdf').onclick = () => {
      if (pcState.tab === 'tut') U.printDoc(pcState.grade + '物理教程', buildTutHtml(pcState.grade));
      else { const ex = pcState.ex || window.ZK_PHYSCOURSE.generateExercises(pcState.grade, pcState.setNo); U.printDoc(ex.title + '（含答案）', buildExHtml(ex)); }
    };
    if (pcState.tab === 'tut') renderPcTut(); else renderPcEx();
  }
  function renderPcTut() {
    const list = window.ZK_PHYSCOURSE.getTutorials(pcState.grade);
    $('#pc-out').innerHTML = list.map(t => `
      <div class="tut-card">
        <div class="tut-head"><span class="tut-no">教程 ${t.no}</span><span class="tut-title">${U.esc(t.title)}</span><span class="muted small">${U.esc(t.chapter)} · ${t.duration}</span></div>
        <div class="tut-obj"><b>学习目标：</b>${t.objectives.map(o => `<span class="chip low">${U.esc(o)}</span>`).join('')}</div>
        <div class="tut-outline">${t.outline.map(o => `<div class="tut-sec"><b>${U.esc(o.h)}</b><ul>${o.p.map(p => `<li>${U.esc(p)}</li>`).join('')}</ul></div>`).join('')}</div>
        <div class="tut-kp"><b>关键要点：</b>${t.keyPoints.map(k => `<span class="chip mid">${U.esc(k)}</span>`).join('')}</div>
      </div>`).join('');
  }
  function renderPcEx() {
    if (!pcState.ex) {
      $('#pc-out').innerHTML = `
        <div class="row" style="margin-bottom:12px">
          <div class="field" style="flex:1"><label>选择练习套号（1–5，本地确定性生成）</label>
            <select id="pc-set">${[1, 2, 3, 4, 5].map(n => `<option ${n === pcState.setNo ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
          <button class="btn btn-primary" id="pc-start">开始练习</button>
        </div>
        <p class="muted small">每套练习由本地确定性工厂生成（同一 年级+套号 结果可复现），含 5 道 ${U.esc(pcState.grade)} 物理题，附答案与解析。</p>`;
      $('#pc-set').onchange = () => { pcState.setNo = +$('#pc-set').value; };
      $('#pc-start').onclick = () => { pcState.ex = window.ZK_PHYSCOURSE.generateExercises(pcState.grade, pcState.setNo); pcState.ex.qs = pcState.ex.questions.map(q => ({ ...q, userAns: null })); pcState.ex.idx = 0; pcState.ex.finished = false; renderPcEx(); };
      return;
    }
    renderPcExSession();
  }
  function renderPcExSession() {
    const ex = pcState.ex;
    if (ex.finished) {
      let correct = 0; ex.qs.forEach(q => { if (q.userAns === q.answer) correct++; });
      const rate = Math.round(correct / ex.qs.length * 100);
      $('#pc-out').innerHTML = `
        <div class="stat" style="max-width:300px"><div class="num" style="color:${rate >= 80 ? 'var(--ok)' : rate >= 60 ? 'var(--warn)' : 'var(--danger)'}">${rate}%</div><div class="lbl">${U.esc(ex.title)} · 答对 ${correct}/${ex.qs.length}</div></div>
        <div style="margin:14px 0">${ex.qs.map((q, i) => `
          <div class="ex-review"><div class="q-stem">${i + 1}. ${U.esc(q.stem)}</div>
            <div class="ex-opts">${q.options.map(o => { const L = String.fromCharCode(65 + q.options.indexOf(o)); const cls = 'ex-opt' + (q.userAns === o ? ' sel' : '') + (o === q.answer ? ' correct' : ''); return `<span class="${cls}">${L}. ${U.esc(o)}</span>`; }).join('')}</div>
            <div class="muted small">答案：${U.esc(q.answer)} ｜ ${U.esc(q.analysis)}</div></div>`).join('')}</div>
        <div class="row"><button class="btn btn-primary" id="pc-again">再来一套</button><button class="btn btn-ghost" id="pc-back">返回</button></div>`;
      $('#pc-again').onclick = () => { pcState.ex = null; renderPhysCourse(); };
      $('#pc-back').onclick = () => { pcState.ex = null; renderPhysCourse(); };
      return;
    }
    const q = ex.qs[ex.idx];
    let opts = q.options.map(o => { const L = String.fromCharCode(65 + q.options.indexOf(o)); const cls = 'opt' + (q.userAns === o ? ' sel' : ''); return `<button class="${cls}" data-opt="${U.esc(o)}">${L}. ${U.esc(o)}</button>`; }).join('');
    $('#pc-out').innerHTML = `
      <div class="card" style="background:var(--surface-2)">
        <div style="display:flex;justify-content:space-between;align-items:center"><h3>练习 · ${U.esc(ex.title)}（第 ${ex.idx + 1}/${ex.qs.length} 题）</h3><button class="btn btn-ghost btn-sm" id="pc-submit">交卷</button></div>
        <div class="q-stem">${U.esc(q.stem)}</div>
        <div id="pc-opts">${opts}</div>
        <div id="pc-act"></div>
      </div>`;
    $$('#pc-opts [data-opt]').forEach(b => b.onclick = () => { q.userAns = b.dataset.opt; renderPcExSession(); });
    if (q.userAns) {
      $('#pc-act').innerHTML = `<div class="muted small" style="margin:8px 0">${q.userAns === q.answer ? '✔ 回答正确' : '✘ 回答错误'} ｜ <b>答案：</b>${U.esc(q.answer)}<br>${U.esc(q.analysis)}</div>` + (ex.idx < ex.qs.length - 1 ? '<button class="btn btn-primary" id="pc-next">下一题 →</button>' : '<button class="btn btn-primary" id="pc-next">交卷</button>');
      $('#pc-next').onclick = () => { if (ex.idx < ex.qs.length - 1) { ex.idx++; renderPcExSession(); } else { ex.finished = true; renderPcExSession(); } };
    }
    $('#pc-submit').onclick = () => { ex.finished = true; renderPcExSession(); };
  }
  function buildTutHtml(grade) {
    const list = window.ZK_PHYSCOURSE.getTutorials(grade);
    return '<p class="muted">' + grade + ' 物理教程（人教版）· 共 ' + list.length + ' 套</p>' + list.map(t => `
      <div style="margin-bottom:14px"><div class="tut-head"><b>教程 ${t.no} · ${U.esc(t.title)}</b> <span class="muted">（${U.esc(t.chapter)} · ${t.duration}）</span></div>
      <div><b>学习目标：</b>${t.objectives.join('；')}</div>
      <div><b>知识大纲：</b>${t.outline.map(o => U.esc(o.h) + '：' + o.p.join('；')).join(' ｜ ')}</div>
      <div><b>关键要点：</b>${t.keyPoints.join('；')}</div></div>`).join('');
  }
  function buildExHtml(ex) {
    return '<p class="muted">' + U.esc(ex.title) + '</p>' + ex.questions.map((q, i) => `
      <div style="margin-bottom:12px"><div class="q-stem">${i + 1}. ${U.esc(q.stem)}</div>
      <div class="muted small">选项：${q.options.map(o => U.esc(o)).join(' / ')}</div>
      <div><b>答案：</b>${U.esc(q.answer)} ｜ ${U.esc(q.analysis)}</div></div>`).join('');
  }

  /* ============================================================
   * 新增板块四：初中英语单词学习记忆（词根词缀 / 联想 / 例句三法助记）
   * ========================================================== */
  let engState = { theme: '', freq: '', q: '', hide: false, showMem: true };
  function speakEn(text) {
    if (!('speechSynthesis' in window)) { U.toast('当前浏览器不支持朗读', 'warn'); return; }
    try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.9; window.speechSynthesis.speak(u); } catch (e) { /* 忽略 */ }
  }
  function renderEngWords() {
    const E = window.ZK_ENGWORDS;
    $('#app').innerHTML = `
      <div class="card">
        <h3>🔤 初中英语单词学习记忆 <span class="muted small">｜ 中考核心词汇 · 词根词缀 / 联想 / 例句三法助记</span></h3>
        <div class="section-bar">
          <select id="ew-theme"><option value="">全部主题</option>${E.THEMES.map(t => `<option>${U.esc(t)}</option>`).join('')}</select>
          <select id="ew-freq"><option value="">全部考频</option><option value="高">🔴高频</option><option value="中">🟡中频</option><option value="低">🟢低频</option></select>
          <input id="ew-q" placeholder="搜索单词 / 释义 / 记忆法…" style="flex:1;min-width:160px;padding:9px 11px;border:1px solid var(--line);border-radius:9px">
          <label class="muted small" style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="ew-hide" style="width:auto"> 隐藏释义自测</label>
          <button class="btn btn-ghost btn-sm" id="ew-toggle">隐藏记忆法</button>
          <button class="btn btn-ghost btn-sm no-print" id="ew-pdf">导出PDF</button>
        </div>
        <p class="muted small">共 <b id="ew-count">0</b> 个词。建议：先勾选「隐藏释义自测」回忆词义，再看「词根词缀 / 联想记忆 / 例句助记」三种方法加深印象；点击 🔊 可朗读单词。</p>
        <div id="ew-out"></div>
      </div>`;
    $('#ew-theme').onchange = () => { engState.theme = $('#ew-theme').value; renderEngList(); };
    $('#ew-freq').onchange = () => { engState.freq = $('#ew-freq').value; renderEngList(); };
    $('#ew-q').oninput = () => { engState.q = $('#ew-q').value; renderEngList(); };
    $('#ew-hide').onchange = () => { engState.hide = $('#ew-hide').checked; renderEngList(); };
    $('#ew-toggle').onclick = () => { engState.showMem = !engState.showMem; $('#ew-toggle').textContent = engState.showMem ? '隐藏记忆法' : '显示记忆法'; renderEngList(); };
    $('#ew-pdf').onclick = () => { const list = E.filterEng(engState); U.printDoc('初中英语单词记忆', buildEngHtml(list, engState.hide)); };
    renderEngList();
  }
  function renderEngList() {
    const list = window.ZK_ENGWORDS.filterEng(engState);
    $('#ew-count').textContent = list.length;
    if (!list.length) { $('#ew-out').innerHTML = '<p class="muted">没有匹配的单词，换个条件试试。</p>'; return; }
    $('#ew-out').innerHTML = list.map(w => `
      <div class="word-card">
        <div class="w-top">
          <div class="w-main"><span class="w-word">${U.esc(w.w)}</span><span class="w-ph">${U.esc(w.ph)}</span><span class="w-pos">${U.esc(w.pos)}</span></div>
          <div class="w-chips"><span class="chip ver">${U.esc(w.theme)}</span>${freqChip(w.freq)}<button class="btn btn-ghost btn-sm" data-spk="${U.esc(w.w)}">🔊</button></div>
        </div>
        <div class="w-zh" ${engState.hide ? 'style="display:none"' : ''}>${U.esc(w.zh)}</div>
        <div class="mem" ${engState.showMem ? '' : 'style="display:none"'}>
          <div class="mem-b"><b>🔡 词根词缀</b>：${U.esc(w.root)}</div>
          <div class="mem-b"><b>💡 联想记忆</b>：${U.esc(w.assoc)}</div>
          <div class="mem-b"><b>📖 例句助记</b>：${U.esc(w.sent)}</div>
          ${w.note ? `<div class="mem-b"><b>📌 拓展</b>：${U.esc(w.note)}</div>` : ''}
        </div>
      </div>`).join('');
    $$('#ew-out [data-spk]').forEach(b => b.onclick = () => speakEn(b.dataset.spk));
  }
  function buildEngHtml(list, hide) {
    return '<p class="muted">共 ' + list.length + ' 个词</p>' + list.map(w => `
      <div class="word-card" style="margin-bottom:12px">
        <div class="w-top"><span class="w-word">${U.esc(w.w)}</span> <span class="w-ph">${U.esc(w.ph)}</span> <span class="w-pos">${U.esc(w.pos)}</span> <span class="chip ver">${U.esc(w.theme)}</span> ${freqChip(w.freq)}</div>
        <div class="w-zh">${U.esc(w.zh)}</div>
        <div class="mem">
          <div class="mem-b"><b>词根词缀：</b>${U.esc(w.root)}</div>
          <div class="mem-b"><b>联想记忆：</b>${U.esc(w.assoc)}</div>
          <div class="mem-b"><b>例句助记：</b>${U.esc(w.sent)}</div>
          ${w.note ? `<div class="mem-b"><b>拓展：</b>${U.esc(w.note)}</div>` : ''}
        </div>
      </div>`).join('');
  }

  /* ============================================================
   * 新增板块五：初中语文文言文专项（字→词→句→篇 分层讲解）
   * ========================================================== */
  let clState = { tab: 'zi', ziSub: '通假字', ciSub: '实词', pianIdx: 0 };
  function ziIntro(s) {
    const map = {
      '通假字': '文言中两个音同/音近字通用，本字写甲、实际读乙——记牢"某通某，义为…"即可。',
      '古今异义': '同一个词，古代意思和现在差别很大，翻译时千万别套用今义。',
      '一词多义': '一个词在不同语境有不同意思，要据上下文判断。',
      '词类活用': '名词、形容词在句中临时改变词性（如名词当动词用），理解"临时"二字是关键。'
    };
    return map[s] || '';
  }
  function renderClassical() {
    const C = window.ZK_CLASSICAL;
    $('#app').innerHTML = `
      <div class="card">
        <h3>📜 初中语文文言文专项 <span class="muted small">｜ 字 → 词 → 句 → 篇，分层讲解、通俗易懂</span></h3>
        <div class="grade-tabs" id="cl-tabs">
          <button class="gtab ${clState.tab === 'zi' ? 'on' : ''}" data-tab="zi">① 字</button>
          <button class="gtab ${clState.tab === 'ci' ? 'on' : ''}" data-tab="ci">② 词</button>
          <button class="gtab ${clState.tab === 'ju' ? 'on' : ''}" data-tab="ju">③ 句</button>
          <button class="gtab ${clState.tab === 'pian' ? 'on' : ''}" data-tab="pian">④ 篇</button>
          <button class="btn btn-ghost btn-sm no-print" id="cl-pdf" style="margin-left:auto">导出PDF</button>
        </div>
        <div id="cl-out"></div>
      </div>`;
    $$('#cl-tabs [data-tab]').forEach(b => b.onclick = () => { clState.tab = b.dataset.tab; renderClassical(); });
    $('#cl-pdf').onclick = () => {
      if (clState.tab === 'zi') U.printDoc('文言文·字（' + clState.ziSub + '）', buildClZiHtml());
      else if (clState.tab === 'ci') U.printDoc('文言文·词（' + clState.ciSub + '）', buildClCiHtml());
      else if (clState.tab === 'ju') U.printDoc('文言文·句', buildClJuHtml());
      else U.printDoc('文言文·篇（' + C.PIAN[clState.pianIdx].篇 + '）', buildClPianHtml(clState.pianIdx));
    };
    if (clState.tab === 'zi') renderClZi();
    else if (clState.tab === 'ci') renderClCi();
    else if (clState.tab === 'ju') renderClJu();
    else renderClPian();
  }
  function renderClZi() {
    const Z = window.ZK_CLASSICAL.ZI;
    const subs = Object.keys(Z);
    $('#cl-out').innerHTML = `
      <div class="subtabs" id="zi-sub">${subs.map(s => `<button class="stab ${clState.ziSub === s ? 'on' : ''}" data-s="${U.esc(s)}">${U.esc(s)}</button>`).join('')}</div>
      <p class="muted small">${ziIntro(clState.ziSub)}</p>
      <div id="zi-out"></div>`;
    $$('#zi-sub [data-s]').forEach(b => b.onclick = () => { clState.ziSub = b.dataset.s; renderClZi(); });
    renderClZiList();
  }
  function renderClZiList() {
    const arr = window.ZK_CLASSICAL.ZI[clState.ziSub];
    if (clState.ziSub === '一词多义') {
      $('#zi-out').innerHTML = arr.map(x => `
        <div class="zi-card"><div class="zi-word">${U.esc(x.词)} <span class="chip mid">一词多义</span></div>
        <div class="zi-body">${x.义项.map(y => `<div class="zi-row"><span class="zi-yi">${U.esc(y.义)}</span><span class="zi-li">${U.esc(y.例)}</span></div>`).join('')}</div></div>`).join('');
      return;
    }
    if (clState.ziSub === '词类活用') {
      $('#zi-out').innerHTML = arr.map(x => `
        <div class="zi-card"><div class="zi-word">${U.esc(x.类)} <span class="muted small">${U.esc(x.说明)}</span></div>
        <div class="zi-body">${x.例.map(y => `<div class="zi-row"><span class="zi-li">${U.esc(y.句)}</span><span class="zi-yi">「${U.esc(y.词)}」${U.esc(y.释)}——${U.esc(y.译)}</span></div>`).join('')}</div></div>`).join('');
      return;
    }
    $('#zi-out').innerHTML = `<table class="zi-table"><thead><tr><th>字/词</th><th>通 / 古今</th><th>释义与例句</th></tr></thead><tbody>` +
      arr.map(x => clState.ziSub === '通假字'
        ? `<tr><td><b>${U.esc(x.字)}</b></td><td>通「${U.esc(x.通)}」</td><td>${U.esc(x.义)} ｜ ${U.esc(x.例)}</td></tr>`
        : `<tr><td><b>${U.esc(x.词)}</b></td><td>古：${U.esc(x.古)}<br>今：${U.esc(x.今)}</td><td>${U.esc(x.例)}</td></tr>`
      ).join('') + `</tbody></table>`;
  }
  function renderClCi() {
    const C = window.ZK_CLASSICAL;
    $('#cl-out').innerHTML = `
      <div class="subtabs" id="ci-sub">
        <button class="stab ${clState.ciSub === '实词' ? 'on' : ''}" data-s="实词">实词高频</button>
        <button class="stab ${clState.ciSub === '虚词' ? 'on' : ''}" data-s="虚词">虚词高频</button>
      </div>
      <p class="muted small">${clState.ciSub === '实词' ? '实词是句子的"骨架"（名、动、形、数量），多义且古今有别，重在积累。' : '虚词不单独表实义，却管"关系与语气"，是读懂文言的钥匙；下面按字列出常见用法。'}</p>
      <div id="ci-out"></div>`;
    $$('#ci-sub [data-s]').forEach(b => b.onclick = () => { clState.ciSub = b.dataset.s; renderClCi(); });
    if (clState.ciSub === '实词') {
      $('#ci-out').innerHTML = C.SHICI.map(x => `
        <div class="zi-card"><div class="zi-word">${U.esc(x.词)} <span class="chip mid">实词</span></div>
        <div class="zi-body"><div class="zi-row"><span class="zi-yi">${U.esc(x.义)}</span><span class="zi-li">${U.esc(x.例)}</span></div>${x.注 ? `<div class="muted small">📌 ${U.esc(x.注)}</div>` : ''}</div></div>`).join('');
    } else {
      $('#ci-out').innerHTML = C.XUCI.map(x => `
        <div class="zi-card"><div class="zi-word">${U.esc(x.词)} <span class="chip ver">虚词</span></div>
        <div class="zi-body">${x.义项.map(y => `<div class="zi-row"><span class="zi-yi">${U.esc(y.义)}</span><span class="zi-li">${U.esc(y.例)}</span></div>`).join('')}</div></div>`).join('');
    }
  }
  function renderClJu() {
    const C = window.ZK_CLASSICAL;
    $('#cl-out').innerHTML = C.JU.map(j => `
      <div class="zi-card">
        <div class="zi-word">${U.esc(j.型)}</div>
        <div class="muted small" style="margin:4px 0 8px">${U.esc(j.说明)}</div>
        <div class="zi-body">${j.例.map(y => `<div class="zi-row"><span class="zi-li">【文】${U.esc(y.文)}</span><span class="zi-yi">【译】${U.esc(y.译)}</span><span class="muted small">${U.esc(y.析)}</span></div>`).join('')}</div>
      </div>`).join('');
  }
  function renderClPian() {
    const C = window.ZK_CLASSICAL;
    const p = C.PIAN[clState.pianIdx];
    $('#cl-out').innerHTML = `
      <div class="subtabs" id="pian-sub" style="flex-wrap:wrap">${C.PIAN.map((x, i) => `<button class="stab ${i === clState.pianIdx ? 'on' : ''}" data-i="${i}">${U.esc(x.篇.replace(/（.*?）/g, ''))}</button>`).join('')}</div>
      <div class="pian-meta"><span class="chip ver">${U.esc(p.作者)}</span><span class="chip">${U.esc(p.体裁)}</span></div>
      <div class="pian-box">
        <div class="pian-sec"><b>📚 背景</b><p>${U.esc(p.背景)}</p></div>
        <div class="pian-sec"><b>🎯 主旨</b><p>${U.esc(p.主旨)}</p></div>
        <div class="pian-sec"><b>📖 逐句讲解</b>${p.段.map((d, i) => `
          <div class="pian-para"><div class="pian-orig">${i + 1}. ${U.esc(d.原)}</div><div class="pian-tran">译：${U.esc(d.译)}</div></div>`).join('')}</div>
        <div class="pian-sec"><b>🔑 重点词</b><div class="pian-kp">${p.重点.map(k => `<span class="chip low">${U.esc(k.词)}：${U.esc(k.释)}</span>`).join('')}</div></div>
      </div>`;
    $$('#pian-sub [data-i]').forEach(b => b.onclick = () => { clState.pianIdx = +b.dataset.i; renderClPian(); });
  }
  function buildClZiHtml() {
    const Z = window.ZK_CLASSICAL.ZI;
    if (clState.ziSub === '一词多义' || clState.ziSub === '词类活用') {
      return '<p class="muted">' + clState.ziSub + '</p>' + Z[clState.ziSub].map(x => `
        <div style="margin-bottom:10px"><b>${U.esc(x.词 || x.类)}</b>：${U.esc(x.说明 || '')}
        ${x.义项 ? x.义项.map(y => '<div>' + U.esc(y.义) + '：' + U.esc(y.例) + '</div>').join('') : ''}
        ${x.例 ? x.例.map(y => '<div>' + U.esc(y.句) + ' ［' + U.esc(y.词) + '］' + U.esc(y.释) + '：' + U.esc(y.译) + '</div>').join('') : ''}</div>`).join('');
    }
    return '<p class="muted">' + clState.ziSub + '</p>' + Z[clState.ziSub].map(x => '<div style="margin-bottom:6px">' +
      (clState.ziSub === '通假字' ? '<b>' + U.esc(x.字) + '</b> 通「' + U.esc(x.通) + '」：' + U.esc(x.义) + ' ｜ ' + U.esc(x.例)
        : '<b>' + U.esc(x.词) + '</b> 古：' + U.esc(x.古) + '；今：' + U.esc(x.今) + ' ｜ ' + U.esc(x.例)) + '</div>').join('');
  }
  function buildClCiHtml() {
    const C = window.ZK_CLASSICAL;
    if (clState.ciSub === '实词') return '<p class="muted">实词高频</p>' + C.SHICI.map(x => '<div style="margin-bottom:8px"><b>' + U.esc(x.词) + '</b>：' + U.esc(x.义) + ' ｜ ' + U.esc(x.例) + (x.注 ? ' ［' + U.esc(x.注) + '］' : '') + '</div>').join('');
    return '<p class="muted">虚词高频</p>' + C.XUCI.map(x => '<div style="margin-bottom:8px"><b>' + U.esc(x.词) + '</b>：' + x.义项.map(y => U.esc(y.义) + '（' + U.esc(y.例) + '）').join('；') + '</div>').join('');
  }
  function buildClJuHtml() {
    const C = window.ZK_CLASSICAL;
    return '<p class="muted">特殊句式</p>' + C.JU.map(j => '<div style="margin-bottom:10px"><b>' + U.esc(j.型) + '</b>：' + U.esc(j.说明) + '<br>' + j.例.map(y => '【文】' + U.esc(y.文) + ' → 【译】' + U.esc(y.译) + '（' + U.esc(y.析) + '）').join('<br>') + '</div>').join('');
  }
  function buildClPianHtml(idx) {
    const p = window.ZK_CLASSICAL.PIAN[idx];
    return '<h3>' + U.esc(p.篇) + '</h3><p class="muted">' + U.esc(p.作者) + ' · ' + U.esc(p.体裁) + '</p>' +
      '<p><b>背景：</b>' + U.esc(p.背景) + '</p><p><b>主旨：</b>' + U.esc(p.主旨) + '</p>' +
      '<p><b>逐句讲解：</b>' + p.段.map((d, i) => '<div style="margin-bottom:8px">' + (i + 1) + '. ' + U.esc(d.原) + '<br>译：' + U.esc(d.译) + '</div>').join('') + '</p>' +
      '<p><b>重点词：</b>' + p.重点.map(k => U.esc(k.词) + '：' + U.esc(k.释)).join('；') + '</p>';
  }

  document.addEventListener('DOMContentLoaded', init);
  window.ZK = Object.assign(window.ZK || {}, { go: setView });
})();
