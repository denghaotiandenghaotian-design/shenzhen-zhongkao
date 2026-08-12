/* ============================================================
 * 深圳中考 AI 复习系统 — 本地模拟卷生成引擎（无 API Key）
 * 教材版本：英语=沪教版(牛津深圳版) / 语文=人教版 / 数学=北师大版 / 物理=人教版
 * 设计：seeded PRNG（mulberry32）+ 参数化题库工厂，按 (学科, 套号) 确定性生成 30 套/科。
 *       同一套号结果可复现；不同套号因工厂洗牌 + 参数随机而各异。
 * 输出：generateExam(subject, setNo) -> { meta, sections:[{name,score,questions[]}], questions[] }
 * ========================================================== */
(function (global) {
  'use strict';

  /* ---------- 确定性随机：mulberry32 + 字符串哈希 ---------- */
  function hashStr(s) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return (h >>> 0); }
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function ri(rng, min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function opts(rng, correct, wrongs) { const all = shuffle(rng, [correct, ...wrongs]); return { options: all, answer: correct }; }
  const frac = n => { const g = (a, b) => b ? g(b, a % b) : a; const d = g(Math.abs(n[0]), Math.abs(n[1])) || 1; return [n[0] / d, n[1] / d]; };

  /* ============================================================
   * 数学（北师大版）工厂
   * 每个工厂: { section, pointId, difficulty, make(rng) => {stem, options, answer, analysis, subjective?} }
   * ========================================================== */
  const MATH = [
    // —— 选择题 ——
    { section: '选择题', pointId: 'math-01', difficulty: '中', make: r => { const a = ri(r, 2, 9), b = ri(r, 1, 9); const ans = a * a + b; const o = opts(r, String(ans), [String(a * a - b), String(a * b), String(a + b)]); return { stem: `计算 (-${a})² + ${b} 的结果是（　）`, ...o, analysis: `(-${a})² = ${a * a}，再加 ${b} 得 ${ans}。` }; } },
    { section: '选择题', pointId: 'math-01', difficulty: '易', make: r => { const c = ri(r, 2, 9); const ans = c + '00000'; const o = opts(r, ans, [(c * 10) + '0000', (c) + '0000', (c) + '000000']); return { stem: `科学记数法 ${c}×10⁵ 的原数是（　）`, ...o, analysis: `${c}×10⁵ = ${ans}。` }; } },
    { section: '选择题', pointId: 'math-02', difficulty: '中', make: r => { const x0 = ri(r, 1, 6), a = ri(r, 3, 6), c = ri(r, 1, a - 1), b = ri(r, 1, 9); const d = (a - c) * x0 - b; const o = opts(r, String(x0), [String(x0 + 1), String(x0 - 2), String(2 * x0)]); return { stem: `方程 ${a}x - ${b} = ${c}x + ${d} 的解为（　）`, ...o, analysis: `移项：${a - c}x = ${b + d}，x = ${x0}。` }; } },
    { section: '选择题', pointId: 'math-06', difficulty: '中', make: r => { const k = ri(r, 2, 5), m = ri(r, 1, 9); const o = opts(r, `x < ${m / k}`, [`x > ${m / k}`, `x < ${-m / k}`, `x > ${-m / k}`]); return { stem: `不等式 ${k}x < ${m} 的解集为（　）`, ...o, analysis: `两边同除以正数 ${k}，不等号方向不变：x < ${m / k}。` }; } },
    { section: '选择题', pointId: 'math-04', difficulty: '中', make: r => { const k = pick(r, [2, -2]), b = pick(r, [3, -3]); let ans; if (k > 0 && b > 0) ans = '一、二、三象限'; else if (k > 0 && b < 0) ans = '一、二、四象限'; else if (k < 0 && b > 0) ans = '一、二、四象限'; else ans = '二、三、四象限'; const o = opts(r, ans, ['一、三、四象限', '一、二、三象限', '二、三、四象限'].filter(x => x !== ans)); return { stem: `一次函数 y = ${k}x ${b >= 0 ? '+' + b : b} 的图象经过（　）`, ...o, analysis: `k${k > 0 ? '>0 递增' : '<0 递减'}，b${b > 0 ? '>0 交 y 轴正半轴' : '<0 交 y 轴负半轴'}，过 ${ans}。` }; } },
    { section: '选择题', pointId: 'math-10', difficulty: '中', make: r => { const k = ri(r, 2, 12); let x = ri(r, 1, 6); while (k % x === 0 && x < 6) x++; const y = (k / x).toFixed(2).replace(/\.?0+$/, ''); const o = opts(r, String(y), [String((k / (x + 1)).toFixed(2)), String(k * x), String(x)]); return { stem: `反比例函数 y = ${k}/x 中，当 x = ${x} 时，y =（　）`, ...o, analysis: `y = ${k} ÷ ${x} = ${y}。` }; } },
    { section: '选择题', pointId: 'math-12', difficulty: '中', make: r => { const pair = pick(r, [['3/5', '4/5'], ['4/5', '3/5'], ['5/13', '12/13'], ['12/13', '5/13'], ['1/2', '√3/2']]); const o = opts(r, pair[1], [pair[0], '1', '0']); return { stem: `Rt△ABC 中，∠C = 90°，sinA = ${pair[0]}，则 cosA =（　）`, ...o, analysis: `由 sin²A + cos²A = 1 且 A 为锐角，得 cosA = ${pair[1]}（须熟记 30°/45°/60° 三角函数特殊值）。` }; } },
    { section: '选择题', pointId: 'math-13', difficulty: '高', make: r => { const h = ri(r, 1, 4), k = ri(r, -3, 3); const ks = k >= 0 ? '+' + k : '-' + (-k); const o = opts(r, `(${h},${k})`, [`(${-h},${k})`, `(${h},${-k})`, `(${h + 1},${k})`]); return { stem: `二次函数 y = (x - ${h})² ${ks} 的顶点坐标是（　）`, ...o, analysis: `顶点式 y = a(x - h)² + k 的顶点为 (h,k) = (${h},${k})。` }; } },
    { section: '选择题', pointId: 'math-14', difficulty: '中', make: r => { const c = ri(r, 2, 5) * 20; const o = opts(r, String(c / 2), [String(c), String(c * 2), String(c / 4)]); return { stem: `同弧所对的圆心角 ∠AOB = ${c}°，则圆周角 ∠ACB =（　）`, ...o, analysis: `圆周角是所对圆心角的一半：${c}/2 = ${c / 2}°（注意与圆心角区别）。` }; } },
    { section: '选择题', pointId: 'math-15', difficulty: '易', make: r => { const f = ri(r, 2, 4); const o = opts(r, '1/2', ['1/3', '1/6', '2/3']); return { stem: `掷一枚均匀骰子，点数为偶数的概率是（　）`, ...o, analysis: `偶数点 {2,4,6} 共 3 个，总 6 个，概率 = 3/6 = 1/2。` }; } },
    { section: '选择题', pointId: 'math-16', difficulty: '中', make: r => { const a = [3, 5, 7, 9, 11]; const o = opts(r, '7', ['5', '9', '8']); return { stem: `数据 3、5、7、9、11 的中位数是（　）`, ...o, analysis: `奇数个数据，中位数 = 排序后中间值 = 7。` }; } },
    { section: '选择题', pointId: 'math-07', difficulty: '易', make: r => { const a = ri(r, 2, 7); const o = opts(r, `(x+${a})(x-${a})`, [`(x+${a})²`, `(x-${a})²`, `(x+${a})(x+${a})`]); return { stem: `因式分解 x² - ${a * a} 的结果是（　）`, ...o, analysis: `平方差公式：x² - ${a * a} = (x + ${a})(x - ${a})。` }; } },
    // —— 填空题 ——
    { section: '填空题', pointId: 'math-03', difficulty: '中', make: r => { const T = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]; const t = pick(r, T); const o = opts(r, String(t[2]), [String(t[0]), String(t[1]), String(t[0] + t[1])]); return { stem: `Rt△ 中两直角边为 ${t[0]} 和 ${t[1]}，则斜边长为 ______。`, ...o, analysis: `勾股定理：c = √(${t[0]}² + ${t[1]}²) = ${t[2]}。` }; } },
    { section: '填空题', pointId: 'math-09', difficulty: '中', make: r => { const r1 = ri(r, 1, 6), r2 = ri(r, 1, 6); const sum = r1 + r2, prod = r1 * r2; const d = (r1 - r2) * (r1 - r2); const o = opts(r, String(d), [String(d + 4), String(sum * sum), String(prod)]); return { stem: `方程 x² - ${sum}x + ${prod} = 0 的判别式 Δ = ______。`, ...o, analysis: `Δ = b² - 4ac = ${sum}² - 4×${prod} = ${d}（≥0 有两实根）。` }; } },
    { section: '填空题', pointId: 'math-16', difficulty: '易', make: r => { const a = ri(r, 70, 90), b = ri(r, 70, 90), c = ri(r, 70, 90); const mean = ((a + b + c) / 3).toFixed(1); const o = opts(r, String(mean), [String(((a + b) / 2).toFixed(1)), String(((b + c) / 2).toFixed(1)), String(a)]); return { stem: `数据 ${a}、${b}、${c} 的平均数为 ______。`, ...o, analysis: `平均数 = (${a}+${b}+${c})÷3 = ${mean}。` }; } },
    { section: '填空题', pointId: 'math-04', difficulty: '中', make: r => { const b0 = ri(r, 1, 4), k = ri(r, 1, 4); const y2 = b0 + 2 * k; const o = opts(r, String(k), [String(k + 1), String(b0), String(2 * k)]); return { stem: `直线过点 (0,${b0}) 与 (2,${y2})，则斜率 k = ______。`, ...o, analysis: `k = (${y2} - ${b0}) ÷ (2 - 0) = ${k}。` }; } },
    { section: '填空题', pointId: 'math-12', difficulty: '中', make: r => { const ang = pick(r, [30, 45, 60]); const tan = ang === 30 ? '√3/3' : ang === 45 ? '1' : '√3'; const o = opts(r, tan, [ang === 30 ? '√3' : '√3/3', '1', '2']); return { stem: `tan ${ang}° = ______。`, ...o, analysis: `特殊角：tan ${ang}° = ${tan}（需熟记 30°/45°/60° 三角函数表）。` }; } },
    // —— 解答题（主观，提供参考答案） ——
    { section: '解答题', pointId: 'math-09', difficulty: '中', make: r => { const r1 = ri(r, 1, 5), r2 = ri(r, 1, 5); const b = -(r1 + r2), c = r1 * r2; return { stem: `解方程：x² ${b >= 0 ? '+' + b : b}x + ${c} = 0。`, options: null, answer: null, subjective: true, analysis: `因式分解：(x - ${r1})(x - ${r2}) = 0，解得 x₁ = ${r1}，x₂ = ${r2}。（也可用求根公式验证）` }; } },
    { section: '解答题', pointId: 'math-04', difficulty: '中', make: r => { const k = ri(r, 1, 3), b = ri(r, 1, 4); const y0 = b - 2 * k; return { stem: `已知一次函数图象过 A(2,${y0}) 与 B(0,${b})，求其解析式，并写出与 x 轴交点。`, options: null, answer: null, subjective: true, analysis: `设 y = kx + b，代入 B 得 b = ${b}；代入 A：${y0} = 2k + ${b} → k = ${k}，故 y = ${k}x + ${b}；令 y=0 得 x = ${-b / k}。` }; } },
    { section: '解答题', pointId: 'math-03', difficulty: '中', make: r => { const T = [[3, 4, 5], [6, 8, 10], [5, 12, 13]]; const t = pick(r, T); const h = ri(r, 2, 6); const base = t[1] + h; return { stem: `一根 ${t[2]} m 的梯子斜靠墙面，底端距墙 ${t[1]} m，若底端再外移 ${h} m，求顶端下滑多少？（提示：分两步用勾股定理）`, options: null, answer: null, subjective: true, analysis: `初态顶端高 = √(${t[2]}²-${t[1]}²) = ${t[0]} m；外移后底端距墙 ${base} m，顶端高 = √(${t[2]}²-${base}²) = ${Math.sqrt(t[2] * t[2] - base * base).toFixed(1)} m；下滑 ${ (t[0] - Math.sqrt(t[2] * t[2] - base * base)).toFixed(1) } m。` }; } },
    { section: '解答题', pointId: 'math-16', difficulty: '中', make: r => { const good = ri(r, 28, 36); const total = good + ri(r, 2, 6); const rate = (good / total * 100).toFixed(1); return { stem: `抽查某批零件 ${total} 个，合格 ${good} 个。①求合格率；②若全厂生产 1000 个，估计合格数。`, options: null, answer: null, subjective: true, analysis: `①合格率 = ${good}/${total} ≈ ${rate}%；②估计合格 ≈ 1000 × ${rate}% ≈ ${Math.round(1000 * good / total)} 个。` }; } },
    { section: '解答题', pointId: 'math-13', difficulty: '高', make: r => { const h = ri(r, 1, 3), k = ri(r, -3, 1); const max = -k; return { stem: `某商品利润 y（元）与降价 x（元）满足 y = -(x - ${h})² ${k >= 0 ? '+' + k : k}（0≤x≤${h + 1}）。求最大利润及对应降价。`, options: null, answer: null, subjective: true, analysis: `a = -1 < 0，抛物线开口向下，顶点 (${h},${k}) 处取最大值；当 x = ${h} 时，最大利润 = ${k} 元（注意结合实际范围）。` }; } }
  ];

  /* ============================================================
   * 物理（人教版）工厂
   * ========================================================== */
  const PHYS = [
    { section: '选择题', pointId: 'phy-01', difficulty: '中', make: r => { const v = ri(r, 36, 108); const s = ri(r, 2, 30); const t = (s / (v / 3.6)).toFixed(1); const o = opts(r, String(t), [String((s / v).toFixed(1)), String((v / s).toFixed(1)), String((s * 3.6 / v).toFixed(1))]); return { stem: `汽车以 ${v} km/h 匀速行驶，通过 ${s} km 路程约需（　）秒`, ...o, analysis: `先换算 v = ${v}/3.6 m/s，t = s/v = ${s}×1000÷(${v}/3.6) ≈ ${t} s。注意 km/h 与 m/s 换算（1 m/s = 3.6 km/h）。` }; } },
    { section: '选择题', pointId: 'phy-03', difficulty: '中', make: r => { const o = opts(r, '晶体有固定熔点，非晶体没有', ['晶体和非晶体都有固定熔点', '晶体没有固定熔点', '熔化过程温度都不变', '非晶体熔化时温度升高但无熔点']); return { stem: `关于晶体与非晶体，正确的是（　）`, ...o, analysis: `晶体（如冰、海波）有固定熔点；非晶体（如蜡、玻璃）没有固定熔点，熔化时温度持续升高。` }; } },
    { section: '选择题', pointId: 'phy-04', difficulty: '中', make: r => { const o = opts(r, '像与物关于镜面对称、像距等于物距', ['像比物大', '像是实像，可用光屏承接', '像距小于物距', '平面镜成倒立像']); return { stem: `关于平面镜成像，正确的是（　）`, ...o, analysis: `平面镜成等大、正立、虚像，像与物关于镜面对称，像距 = 物距。` }; } },
    { section: '选择题', pointId: 'phy-05', difficulty: '高', make: r => { const f = 10; const u = pick(r, [15, 18, 25, 30]); let ans, tip; if (u > f && u < 2 * f) { ans = '倒立、放大的实像（投影仪原理）'; tip = 'f<u<2f'; } else if (u > 2 * f) { ans = '倒立、缩小的实像（照相机原理）'; tip = 'u>2f'; } else { ans = '正立、放大的虚像（放大镜原理）'; tip = 'u<f'; } const o = opts(r, ans, ['倒立、缩小的实像', '正立、放大的虚像', '不成像']); return { stem: `凸透镜 f = ${f} cm，物距 u = ${u} cm（${tip}），成像性质为（　）`, ...o, analysis: `${tip} 时成${ans}。` }; } },
    { section: '选择题', pointId: 'phy-06', difficulty: '中', make: r => { const o = opts(r, '密度是物质特性，与质量、体积无关', ['密度随质量增大而增大', '密度随体积增大而减小', '同种物质密度一定相同', '密度与状态无关']); return { stem: `关于密度 ρ = m/V，正确的是（　）`, ...o, analysis: `密度是物质本身特性，与 m、V 无关；状态变化（如冰→水）时密度会变。` }; } },
    { section: '选择题', pointId: 'phy-08', difficulty: '中', make: r => { const o = opts(r, '相互作用力一定作用在两个不同物体上', ['平衡力作用在两个物体', '相互作用力大小可以不相等', '平衡力是同一性质的力', '相互作用力可以作用在同一物体']); return { stem: `关于二力平衡与相互作用力，错误的是（　）`, ...o, analysis: `相互作用力（作用力与反作用力）一定作用在两个不同物体上；平衡力作用在同一物体。` }; } },
    { section: '选择题', pointId: 'phy-09', difficulty: '中', make: r => { const p = ri(r, 1000, 5000); const o = opts(r, `p = ρgh，只与液体密度和深度有关`, [`p 与容器底面积有关`, `p 与液体体积有关`, `p 与液体重力有关`, `p 与深度无关`]); return { stem: `关于液体压强，正确的是（　）`, ...o, analysis: `液体压强公式 p = ρgh，只与液体密度 ρ 和深度 h 有关，与容器形状、液体重力无关。` }; } },
    { section: '选择题', pointId: 'phy-10', difficulty: '高', make: r => { const F = ri(r, 1, 8); const o = opts(r, String(F), [String(F * 2), String(F / 2), '0']); return { stem: `浸入液体中的物体排开液重 ${F} N，由阿基米德原理浮力 F浮 =（　）`, ...o, analysis: `F浮 = G排 = ${F} N。` }; } },
    { section: '选择题', pointId: 'phy-14', difficulty: '中', make: r => { const U = ri(r, 6, 24), I = ri(r, 1, 3); const R = U / I; const o = opts(r, String(R), [String(R * 2), String(R / 2), String(U * I)]); return { stem: `某段电路两端电压 ${U} V、电流 ${I} A，则电阻 R =（　）`, ...o, analysis: `欧姆定律 R = U/I = ${U}/${I} = ${R} Ω（电阻是导体本身属性，与 U、I 无关）。` }; } },
    { section: '选择题', pointId: 'phy-15', difficulty: '高', make: r => { const U = ri(r, 110, 240), I = ri(r, 1, 3); const P = U * I / 1000; const o = opts(r, P.toFixed(2) + ' kWh', [(P * 2).toFixed(2) + ' kWh', (U * I).toFixed(0) + ' kWh', (U / I).toFixed(0) + ' kWh']); return { stem: `用电器电压 ${U} V、电流 ${I} A，工作 1 h 耗电（　）`, ...o, analysis: `P = UI = ${U}×${I} = ${U * I} W = ${(U * I / 1000).toFixed(3)} kW，W = Pt = ${(U * I / 1000).toFixed(3)}×1 ≈ ${P.toFixed(2)} kWh。` }; } },
    { section: '选择题', pointId: 'phy-16', difficulty: '中', make: r => { const o = opts(r, '发电机利用电磁感应（磁生电）', ['电动机利用电磁感应', '发电机利用通电导体在磁场受力', '电磁铁利用电流磁效应', '扬声器利用电磁感应']); return { stem: `关于电与磁，正确的是（　）`, ...o, analysis: `发电 → 电磁感应（磁生电）；电动（电动机、扬声器）→ 通电导体在磁场中受力；电磁铁 → 电流的磁效应。` }; } },
    { section: '填空题', pointId: 'phy-01', difficulty: '易', make: r => { const ms = ri(r, 10, 50); const kmh = (ms * 3.6).toFixed(1); const o = opts(r, String(kmh), [String((ms / 3.6).toFixed(1)), String(ms * 3.6 * 2), String(ms)]); return { stem: `速度 10 m/s = ______ km/h（换算关系 1 m/s = 3.6 km/h）。`, ...o, analysis: `${ms} m/s × 3.6 = ${kmh} km/h。` }; } },
    { section: '填空题', pointId: 'phy-13', difficulty: '中', make: r => { const c = 4.2; const m = ri(r, 0.2, 1.0); const dt = ri(r, 10, 40); const Q = (c * Math.round(m * 10) / 10 * dt).toFixed(1); const o = opts(r, String(Q), [String((c * dt).toFixed(1)), String((m * dt).toFixed(1)), String((c * m).toFixed(1))]); return { stem: `质量为 ${m} kg 的水，温度升高 ${dt}℃，吸收热量 Q = cmΔt = ______ kJ（c水 = 4.2×10³ J/(kg·℃)）。`, ...o, analysis: `Q = 4.2×${m}×${dt} = ${Q} kJ。比热容大的物质升温慢、吸热多。` }; } },
    { section: '填空题', pointId: 'phy-12', difficulty: '中', make: r => { const F1 = ri(r, 10, 40), L1 = ri(r, 1, 5), L2 = ri(r, 1, 5); const F2 = F1 * L1 / L2; const o = opts(r, String(F2), [String(F1 * L2 / L1), String(F1 + F2), String(F1 - F2)]); return { stem: `杠杆平衡：动力 ${F1} N、动力臂 ${L1} m，阻力臂 ${L2} m，则阻力 = ______ N。`, ...o, analysis: `F1·L1 = F2·L2 → F2 = ${F1}×${L1}/${L2} = ${F2} N。` }; } },
    { section: '填空题', pointId: 'phy-11', difficulty: '中', make: r => { const F = ri(r, 20, 200), s = ri(r, 1, 10); const W = F * s; const o = opts(r, String(W), [String(W / s), String(W * 2), String(F / s)]); return { stem: `水平推力 ${F} N 使物体前进 ${s} m，推力做功 W = ______ J。`, ...o, analysis: `做功两要素：力与在力方向通过的距离。W = Fs = ${F}×${s} = ${W} J。` }; } },
    { section: '实验题', pointId: 'phy-05', difficulty: '高', make: r => { const f = 10; const u = pick(r, [15, 20, 25]); let res; if (u > f && u < 2 * f) res = '倒立放大实像'; else res = '倒立缩小实像'; return { stem: `【实验】探究凸透镜成像：固定 f=${f} cm 透镜，点燃蜡烛，调节光屏得到清晰像。当 u=${u} cm 时，记录像的性质为「${res}」。①此时物距与焦距关系？②若将蜡烛远离透镜，像应如何移动才能重新清晰？`, options: null, answer: null, subjective: true, analysis: `① u=${u} cm，因 f<u<2f（或 u>2f），成${res}；②蜡烛远离→物距增大→像距减小，应将光屏向透镜方向移动（像变小）。` }; } },
    { section: '实验题', pointId: 'phy-14', difficulty: '高', make: r => { const U = pick(r, [2.0, 2.5, 3.0]); const I = (U / ri(r, 5, 15) / 10).toFixed(2); return { stem: `【实验】伏安法测电阻：闭合开关，调节滑片使电压表读数为 ${U} V，此时电流表读数为 ${I} A。①画出实验电路（电源、开关、待测电阻、滑动变阻器、两表）；②计算 R_x。`, options: null, answer: null, subjective: true, analysis: `①电流表串联、电压表并联在被测电阻两端，滑片保护电路；②R_x = U/I = ${U}/${I} = ${(U / parseFloat(I)).toFixed(1)} Ω。` }; } },
    { section: '计算题', pointId: 'phy-10', difficulty: '高', make: r => { const rho = pick(r, [1.0, 0.8, 1.2]); const V = ri(r, 200, 1000) / 1000; const F = (rho * 10 * V).toFixed(2); return { stem: `体积为 ${V} m³ 的木块（ρ液 = ${rho}×10³ kg/m³）完全浸没后释放，求所受浮力（g 取 10 N/kg）。`, options: null, answer: null, subjective: true, analysis: `F浮 = ρ液gV排 = ${rho}×10³×10×${V} = ${F} N（完全浸没 V排 = V）。` }; } },
    { section: '计算题', pointId: 'phy-15', difficulty: '高', make: r => { const U = ri(r, 12, 24), R = ri(r, 4, 12); const P = (U * U / R).toFixed(1); const I = (U / R).toFixed(2); return { stem: `电阻 R = ${R} Ω 接在 U = ${U} V 电源上，求电流与电功率。`, options: null, answer: null, subjective: true, analysis: `I = U/R = ${U}/${R} = ${I} A；P = UI = U²/R = ${U}²/${R} = ${P} W（纯电阻 P = I²R = U²/R）。` }; } },
    { section: '计算题', pointId: 'phy-09', difficulty: '中', make: r => { const rho = pick(r, [1.0, 1.3]); const h = ri(r, 5, 20) / 10; const p = (rho * 10 * h).toFixed(2); return { stem: `容器盛有 ρ = ${rho}×10³ kg/m³ 的液体，深度 h = ${h} m，求液体内部该处压强（g=10 N/kg）。`, options: null, answer: null, subjective: true, analysis: `p = ρgh = ${rho}×10³×10×${h} = ${p} Pa，仅与密度和深度有关。` }; } }
  ];

  /* ============================================================
   * 英语（沪教版·笔试部分，听说需音频故本地仅生成笔试）工厂
   * ========================================================== */
  const EN = [
    { section: '语法词汇', pointId: 'eng-05', difficulty: '中', make: r => { const o = opts(r, 'had left', ['left', 'has left', 'leaves']); return { stem: `By the time we arrived, the train ______.`, ...o, analysis: `“by the time + 过去时”主句用过去完成时 had left（动作发生在 arrived 之前）。` }; } },
    { section: '语法词汇', pointId: 'eng-06', difficulty: '中', make: r => { const o = opts(r, 'written', ['wrote', 'writing', 'writes']); return { stem: `The book ______ (write) by Lu Xun is very famous.`, ...o, analysis: `过去分词 written 作后置定语，表被动（被鲁迅所写）。` }; } },
    { section: '语法词汇', pointId: 'eng-07', difficulty: '中', make: r => { const o = opts(r, 'which', ['who', 'what', 'whom']); return { stem: `I like the book ______ you lent me yesterday.`, ...o, analysis: `定语从句，先行词 book 指物，用 which/that 引导。` }; } },
    { section: '语法词汇', pointId: 'eng-04', difficulty: '易', make: r => { const o = opts(r, 'environment', ['environmently', 'environmental', 'environments']); return { stem: `We should try our best to protect the ______.`, ...o, analysis: `protect 后接名词 environment（环境）；environmental 为形容词。` }; } },
    { section: '语法词汇', pointId: 'eng-05', difficulty: '中', make: r => { const o = opts(r, 'has lived', ['lived', 'lives', 'was living']); return { stem: `He ______ in Shenzhen since 2015.`, ...o, analysis: `since + 过去时间点，主句用现在完成时 has lived。` }; } },
    { section: '语法词汇', pointId: 'eng-10', difficulty: '中', make: r => { const o = opts(r, 'careful', ['care', 'carefully', 'caring']); return { stem: `He is a ______ boy and seldom makes mistakes.`, ...o, analysis: `修饰名词 boy 用形容词 careful（细心的）。` }; } },
    { section: '语法词汇', pointId: 'eng-05', difficulty: '中', make: r => { const o = opts(r, 'will go', ['goes', 'went', 'has gone']); return { stem: `If it is sunny tomorrow, we ______ for a picnic.`, ...o, analysis: `if 条件状语从句“主将从现”：主句用一般将来时 will go。` }; } },
    { section: '语法词汇', pointId: 'eng-04', difficulty: '易', make: r => { const o = opts(r, 'to learn', ['learn', 'learning', 'learned']); return { stem: `It is important ______ English well.`, ...o, analysis: `It is + adj. + to do 为固定句型，用不定式 to learn。` }; } },
    { section: '语法词汇', pointId: 'eng-07', difficulty: '中', make: r => { const o = opts(r, 'that', ['what', 'which', 'who']); return { stem: `I believe ______ he will come on time.`, ...o, analysis: `宾语从句that 引导陈述句，that 可省略，用陈述语序。` }; } },
    { section: '语法词汇', pointId: 'eng-13', difficulty: '中', make: r => { const o = opts(r, 'look forward to hearing', ['look forward to hear', 'look forward hearing', 'looking forward hear']); return { stem: `We are ______ from you soon.`, ...o, analysis: `look forward to + doing（to 为介词），故用 hearing。` }; } },
    { section: '完形填空', pointId: 'eng-08', difficulty: '中', make: r => { const idx = ri(r, 0, 2); const blanks = [
      { stem: `It was a cold winter morning. Tom got up early __1__ he wanted to catch the first bus. 1. A. because  B. but  C. so  D. or`, answer: 'A. because', analysis: '前后为因果关系（早起是因为想赶首班车），选 because。' },
      { stem: `My mother asked me to buy some milk. I went to the shop __1__ it was closed. 1. A. and  B. but  C. so  D. if`, answer: 'B. but', analysis: '想去买奶但店关门，转折关系，选 but。' },
      { stem: `__1__ you work hard, you will make progress. 1. A. If  B. Although  C. Unless  D. Because`, answer: 'A. If', analysis: '条件关系“如果努力就会进步”，选 If。' }
    ]; const b = blanks[idx]; const o = opts(r, b.answer, b.answer.split('  ')[0] === 'A' ? ['B. but', 'C. so', 'D. or'] : ['A. because', 'C. so', 'D. or']); return { stem: `【完形】${b.stem}`, ...o, analysis: b.analysis }; } },
    { section: '阅读理解', pointId: 'eng-09', difficulty: '中', make: r => { const idx = ri(r, 0, 2); const pas = [
      { stem: `【阅读】Tom is a student in Shenzhen. He gets up at 6:30, reads English for 20 minutes, then goes to school by bike. He likes science best. Q: How does Tom go to school? A. By bus  B. By bike  C. On foot  D. By subway`, answer: 'B. By bike', analysis: '原文 “goes to school by bike”，细节题不离原文。' },
      { stem: `【阅读】A survey shows 70% of students do sports every day, but only 30% read books regularly. Q: What can we infer? A. Most students exercise daily  B. Few like sports  C. All read books  D. Nobody exercises`, answer: 'A. Most students exercise daily', analysis: '70% do sports every day → 多数学生每天锻炼，推断须基于文本。' },
      { stem: `【阅读】Save water! Turn off the tap when brushing teeth. A small action helps the earth. Q: What is the writer’s purpose? A. To sell taps  B. To ask people to save water  C. To teach brushing  D. To praise earth`, answer: 'B. To ask people to save water', analysis: '主旨/意图题：呼吁节约用水。' }
    ]; const p = pas[idx]; const o = opts(r, p.answer, p.answer.split('  ')[0] === 'A' ? ['B. By bike', 'C. On foot', 'D. By subway'] : ['A. By bus', 'C. On foot', 'D. By subway']); return { stem: p.stem, ...o, analysis: p.analysis }; } },
    { section: '语法填空', pointId: 'eng-10', difficulty: '中', make: r => { const pairs = [['The ______ (child) are playing in the park.', 'children'], ['He ______ (finish) his homework already.', 'has finished'], ['It is a ______ (use) book for us.', 'useful'], ['She sings ______ (beautiful).', 'beautifully'], ['There ______ (be) some milk in the cup.', 'is']]; const p = pick(r, pairs); const o = opts(r, p[1], [p[1] + 's', p[1].slice(0, -1), p[1] + 'ly']); return { stem: `【语法填空】${p[0]}`, ...o, analysis: `考查词形变换：${p[0].includes('child') ? 'child 复数 children' : p[0].includes('already') ? 'already 用现在完成时 has finished' : p[0].includes('useful') ? '名词前用形容词 useful' : p[0].includes('sings') ? '修饰动词用副词 beautifully' : 'milk 不可数，be 用 is'}。答案：${p[1]}。` }; } },
    { section: '书面表达', pointId: 'eng-11', difficulty: '高', make: r => { const t = pick(r, ['My School Life', 'How to Keep Healthy', 'A Meaningful Trip', 'My Dream Job', 'Environmental Protection']); const req = { 'My School Life': '介绍学校生活（课程、活动、感受），60–80 词。', 'How to Keep Healthy': '给出 2–3 条健康建议，条理清晰。', 'A Meaningful Trip': '记叙一次旅行（时间、地点、收获）。', 'My Dream Job': '说明理想职业及原因。', 'Environmental Protection': '提出环保倡议，使用 First/Second/Third 连接。' }; return { stem: `【书面表达】题目：${t}\n要求：${req[t]} 要点齐全，使用连接词，避免语法错误。`, options: null, answer: null, subjective: true, analysis: `评分要点：①覆盖全部要点；②时态/人称一致、无明显语法错误；③至少 2 个连接词（and / but / first / because）；④适当使用高级表达（如 not only…but also）。按深圳中考书面表达 15–20 分档自评。` }; } }
  ];

  /* ============================================================
   * 语文（人教版）工厂
   * ========================================================== */
  const CHI = [
    { section: '古诗文默写', pointId: 'chi-01', difficulty: '易', make: r => { const items = [['《岳阳楼记》中表达旷达胸襟的句子', '不以物喜，不以己悲'], ['《饮酒》中体现悠然闲适的诗句', '采菊东篱下，悠然见南山'], ['《行路难》中表达壮志豪情的句子', '长风破浪会有时，直挂云帆济沧海'], ['《水调歌头》中表达对亲人美好祝愿', '但愿人长久，千里共婵娟'], ['《酬乐天扬州初逢席上见赠》蕴含新事物代替旧事物', '沉舟侧畔千帆过，病树前头万木春']]; const it = pick(r, items); return { stem: `默写：${it[0]}：______，______。`, options: null, answer: it[1], subjective: true, analysis: `答案示例：${it[1]}。注意形近/同音字（己/已、燕/雁、沧/苍）。` }; } },
    { section: '古诗文默写', pointId: 'chi-01', difficulty: '易', make: r => { const items = [['《出师表》中诸葛亮表明心志', '苟全性命于乱世，不求闻达于诸侯'], ['《桃花源记》描写桃源美景', '芳草鲜美，落英缤纷'], ['《醉翁亭记》点明主旨', '醉翁之意不在酒，在乎山水之间也'], ['《过零丁洋》中以死明志', '人生自古谁无死，留取丹心照汗青']]; const it = pick(r, items); return { stem: `默写：${it[0]}：______，______。`, options: null, answer: it[1], subjective: true, analysis: `答案示例：${it[1]}。默写须准确无误，注意易错字。` }; } },
    { section: '基础选择题', pointId: 'chi-10', difficulty: '中', make: r => { const o = opts(r, '我们要认真发现并随时克服自己的缺点', ['通过努力，使我取得了进步', '他基本上彻底完成了任务', '在会上，他积极地发言和讨论', '我们要认真发现并随时克服自己的缺点']); return { stem: `下列句子没有语病的一项是（　）`, ...o, analysis: `A 缺主语（删“通过”或“使”）；B “基本”与“彻底”矛盾；C “发言和讨论”搭配不当（可“发言并参与讨论”）；D 正确（先发现后克服，语序合理）。` }; } },
    { section: '基础选择题', pointId: 'chi-11', difficulty: '中', make: r => { const o = opts(r, '他处事果断，从不犹豫', ['他处心积虑地为班级着想', '这篇文章文不加点，令人费解', '大家津津乐道地谈论着', '他的演讲栩栩如生，打动人心']); return { stem: `下列加点成语使用恰当的一项是（　）`, ...o, analysis: `A 处心积虑（贬义）误用；B 文不加点（形容写作快，非“无标点”）；C 津津乐道后不接“地谈论”；D 栩栩如生形容艺术形象逼真，此处可用以赞演讲生动。选 D。` }; } },
    { section: '基础选择题', pointId: 'chi-02', difficulty: '中', make: r => { const o = opts(r, '率妻子邑人来此绝境（妻子：妻与子女）', ['走送之（走：行走）', '汤熨之所及（汤：菜汤）', '去国怀乡（去：到……去）', '率妻子邑人来此绝境（妻子：妻与子女）']); return { stem: `下列加点词古今义不同的一项是（　）`, ...o, analysis: `“妻子”古义为妻与子，今仅指配偶；其余：走=跑，汤=热水，去=离开（均为文言本义）。` }; } },
    { section: '文言文阅读', pointId: 'chi-03', difficulty: '中', make: r => { const o = opts(r, '留、删、补、调、换', ['圈、点、勾、画、批', '读、背、写、译、默', '查、抄、问、记、用', '看、想、说、练、测']); return { stem: `文言文翻译“五字法”指（　）`, ...o, analysis: `文言翻译基本方法：留（保留专名）、删（删无义虚词）、补（补省略）、调（调语序）、换（换今语）。` }; } },
    { section: '文言文阅读', pointId: 'chi-14', difficulty: '中', make: r => { const o = opts(r, '应先分别读懂两文，再找共同主题或手法', ['只读一篇即可作答', '两文无需比较直接各译', '比较阅读只看字词', '先定答案再找依据']); return { stem: `文言文对比阅读的关键步骤是（　）`, ...o, analysis: `对比阅读须先分别理解两文，再整合信息、比较异同（主题/写法/人物），不能脱离文本主观臆断。` }; } },
    { section: '现代文阅读', pointId: 'chi-04', difficulty: '中', make: r => { const o = opts(r, '内容上的作用 + 结构上的作用', ['只答情感', '只答修辞手法', '只答词语含义', '内容上的作用 + 结构上的作用']); return { stem: `记叙文“某段作用”题应从哪两方面作答（　）`, ...o, analysis: `作用题须从内容（人物/情感/主旨）与结构（铺垫/照应/过渡）两个维度作答，避免只答一点。` }; } },
    { section: '现代文阅读', pointId: 'chi-05', difficulty: '中', make: r => { const o = opts(r, '举例子：使说明更具体可信', ['举例子：增强文学性', '列数字：使说明更具体可信', '打比方：使说明更准确', '作比较：使说明更生动']); return { stem: `说明文“列数字”的作用通常是（　）`, ...o, analysis: `列数字用具体数据使说明准确、科学、有说服力；打比方才使说明生动形象。` }; } },
    { section: '作文', pointId: 'chi-08', difficulty: '高', make: r => { const t = pick(r, ['那一刻，我长大了', '身边的光', '与你同行', '跨越', '心有所信']); const tips = { '那一刻，我长大了': '写亲身经历的具体事件，突出“那一刻”的触动与成长感悟，首尾点题。', '身边的光': '以某人或某物为“光”，用细节描写其对自己的影响。', '与你同行': '“你”可指人/书/信念，写出陪伴与共同成长。', '跨越': '写克服困难的经历，点明“跨越”后的收获。', '心有所信': '结合理想或信念，议论与叙事结合。' }; return { stem: `【作文】题目：《${t}》\n要求：① 立意明确、健康；② 文体自选（诗歌除外）；③ 不少于 600 字；④ 文中不得出现真实校名人名。`, options: null, answer: null, subjective: true, analysis: `评分要点：①审题准确、不跑题；②立意深刻（由事及理）；③结构完整（开头点题—中间详写—结尾升华）；④语言流畅、有描写。参考：${tips[t]}` }; } }
  ];

  const BANKS = { '数学': MATH, '物理': PHYS, '英语': EN, '语文': CHI };

  /* 各科试卷蓝图（对标深圳中考分值结构，难度梯度 易:中:难≈7:2:1） */
  const BLUEPRINT = {
    '数学': [
      { name: '一、选择题', count: 8, score: 3 },
      { name: '二、填空题', count: 4, score: 3 },
      { name: '三、解答题', count: 4, score: 16 }
    ],
    '物理': [
      { name: '一、选择题', count: 8, score: 2 },
      { name: '二、填空题', count: 4, score: 3 },
      { name: '三、实验题', count: 2, score: 8 },
      { name: '四、计算题', count: 2, score: 13 }
    ],
    '英语': [
      { name: '一、语法词汇', count: 10, score: 2 },
      { name: '二、完形填空', count: 1, score: 10 },
      { name: '三、阅读理解', count: 1, score: 15 },
      { name: '四、语法填空', count: 1, score: 10 },
      { name: '五、书面表达', count: 1, score: 20 }
    ],
    '语文': [
      { name: '一、古诗文默写', count: 2, score: 5 },
      { name: '二、基础选择题', count: 3, score: 4 },
      { name: '三、文言文阅读', count: 2, score: 10 },
      { name: '四、现代文阅读', count: 2, score: 14 },
      { name: '五、作文', count: 1, score: 50 }
    ]
  };

  const VERSIONS = { '英语': '沪教版(牛津深圳版)', '语文': '人教版', '数学': '北师大版', '物理': '人教版' };
  const SETS_PER_SUBJECT = 30;

  function buildSection(rng, factories, name, count, score) {
    const chosen = [];
    const pool = shuffle(rng, factories);
    for (let i = 0; i < count; i++) chosen.push(pool[i % pool.length]);
    return { name, score, questions: chosen.map((f, i) => {
      const q = f.make(rng);
      return Object.assign({ no: i + 1, section: name, pointId: f.pointId, difficulty: f.difficulty, score }, q);
    }) };
  }

  function generateExam(subject, setNo) {
    if (!BANKS[subject]) throw new Error('UNKNOWN_SUBJECT');
    setNo = Math.max(1, Math.min(SETS_PER_SUBJECT, Math.floor(setNo) || 1));
    const rng = mulberry32(hashStr(subject + '#' + setNo));
    const blueprint = BLUEPRINT[subject];
    const sections = blueprint.map(b => {
      const key = b.name.replace(/[一二三四五、\s]/g, '');
      const matched = BANKS[subject].filter(f => f.section === key);
      return buildSection(rng, matched.length ? matched : BANKS[subject], b.name, b.count, b.score);
    });
    let total = 0, qnum = 0;
    const all = [];
    sections.forEach(s => { s.questions.forEach(q => { q.qno = ++qnum; total += s.score; all.push(q); }); });
    return {
      meta: { subject, setNo, version: VERSIONS[subject], totalScore: total, sectionCount: sections.length, generatedAt: 'local#' + setNo },
      sections, questions: all
    };
  }

  global.ZK_MOCK = { generateExam, BLUEPRINT, VERSIONS, SETS_PER_SUBJECT, BANKS };
})(window);
