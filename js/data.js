/* ============================================================
 * 深圳中考 AI 复习系统 — 种子数据引擎
 * 教材版本：英语=沪教版(牛津深圳版) / 语文=人教版 / 数学=北师大版 / 物理=人教版
 * 所有数据均可在应用内【考点库管理】中增删改，本地持久化。
 * ========================================================== */
(function (global) {
  const SUBJECTS = {
    '英语': { version: '沪教版(牛津深圳版)', color: '#f59e0b', icon: 'EN' },
    '语文': { version: '人教版',            color: '#ef4444', icon: '语' },
    '数学': { version: '北师大版',          color: '#3b82f6', icon: '数' },
    '物理': { version: '人教版',            color: '#10b981', icon: '物' }
  };

  const FREQ = { '高': '🔴 高频', '中': '🟡 中频', '低': '🟢 低频' };
  const LEVELS = ['记忆', '理解', '应用', '探究'];

  // ---------- 种子考点库（每科约 16–20 条，可扩展） ----------
  let SEED_POINTS = [
    // ===== 物理（人教版） =====
    { id:'phy-01', subject:'物理', chapter:'八上·第一章 机械运动', name:'速度公式 v=s/t 及单位换算', freq:'高', level:'应用', types:['选择','计算'], trap:'km/h 与 m/s 换算易错（1m/s=3.6km/h）' },
    { id:'phy-02', subject:'物理', chapter:'八上·第二章 声现象', name:'声音三要素与噪声控制', freq:'中', level:'理解', types:['选择'], trap:'音调(频率)与响度(振幅)混淆' },
    { id:'phy-03', subject:'物理', chapter:'八上·第三章 物态变化', name:'熔化/沸腾图像与晶体非晶体', freq:'高', level:'理解', types:['选择','实验'], trap:'晶体有固定熔点，非晶体没有' },
    { id:'phy-04', subject:'物理', chapter:'八上·第四章 光现象', name:'光的反射定律与平面镜成像', freq:'高', level:'应用', types:['选择','实验'], trap:'反射角=入射角，光线标箭头方向' },
    { id:'phy-05', subject:'物理', chapter:'八上·第五章 透镜', name:'凸透镜成像规律(u/v/f关系)', freq:'高', level:'探究', types:['选择','实验'], trap:'物距=u, 像距=v, 一倍/二倍焦距分界' },
    { id:'phy-06', subject:'物理', chapter:'八上·第六章 质量与密度', name:'密度 ρ=m/V 测量与计算', freq:'高', level:'应用', types:['计算','实验'], trap:'ρ 是物质特性，与 m、V 无关' },
    { id:'phy-07', subject:'物理', chapter:'八下·第七章 力', name:'力的三要素与重力', freq:'中', level:'理解', types:['选择','填空'], trap:'重力方向永远竖直向下' },
    { id:'phy-08', subject:'物理', chapter:'八下·第八章 运动和力', name:'牛顿第一定律与二力平衡', freq:'高', level:'应用', types:['选择','实验'], trap:'平衡力作用在同一物体；相互作用力作用在不同物体' },
    { id:'phy-09', subject:'物理', chapter:'八下·第九章 压强', name:'固体/液体/大气压强', freq:'高', level:'应用', types:['选择','计算'], trap:'液体压强 p=ρgh 只与深度、密度有关' },
    { id:'phy-10', subject:'物理', chapter:'八下·第十章 浮力', name:'阿基米德原理与浮沉条件', freq:'高', level:'探究', types:['计算','实验'], trap:'F浮=G排=ρ液gV排' },
    { id:'phy-11', subject:'物理', chapter:'八下·第十一章 功和机械能', name:'功、功率与机械能守恒', freq:'中', level:'应用', types:['计算'], trap:'做功两要素：力与在力方向通过的距离' },
    { id:'phy-12', subject:'物理', chapter:'八下·第十二章 简单机械', name:'杠杆平衡与机械效率', freq:'高', level:'应用', types:['计算','实验'], trap:'F1·L1=F2·L2；省力杠杆费距离' },
    { id:'phy-13', subject:'物理', chapter:'九·第十三章 内能', name:'分子动理论与比热容', freq:'中', level:'理解', types:['选择','计算'], trap:'比热容大的物质升温慢' },
    { id:'phy-14', subject:'物理', chapter:'九·第十五章 电流和电路', name:'串并联电路与欧姆定律', freq:'高', level:'应用', types:['选择','计算','实验'], trap:'I=U/R，电阻是导体本身属性' },
    { id:'phy-15', subject:'物理', chapter:'九·第十八章 电功率', name:'电功、电功率与焦耳定律', freq:'高', level:'探究', types:['计算','实验'], trap:'P=UI=W/t；纯电阻 P=I²R' },
    { id:'phy-16', subject:'物理', chapter:'九·第二十章 电与磁', name:'磁场、电动机与电磁感应', freq:'中', level:'理解', types:['选择'], trap:'发电→电磁感应(磁生电)；电动→通电导体在磁场受力' },

    // ===== 数学（北师大版） =====
    { id:'math-01', subject:'数学', chapter:'七上·第二章 有理数', name:'有理数运算与科学记数法', freq:'中', level:'理解', types:['选择','计算'], trap:'负号与绝对值运算优先级' },
    { id:'math-02', subject:'数学', chapter:'七上·第五章 一元一次方程', name:'一元一次方程解法与应用', freq:'高', level:'应用', types:['计算','解答'], trap:'去括号、移项变号' },
    { id:'math-03', subject:'数学', chapter:'八上·第一章 勾股定理', name:'勾股定理及逆定理', freq:'高', level:'应用', types:['计算','解答'], trap:'直角三角形才可用 a²+b²=c²' },
    { id:'math-04', subject:'数学', chapter:'八上·第四章 一次函数', name:'一次函数图象与性质', freq:'高', level:'探究', types:['选择','解答'], trap:'k 决定增减性，b 决定与 y 轴交点' },
    { id:'math-05', subject:'数学', chapter:'八下·第一章 三角形的证明', name:'全等与等腰三角形判定', freq:'高', level:'应用', types:['解答'], trap:'SSA 不能判定全等' },
    { id:'math-06', subject:'数学', chapter:'八下·第二章 一元一次不等式', name:'不等式解法与解集', freq:'高', level:'应用', types:['计算','解答'], trap:'乘/除以负数时不等号方向改变' },
    { id:'math-07', subject:'数学', chapter:'八下·第四章 因式分解', name:'提公因式与公式法', freq:'中', level:'理解', types:['计算'], trap:'分解要彻底，到不能再分为止' },
    { id:'math-08', subject:'数学', chapter:'八下·第六章 平行四边形', name:'特殊平行四边形性质判定', freq:'高', level:'探究', types:['解答'], trap:'矩形/菱形/正方形从属关系' },
    { id:'math-09', subject:'数学', chapter:'九上·第二章 一元二次方程', name:'一元二次方程求根', freq:'高', level:'应用', types:['计算'], trap:'判别式 Δ=b²-4ac 决定根的情况' },
    { id:'math-10', subject:'数学', chapter:'九上·第六章 反比例函数', name:'反比例函数图象与性质', freq:'高', level:'应用', types:['解答'], trap:'k>0 图象在一三象限' },
    { id:'math-11', subject:'数学', chapter:'九上·第一章 菱形的周长面积', name:'特殊四边形综合', freq:'高', level:'探究', types:['解答'], trap:'结合勾股与相似' },
    { id:'math-12', subject:'数学', chapter:'九下·第一章 锐角三角函数', name:'三角函数与解直角三角形', freq:'高', level:'应用', types:['计算'], trap:'sin/cos 特殊角值记忆' },
    { id:'math-13', subject:'数学', chapter:'九下·第二章 二次函数', name:'二次函数图象与最值', freq:'高', level:'探究', types:['解答'], trap:'顶点式 y=a(x-h)²+k，顶点(h,k)' },
    { id:'math-14', subject:'数学', chapter:'九下·第三章 圆', name:'圆的性质与切线证明', freq:'高', level:'探究', types:['解答'], trap:'垂径定理、切线垂直于半径' },
    { id:'math-15', subject:'数学', chapter:'九上·第三章 概率', name:'概率计算与树状图', freq:'中', level:'应用', types:['选择','解答'], trap:'古典概型=有利/总，注意等可能' },
    { id:'math-16', subject:'数学', chapter:'九上·第五章 统计', name:'统计图表与数据分析', freq:'中', level:'理解', types:['解答'], trap:'众数/中位数/方差含义' },

    // ===== 语文（人教版） =====
    { id:'chi-01', subject:'语文', chapter:'九年级·古诗文', name:'课标古诗文默写(64篇)', freq:'高', level:'记忆', types:['默写'], trap:'同音/形近字误写（己/已、燕/雁）' },
    { id:'chi-02', subject:'语文', chapter:'九年级·文言文', name:'文言实词与虚词(之乎者也)', freq:'高', level:'理解', types:['选择','翻译'], trap:'古今异义（走、去、汤）' },
    { id:'chi-03', subject:'语文', chapter:'九年级·文言文', name:'断句与句子翻译', freq:'高', level:'应用', types:['翻译'], trap:'留删补调换五字法' },
    { id:'chi-04', subject:'语文', chapter:'九年级·现代文', name:'记叙文阅读(情节/人物/主旨)', freq:'高', level:'应用', types:['阅读'], trap:'作用题从内容+结构作答' },
    { id:'chi-05', subject:'语文', chapter:'九年级·现代文', name:'说明文阅读(说明方法)', freq:'高', level:'理解', types:['阅读'], trap:'举例子/列数字/作比较的作用' },
    { id:'chi-06', subject:'语文', chapter:'九年级·现代文', name:'议论文阅读(论点/论证)', freq:'中', level:'理解', types:['阅读'], trap:'区分论点与论题' },
    { id:'chi-07', subject:'语文', chapter:'九年级·名著', name:'名著阅读(《水浒》《西游》等)', freq:'中', level:'理解', types:['选择'], trap:'人物与情节对应' },
    { id:'chi-08', subject:'语文', chapter:'九年级·作文', name:'作文审题立意与选材', freq:'高', level:'探究', types:['写作'], trap:'审题偏差跑题；立意要深刻' },
    { id:'chi-09', subject:'语文', chapter:'九年级·作文', name:'作文结构与语言表达', freq:'高', level:'应用', types:['写作'], trap:'首尾点题，段落清晰' },
    { id:'chi-10', subject:'语文', chapter:'九年级·基础', name:'病句修改与语句衔接', freq:'中', level:'理解', types:['选择'], trap:'搭配不当/成分残缺/语序' },
    { id:'chi-11', subject:'语文', chapter:'九年级·基础', name:'成语词语运用', freq:'中', level:'理解', types:['选择'], trap:'望文生义、褒贬误用' },
    { id:'chi-12', subject:'语文', chapter:'九年级·诗歌', name:'古诗词鉴赏(意象情感)', freq:'高', level:'应用', types:['鉴赏'], trap:'结合背景与意象' },
    { id:'chi-13', subject:'语文', chapter:'九年级·综合性', name:'综合性学习与口语交际', freq:'低', level:'应用', types:['表达'], trap:'得体、有对象意识' },
    { id:'chi-14', subject:'语文', chapter:'九年级·古诗文', name:'文言文对比阅读', freq:'中', level:'应用', types:['阅读'], trap:'跨文本信息整合' },

    // ===== 英语（沪教版） =====
    { id:'eng-01', subject:'英语', chapter:'听说·模仿朗读', name:'语音语调与流利度', freq:'高', level:'记忆', types:['听说'], trap:'重音、连读、语调' },
    { id:'eng-02', subject:'英语', chapter:'听说·信息获取', name:'听选信息与应答', freq:'高', level:'应用', types:['听说'], trap:'抓关键词与疑问词' },
    { id:'eng-03', subject:'英语', chapter:'听说·短文复述', name:'信息记录与连贯复述', freq:'高', level:'应用', types:['听说'], trap:'要点完整、逻辑连接' },
    { id:'eng-04', subject:'英语', chapter:'词汇·话题', name:'单元话题词汇分类', freq:'高', level:'记忆', types:['选择','填空'], trap:'词性、搭配与拼写' },
    { id:'eng-05', subject:'英语', chapter:'语法·时态', name:'六大时态(含现在/过去完成)', freq:'高', level:'应用', types:['选择','填空'], trap:'时态标志词(by the time, since, for)' },
    { id:'eng-06', subject:'英语', chapter:'语法·语态', name:'被动语态结构', freq:'高', level:'应用', types:['填空'], trap:'be + done，注意时态的 be' },
    { id:'eng-07', subject:'英语', chapter:'语法·从句', name:'宾语从句与定语从句', freq:'中', level:'应用', types:['选择'], trap:'陈述语序；关系代词 that/which/who' },
    { id:'eng-08', subject:'英语', chapter:'笔试·完形', name:'完形填空(语境推理)', freq:'高', level:'应用', types:['完形'], trap:'瞻前顾后，逻辑一致' },
    { id:'eng-09', subject:'英语', chapter:'笔试·阅读', name:'阅读理解(细节/推断/主旨)', freq:'高', level:'应用', types:['阅读'], trap:'推断题不离原文依据' },
    { id:'eng-10', subject:'英语', chapter:'笔试·语法填空', name:'语法填空(词形变换)', freq:'高', level:'应用', types:['填空'], trap:'名词单复、动词时态、形容词副词' },
    { id:'eng-11', subject:'英语', chapter:'笔试·写作', name:'书面表达(应用文/记叙文)', freq:'高', level:'探究', types:['写作'], trap:'要点齐全、连接词、无语法错' },
    { id:'eng-12', subject:'英语', chapter:'背诵·范文', name:'单元话题范文背诵', freq:'高', level:'记忆', types:['背诵'], trap:'句型结构与高级表达' },
    { id:'eng-13', subject:'英语', chapter:'词汇·高频', name:'中考高频词组与句型', freq:'高', level:'记忆', types:['填空'], trap:'动词短语搭配' }
  ];

  // ---------- 知识点关联与标签（增强"知识点体系"视图） ----------
  // related: 关联知识点 id（含跨/同学科）；tags: 主题标签
  const POINT_REL = {
    'math-03': ['math-14', 'phy-10', 'phy-12'],
    'math-04': ['math-13', 'phy-14', 'phy-15'],
    'math-09': ['math-13'],
    'math-12': ['phy-09', 'phy-11', 'math-03'],
    'math-13': ['math-04', 'phy-14'],
    'math-14': ['math-03', 'math-08'],
    'math-15': ['math-16'],
    'phy-01': ['phy-11'],
    'phy-05': ['phy-16'],
    'phy-06': ['phy-10'],
    'phy-08': ['phy-12'],
    'phy-09': ['math-12', 'phy-10'],
    'phy-10': ['math-03', 'math-12', 'phy-06'],
    'phy-12': ['math-03', 'phy-08'],
    'phy-14': ['math-04', 'phy-15', 'math-13'],
    'phy-15': ['phy-14', 'math-04'],
    'eng-05': ['eng-10', 'eng-07'],
    'eng-07': ['eng-09'],
    'eng-09': ['eng-11', 'chi-04'],
    'eng-11': ['eng-13'],
    'chi-01': ['chi-12', 'chi-02'],
    'chi-02': ['chi-03', 'chi-14'],
    'chi-03': ['chi-02', 'chi-14'],
    'chi-04': ['chi-05', 'chi-08'],
    'chi-05': ['chi-06'],
    'chi-08': ['chi-09', 'eng-11']
  };
  const POINT_TAGS = {
    'phy-05': '实验探究', 'phy-03': '图像分析', 'phy-14': '图像与计算', 'phy-15': '电学计算',
    'phy-10': '浮力计算', 'phy-12': '杠杆计算', 'phy-09': '压强计算', 'phy-04': '光现象', 'phy-01': '运动计算',
    'math-04': '函数与图像', 'math-13': '函数与图像', 'math-12': '三角函数', 'math-03': '几何计算',
    'math-09': '方程', 'math-14': '圆', 'math-16': '统计', 'math-15': '概率',
    'eng-05': '时态', 'eng-06': '语态', 'eng-07': '从句', 'eng-09': '阅读策略', 'eng-11': '写作', 'eng-13': '高频词组',
    'chi-01': '默写', 'chi-02': '文言文', 'chi-04': '阅读', 'chi-08': '作文', 'chi-12': '诗词鉴赏', 'chi-05': '说明文'
  };
  SEED_POINTS = SEED_POINTS.map(p => ({ ...p, related: POINT_REL[p.id] || [], tags: POINT_TAGS[p.id] ? [POINT_TAGS[p.id]] : [] }));

  // ---------- 种子题库（每科 6–8 题，关联 pointId） ----------
  const SEED_QUESTIONS = [
    // 物理
    { id:'q-p1', subject:'物理', pointId:'phy-01', type:'计算', difficulty:'中', stem:'汽车以 72 km/h 匀速行驶，通过 18 km 路程所需时间约为？', options:['0.25 h','0.5 h','0.75 h','1 h'], answer:'0.25 h', analysis:'v=72km/h，s=18km，t=s/v=18/72=0.25 h。注意单位统一为 km 与 h。' },
    { id:'q-p2', subject:'物理', pointId:'phy-04', type:'选择', difficulty:'中', stem:'关于平面镜成像，正确的是？', options:['像比物大','像与物关于镜面对称','像为实像','像距小于物距'], answer:'像与物关于镜面对称', analysis:'平面镜成等大、正立、虚像，像与物关于镜面对称，像距=物距。' },
    { id:'q-p3', subject:'物理', pointId:'phy-05', type:'实验', difficulty:'高', stem:'凸透镜焦距 f=10cm，当物距 u=15cm 时，成像性质为？', options:['倒立放大实像','正立放大虚像','倒立缩小实像','不成像'], answer:'倒立放大实像', analysis:'f<u<2f(10<15<20) 成倒立放大实像，应用于投影仪。' },
    { id:'q-p4', subject:'物理', pointId:'phy-10', type:'计算', difficulty:'高', stem:'浸在液体中的物体排开液重 2 N，则浮力为？', options:['0 N','1 N','2 N','4 N'], answer:'2 N', analysis:'阿基米德原理 F浮=G排=2 N。' },
    { id:'q-p5', subject:'物理', pointId:'phy-12', type:'计算', difficulty:'中', stem:'杠杆平衡时，动力 20 N、动力臂 0.3 m，阻力臂 0.6 m，则阻力为？', options:['10 N','20 N','30 N','40 N'], answer:'10 N', analysis:'F1·L1=F2·L2 → 20×0.3=F2×0.6 → F2=10 N。' },
    { id:'q-p6', subject:'物理', pointId:'phy-15', type:'计算', difficulty:'高', stem:'用电器电压 220 V、电流 0.5 A，工作 1 h 耗电？', options:['0.11 kWh','0.55 kWh','1.1 kWh','110 kWh'], answer:'0.11 kWh', analysis:'P=UI=220×0.5=110 W=0.11 kW，W=Pt=0.11×1=0.11 kWh。' },
    { id:'q-p7', subject:'物理', pointId:'phy-08', type:'选择', difficulty:'中', stem:'关于二力平衡与相互作用力，错误的是？', options:['平衡力作用在同一物体','相互作用力作用在不同物体','平衡力大小相等方向相反','相互作用力可以作用在同一物体'], answer:'相互作用力可以作用在同一物体', analysis:'相互作用力(作用力与反作用力)一定作用在两个不同物体上。' },

    // 数学
    { id:'q-m1', subject:'数学', pointId:'math-02', type:'计算', difficulty:'中', stem:'解方程 2x - 5 = 3x + 1，x = ?', options:['-6','6','-4','4'], answer:'-6', analysis:'移项：2x-3x=1+5 → -x=6 → x=-6。' },
    { id:'q-m2', subject:'数学', pointId:'math-03', type:'计算', difficulty:'中', stem:'直角三角形两直角边为 3 和 4，斜边为？', options:['5','6','7','25'], answer:'5', analysis:'c=√(3²+4²)=5。' },
    { id:'q-m3', subject:'数学', pointId:'math-09', type:'计算', difficulty:'中', stem:'方程 x² - 5x + 6 = 0 的根为？', options:['2,3','-2,-3','1,6','-1,-6'], answer:'2,3', analysis:'(x-2)(x-3)=0 → x=2 或 3。' },
    { id:'q-m4', subject:'数学', pointId:'math-04', type:'选择', difficulty:'中', stem:'一次函数 y = -2x + 3 的图象经过？', options:['一三四象限','一二四象限','一二三象限','二三四象限'], answer:'一二四象限', analysis:'k=-2<0 递减，b=3>0 交 y 轴正半轴，过一二四象限。' },
    { id:'q-m5', subject:'数学', pointId:'math-12', type:'计算', difficulty:'中', stem:'在 Rt△ 中，∠C=90°，sinA=3/5，则 cosA=？', options:['3/5','4/5','5/3','√1/5'], answer:'4/5', analysis:'sin²A+cos²A=1 → cosA=√(1-9/25)=4/5（锐角取正）。' },
    { id:'q-m6', subject:'数学', pointId:'math-13', type:'解答', difficulty:'高', stem:'二次函数 y = x² - 4x + 1 的顶点坐标为？', options:['(2,-3)','( -2,3)','(4,-3)','(2,3)'], answer:'(2,-3)', analysis:'配方：y=(x-2)²-3，顶点(2,-3)。' },
    { id:'q-m7', subject:'数学', pointId:'math-06', type:'计算', difficulty:'中', stem:'不等式 -2x > 6 的解集为？', options:['x > -3','x < -3','x > 3','x < 3'], answer:'x < -3', analysis:'两边除以 -2，不等号反向：x < -3。' },

    // 语文
    { id:'q-c1', subject:'语文', pointId:'chi-01', type:'默写', difficulty:'中', stem:'默写范仲淹《岳阳楼记》中表达旷达胸襟的句子：___，___。', answer:'不以物喜，不以己悲', analysis:'注意"己"非"已"；此为范仲淹旷达胸襟句。', subjective:true },
    { id:'q-c2', subject:'语文', pointId:'chi-02', type:'选择', difficulty:'中', stem:'下列加点字古今义不同的一项是？', options:['走送之(跑)','汤熨之所及(热水)','去国怀乡(离开)','率妻子邑人(老婆孩子)'], answer:'率妻子邑人(老婆孩子)', analysis:'"妻子"古义为妻与子，今义仅指配偶，古今差异明显；其余在文言中仍常见本义。', subjective:true },
    { id:'q-c3', subject:'语文', pointId:'chi-04', type:'阅读', difficulty:'中', stem:'记叙文中"开头设置悬念"的作用一般是？', options:['交代时间地点','吸引读者、推动情节','抒发作者情感','说明事物特征'], answer:'吸引读者、推动情节', analysis:'悬念用于激发阅读兴趣并推进情节发展。', subjective:true },
    { id:'q-c4', subject:'语文', pointId:'chi-10', type:'选择', difficulty:'中', stem:'下列句子没有语病的一项是？', options:['通过努力，使我进步','他基本上彻底完成了任务','我们要认真克服并随时发现缺点','他各级人民政府重视教育'], answer:'我们要认真克服并随时发现缺点', analysis:'A缺主语；B"基本"与"彻底"矛盾；C语序应为先发现后克服。', subjective:true },
    { id:'q-c5', subject:'语文', pointId:'chi-12', type:'鉴赏', difficulty:'中', stem:'"大漠孤烟直，长河落日圆"的画面与情感特点是？', answer:'苍茫雄浑、壮阔孤寂', analysis:'描绘了边塞大漠的雄浑景象，暗含诗人孤寂慷慨之情。', subjective:true },

    // 英语
    { id:'q-e1', subject:'英语', pointId:'eng-05', type:'选择', difficulty:'中', stem:'By the time we arrived, the train ___.', options:['left','has left','had left','leaves'], answer:'had left', analysis:'"by the time + 过去时"主句用过去完成时 had left。' },
    { id:'q-e2', subject:'英语', pointId:'eng-06', type:'填空', difficulty:'中', stem:'The book ___ (write) by Lu Xun is famous.', answer:'written', analysis:'过去分词 written 作后置定语，表被动。' },
    { id:'q-e3', subject:'英语', pointId:'eng-04', type:'选择', difficulty:'易', stem:'We should protect the ___ (environment / environmently).', options:['environment','environmently','environmental','environments'], answer:'environment', analysis:'protect 后接名词 environment（环境）。' },
    { id:'q-e4', subject:'英语', pointId:'eng-07', type:'选择', difficulty:'中', stem:'I like the book ___ you lent me.', options:['who','which','what','whom'], answer:'which', analysis:'定语从句先行词 book 指物，用 which/that。' },
    { id:'q-e5', subject:'英语', pointId:'eng-09', type:'阅读', difficulty:'中', stem:'What can we infer from the passage? (推断题应？)', answer:'依据原文合理推断，不主观臆断', analysis:'推断题必须基于文本线索，不能脱离原文。', subjective:true },
    { id:'q-e6', subject:'英语', pointId:'eng-10', type:'填空', difficulty:'中', stem:'He is a ___ (care) boy and seldom makes mistakes.', answer:'careful', analysis:'修饰名词 boy 用形容词 careful（细心的）。' }
  ];

  // ---------- 背诵篇目（按版本确权） ----------
  const SEED_RECITE = [
    // 语文（人教版必背古诗文，篇目名）
    { id:'r-c1', subject:'语文', version:'人教版', type:'古诗文', item:'《岳阳楼记》(范仲淹)', unit:'九年级上册', must:true },
    { id:'r-c2', subject:'语文', version:'人教版', type:'古诗文', item:'《醉翁亭记》(欧阳修)', unit:'九年级上册', must:true },
    { id:'r-c3', subject:'语文', version:'人教版', type:'古诗文', item:'《桃花源记》(陶渊明)', unit:'八年级下册', must:true },
    { id:'r-c4', subject:'语文', version:'人教版', type:'古诗文', item:'《出师表》(诸葛亮)', unit:'九年级下册', must:true },
    { id:'r-c5', subject:'语文', version:'人教版', type:'古诗文', item:'《水调歌头·明月几时有》(苏轼)', unit:'九年级上册', must:true },
    { id:'r-c6', subject:'语文', version:'人教版', type:'古诗文', item:'《行路难》(李白)', unit:'九年级上册', must:true },
    { id:'r-c7', subject:'语文', version:'人教版', type:'古诗文', item:'《酬乐天扬州初逢席上见赠》(刘禹锡)', unit:'九年级上册', must:true },
    { id:'r-c8', subject:'语文', version:'人教版', type:'古诗文', item:'《破阵子·为陈同甫赋壮词》(辛弃疾)', unit:'九年级下册', must:false },
    { id:'r-c9', subject:'语文', version:'人教版', type:'古诗文', item:'《过零丁洋》(文天祥)', unit:'九年级下册', must:false },
    // 英语（沪教版单元话题范文）
    { id:'r-e1', subject:'英语', version:'沪教版(牛津深圳版)', type:'范文', item:'My School Life (校园生活)', unit:'7A Unit 1-3', must:true },
    { id:'r-e2', subject:'英语', version:'沪教版(牛津深圳版)', type:'范文', item:'How to Keep Healthy (健康)', unit:'8A Unit 2', must:true },
    { id:'r-e3', subject:'英语', version:'沪教版(牛津深圳版)', type:'范文', item:'A Meaningful Trip (旅行)', unit:'8B Unit 1', must:true },
    { id:'r-e4', subject:'英语', version:'沪教版(牛津深圳版)', type:'范文', item:'My Dream Job (职业)', unit:'9A Unit 3', must:true },
    { id:'r-e5', subject:'英语', version:'沪教版(牛津深圳版)', type:'范文', item:'Environmental Protection (环保)', unit:'9B Unit 4', must:false },
    { id:'r-e6', subject:'英语', version:'沪教版(牛津深圳版)', type:'范文', item:'Technology and Life (科技)', unit:'9B Unit 2', must:false },
    // 物理（人教版实验步骤）
    { id:'r-p1', subject:'物理', version:'人教版', type:'实验', item:'探究凸透镜成像规律(步骤)', unit:'八上 透镜', must:true },
    { id:'r-p2', subject:'物理', version:'人教版', type:'实验', item:'测量固体/液体密度(步骤)', unit:'八上 质量密度', must:true },
    { id:'r-p3', subject:'物理', version:'人教版', type:'实验', item:'探究电流与电压/电阻关系(步骤)', unit:'九 欧姆定律', must:true },
    { id:'r-p4', subject:'物理', version:'人教版', type:'实验', item:'探究浮力大小(阿基米德原理)', unit:'八下 浮力', must:true },
    { id:'r-p5', subject:'物理', version:'人教版', type:'实验', item:'探究杠杆平衡条件(步骤)', unit:'八下 简单机械', must:false },
    // 数学（北师大版公式定理）
    { id:'r-m1', subject:'数学', version:'北师大版', type:'公式', item:'一元二次方程求根公式 x=(-b±√Δ)/2a', unit:'九上 一元二次方程', must:true },
    { id:'r-m2', subject:'数学', version:'北师大版', type:'公式', item:'二次函数顶点式 y=a(x-h)²+k', unit:'九下 二次函数', must:true },
    { id:'r-m3', subject:'数学', version:'北师大版', type:'公式', item:'勾股定理 a²+b²=c²', unit:'八上 勾股定理', must:true },
    { id:'r-m4', subject:'数学', version:'北师大版', type:'公式', item:'特殊平行四边形性质(矩/菱/正)', unit:'八下 平行四边形', must:true },
    { id:'r-m5', subject:'数学', version:'北师大版', type:'公式', item:'三角函数特殊角值(sin/cos/tan)', unit:'九下 锐角三角函数', must:true },
    { id:'r-m6', subject:'数学', version:'北师大版', type:'公式', item:'圆的垂径定理与切线性质', unit:'九下 圆', must:false }
  ];

  global.ZK_DATA = { SUBJECTS, FREQ, LEVELS, SEED_POINTS, SEED_QUESTIONS, SEED_RECITE };
})(window);
