/* ============================================================
 * 本地存储层 — 所有数据持久化于 localStorage，开箱即用、无需后端。
 * 座位模式已取消：全站共用单一命名空间（不再按 ?seat=N 隔离）。
 * ========================================================== */
(function (global) {
  const KEY = 'zk_review_v1';

  const DEFAULTS = {
    points: null,        // 初始化时由 SEED 填充
    questions: null,
    recite: null,
    wrong: [],            // 错题本
    plan: null,           // 当前复习计划
    reciteLog: {},        // 背诵打卡记录 {itemId: {schedule:[], done:[], status}}
    examRecords: [],      // 模考成绩
    practiceStats: {},    // {pointId: {total, correct}}
    kpProgress: {},       // 知识点掌握进度 {pointId: 'learning'|'mastered'}
    settings: {
      examDate: '2027-06-20',
      dailyHours: 4,
      targetScore: 580,
      targetSchool: '',
      apiKey: '',
      apiBase: 'https://api.openai.com/v1/chat/completions',
      apiModel: 'gpt-4o-mini'
    }
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return initSeed(structuredClone(DEFAULTS));
      const parsed = JSON.parse(raw);
      const merged = migrate(Object.assign(structuredClone(DEFAULTS), parsed, {
        settings: Object.assign(structuredClone(DEFAULTS.settings), parsed.settings || {})
      }));
      return merged;
    } catch (e) {
      // 数据损坏：记录日志并恢复种子，避免白屏
      if (window.ZK_LOG) window.ZK_LOG.error('store.load: 解析失败，重置为种子数据', e && e.message);
      try { localStorage.removeItem(KEY); } catch (_) {}
      const fresh = initSeed(structuredClone(DEFAULTS));
      try { saveTo(fresh); } catch (_) {}
      return fresh;
    }
  }

  // 字段补全与最小校验，保证各数组字段始终存在（向后兼容旧数据）
  function migrate(s) {
    s.points = Array.isArray(s.points) ? s.points : structuredClone(global.ZK_DATA.SEED_POINTS);
    s.questions = Array.isArray(s.questions) ? s.questions : structuredClone(global.ZK_DATA.SEED_QUESTIONS);
    s.recite = Array.isArray(s.recite) ? s.recite : structuredClone(global.ZK_DATA.SEED_RECITE);
    s.wrong = Array.isArray(s.wrong) ? s.wrong : [];
    s.examRecords = Array.isArray(s.examRecords) ? s.examRecords : [];
    s.practiceStats = s.practiceStats && typeof s.practiceStats === 'object' ? s.practiceStats : {};
    s.reciteLog = s.reciteLog && typeof s.reciteLog === 'object' ? s.reciteLog : {};
    s.kpProgress = s.kpProgress && typeof s.kpProgress === 'object' ? s.kpProgress : {};
    // 设置数值边界保护
    const st = s.settings || (s.settings = {});
    st.dailyHours = clampNum(st.dailyHours, 1, 12, 4);
    st.targetScore = clampNum(st.targetScore, 0, 610, 580);
    return s;
  }
  function clampNum(v, min, max, fallback) {
    v = Number(v);
    if (!isFinite(v)) return fallback;
    return Math.min(max, Math.max(min, Math.round(v)));
  }

  function initSeed(s) {
    s.points = structuredClone(global.ZK_DATA.SEED_POINTS);
    s.questions = structuredClone(global.ZK_DATA.SEED_QUESTIONS);
    s.recite = structuredClone(global.ZK_DATA.SEED_RECITE);
    return s;
  }

  // 持久化：捕获配额溢出 / 序列化异常，避免整页崩溃
  function save() { saveTo(state); }
  function saveTo(obj) {
    try {
      localStorage.setItem(KEY, JSON.stringify(obj));
    } catch (e) {
      const isQuota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
      if (window.ZK_LOG) window.ZK_LOG.error('store.save: 写入失败', isQuota ? 'QUOTA_EXCEEDED' : (e && e.message));
      // 配额溢出时的用户提示（仅首次提示，避免刷屏）
      if (isQuota && !save._quotaWarned && window.ZK_UTIL) {
        save._quotaWarned = true;
        window.ZK_UTIL.toast('本地存储已满，部分数据可能未保存，请清理或导出备份', 'err');
      }
      throw e; // 仍向上抛出，调用方可感知
    }
  }

  const store = {
    get() { return state; },
    save,
    reset() {
      localStorage.removeItem(KEY);
      state = initSeed(structuredClone(DEFAULTS));
      save();
    },
    getSettings() { return state.settings; },
    setSettings(patch) {
      if (!patch) return;
      if (patch.dailyHours !== undefined) patch.dailyHours = clampNum(patch.dailyHours, 1, 12, state.settings.dailyHours);
      if (patch.targetScore !== undefined) patch.targetScore = clampNum(patch.targetScore, 0, 610, state.settings.targetScore);
      Object.assign(state.settings, patch);
      save();
    },

    // ---- 考点库 ----
    getPoints() { return state.points; },
    addPoint(p) { p.id = 'u' + Date.now(); state.points.push(p); save(); return p; },
    updatePoint(id, patch) { const i = state.points.findIndex(x => x.id === id); if (i >= 0) { Object.assign(state.points[i], patch); save(); } },
    deletePoint(id) { state.points = state.points.filter(x => x.id !== id); save(); },

    // ---- 题库 ----
    getQuestions() { return state.questions; },
    getQuestion(id) { return state.questions.find(q => q.id === id); },

    // ---- 错题 ----
    getWrong() { return state.wrong; },
    addWrong(w) { w.id = 'w' + Date.now(); w.createdAt = today(); state.wrong.push(w); save(); },
    updateWrong(id, patch) { const i = state.wrong.findIndex(x => x.id === id); if (i >= 0) { Object.assign(state.wrong[i], patch); save(); } },
    deleteWrong(id) { state.wrong = state.wrong.filter(x => x.id !== id); save(); },

    // ---- 复习计划 ----
    getPlan() { return state.plan; },
    setPlan(p) { state.plan = p; save(); },

    // ---- 背诵 ----
    getRecite() { return state.recite; },
    getReciteLog() { return state.reciteLog; },
    setReciteItem(id, log) { state.reciteLog[id] = log; save(); },

    // ---- 模考 ----
    addExamRecord(r) { state.examRecords.push(r); save(); },
    getExamRecords() { return state.examRecords; },

    // ---- 刷题统计 ----
    recordPractice(pointId, correct) {
      if (!pointId) return;
      const s = state.practiceStats[pointId] || { total: 0, correct: 0 };
      s.total++; if (correct) s.correct++;
      state.practiceStats[pointId] = s; save();
    },
    getPracticeStats() { return state.practiceStats; },

    // ---- 知识点掌握进度（知识体系模块）----
    getKpProgress() { return state.kpProgress; },
    setKpProgress(pointId, status) {
      if (!pointId) return;
      if (status === 'mastered' || status === 'learning') state.kpProgress[pointId] = status;
      else delete state.kpProgress[pointId];
      save();
    },

    // ---- 全量备份 / 恢复（用于跨设备/多人共享同一份数据） ----
    exportAll() { return JSON.parse(JSON.stringify(state)); },
    importAll(obj) {
      if (!obj || typeof obj !== 'object') throw new Error('INVALID_BACKUP');
      // 仅覆盖已知字段，保留 schema 完整性
      state = migrate(Object.assign(structuredClone(DEFAULTS), obj, {
        settings: Object.assign(structuredClone(DEFAULTS.settings), obj.settings || {})
      }));
      save();
    },
    // 读取日志缓冲（供设置面板排查）
    getLog() { return (window.ZK_LOG && window.ZK_LOG.dump()) || ''; }
  };

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  global.ZK_STORE = store;
  global.ZK_TODAY = today;
})(window);
