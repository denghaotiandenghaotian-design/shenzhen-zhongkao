/* ============================================================
 * 名师专栏 — 全网名师资源索引（无后端，链接均为公开、权威来源）
 * 设计：① 官方/权威平台入口；② 按学科 + 主题生成「全网搜」外链（B站/智慧教育平台），
 *       点击即在对应平台检索该主题名师讲解，实现"名师讲题"的检索与分类筛选。
 * 说明：本应用不托管任何音视频，仅做合规的"资源索引 + 全网检索入口"，链接指向官方/公开平台。
 * TEACHERS: [{id, teacher, org, subject, topic, format, platform, url, desc, tags, level}]
 * ========================================================== */
(function (global) {
  'use strict';

  const SUBJECTS = ['语文', '数学', '英语', '物理'];

  // —— 官方 / 权威平台入口（稳定、免费、合规）——
  const PLATFORMS = [
    { id: 'pf-zxx', teacher: '国家中小学智慧教育平台·名师微课', org: '教育部', subject: '全科', topic: '同步课程 / 中考专项', format: '视频', platform: '国家中小学智慧教育平台', url: 'https://basic.smartedu.cn/', desc: '教育部官方平台，收录各地骨干教师 15–25 分钟精品微课，覆盖初中全科与中考专项、虚拟实验，支持倍速/离线。', tags: ['官方', '免费', '名师微课', '全科'], level: '官方' },
    { id: 'pf-eduyun', teacher: '国家教育资源公共服务平台·一师一优课', org: '教育部教育技术与资源发展中心', subject: '全科', topic: '优质公开课 / 教学设计', format: '视频', platform: '国家教育资源公共服务平台', url: 'https://www.eduyun.cn/', desc: '"一师一优课"优质课例宝库，同一知识点可看多位名师不同讲法；课件/教案/习题可免费下载。', tags: ['官方', '免费', '公开课', '全科'], level: '官方' },
    { id: 'pf-bili', teacher: '哔哩哔哩·深圳中考学习区', org: '公开创作者', subject: '全科', topic: '中考专题讲解', format: '视频', platform: '哔哩哔哩(B站)', url: 'https://search.bilibili.com/all?keyword=' + encodeURIComponent('深圳中考 名师讲解'), desc: '海量一线教师/毕业班名师上传的中考专题讲解、压轴题拆解、实验演示，可免费观看。', tags: ['公开', '免费', '视频', '全科'], level: '公开' }
  ];

  // —— 学科主题 "全网搜" 入口（按学科×主题生成平台检索链接）——
  const TOPICS = {
    '物理': [
      ['凸透镜成像规律', '实验探究'],
      ['压强与浮力计算', '计算解题'],
      ['欧姆定律与电功率', '电路分析'],
      ['机械运动与速度', '易错辨析'],
      ['杠杆与机械效率', '综合计算']
    ],
    '数学': [
      ['二次函数最值与压轴', '压轴突破'],
      ['圆与切线证明', '几何综合'],
      ['锐角三角函数', '解直角三角形'],
      ['一元二次方程应用', '方程建模'],
      ['特殊平行四边形', '性质判定']
    ],
    '语文': [
      ['古诗文默写与鉴赏', '背诵积累'],
      ['记叙文阅读作用题', '阅读技法'],
      ['议论文说明文阅读', '文体阅读'],
      ['中考作文审题立意', '写作提升'],
      ['文言文实词虚词', '文言基础']
    ],
    '英语': [
      ['时态与被动语态', '语法精讲'],
      ['完形填空语境推理', '阅读技法'],
      ['书面表达高分句型', '写作提升'],
      ['听说考试训练', '听说冲刺'],
      ['阅读理解推断题', '阅读技法']
    ]
  };

  function buildTopicEntries() {
    const list = [];
    SUBJECTS.forEach(sub => {
      (TOPICS[sub] || []).forEach(([topic, tag], i) => {
        const kw = '深圳中考 ' + sub + ' ' + topic;
        list.push({
          id: 'tk-' + sub + '-' + i,
          teacher: sub + '·' + topic + ' 名师讲解',
          org: '全网检索',
          subject: sub,
          topic: topic + '（' + tag + '）',
          format: '视频',
          platform: '哔哩哔哩(B站)',
          url: 'https://search.bilibili.com/all?keyword=' + encodeURIComponent(kw),
          desc: '在 B站 检索「' + kw + '」，聚合多位名师的专题讲解与典型题拆解，可按播放量/最新筛选。',
          tags: ['全网搜', '视频', tag],
          level: '公开'
        });
        // 智慧教育平台检索入口（图文/视频混合）
        list.push({
          id: 'tkz-' + sub + '-' + i,
          teacher: sub + '·' + topic + ' 同步课',
          org: '教育部',
          subject: sub,
          topic: topic + '（' + tag + '）',
          format: '图文',
          platform: '国家中小学智慧教育平台',
          url: 'https://basic.smartedu.cn/syncClass?keyword=' + encodeURIComponent(sub + ' ' + topic),
          desc: '在智慧教育平台检索该主题同步课与学习任务单，官方名师微课+课后练习。',
          tags: ['官方', '图文', tag],
          level: '官方'
        });
      });
    });
    return list;
  }

  const ALL = PLATFORMS.concat(buildTopicEntries());

  function searchTeachers(q, filter) {
    q = (q || '').trim().toLowerCase();
    filter = filter || {};
    return ALL.filter(t => {
      if (filter.subject && filter.subject !== '全科' && t.subject !== filter.subject) return false;
      if (filter.format && t.format !== filter.format) return false;
      if (filter.level && t.level !== filter.level) return false;
      if (q) {
        const hay = (t.teacher + t.topic + t.platform + t.desc + t.tags.join('')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  global.ZK_TEACHERS = { TEACHERS: ALL, SUBJECTS, searchTeachers };
})(window);
