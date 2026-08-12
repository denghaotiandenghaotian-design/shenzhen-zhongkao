/* ============================================================
 * 初中英语单词学习记忆板块（本地数据，无需联网/API）
 * 内容：中考考点核心词汇，按主题归类；每个词提供三种记忆方法——
 *   ① 词根词缀（root）  ② 联想记忆（assoc）  ③ 例句助记（sent）
 * 同时标注音标、词性、中文义与考频（高/中/低）。
 * 接口：getAll() / filterEng({theme,freq,q}) / THEMES
 * 说明：词根词缀以初中可理解的方式呈现，重在"有法可依、记得牢"；
 *       联想记忆为辅助趣味方法，例句均给出中英对照。
 * ========================================================== */
(function (global) {
  'use strict';

  const THEMES = ['高频动词与派生', '抽象名词派生', '形容词与副词', '易混多义词', '学校考试高频', '生活与健康', '自然与环境', '情感与交际'];

  // 字段：id, theme, w(单词), ph(音标), pos(词性), zh(中文义),
  //       freq(高/中/低), root(词根词缀), assoc(联想), sent(例句助记), note(拓展,可选)
  const WORDS = [
    /* —— 高频动词与派生 —— */
    { id: 'e01', theme: '高频动词与派生', w: 'unhappy', ph: '/ʌnˈhæpi/', pos: 'adj.', zh: '不高兴的；不幸福的', freq: '中',
      root: 'un-（不，相反）+ happy（高兴的）→ 不高兴的', assoc: '前缀 un- 是"否定专用户"，happy 前面加它立刻变反义，如 unfair 不公平、unusual 不寻常。', sent: 'She is unhappy because it rains. 因为下雨，她不高兴。', note: '反义 happy；同类 un- 词：unfair / unclear / unhealthy。' },
    { id: 'e02', theme: '高频动词与派生', w: 'disappear', ph: '/ˌdɪsəˈpɪə/', pos: 'v.', zh: '消失；不见了', freq: '中',
      root: 'dis-（相反/不）+ appear（出现）→ 不出现 = 消失', assoc: 'dis- 表示"否定、除去"，appear 是"出现"，合起来就是"不再出现"。', sent: 'The sun disappeared behind a cloud. 太阳消失在云后。', note: '反义 appear；同类 dis- 词：dislike / discover（覆盖）/ dishonest。' },
    { id: 'e03', theme: '高频动词与派生', w: 'retell', ph: '/ˌriːˈtel/', pos: 'v.', zh: '复述；重讲', freq: '低',
      root: 're-（再，重新）+ tell（告诉，讲）→ 再讲一遍 = 复述', assoc: 're- 是"重新"标志，return 回、review 复习、rewrite 重写，retell 就是把故事再讲一次。', sent: 'Please retell the story in English. 请用英语复述这个故事。' },
    { id: 'e04', theme: '高频动词与派生', w: 'impossible', ph: '/ɪmˈpɒsəbl/', pos: 'adj.', zh: '不可能的', freq: '中',
      root: 'im-（不，因 p 前用 im-）+ possible（可能的）→ 不可能的', assoc: 'im- 在 p/b/m 开头的词前代替 un-，如 impolite 不礼貌；possible 的反面就是 impossible。', sent: 'Nothing is impossible. 没有什么是不可能的。', note: '反义 possible；近义 unlucky 用 un-，possible 用 im-，记住"p 前用 im"。' },
    { id: 'e05', theme: '高频动词与派生', w: 'careful', ph: '/ˈkeəfl/', pos: 'adj.', zh: '小心的；仔细的', freq: '高',
      root: 'care（关心，在意）+ -ful（充满……的）→ 充满关心的 = 小心的', assoc: '后缀 -ful 是"充满"，helpful 乐于助人的、useful 有用的、careful 就是"充满小心的"。', sent: 'Be careful when you cross the road. 过马路要小心。', note: '反义 careless（粗心的）；副词 carefully。' },
    { id: 'e06', theme: '高频动词与派生', w: 'teacher', ph: '/ˈtiːtʃə/', pos: 'n.', zh: '教师；老师', freq: '高',
      root: 'teach（教）+ -er（做……的人）→ 教书的人 = 教师', assoc: '后缀 -er/-or 表"人"：worker 工人、reader 读者、teacher 老师。', sent: 'My teacher is very kind. 我的老师很和蔼。', note: '女教师也可说 teacher；"教"的动词 teach，过去式 taught。' },
    { id: 'e07', theme: '高频动词与派生', w: 'friendly', ph: '/ˈfrendli/', pos: 'adj.', zh: '友好的；亲切的', freq: '高',
      root: 'friend（朋友）+ -ly（形容词后缀）→ 像朋友一样的 = 友好的', assoc: '注意 friendly 虽以 -ly 结尾却是形容词；-ly 大多变副词，但 friendly / lovely / lonely 是形容词。', sent: 'They are friendly to us. 他们对我们很友好。', note: '副词是 in a friendly way；反义 unfriendly。' },

    /* —— 抽象名词派生 —— */
    { id: 'e08', theme: '抽象名词派生', w: 'agreement', ph: '/əˈɡriːmənt/', pos: 'n.', zh: '协议；同意', freq: '中',
      root: 'agree（同意）+ -ment（名词后缀）→ 同意（的事）= 协议', assoc: '名词后缀 -ment 很常见：development 发展、movement 运动、agreement 即"同意的产物"。', sent: 'We reached an agreement. 我们达成了一项协议。', note: '动词 agree；反义 disagreement。' },
    { id: 'e09', theme: '抽象名词派生', w: 'decision', ph: '/dɪˈsɪʒn/', pos: 'n.', zh: '决定；抉择', freq: '高',
      root: 'decide（决定）去 e + -sion（名词后缀）→ 决定', assoc: '以 -de 结尾的动词变名词常把 de 改成 sion：decide→decision，explode→explosion。', sent: 'He made a big decision. 他做了一个重大决定。', note: '动词 decide；短语 make a decision 做决定。' },
    { id: 'e10', theme: '抽象名词派生', w: 'invention', ph: '/ɪnˈvenʃn/', pos: 'n.', zh: '发明；发明物', freq: '中',
      root: 'invent（发明）+ -ion（名词后缀）→ 发明', assoc: '名词后缀 -ion：action 行动、question 问题、invention 就是"发明的东西"。', sent: 'The telephone is a great invention. 电话是一项伟大的发明。', note: '动词 invent；人 inventor 发明家。' },
    { id: 'e11', theme: '抽象名词派生', w: 'pollution', ph: '/pəˈluːʃn/', pos: 'n.', zh: '污染', freq: '高',
      root: 'pollute（污染）+ -tion（名词后缀）→ 污染', assoc: 'tion 与 sion 同是"名词后缀"，pollute 去 e 加 tion 成 pollution。', sent: 'Air pollution is a big problem. 空气污染是个大问题。', note: '动词 pollute；形容词 polluted 受污染的。' },
    { id: 'e12', theme: '抽象名词派生', w: 'environment', ph: '/ɪnˈvaɪrənmənt/', pos: 'n.', zh: '环境', freq: '高',
      root: 'environ（环绕，周围）+ -ment（名词后缀）→ 周围的事物 = 环境', assoc: 'en- 使、viron 周围，合起来"使处于周围"即环境；protect the environment 是高频搭配。', sent: 'We must protect the environment. 我们必须保护环境。', note: '常作不可数名词；形容词 environmental 环境的。' },
    { id: 'e13', theme: '抽象名词派生', w: 'government', ph: '/ˈɡʌvənmənt/', pos: 'n.', zh: '政府', freq: '中',
      root: 'govern（治理，统治）+ -ment（名词后缀）→ 治理者 = 政府', assoc: '动词 govern 治理，加 -ment 名词化；类似 parliament 议会。', sent: 'The government built a new park. 政府新建了一座公园。', note: '首字母常大写 the Government 指某国政府。' },
    { id: 'e14', theme: '抽象名词派生', w: 'information', ph: '/ˌɪnfəˈmeɪʃn/', pos: 'n.', zh: '信息；资料', freq: '高',
      root: 'inform（通知）+ -ation（名词后缀）→ 被通知的内容 = 信息', assoc: '名词后缀 -ation：education 教育、invitation 邀请、information 即"被通知到的东西"。', sent: 'This book gives useful information. 这本书提供有用的信息。', note: '不可数名词，不能说 an information，说 a piece of information。' },
    { id: 'e15', theme: '抽象名词派生', w: 'knowledge', ph: '/ˈnɒlɪdʒ/', pos: 'n.', zh: '知识；学问', freq: '高',
      root: 'know（知道）+ -ledge（名词后缀）→ 知道的东西 = 知识', assoc: '知识是没有"边缘"的——no（不）+ edge（边缘）→ 学无止境，knowledge 无边。', sent: 'Knowledge is power. 知识就是力量。', note: '不可数名词；形容词 knowledgeable 知识渊博的。' },

    /* —— 形容词与副词 —— */
    { id: 'e16', theme: '形容词与副词', w: 'quickly', ph: '/ˈkwɪkli/', pos: 'adv.', zh: '快速地；迅速地', freq: '高',
      root: 'quick（快的）+ -ly（副词后缀）→ 快地', assoc: '形容词加 -ly 变副词是铁律：slow→slowly、careful→carefully、quick→quickly。', sent: 'He ran quickly to school. 他飞快地跑向学校。', note: '形容词 quick；注意以 y 结尾变 ily：easy→easily。' },
    { id: 'e17', theme: '形容词与副词', w: 'wonderful', ph: '/ˈwʌndəfl/', pos: 'adj.', zh: '精彩的；极好的', freq: '中',
      root: 'wonder（惊奇，奇迹）+ -ful（充满……的）→ 充满奇迹的 = 精彩的', assoc: 'wonder 是"惊叹"，-ful"充满"，wonderful 就是"满满惊喜"。', sent: 'We had a wonderful time. 我们玩得精彩极了。', note: '近义 great / excellent；名词 wonder 奇迹。' },
    { id: 'e18', theme: '形容词与副词', w: 'comfortable', ph: '/ˈkʌmftəbl/', pos: 'adj.', zh: '舒适的；舒服的', freq: '中',
      root: 'comfort（舒适，安慰）+ -able（能……的）→ 能让人舒适的 = 舒适的', assoc: '后缀 -able"能……的"：readable 可读的、usable 可用的、comfortable 即"能让人舒服的"。', sent: 'This chair is comfortable. 这把椅子很舒适。', note: '反义 uncomfortable；副词 comfortably。' },
    { id: 'e19', theme: '形容词与副词', w: 'international', ph: '/ˌɪntəˈnæʃnəl/', pos: 'adj.', zh: '国际的', freq: '中',
      root: 'inter-（在……之间）+ nation（国家）+ -al（……的）→ 国家之间的 = 国际的', assoc: 'inter- 表示"之间"：internet 网际网、interview 面谈；国与国之间就是 international。', sent: 'The World Cup is an international event. 世界杯是国际赛事。', note: 'nation 国家；national 国家的。' },
    { id: 'e20', theme: '形容词与副词', w: 'traditional', ph: '/trəˈdɪʃənl/', pos: 'adj.', zh: '传统的', freq: '中',
      root: 'tradition（传统）+ -al（……的）→ 传统的', assoc: '名词去尾加 -al 变形容词：person→personal 个人的、nation→national 国家的。', sent: 'Spring Festival is a traditional festival. 春节是传统节日。', note: '名词 tradition；副词 traditionally。' },
    { id: 'e21', theme: '形容词与副词', w: 'convenient', ph: '/kənˈviːniənt/', pos: 'adj.', zh: '方便的；便利的', freq: '中',
      root: 'con-（共同）+ veni（来）+ -ent（……的）→ 大家都能来（到达）的 = 方便的', assoc: 'veni 是"来"（visit 拜访同根），convenient 本义"容易到达"，引申方便。', sent: 'It is convenient to shop online. 网上购物很方便。', note: '名词 convenience；反义 inconvenient。' },
    { id: 'e22', theme: '形容词与副词', w: 'confident', ph: '/ˈkɒnfɪdənt/', pos: 'adj.', zh: '自信的；有把握的', freq: '中',
      root: 'con-（完全）+ fid（信任）+ -ent（……的）→ 完全信任自己的 = 自信的', assoc: 'fid 是"信任"：faith 信念同根；对自己有信心就是 confident。', sent: 'Be confident in yourself. 要对自己有信心。', note: '名词 confidence 信心；反义 unconfident。' },
    { id: 'e23', theme: '形容词与副词', w: 'necessary', ph: '/ˈnesəsəri/', pos: 'adj.', zh: '必要的；必需的', freq: '高',
      root: '来自动词 necessitate（使成为必要），构词较古；可用拆分记忆', assoc: '拆成 ne-ce-ssa-ry：想象"哪(né)厕(ce)所(ssa)里(ry)都要去——上厕所是必要的"，谐音助记拼写。', sent: 'Sleep is necessary for health. 睡眠对健康是必要的。', note: '易错拼写：一个 c、两个 s；名词 necessity。' },
    { id: 'e24', theme: '形容词与副词', w: 'sincerely', ph: '/sɪnˈsɪəli/', pos: 'adv.', zh: '真诚地', freq: '低',
      root: 'sincere（真诚的）+ -ly（副词后缀）→ 真诚地', assoc: '书信结尾 Yours sincerely（你真诚的）是高频率写作用语，记住整句就不会拼错。', sent: 'Yours sincerely,（书信结尾）你真诚的，……', note: '形容词 sincere；名词 sincerity 真诚。' },

    /* —— 易混多义词 —— */
    { id: 'e25', theme: '易混多义词', w: 'accept', ph: '/əkˈsept/', pos: 'v.', zh: '接受', freq: '高',
      root: 'ac-（去）+ cept（拿，取）→ 去拿 = 接受', assoc: 'cept 是"拿"：receive 收到同根；accept 强调主观"乐意接受"。', sent: 'I accept your gift. 我接受你的礼物。', note: '对比 except（除……之外）；received 侧重"收到"，accepted 侧重"接受"。' },
    { id: 'e26', theme: '易混多义词', w: 'except', ph: '/ɪkˈsept/', pos: 'prep.', zh: '除……之外', freq: '中',
      root: 'ex-（出）+ cept（拿）→ 拿出去 = 排除', assoc: 'ex- 出、cept 拿，把……拿出来就是"除了它"。', sent: 'Everyone came except Tom. 除汤姆外大家都来了。', note: '对比 accept（接受）；except 是介词，后接名词/代词。' },
    { id: 'e27', theme: '易混多义词', w: 'quiet', ph: '/ˈkwaɪət/', pos: 'adj.', zh: '安静的', freq: '高',
      root: '源自古法语 quiete（平静）；可用谐音拆分', assoc: 'qui(亏)+et(饿他)→"亏待他让他饿着"，他就安静不闹了，区分 quiet（安静）。', sent: 'Please keep quiet. 请保持安静。', note: '对比 quite（相当）；quiet 是形容词，quite 是副词。' },
    { id: 'e28', theme: '易混多义词', w: 'quite', ph: '/kwaɪt/', pos: 'adv.', zh: '相当；十分', freq: '高',
      root: '来自 quiet 的古义"平息、完全"；作副词"完全、相当"', assoc: 'qui(亏)+te(特)→"亏得特别"= 相当；注意它是副词，修饰形容词。', sent: 'It\'s quite cold today. 今天相当冷。', note: '对比 quiet（安静的，adj.）；quite a few 相当多。' },
    { id: 'e29', theme: '易混多义词', w: 'affect', ph: '/əˈfekt/', pos: 'v.', zh: '影响', freq: '高',
      root: 'af-（向）+ fect（做）→ 对……起作用 = 影响', assoc: 'fect 是"做"：effect 效果同根；affect 是动词"影响"，effect 是名词"效果"。', sent: 'Smoking affects your health. 吸烟影响你的健康。', note: '对比 effect（n. 效果）；"影响健康"用动词 affect。' },
    { id: 'e30', theme: '易混多义词', w: 'effect', ph: '/ɪˈfekt/', pos: 'n.', zh: '效果；影响', freq: '中',
      root: 'e-（出）+ fect（做）→ 做出来的结果 = 效果', assoc: 'fect"做"，effect 是"做出来的结果"；与 affect 同源但词性不同。', sent: 'The medicine had no effect. 这药没有效果。', note: '对比 affect（v. 影响）；have an effect on 对……有影响。' },
    { id: 'e31', theme: '易混多义词', w: 'borrow', ph: '/ˈbɒrəʊ/', pos: 'v.', zh: '借入', freq: '高',
      root: '源自古英语 borgian（担保借）；可用谐音', assoc: 'bor(伯)+row(肉)→"伯伯借肉"——从别人那里借进来，borrow 是"借入"。', sent: 'Can I borrow your pen? 我能借你的笔吗？', note: '对比 lend（借出）；borrow...from 向……借，lend...to 借给……。' },
    { id: 'e32', theme: '易混多义词', w: 'lend', ph: '/lend/', pos: 'v.', zh: '借出', freq: '中',
      root: '源自古英语 lænan（借出）；可用谐音', assoc: 'len(连)+d(弟)→"连弟都借出"——把东西给别人，lend 是"借出"。', sent: 'I lent him my bike. 我把自行车借给了他。', note: '对比 borrow（借入）；过去式 lent。' },
    { id: 'e33', theme: '易混多义词', w: 'hear', ph: '/hɪə/', pos: 'v.', zh: '听见（结果）', freq: '高',
      root: '源自古英语 hieran（听）；可用联想', assoc: 'h(喝)+ear(耳朵)→"喝东西时竖起耳朵"听，hear 强调"听到了"（结果）。', sent: 'I hear a song. 我听见一首歌。', note: '对比 listen（听，强调动作）；hear 过去式 heard。' },
    { id: 'e34', theme: '易混多义词', w: 'listen', ph: '/ˈlɪsn/', pos: 'v.', zh: '听（动作）', freq: '高',
      root: '来自古英语 hlysnan；可用联想', assoc: 'li(里)+sten(死等)→"在里面死等也要听"，listen 强调"去听"的动作。', sent: 'Listen to the teacher. 听老师讲。', note: '对比 hear（听见结果）；listen 不及物，后接 to。' },

    /* —— 学校考试高频 —— */
    { id: 'e35', theme: '学校考试高频', w: 'examine', ph: '/ɪɡˈzæmɪn/', pos: 'v.', zh: '检查；考试', freq: '中',
      root: 'ex-（出）+ amin（审查，称量）→ 仔细审查 = 检查/考核', assoc: '由 exam（考试）加 -ine 动词化；医生"检查"、老师"考核"都用它。', sent: 'The doctor examined the patient. 医生检查了病人。', note: '名词 examination 考试；exam 是缩写。' },
    { id: 'e36', theme: '学校考试高频', w: 'review', ph: '/rɪˈvjuː/', pos: 'v./n.', zh: '复习；回顾', freq: '高',
      root: 're-（再）+ view（看）→ 再看一遍 = 复习', assoc: 'view 是"看"，re- 是"重新"，复习就是"把功课再看一遍"。', sent: 'We should review lessons every day. 我们应每天复习功课。', note: '也可指"评论、回顾"；同根 interview 面试。' },
    { id: 'e37', theme: '学校考试高频', w: 'explain', ph: '/ɪkˈspleɪn/', pos: 'v.', zh: '解释；说明', freq: '高',
      root: 'ex-（出）+ plain（平，明白）→ 把话铺平讲清楚 = 解释', assoc: 'plain 是"平白、清楚"，explain 即"说清楚、讲明白"。', sent: 'Can you explain this word? 你能解释这个词吗？', note: '名词 explanation；explain sth. to sb. 向某人解释。' },
    { id: 'e38', theme: '学校考试高频', w: 'understand', ph: '/ˌʌndəˈstænd/', pos: 'v.', zh: '理解；懂', freq: '高',
      root: 'under-（在……下）+ stand（站）→ 站在下面体会 = 理解', assoc: 'stand 站、under 在下面，站在对方立场下体会就是"理解"。', sent: 'I don\'t understand this sentence. 我不理解这句话。', note: '过去式/过去分词 understood；名词 understanding。' },
    { id: 'e39', theme: '学校考试高频', w: 'mistake', ph: '/mɪˈsteɪk/', pos: 'n./v.', zh: '错误；弄错', freq: '高',
      root: 'mis-（错）+ take（拿）→ 拿错了 = 错误', assoc: 'mis- 表"错误"：misunderstand 误解、misspell 拼错；mistake 即"拿错"。', sent: 'It\'s a common mistake. 这是个常见错误。', note: 'make a mistake 犯错；过去式 mistook。' },
    { id: 'e40', theme: '学校考试高频', w: 'grammar', ph: '/ˈɡræmə/', pos: 'n.', zh: '语法', freq: '中',
      root: '来自希腊语 gramma（字母，书写）；可用谐音', assoc: 'gram(格)+mar(妈)→"格妈教语法"，把 grammar 想成"格+妈"就好记。', sent: 'English grammar is not easy. 英语语法不简单。', note: '形容词 grammatical 语法的。' },

    /* —— 生活与健康 —— */
    { id: 'e41', theme: '生活与健康', w: 'healthy', ph: '/ˈhelθi/', pos: 'adj.', zh: '健康的', freq: '高',
      root: 'health（健康）+ -y（形容词后缀）→ 健康的', assoc: '名词加 -y 变形容词：fun→funny、lucky→lucky、health→healthy。', sent: 'Eat more vegetables to keep healthy. 多吃蔬菜保持健康。', note: '名词 health；反义 unhealthy。' },
    { id: 'e42', theme: '生活与健康', w: 'disease', ph: '/dɪˈziːz/', pos: 'n.', zh: '疾病', freq: '中',
      root: 'dis-（不）+ ease（舒服，安逸）→ 不舒服 = 疾病', assoc: 'ease 是"安逸"，dis- 否定，disease 即"失去安逸——生病"。', sent: 'Washing hands prevents disease. 洗手能预防疾病。', note: '对比 illness（生病状态）；dis- 词：dislike 不喜欢。' },
    { id: 'e43', theme: '生活与健康', w: 'habit', ph: '/ˈhæbɪt/', pos: 'n.', zh: '习惯', freq: '中',
      root: '来自拉丁语 habere（拥有，保持）；可用谐音', assoc: 'ha(哈)+bit(一点)→"哈哈一点点"就成习惯，把 habit 想成"哈+比特"。', sent: 'Reading is a good habit. 阅读是个好习惯。', note: 'good/bad habit 好/坏习惯；form a habit 养成习惯。' },
    { id: 'e44', theme: '生活与健康', w: 'enough', ph: '/ɪˈnʌf/', pos: 'adj./adv.', zh: '足够的；足够地', freq: '高',
      root: '源自古英语 genōg（充足）；可用谐音', assoc: 'e(鹅)+nough(那夫)→"鹅给那夫的足够吃"，enough 即"足够"。', sent: 'We have enough food. 我们有足够的食物。', note: '注意位置：名前形后——enough food（形前），big enough（形/副后）。' },
    { id: 'e45', theme: '生活与健康', w: 'waste', ph: '/weɪst/', pos: 'v./n.', zh: '浪费；废物', freq: '中',
      root: '来自古法语 wast（空的，荒废的）；可用谐音', assoc: 'wa(哇)+ste(死特)→"哇，死特浪费"，waste 即"浪费"。', sent: 'Don\'t waste water. 别浪费水。', note: 'it\'s a waste of time 是浪费时间；反义 save 节约。' },

    /* —— 自然与环境 —— */
    { id: 'e46', theme: '自然与环境', w: 'weather', ph: '/ˈweðə/', pos: 'n.', zh: '天气', freq: '高',
      root: '源自古英语 weder（天气）；可用联想', assoc: 'wea(威)+ther(热)→"威热"就是天气；注意与 whether（是否）同音不同义。', sent: 'The weather is fine today. 今天天气晴朗。', note: '对比 whether（是否）；weather 不可数，前面无 a。' },
    { id: 'e47', theme: '自然与环境', w: 'whether', ph: '/ˈweðə/', pos: 'conj.', zh: '是否', freq: '中',
      root: '来自古英语 hwæther（哪一个）；与 weather 同音', assoc: 'whether 是"是否"，常接 or not；记住它是连词、拼写为 h-e-t-h-e-r。', sent: 'I don\'t know whether he will come. 我不知道他是否来。', note: '对比 weather（天气，n.）；whether...or not 是否。' },
    { id: 'e48', theme: '自然与环境', w: 'temperature', ph: '/ˈtemprətʃə/', pos: 'n.', zh: '温度；气温', freq: '中',
      root: 'temper（温度，脾气）+ -ature（名词后缀）→ 温度', assoc: 'temper 也有"冷热脾气"之意，-ature 表"状态"，合起来温度。', sent: 'The temperature dropped today. 今天气温降了。', note: 'take one\'s temperature 量体温；high/low temperature 高/低温。' },
    { id: 'e49', theme: '自然与环境', w: 'fresh', ph: '/freʃ/', pos: 'adj.', zh: '新鲜的；清新的', freq: '中',
      root: '来自古法语 fresche（新鲜）；可用谐音', assoc: 'fr(夫人)+esh(爱洗)→"夫人爱洗"所以东西 fresh（新鲜），联想清洁感。', sent: 'I like fresh air. 我喜欢清新的空气。', note: 'fresh water 淡水；fresh food 新鲜食物；反义 stale 不新鲜。' },
    { id: 'e50', theme: '自然与环境', w: 'nature', ph: '/ˈneɪtʃə/', pos: 'n.', zh: '自然；本性', freq: '中',
      root: 'nat（出生）+ -ure（名词后缀）→ 与生俱来的 = 自然/本性', assoc: 'nat 是"出生"：native 本地的、nation 民族同源；nature 即"天生如此"。', sent: 'We should protect nature. 我们应保护自然。', note: '形容词 natural 自然的；by nature 天生地。' },

    /* —— 情感与交际 —— */
    { id: 'e51', theme: '情感与交际', w: 'encourage', ph: '/ɪnˈkʌrɪdʒ/', pos: 'v.', zh: '鼓励', freq: '中',
      root: 'en-（使）+ courage（勇气）→ 使有勇气 = 鼓励', assoc: 'courage 是"勇气"，en- 使动，encourage 即"让人鼓起勇气"。', sent: 'My parents encourage me to study hard. 父母鼓励我努力学习。', note: '名词 encouragement；反义 discourage 使泄气。' },
    { id: 'e52', theme: '情感与交际', w: 'succeed', ph: '/səkˈsiːd/', pos: 'v.', zh: '成功', freq: '高',
      root: 'suc-（在……下）+ ceed（走，行）→ 走到底 = 成功', assoc: 'ceed 是"走"：proceed 前进同根；一路走到终点就是 succeed。', sent: 'If you work hard, you will succeed. 努力就会成功。', note: '名词 success；形容词 successful；反义 fail。' },
    { id: 'e53', theme: '情感与交际', w: 'promise', ph: '/ˈprɒmɪs/', pos: 'n./v.', zh: '承诺；答应', freq: '中',
      root: 'pro-（向前）+ mise（送，说）→ 向前说定 = 承诺', assoc: 'mise 与 message"话"同源；promise 即"把话往前送出、说定下来"。', sent: 'He promised to help me. 他答应帮我。', note: 'make a promise 许诺；keep one\'s promise 信守承诺。' },
    { id: 'e54', theme: '情感与交际', w: 'experience', ph: '/ɪkˈspɪəriəns/', pos: 'n.', zh: '经验；经历', freq: '高',
      root: 'ex-（出）+ peri（尝试，经历）+ -ence（名词后缀）→ 从尝试中得来 = 经验', assoc: 'peri 是"尝试"：experiment 实验同根；经验来自"试过"。', sent: 'She has much teaching experience. 她教学经验丰富。', note: '作"经历"可数，作"经验"不可数；动词 experience 经历。' },
    { id: 'e55', theme: '情感与交际', w: 'communicate', ph: '/kəˈmjuːnɪkeɪt/', pos: 'v.', zh: '交流；沟通', freq: '中',
      root: 'com-（共同）+ muni（公共，服务）+ -cate（动词后缀）→ 共同传达 = 交流', assoc: 'muni 是"公共"：community 社区同根；communicate 即"在共同空间里传话"。', sent: 'We communicate by email. 我们用邮件交流。', note: '名词 communication；with 表对象。' },
    { id: 'e56', theme: '情感与交际', w: 'believe', ph: '/bɪˈliːv/', pos: 'v.', zh: '相信；认为', freq: '高',
      root: 'be-（使）+ lie（谎言）+ -ve → 把谎言去除 = 相信（不骗）', assoc: '拆分 be-lieve：be(是)+lie(谎言)→"是谎言就不 believe（相信）"，用来区分拼写。', sent: 'I believe you. 我相信你。', note: 'believe in 信任；名词 belief 信念（ve 变 f）。' }
  ];

  function getAll() { return WORDS.slice(); }

  function filterEng(filter) {
    filter = filter || {};
    const q = (filter.q || '').trim().toLowerCase();
    return WORDS.filter(p => {
      if (filter.theme && p.theme !== filter.theme) return false;
      if (filter.freq && p.freq !== filter.freq) return false;
      if (q) {
        const hay = (p.w + ' ' + p.zh + ' ' + p.root + ' ' + p.assoc + ' ' + p.sent).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  global.ZK_ENGWORDS = { getAll: getAll, filterEng: filterEng, THEMES: THEMES };
})(window);
