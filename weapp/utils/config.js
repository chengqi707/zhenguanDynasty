// 凌烟阁密档 - 游戏配置
// 与 Web 版本 config 对象保持同步

const config = {
  version: '1.2.2',
  maxDay: 15,
  eventsPerDay: 3,
  meetCooldown: 3,
  banquetCost: 10,
  meetFavor: 15,
  meetPenalty: 5,
  banquetFavor: 5,
  adMeetFavor: 15,
  stabilityInitial: 50,
  powerInitial: 30,

  difficulties: {
    easy:   { id: 'easy',   name: '太宗之路', desc: '初始稳定度高，大臣更宽容，适合熟悉机制', stabilityInitial: 70, eventMultiplier: 0.8,  endingThreshold: 60, aiTolerance: 2 },
    normal: { id: 'normal', name: '贞观之治', desc: '平衡的挑战，默认体验',                     stabilityInitial: 50, eventMultiplier: 1.0,  endingThreshold: 80, aiTolerance: 1 },
    hard:   { id: 'hard',   name: '凌烟阁主', desc: '初始稳定度低，大臣更敏感，追求极限',       stabilityInitial: 30, eventMultiplier: 1.3,  endingThreshold: 90, aiTolerance: 0 }
  },

  characters: {
    changsun: { name: '长孙无忌', title: '外戚文官', emoji: '👔', abilityType: 'politics', abilityName: '政治' },
    yuchi:    { name: '尉迟敬德', title: '武将功臣', emoji: '⚔️', abilityType: 'military', abilityName: '军事' },
    weizheng: { name: '魏征',     title: '谏臣清流', emoji: '📜', abilityType: 'diplomacy', abilityName: '外交' },
    fangxuanling: { name: '房玄龄', title: '谋臣务实', emoji: '🏛️', abilityType: 'strategy', abilityName: '谋略' }
  },

  stages: [
    { id: 'early',  name: '贞观初年', years: '627-629', startDay: 1,  endDay: 5,  color: '#4a90d9' },
    { id: 'middle', name: '贞观中期', years: '630-639', startDay: 6,  endDay: 10, color: '#2e7d32' },
    { id: 'late',   name: '贞观晚年', years: '640-649', startDay: 11, endDay: 15, color: '#b22222' }
  ],

  storylines: {
    reform:    { name: '制度改革', color: '#c9a227' },
    turkic:    { name: '突厥战争', color: '#b22222' },
    prince:    { name: '太子储位', color: '#4a90d9' },
    weizheng:  { name: '魏征直谏', color: '#2e7d32' },
    harem:     { name: '后宫暗流', color: '#8e44ad' }
  },

  posthumousTitles: [
    { id: 'taizong',    name: '太宗', condition: (s) => s.stability >= 80 && Object.values(s.characters).every(c => c.favor >= 20), summary: '开创盛世的贤君' },
    { id: 'wudi',       name: '武帝', condition: (s) => s.characters.yuchi.power >= 80 && s.stability >= 40, summary: '武功赫赫但朝堂暗流涌动' },
    { id: 'wenzong',    name: '文宗', condition: (s) => s.characters.weizheng.power >= 80 && s.stability >= 40, summary: '善于纳谏、重视文治' },
    { id: 'gaozong',    name: '高宗', condition: (s) => s.characters.changsun.power >= 80 && s.stability >= 40, summary: '外戚势大，皇权旁落' },
    { id: 'xuanzong',   name: '宣宗', condition: (s) => s.characters.fangxuanling.power >= 80 && s.stability >= 40, summary: '知人善任，制度严明' },
    { id: 'yang',       name: '炀',   condition: (s) => s.stability <= 0 || Object.values(s.characters).some(c => c.favor <= -100), summary: '众叛亲离、统治失败' },
    { id: 'zhongzong',  name: '中宗', condition: () => true, summary: '守成之君，无功无过' }
  ]
};

// 事件库（精简版，完整版从 Web 版本同步）
config.events = require('./events.js');

// 阶段挑战配置
config.stageChallenges = require('./challenges.js');

module.exports = config;
