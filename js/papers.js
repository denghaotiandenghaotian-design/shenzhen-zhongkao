/* ============================================================
 * 五年真题详解 — 本地真题（仿真）数据引擎（无 API Key）
 * 说明：受版权与政策限制，本应用不直接转载官方原题，而是按深圳中考真实
 *       试卷蓝图（题型/分值/难度梯度）确定性生成「仿真真题样卷」，结构完全
 *       对标，内容为教学示例；每题附标准答案与逐题详细解析。
 *       若需使用真实原题，可在「真题」模块通过导入 JSON 或后续接入官方数据源。
 * 复用 mockgen 的 BANKS / BLUEPRINT / VERSIONS，保证答案由代码计算、可判分。
 * generatePastPaper(subject, year) -> { meta, sections, questions }
 * ========================================================== */
(function (global) {
  'use strict';

  // 轻量确定性随机（与 mockgen 同源算法，独立实现避免耦合）
  function hashStr(s) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return (h >>> 0); }
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  const PAST_YEARS = [2021, 2022, 2023, 2024, 2025];

  function buildSection(rng, factories, name, count, score) {
    const chosen = [];
    const pool = factories.slice().sort(() => rng() - 0.5);
    for (let i = 0; i < count; i++) chosen.push(pool[i % pool.length]);
    return { name, score, questions: chosen.map((f, i) => {
      const q = f.make(rng);
      return Object.assign({ no: i + 1, section: name, pointId: f.pointId, difficulty: f.difficulty, score }, q);
    }) };
  }

  function generatePastPaper(subject, year) {
    const M = global.ZK_MOCK;
    if (!M || !M.BANKS[subject]) throw new Error('UNKNOWN_SUBJECT');
    if (!PAST_YEARS.includes(+year)) throw new Error('UNKNOWN_YEAR');
    const rng = mulberry32(hashStr(subject + '#P' + year));
    const blueprint = M.BLUEPRINT[subject];
    const sections = blueprint.map(b => {
      const key = b.name.replace(/[一二三四五、\s]/g, '');
      const matched = M.BANKS[subject].filter(f => f.section === key);
      return buildSection(rng, matched.length ? matched : M.BANKS[subject], b.name, b.count, b.score);
    });
    let total = 0, qnum = 0; const all = [];
    sections.forEach(s => { s.questions.forEach(q => { q.qno = ++qnum; total += s.score; all.push(q); }); });
    return {
      meta: { subject, year, version: M.VERSIONS[subject], totalScore: total, sectionCount: sections.length, kind: 'past', label: '仿真真题样卷（结构对标深圳中考·非官方原题）' },
      sections, questions: all
    };
  }

  global.ZK_PAPERS = { generatePastPaper, PAST_YEARS, hashStr, mulberry32 };
})(window);
