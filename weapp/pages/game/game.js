const app = getApp();
const config = require('../../utils/config.js');
const saveManager = require('../../utils/saveManager.js');
const adManager = require('../../utils/adManager.js');
const analytics = require('../../utils/analytics.js');
const share = require('../../utils/share.js');

Page({
  data: {
    config,
    gameState: null,
    currentEvent: null,
    currentStage: {},
    currentYear: '',
    difficultyName: '',
    characterList: [],
    showNight: false,
    showMeetMenu: false,
    meetOptions: [],
    showChallenge: false,
    challengeTitle: '',
    challengeIntro: '',
    challengeSteps: [],
    challengeStep: -1,
    challengeResult: null,
    challengeScore: 0,
    challengeIsFinal: false,
    showEnding: false,
    ending: {},
    posthumousTitle: {},
    summary: '',
    showSettingsModal: false,
    showCrisis: false,
    soundEnabled: true,
    bgmEnabled: false,
    noAds: false,
    saveSlots: []
  },

  onLoad(options) {
    this.setData({
      soundEnabled: app.globalData.soundEnabled,
      bgmEnabled: app.globalData.bgmEnabled,
      noAds: app.globalData.noAds
    });

    if (options.new === '1' && options.difficulty) {
      this.startNewGame(options.difficulty);
    } else if (options.continue === '1') {
      this.continueGame();
    } else if (options.seed) {
      this.startFromSeed(options.seed);
    } else {
      // 默认检查是否有存档
      const save = saveManager.loadGame();
      if (save) {
        this.continueGame();
      } else {
        wx.redirectTo({ url: '/pages/index/index' });
      }
    }
  },

  onShow() {
    if (this.data.gameState) {
      this.renderAll();
    }
  },

  onShareAppMessage() {
    const seed = this.data.gameState ? share.generateShareSeed(this.data.gameState) : '';
    return {
      title: share.getShareTitle(this.data.ending.name, this.data.posthumousTitle.name),
      path: share.getSharePath(seed),
      imageUrl: share.getShareImageUrl()
    };
  },

  // ========== 游戏初始化 ==========
  startNewGame(difficulty) {
    const state = this.createInitialState(difficulty);
    state.currentEvents = this.randomEvents(config.eventsPerDay);
    this.setData({ gameState: state });
    saveManager.saveGame(state);
    analytics.logGameStart(difficulty, 'new');
    this.renderAll();
  },

  continueGame() {
    const save = saveManager.loadGame();
    if (!save) {
      wx.showToast({ title: '无存档', icon: 'none' });
      return;
    }
    this.setData({ gameState: save });
    this.renderAll();
  },

  startFromSeed(seedStr) {
    const seed = share.parseShareSeed(seedStr);
    if (!seed) {
      wx.showToast({ title: '种子无效', icon: 'none' });
      return;
    }
    // 基于种子创建挑战局
    const state = this.createInitialState(seed.diff);
    state.triggeredEvents = seed.te || [];
    // 恢复数值
    state.stability = seed.s || state.stability;
    (seed.c || []).forEach(charData => {
      if (state.characters[charData.k]) {
        state.characters[charData.k].favor = charData.f || 0;
        state.characters[charData.k].power = charData.p || 30;
        state.characters[charData.k].ability = charData.a || 30;
      }
    });
    state.currentEvents = this.randomEvents(config.eventsPerDay);
    this.setData({ gameState: state });
    saveManager.saveGame(state);
    analytics.logGameStart(seed.diff, 'seed');
    this.renderAll();
  },

  createInitialState(difficultyId = 'normal') {
    const diff = config.difficulties[difficultyId] || config.difficulties.normal;
    const state = {
      day: 1,
      maxDay: config.maxDay,
      difficulty: difficultyId,
      stability: diff.stabilityInitial,
      eventIndex: 0,
      currentEvents: [],
      triggeredEvents: [],
      deceased: {},
      completedChallenges: {},
      challengeResults: {},
      lastMeetDay: {},
      adUsedToday: false,
      history: [],
      characters: {}
    };
    Object.keys(config.characters).forEach(key => {
      state.lastMeetDay[key] = -99;
      state.characters[key] = {
        ...config.characters[key],
        favor: 0,
        power: config.powerInitial,
        ability: config.powerInitial
      };
    });
    return state;
  },

  // ========== 渲染 ==========
  renderAll() {
    const state = this.data.gameState;
    if (!state) return;

    const stage = this.getCurrentStage();
    const currentEvent = state.currentEvents[state.eventIndex];
    const year = currentEvent && currentEvent.historicalYear ? currentEvent.historicalYear : stage.years.split('-')[0];
    const diff = config.difficulties[state.difficulty] || config.difficulties.normal;

    const characterList = Object.entries(state.characters).map(([key, char]) => ({
      key,
      ...char,
      deceased: !!state.deceased[key]
    }));

    this.setData({
      currentStage: stage,
      currentYear: year,
      difficultyName: diff.name,
      characterList,
      currentEvent: currentEvent || null,
      showNight: state.eventIndex >= config.eventsPerDay && state.day <= state.maxDay,
      showEnding: state.day > state.maxDay || this.isInstantEnding(),
      showCrisis: this.checkCrisis()
    });

    if (this.data.showEnding) {
      this.renderEnding();
    }
  },

  renderEnding() {
    const state = this.data.gameState;
    const ending = this.getEnding();
    const title = this.getPosthumousTitle();
    const summary = this.generateSummary(ending, title);

    analytics.logEnding(ending.name, title.name, state.day, state.stability);
    saveManager.saveToSlot('auto', state, '结局前自动存档');

    this.setData({
      ending,
      posthumousTitle: title,
      summary,
      showEnding: true
    });
  },

  getCurrentStage() {
    const state = this.data.gameState;
    return config.stages.find(s => state.day >= s.startDay && state.day <= s.endDay) || config.stages[config.stages.length - 1];
  },

  // ========== 事件系统 ==========
  randomEvents(count) {
    const state = this.data.gameState;
    const currentStage = this.getCurrentStage();
    const triggered = new Set(state.triggeredEvents);

    let freshPool = config.events.filter(e => {
      if (e.stage !== currentStage.id) return false;
      if (triggered.has(e.id)) return false;
      if (e.prerequisite && !triggered.has(e.prerequisite)) return false;
      return true;
    });

    const selected = [];

    // 优先剧情链
    const storylineFresh = freshPool.filter(e => e.storyline && e.prerequisite && triggered.has(e.prerequisite));
    storylineFresh.sort((a, b) => a.prerequisite - b.prerequisite);
    const seenStorylines = new Set();
    for (const e of storylineFresh) {
      if (!seenStorylines.has(e.storyline) && selected.length < count) {
        selected.push(e);
        seenStorylines.add(e.storyline);
      }
    }

    // 填充剩余
    freshPool = freshPool.filter(e => !selected.includes(e));
    const shuffledFresh = this.shuffle(freshPool);
    while (selected.length < count && shuffledFresh.length > 0) {
      selected.push(shuffledFresh.pop());
    }

    // 允许重复
    if (selected.length < count) {
      const repeatedPool = this.shuffle(config.events.filter(e => e.stage === currentStage.id && !selected.includes(e)));
      while (selected.length < count && repeatedPool.length > 0) {
        selected.push(repeatedPool.pop());
      }
    }

    return this.shuffle(selected);
  },

  shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },

  chooseOption(e) {
    const index = e.currentTarget.dataset.index;
    const state = this.data.gameState;
    const event = state.currentEvents[state.eventIndex];
    const option = event.options[index];

    this.applyEffects(option.effects);
    state.history.push({
      day: state.day,
      phase: '上朝',
      action: event.title,
      detail: option.text
    });
    state.triggeredEvents.push(event.id);
    state.eventIndex++;

    analytics.logEventChoice(state.day, event.id, index, option.effects);
    saveManager.saveGame(state);
    this.setData({ gameState: state });

    if (state.eventIndex >= config.eventsPerDay) {
      this.autoSaveDaily();
    }

    this.renderAll();
  },

  applyEffects(effects) {
    if (!effects) return;
    const state = this.data.gameState;
    const diff = config.difficulties[state.difficulty] || config.difficulties.normal;
    const mult = diff.eventMultiplier || 1.0;

    Object.entries(effects).forEach(([key, value]) => {
      if (key === 'stability') {
        const adjusted = value > 0 ? Math.round(value * mult) : Math.round(value * (2 - mult));
        state.stability = this.clamp(state.stability + adjusted, 0, 100);
      } else if (state.characters[key] && !state.deceased[key]) {
        if (typeof value === 'number') {
          const adjusted = value > 0 ? Math.round(value * mult) : Math.round(value * (2 - mult));
          state.characters[key].favor = this.clamp(state.characters[key].favor + adjusted, -100, 100);
        } else if (typeof value === 'object') {
          if (typeof value.favor === 'number') {
            const adj = value.favor > 0 ? Math.round(value.favor * mult) : Math.round(value.favor * (2 - mult));
            state.characters[key].favor = this.clamp(state.characters[key].favor + adj, -100, 100);
          }
          if (typeof value.power === 'number') {
            const adj = value.power > 0 ? Math.round(value.power * mult) : Math.round(value.power * (2 - mult));
            state.characters[key].power = this.clamp(state.characters[key].power + adj, 0, 100);
          }
          if (typeof value.ability === 'number') {
            state.characters[key].ability = this.clamp(state.characters[key].ability + value.ability, 0, 100);
          }
        }
      }
    });

    // 自动影响力变化
    Object.keys(state.characters).forEach(key => {
      if (state.deceased[key]) return;
      const char = state.characters[key];
      if (char.favor > 50) char.power = this.clamp(char.power + 2, 0, 100);
      if (char.favor < -50) char.power = this.clamp(char.power - 2, 0, 100);
    });
  },

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  // ========== 晚间决策 ==========
  openMeetMenu() {
    const state = this.data.gameState;
    const options = Object.entries(state.characters).map(([key, char]) => {
      const daysSince = state.day - state.lastMeetDay[key];
      const canMeet = daysSince >= config.meetCooldown && !state.deceased[key];
      return {
        key,
        name: char.name,
        deceased: !!state.deceased[key],
        canMeet,
        waitDays: config.meetCooldown - daysSince
      };
    });
    this.setData({ showMeetMenu: true, meetOptions: options });
  },

  closeMeetMenu() {
    this.setData({ showMeetMenu: false });
  },

  handleMeet(e) {
    const key = e.currentTarget.dataset.key;
    const type = e.currentTarget.dataset.type;
    const state = this.data.gameState;

    if (state.deceased[key]) {
      wx.showToast({ title: config.characters[key].name + '已去世', icon: 'none' });
      return;
    }

    const others = Object.keys(state.characters).filter(k => k !== key);

    if (type === 'encourage') {
      state.characters[key].favor = this.clamp(state.characters[key].favor + config.meetFavor, -100, 100);
    } else if (type === 'cultivate') {
      state.characters[key].ability = this.clamp(state.characters[key].ability + 10, 0, 100);
      state.characters[key].favor = this.clamp(state.characters[key].favor + 5, -100, 100);
    }

    others.forEach(k => {
      state.characters[k].favor = this.clamp(state.characters[k].favor - config.meetPenalty, -100, 100);
    });

    state.lastMeetDay[key] = state.day;
    state.history.push({
      day: state.day,
      phase: '晚间',
      action: '召见',
      detail: state.characters[key].name + (type === 'encourage' ? '（勉励）' : '（栽培）')
    });

    analytics.logNightAction(state.day, 'meet', key);
    this.setData({ gameState: state, showMeetMenu: false });
    this.nextDay();
  },

  handleBanquet() {
    const state = this.data.gameState;
    if (state.stability < config.banquetCost) return;

    Object.values(state.characters).forEach(char => {
      char.favor = this.clamp(char.favor + config.banquetFavor, -100, 100);
    });
    state.stability = this.clamp(state.stability - config.banquetCost, 0, 100);
    state.history.push({ day: state.day, phase: '晚间', action: '宴会' });

    analytics.logNightAction(state.day, 'banquet');
    this.setData({ gameState: state });
    this.nextDay();
  },

  handleAdMeet() {
    if (this.data.noAds) {
      this.openMeetMenu();
      return;
    }
    if (this.data.gameState.adUsedToday) return;

    analytics.logAdClick('night_ad_meet');
    adManager.showRewardedAd().then(() => {
      this.data.gameState.adUsedToday = true;
      this.openMeetMenu();
    }).catch(() => {
      wx.showToast({ title: '广告未完成', icon: 'none' });
    });
  },

  skipNight() {
    this.nextDay();
  },

  nextDay() {
    const state = this.data.gameState;
    if (this.isInstantEnding()) {
      this.renderAll();
      return;
    }

    state.day++;
    state.eventIndex = 0;
    state.adUsedToday = false;

    if (state.day > state.maxDay) {
      const finalChallenge = config.stageChallenges.find(c => c.stageId === 'ending');
      if (finalChallenge && !state.completedChallenges[finalChallenge.id]) {
        this.startChallenge(finalChallenge);
        return;
      }
      this.renderAll();
      return;
    }

    const stage = this.getCurrentStage();
    const challenge = config.stageChallenges.find(c => c.stageId === stage.id);
    if (challenge && !state.completedChallenges[challenge.id] && state.day === stage.startDay) {
      this.startChallenge(challenge);
      return;
    }

    this.startDay();
  },

  startDay() {
    const state = this.data.gameState;
    state.currentEvents = this.randomEvents(config.eventsPerDay);
    saveManager.saveGame(state);
    this.setData({ gameState: state });
    this.renderAll();
  },

  // ========== 阶段挑战 ==========
  startChallenge(challenge) {
    this.setData({
      showChallenge: true,
      challengeTitle: challenge.title,
      challengeIntro: challenge.intro,
      challengeSteps: challenge.steps,
      challengeStep: -1,
      challengeResult: null,
      challengeScore: 0,
      challengeIsFinal: challenge.stageId === 'ending'
    });
    analytics.logChallengeStart(challenge.id);
  },

  startChallengeStep() {
    this.setData({ challengeStep: 0 });
  },

  chooseChallengeOption(e) {
    const index = e.currentTarget.dataset.index;
    const state = this.data.gameState;
    const challenge = config.stageChallenges.find(c => c.title === this.data.challengeTitle);
    const step = this.data.challengeSteps[this.data.challengeStep];
    const option = step.options[index];

    const pts = challenge.scoreStep(state, option);
    const newScore = this.data.challengeScore + pts;

    if (this.data.challengeStep >= this.data.challengeSteps.length - 1) {
      // 最后一题，结算
      const result = challenge.resolve(state, newScore);
      state.completedChallenges[challenge.id] = true;
      state.challengeResults[challenge.id] = result.rank;
      this.applyEffects(result.effects);

      analytics.logChallengeEnd(challenge.id, result.rank, newScore);
      saveManager.saveGame(state);
      this.setData({
        gameState: state,
        challengeResult: result,
        challengeScore: newScore
      });
    } else {
      this.setData({
        challengeStep: this.data.challengeStep + 1,
        challengeScore: newScore
      });
    }
  },

  closeChallenge() {
    this.setData({ showChallenge: false });
    if (this.data.challengeIsFinal) {
      this.renderAll();
    } else {
      this.startDay();
    }
  },

  // ========== 结局 ==========
  getEnding() {
    const state = this.data.gameState;
    const diff = config.difficulties[state.difficulty] || config.difficulties.normal;
    const threshold = diff.endingThreshold || 80;

    if (this.isInstantEnding()) {
      return { name: '众叛亲离', desc: '政变爆发，你的统治结束了。' };
    }

    const favors = Object.values(state.characters);
    if (state.stability >= threshold && favors.every(c => c.favor >= 20)) {
      return { name: '贞观之治', desc: '你成功平衡了各方，开创了盛世。' };
    }

    const positiveCount = favors.filter(c => c.favor >= 0).length;
    const passThreshold = Math.round(threshold * 0.75);
    if (state.stability >= passThreshold && positiveCount >= 2) {
      return { name: '君臣相得', desc: '虽有波折，但总体平稳。' };
    }

    if (state.characters.yuchi.power >= 80) {
      return { name: '功高震主', desc: '尉迟敬德势力过大，你不得不杯酒释兵权。' };
    }
    if (state.characters.changsun.power >= 80) {
      return { name: '外戚专权', desc: '长孙无忌成为实际掌权者，你逐渐沦为傀儡。' };
    }
    if (state.characters.fangxuanling.power >= 80) {
      return { name: '权相治国', desc: '房玄龄权倾朝野，你成为垂拱而治的象征。' };
    }

    return { name: '君臣相得', desc: '虽有波折，但总体平稳。' };
  },

  getPosthumousTitle() {
    const state = this.data.gameState;
    for (const t of config.posthumousTitles) {
      if (t.condition(state)) return t;
    }
    return config.posthumousTitles[config.posthumousTitles.length - 1];
  },

  generateSummary(ending, title) {
    const state = this.data.gameState;
    const chars = state.characters;
    const favors = Object.values(chars);
    const avgFavor = favors.reduce((a, b) => a + b.favor, 0) / favors.length;
    const stdDev = Math.sqrt(favors.reduce((sq, c) => sq + Math.pow(c.favor - avgFavor, 2), 0) / favors.length);

    let summary = '';
    if (stdDev < 15) summary += '你维持了朝堂的基本平衡，各方势力各得其所。';
    else if (stdDev < 40) summary += '朝堂之上虽有波澜，但大局仍在你的掌控之中。';
    else summary += '朝堂势力严重失衡，你的统治如履薄冰。';

    if (state.stability >= 70) summary += '皇权稳固，乾纲独断。';
    else if (state.stability >= 40) summary += '皇权尚可，但隐患未除。';
    else summary += '皇权摇摇欲坠，各方虎视眈眈。';

    const dominant = Object.entries(chars).sort((a, b) => b[1].power - a[1].power)[0];
    if (dominant[1].power >= 70) {
      const nameMap = { changsun: '长孙无忌', yuchi: '尉迟敬德', weizheng: '魏征', fangxuanling: '房玄龄' };
      summary += `${nameMap[dominant[0]]}权柄日重，朝堂倚重。`;
    }

    summary += `后世史官称你为**${title.name}**。`;
    return summary;
  },

  isInstantEnding() {
    const state = this.data.gameState;
    return state.stability <= 0 || Object.values(state.characters).some(c => c.favor <= -100);
  },

  // ========== 存档系统 ==========
  autoSaveDaily() {
    saveManager.saveToSlot('auto', this.data.gameState, '第' + this.data.gameState.day + '天自动存档');
  },

  loadAutoSave() {
    const save = saveManager.loadFromSlot('auto');
    if (save) {
      this.setData({ gameState: save });
      saveManager.saveGame(save);
      this.renderAll();
      wx.showToast({ title: '已回档', icon: 'success' });
    }
  },

  checkCrisis() {
    const state = this.data.gameState;
    if (!state) return false;
    const aliveChars = Object.values(state.characters).filter(c => !state.deceased[Object.keys(state.characters).find(k => state.characters[k] === c)]);
    const minFavor = aliveChars.length > 0 ? Math.min(...aliveChars.map(c => c.favor)) : 0;
    return state.stability <= 10 || minFavor <= -80;
  },

  ignoreCrisis() {
    this.setData({ showCrisis: false });
  },

  // ========== 设置与存档位 ==========
  showSettings() {
    const slots = saveManager.getSaveSlots();
    const slotData = {};
    Object.entries(slots).forEach(([id, slot]) => {
      slotData[id] = slot ? {
        name: slot.name,
        day: slot.day,
        difficultyName: config.difficulties[slot.difficulty]?.name || '未知'
      } : null;
    });
    this.setData({ showSettingsModal: true, saveSlots: slotData });
  },

  closeSettingsModal() {
    this.setData({ showSettingsModal: false });
  },

  toggleSound(e) {
    app.globalData.soundEnabled = e.detail.value;
    app.saveSettings();
    this.setData({ soundEnabled: e.detail.value });
  },

  toggleBGM(e) {
    app.globalData.bgmEnabled = e.detail.value;
    app.saveSettings();
    this.setData({ bgmEnabled: e.detail.value });
  },

  saveSlot(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '保存存档',
      editable: true,
      placeholderText: '第' + this.data.gameState.day + '天存档',
      success: (res) => {
        if (res.confirm) {
          saveManager.saveToSlot(id, this.data.gameState, res.content || '第' + this.data.gameState.day + '天存档');
          this.showSettings();
          wx.showToast({ title: '已保存', icon: 'success' });
        }
      }
    });
  },

  loadSlot(e) {
    const id = e.currentTarget.dataset.id;
    const save = saveManager.loadFromSlot(id);
    if (save) {
      wx.showModal({
        title: '确认读取',
        content: '当前进度将被覆盖，确定读取吗？',
        success: (res) => {
          if (res.confirm) {
            this.setData({ gameState: save });
            saveManager.saveGame(save);
            this.renderAll();
            this.setData({ showSettingsModal: false });
            wx.showToast({ title: '已读取', icon: 'success' });
          }
        }
      });
    }
  },

  deleteSlot(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定删除该存档吗？',
      success: (res) => {
        if (res.confirm) {
          saveManager.deleteSlot(id);
          this.showSettings();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  // ========== 结局操作 ==========
  restartGame() {
    wx.redirectTo({ url: '/pages/index/index' });
  },

  handleAdRestart() {
    analytics.logAdClick('ending_ad_restart');
    adManager.showRewardedAd().then(() => {
      this.restartGame();
    }).catch(() => {
      wx.showToast({ title: '广告未完成', icon: 'none' });
    });
  },

  goToShop() {
    wx.switchTab({ url: '/pages/shop/shop' });
  },

  toggleFullscreen() {
    // 小程序不支持全屏 API，使用页面导航栏控制
    wx.showToast({ title: '小程序不支持全屏', icon: 'none' });
  },

  preventBubble() {}
});
