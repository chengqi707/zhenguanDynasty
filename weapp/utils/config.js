// 凌烟阁密档 - 游戏配置 V3.0
// 与 Web 版本 config 对象保持同步

const config = {
  version: '3.2.0',
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
        changsun: { name: '长孙无忌', title: '外戚文官', emoji: '👔', portrait: '/images/portraits/changsun_wuji.jpg', abilityType: 'politics', abilityName: '政治' },
        yuchi:    { name: '尉迟敬德', title: '武将功臣', emoji: '⚔️', portrait: '/images/portraits/yuchi_jingde.jpg', abilityType: 'military', abilityName: '军事' },
        weizheng: { name: '魏征',     title: '谏臣清流', emoji: '📜', portrait: '/images/portraits/weizheng.jpg', abilityType: 'diplomacy', abilityName: '外交' },
        fangxuanling: { name: '房玄龄', title: '谋臣务实', emoji: '🏛️', portrait: '/images/portraits/fangxuanling.jpg', abilityType: 'strategy', abilityName: '谋略' }
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
        {
          id: 'taizong',
          name: '太宗',
          condition: (s) => s.stability >= 80 &&
            s.characters.changsun.favor >= 20 &&
            s.characters.yuchi.favor >= 20 &&
            s.characters.weizheng.favor >= 20 &&
            s.characters.fangxuanling.favor >= 20,
          summary: '你开创了一代盛世，君臣相得，四海升平。'
        },
        {
          id: 'wudi',
          name: '武帝',
          condition: (s) => s.characters.yuchi.power >= 80 && s.stability >= 40,
          summary: '你倚重武功，威震四方，但朝堂之上暗流涌动。'
        },
        {
          id: 'wenzong',
          name: '文宗',
          condition: (s) => s.characters.weizheng.power >= 80 && s.stability >= 40,
          summary: '你广开言路，重视文治，朝堂风气为之一新。'
        },
        {
          id: 'gaozong',
          name: '高宗',
          condition: (s) => s.characters.changsun.power >= 80 && s.stability >= 40,
          summary: '外戚势力渐大，你的皇权被逐步架空，沦为象征。'
        },
        {
          id: 'xuanzong',
          name: '宣宗',
          condition: (s) => s.characters.fangxuanling.power >= 80 && s.stability >= 40,
          summary: '你知人善任，制度严明，朝堂运转井然有序。'
        },
        {
          id: 'yang',
          name: '炀',
          condition: (s) => s.stability <= 0 ||
            Object.values(s.characters).some(c => c.favor <= -100),
          summary: '你众叛亲离，统治分崩离析，成为后人警示的反面教材。'
        },
        {
          id: 'zhongzong',
          name: '中宗',
          condition: () => true,
          summary: '你守住了祖宗基业，虽无赫赫之功，也算平稳度日。'
        }
      ],

  achievements: [
        // 谥号类
        { id: 'taizong_first', name: '千古一帝', desc: '首次获得「太宗」谥号', category: 'title', condition: (s, ach) => !ach.unlocked.includes('taizong_first') && s.titleId === 'taizong', rarity: 3, reward: 'avatarFrame_golden' },
        { id: 'yang_first', name: '乱世枭雄', desc: '首次获得「炀」谥号', category: 'title', condition: (s, ach) => !ach.unlocked.includes('yang_first') && s.titleId === 'yang', rarity: 2, reward: null },
        { id: 'zhongzong_first', name: '守成之君', desc: '首次获得「中宗」谥号', category: 'title', condition: (s, ach) => !ach.unlocked.includes('zhongzong_first') && s.titleId === 'zhongzong', rarity: 1, reward: null },
        { id: 'wudi_first', name: '武勋昭彰', desc: '首次获得「武帝」谥号', category: 'title', condition: (s, ach) => !ach.unlocked.includes('wudi_first') && s.titleId === 'wudi', rarity: 2, reward: null },
        { id: 'wenzong_first', name: '文治天下', desc: '首次获得「文宗」谥号', category: 'title', condition: (s, ach) => !ach.unlocked.includes('wenzong_first') && s.titleId === 'wenzong', rarity: 2, reward: null },
        { id: 'gaozong_first', name: '外戚之世', desc: '首次获得「高宗」谥号', category: 'title', condition: (s, ach) => !ach.unlocked.includes('gaozong_first') && s.titleId === 'gaozong', rarity: 2, reward: null },
        { id: 'xuanzong_first', name: '宣室之明', desc: '首次获得「宣宗」谥号', category: 'title', condition: (s, ach) => !ach.unlocked.includes('xuanzong_first') && s.titleId === 'xuanzong', rarity: 2, reward: null },
        // 难度类
        { id: 'hard_clear', name: '凌烟阁主', desc: '首次在 hard 难度通关（任意结局）', category: 'difficulty', condition: (s, ach) => !ach.unlocked.includes('hard_clear') && s.difficulty === 'hard' && s.day >= s.maxDay, rarity: 3, reward: 'permanent_stability_5' },
        { id: 'hard_taizong', name: '极限挑战', desc: '在 hard 难度获得「太宗」谥号', category: 'difficulty', condition: (s, ach) => !ach.unlocked.includes('hard_taizong') && s.difficulty === 'hard' && s.titleId === 'taizong', rarity: 4, reward: 'special_script' },
        // 收集类
        { id: 'shihou_collector', name: '谥号收藏家', desc: '收集全部 7 个谥号', category: 'collection', condition: (s, ach) => !ach.unlocked.includes('shihou_collector') && (ach.titlesSeen || []).length >= 7, rarity: 4, reward: 'free_mode' },
        { id: 'ending_collector', name: '结局通览', desc: '触发全部 6 种结局', category: 'collection', condition: (s, ach) => !ach.unlocked.includes('ending_collector') && (ach.endingsSeen || []).length >= 6, rarity: 3, reward: 'hidden_character_duruhui' },
        // 挑战类
        { id: 'weizheng_friend', name: '魏征之友', desc: '魏征好感度达到 100', category: 'challenge', condition: (s, ach) => !ach.unlocked.includes('weizheng_friend') && s.characters.weizheng.favor >= 100, rarity: 2, reward: null },
        { id: 'balance_master', name: '制衡大师', desc: '一局内四方好感度均 ≥ 0', category: 'challenge', condition: (s, ach) => !ach.unlocked.includes('balance_master') && Object.values(s.characters).every(c => c.favor >= 0), rarity: 3, reward: 'avatarFrame_balance' },
        { id: 'lonely_king', name: '孤家寡人', desc: '一局内四方好感度均 ≤ -50', category: 'challenge', condition: (s, ach) => !ach.unlocked.includes('lonely_king') && Object.values(s.characters).every(c => c.favor <= -50), rarity: 2, reward: null },
        { id: 'turkic_conqueror', name: '突厥征服者', desc: '决战突厥获得「大捷」', category: 'challenge', condition: (s, ach) => !ach.unlocked.includes('turkic_conqueror') && s.challengeResults && s.challengeResults.turkic_war === 'great', rarity: 2, reward: null },
        { id: 'prince_guardian', name: '储位守护者', desc: '储位暗涌获得「朝局稳定」', category: 'challenge', condition: (s, ach) => !ach.unlocked.includes('prince_guardian') && s.challengeResults && s.challengeResults.prince_struggle === 'stable', rarity: 2, reward: null },
        { id: 'zhenguan_legacy', name: '贞观遗风', desc: '凌烟阁终评获得「贞观遗风」', category: 'challenge', condition: (s, ach) => !ach.unlocked.includes('zhenguan_legacy') && s.challengeResults && s.challengeResults.final_review === 'legend', rarity: 3, reward: 'bgm_lingyange' },
        // 行为类
        { id: 'diligent_ruler', name: '勤政爱民', desc: '累计 5 天选择「批阅奏折」', category: 'behavior', condition: (s, ach) => !ach.unlocked.includes('diligent_ruler') && (s.achievementStats ? s.achievementStats.totalSkipNight : 0) >= 5, rarity: 1, reward: null },
        { id: 'banquet_king', name: '宴饮无度', desc: '累计举办 10 次宴会', category: 'behavior', condition: (s, ach) => !ach.unlocked.includes('banquet_king') && (s.achievementStats ? s.achievementStats.totalBanquet : 0) >= 10, rarity: 1, reward: null },
        { id: 'cultivate_heart', name: '栽培之心', desc: '累计栽培大臣 20 次', category: 'behavior', condition: (s, ach) => !ach.unlocked.includes('cultivate_heart') && (s.achievementStats ? s.achievementStats.totalCultivate : 0) >= 20, rarity: 1, reward: null },
        // V3.0 周目类（周目数据由 checkAchievements 通过 ach.newgamePlus 传入，config 保持纯数据）
        { id: 'five_cycles', name: '五世其昌', desc: '累计通关 5 周目', category: 'challenge', condition: (s, ach) => !ach.unlocked.includes('five_cycles') && !!(ach.newgamePlus && ach.newgamePlus.cycleCount >= 5), rarity: 3, reward: null },
        { id: 'ten_cycles', name: '十朝元老', desc: '累计通关 10 周目', category: 'challenge', condition: (s, ach) => !ach.unlocked.includes('ten_cycles') && !!(ach.newgamePlus && ach.newgamePlus.cycleCount >= 10), rarity: 4, reward: null },
        { id: 'versatile_monarch', name: '百变君主', desc: '用全部 4 个剧本各通关 1 次', category: 'challenge', condition: (s, ach) => !ach.unlocked.includes('versatile_monarch') && (() => { const ng = ach.newgamePlus; if (!ng || !ng.scripts) return false; return ['xuanwumen','turkic_defeated','golden_age','crisis'].every(k => ng.scripts[k] && ng.scripts[k].clearedCount > 0); })(), rarity: 5, reward: null }
      ],

  harem: {
    empress: { name: '长孙皇后', title: '母仪天下', emoji: '👑', portrait: '/images/portraits/empress.jpg' },
    wushi: { name: '武氏', title: '才人', emoji: '🌸', portrait: '/images/portraits/wushi.jpg' },
    yangfei: { name: '杨妃', title: '贵妃', emoji: '🌺', portrait: '/images/portraits/yangfei.jpg' }
  },

  // V3.0 剧本系统
  scripts: {
    default: { id: 'default', name: '默认开局', desc: '标准贞观初年开局', price: 0, locked: false },
    xuanwumen: { id: 'xuanwumen', name: '玄武门余波', desc: '从夺嫡余波中开始，皇权不稳，需更快建立威信', price: 0, locked: true, unlockCondition: '通关 1 周目' },
    turkic_defeated: { id: 'turkic_defeated', name: '突厥已破', desc: '突厥已被击败，但朝堂暗流涌动，文官势力膨胀', price: 0, locked: true, unlockCondition: '决战突厥大捷' },
    golden_age: { id: 'golden_age', name: '盛世序章', desc: '解锁「太宗」谥号后可用，初始稳定度+10', price: 6, locked: true, unlockCondition: '获得「太宗」谥号' },
    crisis: { id: 'crisis', name: '危机四伏', desc: '解锁「炀」谥号后可用，极限挑战模式', price: 0, locked: true, unlockCondition: '获得「炀」谥号' }
  },

  // V3.0 名臣卡系统
  nameCards: {
    duruhui: { id: 'duruhui', name: '杜如晦', title: '房谋杜断', emoji: '📋', abilityType: 'strategy', abilityName: '谋略', desc: '初始能力+10，谋略类事件额外收益', price: 3 },
    lijing: { id: 'lijing', name: '李靖', title: '大唐军神', emoji: '🏹', abilityType: 'military', abilityName: '军事', desc: '军事类事件额外收益，武将好感度+10', price: 3 },
    chusuliang: { id: 'chusuliang', name: '褚遂良', title: '书法大家', emoji: '✒️', abilityType: 'politics', abilityName: '政治', desc: '政治类事件额外收益，文官好感度+10', price: 3 }
  },

  haremEvents: [
        {
          id: 101, stage: 'early', title: '皇后劝谏',
          desc: '长孙皇后以「牝鸡司晨」为由劝你平衡朝臣，不可偏废。',
          options: [
            { text: '接受劝谏，平衡各方', effects: { changsun: 5, yuchi: 5, weizheng: 5, fangxuanling: 5, harem: { empress: { favor: 10, influence: 5 } } }, feedback: '皇后欣慰，朝臣亦感圣意公允。' },
            { text: '拒绝，朕自有主张', effects: { changsun: -5, weizheng: -5, harem: { empress: { favor: -10 } } }, feedback: '皇后默然退下，朝臣暗生疑虑。' }
          ]
        },
        {
          id: 102, stage: 'early', title: '武氏献媚',
          desc: '武氏在御花园「偶遇」你，献诗一首，暗表仰慕。',
          options: [
            { text: '宠幸武氏，赐珠宝', effects: { harem: { wushi: { favor: 20 } }, weizheng: -15 }, feedback: '武氏得宠，魏征上书谏止「女色误国」。' },
            { text: '拒绝，朕不喜谄媚', effects: { harem: { wushi: { ambition: 10 } }, weizheng: 5 }, feedback: '武氏低头退下，眼中闪过不甘。' }
          ]
        },
        {
          id: 103, stage: 'early', title: '杨妃请安',
          desc: '杨妃前来请安，提及旧族近日困顿，似有求于你。',
          options: [
            { text: '关怀备至，赐她兄长官职', effects: { harem: { yangfei: { favor: 15, influence: 5 } }, changsun: -5 }, feedback: '杨妃感激涕零，旧族势力有所抬头。' },
            { text: '冷落敷衍，让她退下', effects: { harem: { yangfei: { favor: -10 } } }, feedback: '杨妃黯然离去，旧族对你更加疏远。' }
          ]
        },
        {
          id: 104, stage: 'middle', title: '后宫争宠',
          desc: '武氏与杨妃在御花园发生冲突，互相指责对方「狐媚惑主」。',
          options: [
            { text: '偏袒武氏', effects: { harem: { wushi: { favor: 15 }, yangfei: { favor: -10, ambition: 5 } } }, feedback: '武氏得意洋洋，杨妃含恨退下。' },
            { text: '偏袒杨妃', effects: { harem: { yangfei: { favor: 15 }, wushi: { favor: -10, ambition: 10 } } }, feedback: '杨妃展颜，武氏眼中寒光一闪。' },
            { text: '请皇后出面调和', effects: { harem: { empress: { favor: 5, influence: 5 }, wushi: { favor: 5 }, yangfei: { favor: 5 } } }, feedback: '皇后温言劝解，二人暂时偃旗息鼓。' }
          ]
        },
        {
          id: 105, stage: 'middle', title: '皇后病重',
          desc: '长孙皇后突染风寒，卧床不起。太医说需静养，但皇后仍惦记朝堂。',
          options: [
            { text: '每日探望，暂缓朝政', effects: { harem: { empress: { favor: 20 } }, changsun: 3, yuchi: 3, weizheng: 3, fangxuanling: 3, stability: 5 }, feedback: '皇后感动不已，朝臣皆赞你情深义重。' },
            { text: '遣人送药，不亲自探望', effects: { harem: { empress: { favor: -20 } }, stability: -10 }, feedback: '皇后病情恶化，朝堂人心浮动。' }
          ]
        },
        {
          id: 106, stage: 'middle', title: '武氏干政试探',
          desc: '武氏借替你整理奏折之机，对朝政发表见解，暗示可为你分忧。',
          options: [
            { text: '默许，让她继续参与', effects: { harem: { wushi: { ambition: 20, influence: 10 } }, weizheng: -20 }, feedback: '武氏眼中光芒大盛，魏征旧部忧心忡忡。' },
            { text: '严词制止，后宫不得干政', effects: { harem: { wushi: { favor: -15 } }, weizheng: 10 }, feedback: '武氏低头认错，但野心未减。' }
          ]
        },
        {
          id: 107, stage: 'late', title: '皇后去世',
          desc: '长孙皇后病情急转直下，撒手人寰。临终前紧握你的手，请求善待长孙无忌但勿过度重用。',
          prerequisite: (s) => s.day >= 11 && !s.haremDeceased?.empress,
          options: [
            { text: '痛哭失声，辍朝三日', effects: { changsun: 10, weizheng: 5, fangxuanling: 5, stability: -10, harem: { empress: { favor: -100 } } }, feedback: '朝野同悲，但国事堆积，人心惶惶。' },
            { text: '强忍悲痛，照常理政', effects: { changsun: -5, weizheng: 10, fangxuanling: 10, stability: 5, harem: { empress: { favor: -100 } } }, feedback: '朝臣敬佩你的坚毅，但长孙无忌心生怨怼。' }
          ]
        },
        {
          id: 108, stage: 'late', title: '武氏野心膨胀',
          desc: '武氏野心日盛，多次请求参与朝政议事。朝中已有大臣暗中依附于她。',
          prerequisite: (s) => s.harem?.wushi?.ambition >= 60 && s.haremDeceased?.empress,
          options: [
            { text: '允许她参与朝政', effects: { harem: { wushi: { influence: 20, favor: 10 } }, weizheng: -15, changsun: -10, stability: -10 }, feedback: '武氏正式踏入朝堂，开启「后宫干政」线。' },
            { text: '拒绝，警告她安守本分', effects: { harem: { wushi: { favor: -20, ambition: 10 } }, weizheng: 10 }, feedback: '武氏表面顺从，暗中更加紧布局。' }
          ]
        },
        {
          id: 109, stage: 'late', title: '杨妃旧族联络',
          desc: '杨妃请求你为旧族子弟安排要职，称此乃「不忘根本」。',
          options: [
            { text: '允准，安排旧族子弟入仕', effects: { harem: { yangfei: { favor: 15, influence: 10 } }, changsun: -10 }, feedback: '杨妃喜形于色，旧族势力再度抬头。' },
            { text: '拒绝，唯才是举', effects: { harem: { yangfei: { favor: -10 } }, weizheng: 10, changsun: 5 }, feedback: '杨妃失望，旧族对你更加疏远。' }
          ]
        },
        {
          id: 110, stage: 'late', title: '立后之争',
          desc: '长孙皇后去世已久，后宫无主。武氏与杨妃各自拉拢朝臣，争立后位。',
          prerequisite: (s) => s.haremDeceased?.empress,
          options: [
            { text: '立武氏为后', effects: { harem: { wushi: { favor: 30, influence: 20, ambition: 10 }, yangfei: { favor: -20 } }, weizheng: -20, changsun: -15, stability: -10 }, feedback: '武氏登上后位，权倾后宫，朝臣震恐。' },
            { text: '立杨妃为后', effects: { harem: { yangfei: { favor: 30, influence: 20 }, wushi: { favor: -20, ambition: 15 } }, changsun: -10 }, feedback: '杨妃为后，旧族势力大增，武氏暗藏恨意。' },
            { text: '暂不立后，维持现状', effects: { harem: { wushi: { favor: -10 }, yangfei: { favor: -10 } }, weizheng: 10, stability: 5 }, feedback: '后宫之争暂息，但隐患未除。' }
          ]
        }
      ],

}; // end config

// 事件库
config.events = require('./events.js');

// 阶段挑战配置
config.stageChallenges = require('./challenges.js');

module.exports = config;