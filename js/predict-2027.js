/* ============================================================
 * 新增板块：2027年考试预测（深圳中考）
 * 说明：本文件内容为基于公开报道、各地教研趋势与课标方向的
 *       “预测性学习参考”，并非官方命题或泄题，仅用于提示复习重点。
 *       具体请以深圳市招生考试部门公布的当年政策与考纲为准。
 * ========================================================== */
window.ZK_PREDICT2027 = (function () {
  const META = {
    year: 2027,
    city: '深圳',
    total: 630,
    disclaimer: '本板块为基于公开信息整合的预测性学习参考，非官方命题或泄题，旨在提示复习方向；最终请以深圳市招考部门当年公布的政策与考纲为准。',
    score: [
      { k: '语文', v: 120 }, { k: '数学', v: 100 }, { k: '英语', v: 100 },
      { k: '物理+化学（合卷）', v: 140, note: '含实验操作 20 分' },
      { k: '历史', v: 70 }, { k: '道德与法治（开卷）', v: 50 }, { k: '体育与健康', v: 50 }
    ],
    trends: [
      '命题情境化、项目化成为常态：题干多取自生活、科技、社会真实场景。',
      '跨学科融合趋势明显：数学/物理/道法常与科学、历史、社会议题结合。',
      '理科实验探究分值提升，强调实验设计、数据分析与异常探究。',
      '语文强化非连续性文本、阅读量与思辨表达，弱化机械默写与套路作文。',
      '英语提升语言实际运用（听说情境化、读写综合、反模板化写作）。',
      '道德与法治多地区转开卷，考查材料分析、价值判断与知识整合。',
      'AI 智能阅卷推广，书写工整、卷面清晰直接影响得分。'
    ]
  };

  /* ---------- 维度一：知识点预测 ---------- */
  const KNOWLEDGE = [
    { subject: '语文', level: '核心', point: '非连续性文本阅读（图表/新闻/说明书信息整合）', basis: '多地区 2026 真题已明显加强，2027 趋于常态', advice: '练“读图+读文”双线提取：先看标题、图例、单位，再圈关键句，最后整合结论。' },
    { subject: '语文', level: '核心', point: '古诗文情境化运用（不再划范围机械默写）', basis: '2027 语文改革信号：课内篇目全纳入，重情境运用', advice: '按“主题+情感”归类名句，练“给情境→选诗句”“课内外对比”两类题。' },
    { subject: '语文', level: '新增强化', point: '整本书阅读与名著深层评析', basis: '向高考阅读量、思辨要求靠拢', advice: '梳理《西游记》《水浒传》《红星照耀中国》等人物线与主题，能结合原文评析。' },
    { subject: '语文', level: '核心', point: '作文反模板、强化思辨与个性化表达', basis: '多地明确“套模板低分、鼓励个性化解读”', advice: '积累“小切口+真体验”素材，练列提纲：立意—结构—金句，避免套话。' },
    { subject: '数学', level: '核心', point: '情境化建模题（实际问题→数学模型）', basis: '广东 2027 数学趋势：关注数学与实际生活联系', advice: '见到“方案/成本/概率/统计”类题，先抽象变量、再列式、最后检验合理性。' },
    { subject: '数学', level: '新增强化', point: '新定义题型常态化', basis: '多地教研会 2027 风向：现场定义新概念考查即时学习', advice: '读定义—举特例—归纳规律—代值验证，不慌、按步给分。' },
    { subject: '数学', level: '核心', point: '几何综合（辅助线、弱化套路）', basis: '多地命题：几何思路更灵活、弱化套路化解法', advice: '熟记“中点、角分线、弦心距”三类常用辅助线，多画多试。' },
    { subject: '数学', level: '新增强化', point: '跨学科融合（与物/化/生结合）', basis: '广东命题趋势：跨学科综合题可能出现', advice: '遇到“密度/温度/生物量”等词，先识别它对应哪个数学量（质量、比例、函数）。' },
    { subject: '英语', level: '新增强化', point: '读写综合（任务型匹配 + 开放问答）', basis: '广州 2027 英语改革：新增 20 分读写综合，取代完形', advice: '任务型匹配看关键词对应；开放问答用“观点+理由+例子”三句式作答。' },
    { subject: '英语', level: '核心', point: '听说情境化、真实语用', basis: '多地提升听说分值占比，材料贴近真实生活', advice: '每日 10 分钟跟读+情景问答，练“听后回答”的完整句子输出。' },
    { subject: '英语', level: '核心', point: '阅读学术化与长难句理解', basis: '阅读 CD 篇学术化趋势明显', advice: '长难句拆“主谓宾”，遇生词猜词义不卡壳，重点抓段落主旨句。' },
    { subject: '物理', level: '新增强化', point: '实验探究占比提升（约 30%–40%，含设计实验方案）', basis: '多地 2027 物理：实验探究题型占比上升', advice: '掌握“目的—原理—步骤—记录—结论—误差”六步法，能补全实验设计。' },
    { subject: '物理', level: '核心', point: '情境化解决实际问题（生活/科技素材）', basis: '深圳/广州命题素材多源自教材与生活场景', advice: '把“人造太阳、育苗棚监测、交通限速”等转化为受力/能量/电路模型。' },
    { subject: '物理', level: '核心', point: '跨学科融合（物理+化学/生物）', basis: '多地：物理与化学、生物融合出题成为常态', advice: '记住“密度/浮力/压强”常配“产气/沉淀/温度变化”出现。' },
    { subject: '道法', level: '核心', point: '开卷结合时政热点、材料分析与价值判断', basis: '深圳道德与法治改为开卷笔试', advice: '开卷≠抄书，练“提炼中心论点+分点论证+联系教材观点”。' },
    { subject: '道法', level: '核心', point: '法治意识、责任担当与集体（课标核心素养）', basis: '核心素养立意，弱化死记硬背', advice: '用“是什么—为什么—怎么做”框架组织作答，结合青少年生活实例。' }
  ];

  /* ---------- 维度二：热点考点预测 ---------- */
  const HOTSPOTS = [
    { theme: '科技强国与人工智能', background: 'AI、芯片、航天（神舟/空间站）、大科学装置频现新闻。', kd: '物理（力电磁综合）、语文（科普类非连文本）、道法（创新驱动发展）。' },
    { theme: '绿色低碳与生态文明', background: '碳中和、垃圾分类、新能源成为长期议题。', kd: '物理（能量转化）、道法（绿色发展理念）、语文（生态类非连文本）。' },
    { theme: '中华优秀传统文化', background: '非遗、节气、文博热持续升温。', kd: '语文（古诗文情境运用、文化探讨）、道法（文化自信）。' },
    { theme: '粤港澳大湾区建设', background: '深圳先行示范区、湾区互联互通加速。', kd: '道法（国情与改革开放）、语文（本土情境写作）、数学（统计图表）。' },
    { theme: '健康中国与体质健康', background: '体质监测、心理健康受重视，体育分值提升。', kd: '道法（生命与健康）、语文（人物/成长类阅读）。' },
    { theme: '法治与安全', background: '反诈、网络安全、未成年人保护相关案例增多。', kd: '道法（法治意识、自我保护）、语文（议论文素材）。' },
    { theme: '劳动教育与工匠精神', background: '劳动教育纳入必修课，工匠精神被反复倡导。', kd: '道法（责任与奉献）、语文（人物通讯/说明文）。' },
    { theme: '乡村振兴与美好生活', background: '乡村发展、城乡融合是长期主题。', kd: '道法（共享发展）、语文（乡土题材阅读与写作）。' },
    { theme: '跨学科实践与项目式学习', background: '科学探究、项目式学习进入日常教学评价。', kd: '物理（实验探究）、数学（建模）、道法（公共参与）。' },
    { theme: '国际视野与文明交流', background: '人类命运共同体、文明互鉴频繁出现在教材与新闻。', kd: '道法（世界眼光）、英语（文化对比类阅读）。' }
  ];

  /* ---------- 维度三：可能的题目预测 ---------- */
  const QTYPES = [
    { type: '情境化建模题（数学）', desc: '给生活/科技情境，要求建立数学模型求解。', ex: '如“设计节能方案，计算成本与收益并评估可行性”。', sub: '数学' },
    { type: '新定义题型（数学）', desc: '现场给出新概念或新运算，考查即时学习与迁移。', ex: '如定义“友好数对”，判断并求解。', sub: '数学' },
    { type: '跨学科融合题（数学/物理）', desc: '结合物理、化学、生物、地理知识综合考查。', ex: '如用密度/浮力解释“产气使物体上浮”的现象。', sub: '物理' },
    { type: '非连续性文本（语文）', desc: '图表+新闻+说明文组合，考查信息提取与整合。', ex: '如给出“深圳某民生数据”图表，要求概括结论。', sub: '语文' },
    { type: '实验设计与探究开放题（物理）', desc: '要求补充实验步骤、分析异常、得出开放性结论。', ex: '如“测未知液体密度，给定器材，设计步骤并评估误差”。', sub: '物理' },
    { type: '读写综合（英语）', desc: '任务型信息匹配 + 开放式问答题。', ex: '如读一封活动邮件，先匹配信息，再写 2–3 句参与理由。', sub: '英语' },
    { type: '古诗文情境运用（语文）', desc: '给生活情境，要求引用合适诗句或做课内外对比。', ex: '如“朋友陷入困境”，用哪句诗鼓励他？', sub: '语文' },
    { type: '材料分析开放题（道法）', desc: '结合时政热点，要求提炼观点并分点论证。', ex: '如结合“反诈案例”谈青少年如何自我保护。', sub: '道法' },
    { type: '几何综合（数学）', desc: '融合相似、全等、圆的多知识点大题。', ex: '如“圆中双切线+弦，证线段关系并求长度”。', sub: '数学' },
    { type: '听说情景反应（英语）', desc: '真实交际场景中的听后回答与角色扮演。', ex: '如听一段问路对话，口头给出正确路线。', sub: '英语' }
  ];

  /* ---------- 维度四：3 套预测模拟试题 ---------- */
  // 统一题型：choice 含 options+answer(字母)；非 choice 用 answer 为参考答案，analysis 为解析
  const EXAMS = [
    {
      id: 'p2027-1', setNo: 1, title: '2027 深圳中考预测模拟卷（一）',
      coverage: '语文6 · 数学6 · 英语5 · 物理5 · 道法2',
      sections: [
        { name: '语文', qs: [
          { no: 1, subject: '语文', type: '情境默写', stem: '毕业在即，你想鼓励屡遭挫折却不肯放弃的同学，下列诗句中最贴切的是（ ）', options: ['A. 采菊东篱下，悠然见南山', 'B. 山重水复疑无路，柳暗花明又一村', 'C. 会当凌绝顶，一览众山小', 'D. 海内存知己，天涯若比邻'], answer: 'B', analysis: '“山重水复疑无路，柳暗花明又一村”比喻困境中突现转机，最契合“屡遭挫折却不放弃”的鼓励语境。', point: '古诗文情境运用' },
          { no: 2, subject: '语文', type: '非连续性文本', stem: '阅读“某社区垃圾分类实施前后数据”图表（回收率由 32% 升至 78%），下列结论最合理的是（ ）', options: ['A. 宣传无效', 'B. 回收率显著提高，措施有效', 'C. 居民参与度下降', 'D. 无法判断'], answer: 'B', analysis: '图表显示回收率大幅提升，可直接得出“措施有效”的因果结论；其余选项与数据矛盾。', point: '非连续性文本信息整合' },
          { no: 3, subject: '语文', type: '文言文对比', stem: '《陋室铭》“何陋之有”中“之”的用法，与下列哪项相同（ ）', options: ['A. 水陆草木之花', 'B. 予独爱莲之出淤泥而不染', 'C. 宾语前置标志，无实义', 'D. 送孟浩然之广陵'], answer: 'C', analysis: '“何陋之有”为宾语前置，“之”是提宾标志；A、B 为结构助词“的/取消句子独立性”，D 为动词“到”。', point: '文言文虚词' },
          { no: 4, subject: '语文', type: '现代文阅读', stem: '下列对写人叙事类文本“细节描写”作用的理解，正确的是（ ）', options: ['A. 仅为凑字数', 'B. 使人物更鲜活、情感更真实', 'C. 可有可无', 'D. 只用于景物'], answer: 'B', analysis: '细节描写通过具体动作、神态、语言刻画人物，增强真实感与感染力，是写人叙事的重要手法。', point: '文学鉴赏' },
          { no: 5, subject: '语文', type: '名著阅读', stem: '《西游记》中“三调芭蕉扇”集中体现了孙悟空的（ ）', options: ['A. 怯懦', 'B. 机智与不屈', 'C. 冷漠', 'D. 鲁莽'], answer: 'B', analysis: '三次借扇过程展现孙悟空遇挫愈勇、随机应变的智慧与斗争精神。', point: '整本书阅读' },
          { no: 6, subject: '语文', type: '作文预测', stem: '材料作文：AI 能写作、能绘画，有人说“学习无用”，也有人说“更要会思考”。请以“AI 时代，我们为什么还要学习”为题写一段 80 字左右的立意提纲。', options: null, answer: '【参考提纲】① 立意：AI 替代重复劳动，但提出好问题、判断真伪、人文关怀仍靠人。② 结构：现象引入—辨析“学习无用”误区—论述学习培养思维与价值观—号召做 AI 的主人。③ 金句：工具越强，越需要会思考的大脑。', analysis: '评分看“是否破误区、是否有思辨、是否联系自身”；避免空喊口号，要落到“思维力/价值观”等 AI 难替代之处。', point: '作文反模板与思辨' }
        ]},
        { name: '数学', qs: [
          { no: 7, subject: '数学', type: '选择', stem: '深圳某年常住人口约 1.76×10⁷ 人，这个数值的原数是（ ）', options: ['A. 176000', 'B. 1760000', 'C. 17600000', 'D. 176000000'], answer: 'C', analysis: '1.76×10⁷ = 1.76 × 10000000 = 17600000（一千七百六十万）。', point: '科学记数法' },
          { no: 8, subject: '数学', type: '选择', stem: '如图，⊙O 中弦 AB 垂直半径 OC 于 D，若 AB=8，OD=3，则⊙O 半径 r 为（ ）', options: ['A. 4', 'B. 5', 'C. 6', 'D. 7'], answer: 'B', analysis: '垂径定理：AD=4；Rt△AOD 中 r²=AD²+OD²=16+9=25，r=5。', point: '圆的垂径定理' },
          { no: 9, subject: '数学', type: '填空', stem: '一次函数 y=kx+b 过 (1,3)、(2,5)，则 k=____，b=____。', options: null, answer: 'k=2，b=1', analysis: '由两点得 k=(5-3)/(2-1)=2，代入 (1,3)：3=2×1+b ⇒ b=1。', point: '一次函数' },
          { no: 10, subject: '数学', type: '解答·统计', stem: '调查 200 名学生喜爱的运动，篮球 80 人、足球 50 人、跑步 40 人、其他 30 人。(1) 求篮球所占圆心角度数；(2) 若全校 1200 人，估计喜爱足球人数。', options: null, answer: '(1) 80/200×360°=144°；(2) 50/200×1200=300 人。', analysis: '扇形圆心角=频数/总数×360°；用样本频率估计总体：1200×(50/200)=300。', point: '统计与概率·样本估计' },
          { no: 11, subject: '数学', type: '解答·几何综合', stem: '已知 △ABC 中 AB=AC，D、E 分别为 AB、AC 中点，连接 DE。求证：DE∥BC 且 DE=½BC。', options: null, answer: '证：D、E 为中点 ⇒ DE 为△ABC 中位线；由中位线定理得 DE∥BC 且 DE=½BC。', analysis: '识别“中点+中点”即中位线模型，直接套用中位线定理即可，注意书写“∵…∴…”。', point: '三角形中位线' },
          { no: 12, subject: '数学', type: '解答·建模', stem: '某快递点用 A、B 两种包装，A 每个成本 2 元可装 3 件，B 每个 3 元可装 5 件。现需装不少于 60 件且包装总数不超过 16 个，怎样搭配成本最低？', options: null, answer: '设 A x 个、B y 个，约束 3x+5y≥60、x+y≤16、x,y≥0 整数；枚举可得 x=0,y=12 时成本 36 元最低（装 60 件）。', analysis: '这是“整数线性规划”雏形：先列约束，再在可行整数解中比较目标函数；注意“不少于/不超过”的方向。', point: '情境化建模' }
        ]},
        { name: '英语', qs: [
          { no: 13, subject: '英语', type: '语法填空', stem: 'Grammar fill: Mike is ___ (tall) than any other student in his class. (用所给词适当形式)', options: null, answer: 'taller', analysis: 'than 提示比较级；tall 为规则形容词，直接加 -er → taller。', point: '形容词比较级' },
          { no: 14, subject: '英语', type: '完形', stem: 'One day a little boy ___ (find) a lost dog and took it home.', options: ['A. finds', 'B. found', 'C. finding', 'D. find'], answer: 'B', analysis: 'and 并列 took（过去式），故 find 也用过去式 found，保持时态一致。', point: '动词时态' },
          { no: 15, subject: '英语', type: '阅读', stem: 'Reading: Many cities now use solar power for street lights. This helps cut pollution and save money. What is the main idea?', options: ['A. Solar lights are expensive', 'B. Solar street lights help environment and save cost', 'C. Cities hate lights', 'D. Pollution is good'], answer: 'B', analysis: '段首+段尾点明“太阳能路灯减少污染、节省开支”，B 同义概括为主旨。', point: '阅读主旨' },
          { no: 16, subject: '英语', type: '阅读·非连', stem: '图表显示：Students’ favorite free-time activity — Reading 35%, Sports 30%, Games 20%, Others 15%. Which is the most popular?', options: ['A. Sports', 'B. Games', 'C. Reading', 'D. Others'], answer: 'C', analysis: 'Reading 35% 为最高比例，故最受欢迎。', point: '图表信息提取' },
          { no: 17, subject: '英语', type: '读写综合', stem: 'Read the notice about a school book fair. (a) Match the activity with its time; (b) In 2–3 sentences, say why you want to join and what you will do there.', options: null, answer: '(a) 依据通知中“时间—活动”对应匹配；(b) 示例：I want to join because I love reading. I will share my favorite book and help organize the stalls.', analysis: '开放问答用“观点+理由+行动”结构；拼写与基本语法正确即可按档给分。', point: '读写综合' }
        ]}
      ]
    },
    {
      id: 'p2027-2', setNo: 2, title: '2027 深圳中考预测模拟卷（二）',
      coverage: '语文6 · 数学6 · 英语5 · 物理5 · 道法2',
      sections: [
        { name: '语文', qs: [
          { no: 1, subject: '语文', type: '情境默写', stem: '“朋友即将远行，你以酒饯别并赠言”，最适合引用的诗句是（ ）', options: ['A. 独在异乡为异客', 'B. 劝君更尽一杯酒，西出阳关无故人', 'C. 春风又绿江南岸', 'D. 一行白鹭上青天'], answer: 'B', analysis: '“劝君更尽一杯酒”正是饯别赠言的经典名句，情境完全吻合。', point: '古诗文情境运用' },
          { no: 2, subject: '语文', type: '非连续性文本', stem: '某博物馆“线上预约”须知写明：周二闭馆、每日限流 5000 人。下列说法正确的一项是（ ）', options: ['A. 周二可现场购票入馆', 'B. 周一可预约参观', 'C. 不限人数', 'D. 随时免约'], answer: 'B', analysis: '仅“周二闭馆”，其余时间（含周一）可预约；限流 5000 说明有人数上限，故 B 正确。', point: '非连续性文本信息整合' },
          { no: 3, subject: '语文', type: '文言文对比', stem: '《爱莲说》“予独爱莲之出淤泥而不染”中“之”的作用是（ ）', options: ['A. 代词', 'B. 动词“到”', 'C. 取消句子独立性', 'D. 宾语前置标志'], answer: 'C', analysis: '“莲出淤泥而不染”本为句子，加“之”取消独立性，使之前作“爱”的宾语。', point: '文言文虚词' },
          { no: 4, subject: '语文', type: '现代文阅读', stem: '“标题的作用”不包括下列哪一项（ ）', options: ['A. 概括内容', 'B. 设置悬念吸引读者', 'C. 决定作者国籍', 'D. 暗示主题'], answer: 'C', analysis: '标题可概括内容、设悬、点题，但与“作者国籍”无必然联系。', point: '文本鉴赏' },
          { no: 5, subject: '语文', type: '名著阅读', stem: '《水浒传》中“鲁智深倒拔垂杨柳”表现了他（ ）', options: ['A. 粗中有细、力大无穷', 'B. 胆小', 'C. 狡猾', 'D. 冷漠'], answer: 'A', analysis: '该情节既显神力，又见其直率粗犷下的细腻（借机震慑泼皮），符合人物性格。', point: '整本书阅读' },
          { no: 6, subject: '语文', type: '作文预测', stem: '材料：家乡的某项传统手艺（如扎灯笼、做粤式点心）正面临失传。请以“守住身边的传统”为题写一段 80 字左右的立意提纲。', options: null, answer: '【参考提纲】① 立意：传统手艺承载文化与乡愁，值得守护。② 结构：描摹手艺之美—点出失传隐忧—提出“记录+体验+传播”三法—升华文化自信。③ 金句：守住手艺，就是守住我们的来路。', analysis: '评分重“真体验+具体做法+文化高度”；避免空泛抒情，要有可操作的保护方案。', point: '作文反模板与思辨' }
        ]},
        { name: '数学', qs: [
          { no: 7, subject: '数学', type: '选择', stem: '下列调查中，适合用普查的是（ ）', options: ['A. 全国中学生视力', 'B. 本班同学身高', 'C. 全市空气质量', 'D. 某种灯泡寿命'], answer: 'B', analysis: '普查要求对象少、易操作；本班人数少适合普查，其余总体大或具破坏性的宜抽样。', point: '调查方式' },
          { no: 8, subject: '数学', type: '选择', stem: '新定义：若 a⊕b = a²−b，则 3⊕1 =（ ）', options: ['A. 2', 'B. 8', 'C. 4', 'D. 9'], answer: 'B', analysis: '按定义 3⊕1=3²−1=9−1=8。', point: '新定义题型' },
          { no: 9, subject: '数学', type: '填空', stem: '因式分解：x²−9 = ________。', options: null, answer: '(x+3)(x−3)', analysis: '平方差公式：a²−b²=(a+b)(a−b)，此处 a=x、b=3。', point: '因式分解' },
          { no: 10, subject: '数学', type: '解答·概率', stem: '袋中有红、黄、蓝球各 2 个，随机摸 1 个。(1) 摸到红球概率；(2) 摸后放回再摸，两次都黄的概率。', options: null, answer: '(1) 2/6=1/3；(2) (2/6)×(2/6)=1/9。', analysis: '放回抽样两次独立；注意“放回”使第二次概率不变。', point: '概率' },
          { no: 11, subject: '数学', type: '解答·几何综合', stem: 'Rt△ABC 中 ∠C=90°，CD 为斜边 AB 上的中线，若 AB=10，求 CD 长，并说明理由。', options: null, answer: 'CD=5。理由：直角三角形斜边中线等于斜边一半，故 CD=½AB=5。', analysis: '识别“直角+斜边中线”直接套用定理；书写要写清“∵∠C=90°，CD 为中线，∴CD=½AB”。', point: '直角三角形斜边中线' },
          { no: 12, subject: '数学', type: '解答·建模', stem: '某农场用 A、B 两种肥，A 每袋含氮 20kg 售 40 元，B 每袋含氮 15kg 售 30 元。需总氮不少于 120kg 且袋数不超过 7 袋，怎样最省钱？', options: null, answer: '设 A x、B y 袋，约束 20x+15y≥120、x+y≤7、整数；枚举：x=3,y=4 时氮=120、价=240 元，为最低。', analysis: '整数规划：在可行整数解中比较总价；注意“不少于/不超过”约束方向，优先多买单位氮价低的 A。', point: '情境化建模' }
        ]},
        { name: '英语', qs: [
          { no: 13, subject: '英语', type: '语法填空', stem: 'Grammar fill: Look! The children ___ (play) happily in the park now. (用所给词适当形式)', options: null, answer: 'are playing', analysis: 'Look!/now 提示现在进行时：be + v-ing；主语 children 复数 ⇒ are playing。', point: '现在进行时' },
          { no: 14, subject: '英语', type: '完形', stem: 'She was tired ___ she kept working to finish the project.', options: ['A. and', 'B. but', 'C. so', 'D. or'], answer: 'B', analysis: '“累”与“仍坚持”为转折关系，用 but。', point: '并列连词' },
          { no: 15, subject: '英语', type: '阅读', stem: 'Reading: Bamboo grows fast and can be used to make furniture and paper. It is also food for pandas. What can we learn?', options: ['A. Bamboo is useless', 'B. Bamboo has many uses', 'C. Pandas eat paper', 'D. It grows slow'], answer: 'B', analysis: '文中列举家具、纸、熊猫食物等多用途，B 为归纳。', point: '阅读主旨' },
          { no: 16, subject: '英语', type: '阅读·非连', stem: 'A poster shows: School Trip — Date: May 12; Place: Science Museum; Bring: notebook. When is the trip?', options: ['A. May 2', 'B. May 12', 'C. May 20', 'D. June 12'], answer: 'B', analysis: '海报“Date: May 12”直接给出日期。', point: '图表/海报信息提取' },
          { no: 17, subject: '英语', type: '读写综合', stem: 'Read a letter from a pen friend in Shenzhen. (a) Find two places he mentions; (b) Reply in 2–3 sentences saying which place you’d like to visit and why.', options: null, answer: '(a) 依信件内容圈出两处地名；(b) 示例：I’d like to visit the bay area because the city is modern and beautiful by the sea.', analysis: '开放问答需“具体地点+理由”；语法基本正确、信息相关即可给分。', point: '读写综合' }
        ]}
      ]
    },
    {
      id: 'p2027-3', setNo: 3, title: '2027 深圳中考预测模拟卷（三）',
      coverage: '语文6 · 数学6 · 英语5 · 物理5 · 道法2',
      sections: [
        { name: '语文', qs: [
          { no: 1, subject: '语文', type: '情境默写', stem: '形容“站得高、看得远，胸怀天下”的抱负，最合适的诗句是（ ）', options: ['A. 床前明月光', 'B. 会当凌绝顶，一览众山小', 'C. 春眠不觉晓', 'D. 两个黄鹂鸣翠柳'], answer: 'B', analysis: '“会当凌绝顶，一览众山小”抒发登顶望远、俯视一切的豪情与抱负，最贴切。', point: '古诗文情境运用' },
          { no: 2, subject: '语文', type: '非连续性文本', stem: '某 APP 隐私政策写明“仅在使用定位时收集位置”。下列做法符合的是（ ）', options: ['A. 后台持续上传位置', 'B. 仅导航时获取位置', 'C. 出售位置给第三方', 'D. 默认全天开启'], answer: 'B', analysis: '“仅在使用定位时收集”对应 B；其余均超出声明范围，违背告知原则。', point: '非连续性文本信息整合' },
          { no: 3, subject: '语文', type: '文言文对比', stem: '“下车引之”中“之”指代（ ）', options: ['A. 友人的车子', 'B. 友人（元方之父的朋友）', 'C. 元方', 'D. 道路'], answer: 'B', analysis: '出自《陈太丘与友期》，“引之”即拉他（友人）表示歉意。', point: '文言文虚词·代词' },
          { no: 4, subject: '语文', type: '现代文阅读', stem: '下列对“插叙”手法的说明，正确的是（ ）', options: ['A. 打断主线叙述过去的事', 'B. 顺时叙述', 'C. 只用于开头', 'D. 无意义'], answer: 'A', analysis: '插叙是在主线中插入对往事的回忆或补充，丰富内容、交代背景。', point: '叙事手法' },
          { no: 5, subject: '语文', type: '名著阅读', stem: '《红星照耀中国》属于（ ）', options: ['A. 虚构小说', 'B. 纪实文学（报告文学）', 'C. 诗歌', 'D. 童话'], answer: 'B', analysis: '斯诺所著为实地采访写成的纪实作品，记录陕北苏区真实情况。', point: '整本书阅读·文体' },
          { no: 6, subject: '语文', type: '作文预测', stem: '材料：有同学说“家务是父母的事，学生只要读书”。请就“中学生该不该做家务”写一段 80 字左右的立意提纲（需有辩证观点）。', options: null, answer: '【参考提纲】① 立意：做家务是劳动教育的必修课，利大于弊。② 结构：破“读书至上”误区—论家务培养责任与独立—提“量力而行、家校配合”—收束。③ 金句：会生活，才能更好地面向未来。', analysis: '评分重“辩证”（不绝对化）+“联系自身”；避免一边倒，要承认读书重要但家务亦不可少。', point: '作文反模板与思辨' }
        ]},
        { name: '数学', qs: [
          { no: 7, subject: '数学', type: '选择', stem: '下列计算正确的是（ ）', options: ['A. a²+a³=a⁵', 'B. a²·a³=a⁶', 'C. (a²)³=a⁶', 'D. a⁶÷a²=a³'], answer: 'C', analysis: '幂的运算：(a²)³=a⁶ 正确；A 非同类项不能加，B 应为 a⁵，D 应为 a⁴。', point: '幂运算' },
          { no: 8, subject: '数学', type: '选择', stem: '新定义：数 a 的“伴随数”为 2a+1，则 5 的伴随数是（ ）', options: ['A. 6', 'B. 11', 'C. 10', 'D. 9'], answer: 'B', analysis: '2×5+1=11。', point: '新定义题型' },
          { no: 9, subject: '数学', type: '填空', stem: '若 √(x−3) 有意义，则 x 的取值范围是 ________。', options: null, answer: 'x≥3', analysis: '被开方数非负：x−3≥0 ⇒ x≥3。', point: '二次根式有意义' },
          { no: 10, subject: '数学', type: '解答·统计', stem: '甲乙两班数学平均分均为 85，甲班方差 12，乙班方差 20。哪班成绩更整齐？并说明理由。', options: null, answer: '甲班更整齐。理由：平均分相同，方差越小波动越小；12<20，故甲班更整齐。', analysis: '方差衡量离散程度，越小越稳定；比较前先确认“平均数相同”这一前提。', point: '统计·方差意义' },
          { no: 11, subject: '数学', type: '解答·几何综合', stem: '在 □ABCD 中，E、F 分别为 AD、BC 中点。求证：四边形 BEDF 是平行四边形。', options: null, answer: '证：□ABCD 中 AD∥BC 且 AD=BC；E、F 为中点 ⇒ ED=½AD、BF=½BC ⇒ ED=BF；又 ED∥BF，一组对边平行且相等 ⇒ BEDF 为平行四边形。', analysis: '平行四边形判定优先想“一组对边平行且相等”；用好“中点+平行”条件。', point: '平行四边形判定' },
          { no: 12, subject: '数学', type: '解答·建模', stem: '某班 45 人去研学，大车每辆坐 9 人租金 200 元，小车每辆坐 5 人租金 130 元。怎样租车最省钱（车不空座过多）？', options: null, answer: '设大车 x、小车 y，9x+5y≥45 且尽量坐满；枚举：x=5,y=0 坐 45 人，价 1000 元最优（或 x=4,y=2 坐 46 人价 1060 略高）。', analysis: '整数规划：优先多租“人均成本低”的大车，再微调小车补余数，比较总价取最小。', point: '情境化建模' }
        ]},
        { name: '英语', qs: [
          { no: 13, subject: '英语', type: '语法填空', stem: 'Grammar fill: If it ___ (rain) tomorrow, we will stay at home. (用所给词适当形式)', options: null, answer: 'rains', analysis: 'if 条件状语从句“主将从现”：主句将来时，从句用一般现在时 rains。', point: '条件状语从句' },
          { no: 14, subject: '英语', type: '完形', stem: 'He practiced every day ___ he won the competition.', options: ['A. but', 'B. so', 'C. because', 'D. or'], answer: 'B', analysis: '“每天练习”导致“夺冠”，因果用 so。', point: '并列连词' },
          { no: 15, subject: '英语', type: '阅读', stem: 'Reading: Reusing water at home can save money and protect the earth. What does the writer advise?', options: ['A. Waste water', 'B. Reuse water', 'C. Drink less', 'D. Buy more'], answer: 'B', analysis: '段意倡导“家庭循环用水”，B 同义。', point: '阅读主旨' },
          { no: 16, subject: '英语', type: '阅读·非连', stem: 'Table: Weekday sleep — Mon 8h, Tue 7h, Wed 8h, Thu 7h, Fri 9h. Which day has the most sleep?', options: ['A. Tue', 'B. Thu', 'C. Fri', 'D. Mon'], answer: 'C', analysis: 'Fri 9h 为最大值。', point: '图表信息提取' },
          { no: 17, subject: '英语', type: '读写综合', stem: 'Read a short article about green life. (a) List two green habits mentioned; (b) Write 2–3 sentences about one habit you can start this week.', options: null, answer: '(a) 依文意列出两种绿色习惯（如节水、垃圾分类）；(b) 示例：I will start saving water by turning off the tap while brushing teeth.', analysis: '开放问答“具体习惯+可操作行动”；语法正确、内容相关即可给分。', point: '读写综合' }
        ]}
      ]
    }
  ];

  // 每套补「物理」与「道法」板块，确保 3 套完整覆盖预测重点
  EXAMS.forEach(function (ex, i) {
    ex.sections.push({ name: '物理', qs: [
      { no: 18, subject: '物理', type: '选择', stem: '下列现象中，由于光的反射形成的是（ ）', options: ['A. 小孔成像', 'B. 水中倒影', 'C. 日食', 'D. 放大镜成像'], answer: 'B', analysis: '水中倒影是平面镜成像，属光的反射；A、C 为光的直线传播，D 为折射。', point: '光现象' },
      { no: 19, subject: '物理', type: '选择', stem: '一节干电池电压约（ ）', options: ['A. 1.5V', 'B. 36V', 'C. 220V', 'D. 3.7V'], answer: 'A', analysis: '常见干电池标称电压 1.5V；220V 为市电，36V 为安全电压上限。', point: '电压常识' },
      { no: 20, subject: '物理', type: '实验探究', stem: '用天平和量筒测石块密度。(1) 调平时指针偏左，平衡螺母应向哪调？(2) 若 m=54g、V=20cm³，求密度。', options: null, answer: '(1) 指针偏左 ⇒ 左侧重 ⇒ 平衡螺母向右调；(2) ρ=m/V=54/20=2.7 g/cm³。', analysis: '“左偏右调”是天平调平口诀；密度=质量/体积，注意单位统一为 g/cm³。', point: '实验探究·测密度' },
      { no: 21, subject: '物理', type: '计算', stem: '重 600N 的物体在 200N 水平推力下匀速前进 5m，求推力做功与摩擦力。', options: null, answer: 'W=Fs=200×5=1000J；匀速 ⇒ f=F=200N。', analysis: '功 W=Fs；匀速直线运动二力平衡，滑动摩擦力等于推力。', point: '功与力平衡' },
      { no: 22, subject: '物理', type: '跨学科融合', stem: '一密闭瓶内水草在光下产生气泡（氧气），使瓶内气压略升、将瓶口轻质小球顶起。此现象主要涉及（ ）', options: ['A. 仅化学', 'B. 物理（气压/浮力）+ 生物（光合作用）', 'C. 仅生物', 'D. 仅数学'], answer: 'B', analysis: '光合作用产气属生物，气体使气压变化、顶起小球属物理（气压与力），为典型跨学科融合。', point: '跨学科融合' }
    ]});
    ex.sections.push({ name: '道德与法治', qs: [
      { no: 23, subject: '道法', type: '材料分析', stem: '某中学生遇到“免费领游戏皮肤”的陌生链接，下列做法最恰当的是（ ）', options: ['A. 直接点击', 'B. 先核实并举报，不轻易填写个人信息', 'C. 转发给同学', 'D. 输入密码领取'], answer: 'B', analysis: '陌生链接可能涉及诈骗，应先核实、保护个人信息并及时举报，体现法治与自我保护意识。', point: '法治与安全·自我保护' },
      { no: 24, subject: '道法', type: '开放题', stem: '结合“班级大扫除”实例，谈谈中学生如何在集体中承担责任。（80 字左右）', options: null, answer: '【参考】在集体中，责任始于分内之事：大扫除时我主动认领擦窗任务，并提醒同伴注意安全；遇到困难主动补位。承担责任让集体更温暖，也让我学会担当。', analysis: '评分看“具体行为+集体意义+价值升华”；用“是什么—怎么做—意义”组织，避免空话。', point: '责任与集体' }
    ]});
  });

  return { META: META, KNOWLEDGE: KNOWLEDGE, HOTSPOTS: HOTSPOTS, QTYPES: QTYPES, EXAMS: EXAMS, subjects: ['语文', '数学', '英语', '物理', '道法'] };
})();
