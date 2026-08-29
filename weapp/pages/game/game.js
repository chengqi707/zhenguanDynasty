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
    eventFeedback: null,
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
    saveSlots: [],
    // V3.0
    showHarem: false,
    haremList: [],
    showHaremEvent: false,
    currentHaremEvent: null,
    cycleInfo: {},
    showCycleInfo: false,
    cycleCount: 0,
    permanentBonus: { stability: 0, ability: 0 },
    endingStats: {}
  },

  onLoad(options) {
    this.setData({
      soundEnabled: app.globalData.soundEnabled,
      bgmEnabled: app.globalData.bgmEnabled,
      noAds: app.globalData.noAds
    });

    // 加载周目信息
    const cycleData = saveManager.getCycleData();
    this.setData({
      cycleCount: cycleData.cycleCount,
      permanentBonus: cycleData.permanentBonus || { stability: 0, ability: 0 }
    });

    // 分享链接冷启动可带 query（?seed=...），其余入口一律走 onShow 的 pendingGameParams
    if (options && options.seed) {
      this.startFromSeed(options.seed);
    }
  },

  onShow() {
    // 消费首页通过 globalData 传来的开局参数（tabBar 页 switchTab 不能带 query）
    const pending = app.globalData.pendingGameParams;
    if (pending) {
      app.globalData.pendingGameParams = null;
      if (pending.new) {
        this.startNewGame(pending.difficulty, pending.script, pending.nameCards);
        return;
      }
      if (pending.continue) {
        this.continueGame();
        return;
      }
    }
    if (this.data.gameState) {
      this.renderAll();
      return;
    }
    // tab 切换进入且无开局参数：有存档则继续，否则回首页
    const save = saveManager.loadGame();
    if (save) {
      this.continueGame();
    } else {
      wx.switchTab({ url: '/pages/index/index' });
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

  // ========== 游戏初始化 V3.0 ==========
  startNewGame(difficulty, scriptId, nameCardsStr) {
    const cycleData = saveManager.getCycleData();
    const nameCards = nameCardsStr ? nameCardsStr.split(',').filter(Boolean) : [];
    const state = this.createInitialState(difficulty, cycleData, scriptId, nameCards);
    state.selectedScript = scriptId || 'default';
    state.selectedNameCards = nameCards;
    state.currentEvents = this.randomEvents(config.eventsPerDay, state);
    this.setData({ gameState: state });
    saveManager.saveGame(state);
    analytics.logGameStart(difficulty, 'new');
    this.renderAll();
  },

  continueGame() {
    const save = saveManager.loadGame();
    if (!save) {
      wx.showToast({ title: '无存档', icon: 'none' });
      wx.switchTab({ url: '/pages/index/index' });
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
    const cycleData = saveManager.getCycleData();
    const state = this.createInitialState(seed.diff, cycleData);
    state.triggeredEvents = seed.te || [];
    state.stability = seed.s || state.stability;
    (seed.c || []).forEach(charData => {
      if (state.characters[charData.k]) {
        state.characters[charData.k].favor = charData.f || 0;
        state.characters[charData.k].power = charData.p || 30;
        state.characters[charData.k].ability = charData.a || 30;
      }
    });
    state.currentEvents = this.randomEvents(config.eventsPerDay, state);
    this.setData({ gameState: state });
    saveManager.saveGame(state);
    analytics.logGameStart(seed.diff, 'seed');
    this.renderAll();
  },

  createInitialState(difficultyId = 'normal', cycleData = null, scriptId = 'default', nameCards = []) {
    const diff = config.difficulties[difficultyId] || config.difficulties.normal;
    const bonus = cycleData ? (cycleData.permanentBonus || { stability: 0, ability: 0 }) : { stability: 0, ability: 0 };
    const script = config.scripts[scriptId] || config.scripts.default;

    let stability = diff.stabilityInitial + bonus.stability;
    // 应用剧本效果
    if (scriptId === 'xuanwumen') stability -= 10;
    if (scriptId === 'golden_age') stability += 10;
    if (scriptId === 'crisis') stability -= 20;

    const state = {
      day: 1,
      maxDay: config.maxDay,
      difficulty: difficultyId,
      stability: this.clamp(stability, 0, 100),
      eventIndex: 0,
      currentEvents: [],
      triggeredEvents: [],
      deceased: {},
      completedChallenges: {},
      challengeResults: {},
      lastMeetDay: {},
      adUsedToday: false,
      history: [],
      characters: {},
      // 周目结算幂等标记（镜像 Web：同一局只结算一次）
      cycleCounted: false,
      // 成就行为统计（镜像 Web V1.5）
      achievementStats: {
        totalCultivate: 0,
        totalBanquet: 0,
        totalSkipNight: 0,
        maxWeizhengFavor: 0
      },
      // V3.0
      cycle: (cycleData ? cycleData.cycleCount : 0) + 1,
      haremHistory: [],
      achievementUnlocks: [],
      selectedNameCards: nameCards,
      selectedScript: scriptId,
      haremDeceased: {},
      totalScore: 0
    };

    Object.keys(config.characters).forEach(key => {
      state.lastMeetDay[key] = -99;
      let ability = config.powerInitial + bonus.ability;
      // 应用名臣卡效果
      if (nameCards.includes('duruhui')) ability += 10;
      state.characters[key] = {
        ...config.characters[key],
        favor: 0,
        power: config.powerInitial,
        ability: this.clamp(ability, 0, 100)
      };
    });

    // 名臣卡：李靖 - 武将好感度+10
    if (nameCards.includes('lijing') && state.characters.yuchi) {
      state.characters.yuchi.favor += 10;
    }
    // 名臣卡：褚遂良 - 文官好感度+10
    if (nameCards.includes('chusuliang')) {
      if (state.characters.changsun) state.characters.changsun.favor += 10;
      if (state.characters.fangxuanling) state.characters.fangxuanling.favor += 10;
    }

    // 剧本：突厥已破 - 文官势力膨胀
    if (scriptId === 'turkic_defeated') {
      if (state.characters.changsun) state.characters.changsun.power += 10;
      if (state.characters.fangxuanling) state.characters.fangxuanling.power += 10;
    }

    // V3.0: 初始化后宫
    if (config.harem) {
      state.harem = {};
      Object.keys(config.harem).forEach(key => {
        state.harem[key] = {
          ...config.harem[key],
          favor: 0,
          influence: 30,
          ambition: 30
        };
      });
    }

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

    // V3.0: 后宫列表
    const haremList = state.harem ? Object.entries(state.harem).map(([key, char]) => ({
      key,
      ...char,
      deceased: !!(state.haremDeceased && state.haremDeceased[key])
    })) : [];

    this.setData({
      currentStage: stage,
      currentYear: year,
      difficultyName: diff.name,
      characterList,
      haremList,
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
    // 记录结局与谥号到 state，供成就检查使用（参照 Web showEnding）
    state.endingName = ending.name;
    state.titleId = title.id;
    const summary = this.generateSummary(ending, title);

    // V3.0: 记录周目（幂等：同一局只结算一次，切 tab 回来 renderAll 不会重复计数）
    let cycleResult;
    if (!state.cycleCounted) {
      state.cycleCounted = true;
      cycleResult = saveManager.recordCycleEnd({
        ending: title.id,
        title: title.name,
        day: state.day,
        stability: state.stability,
        difficulty: state.difficulty,
        script: state.selectedScript || 'default'
      });
      saveManager.saveGame(state);
    } else {
      cycleResult = saveManager.getCycleData();
    }

    // V3.0: 检查成就（在周目结算之后，保证周目成就按本次通关计数）
    this.checkAchievements(state, title.id);

    analytics.logEnding(ending.name, title.name, state.day, state.stability);
    saveManager.saveToSlot('auto', state, '结局前自动存档');

    this.setData({
      ending,
      posthumousTitle: title,
      summary,
      showEnding: true,
      cycleInfo: cycleResult,
      endingStats: {
        day: state.day,
        stability: state.stability,
        cycle: state.cycle,
        difficulty: state.difficulty
      }
    });
  },

  getCurrentStage(state) {
    state = state || this.data.gameState;
    return config.stages.find(s => state.day >= s.startDay && state.day <= s.endDay) || config.stages[config.stages.length - 1];
  },

  // ========== 事件系统 ==========
  randomEvents(count, state) {
    // state 可显式传入：startNewGame/startFromSeed 在 setData 前调用时 this.data.gameState 还是旧值
    state = state || this.data.gameState;
    const currentStage = this.getCurrentStage(state);
    const triggered = new Set(state.triggeredEvents);

    let freshPool = config.events.filter(e => {
      if (e.stage !== currentStage.id) return false;
      if (triggered.has(e.id)) return false;
      if (e.prerequisite && !triggered.has(e.prerequisite)) return false;
      // V3.0: 跳过涉及已去世角色的事件
      if (e.requiredChar && state.deceased[e.requiredChar]) return false;
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

    // V3.0: 魏征去世检查
    this.checkDeceased();

    analytics.logEventChoice(state.day, event.id, index, option.effects);
    saveManager.saveGame(state);
    // 内联展示选项后果（feedback 文案 + 数值变化摘要），点「继续」再进下一条
    this.setData({
      gameState: state,
      eventFeedback: {
        text: option.feedback || '圣意已决。',
        changes: this.summarizeEffects(option.effects)
      }
    });
  },

  continueAfterFeedback() {
    const state = this.data.gameState;
    if (!state) return;
    state.eventIndex++;
    saveManager.saveGame(state);
    this.setData({ gameState: state, eventFeedback: null });

    if (state.eventIndex >= config.eventsPerDay) {
      this.autoSaveDaily();
    }

    this.renderAll();
  },

  // 把 effects 转成可读的数值变化摘要（如「稳定度+5 · 魏征好感+10」）
  summarizeEffects(effects) {
    if (!effects) return '';
    const parts = [];
    const fmt = (label, v) => `${label}${v > 0 ? '+' : ''}${v}`;
    const charName = (k) => (config.characters[k] && config.characters[k].name) || k;
    const haremName = (k) => (config.harem && config.harem[k] && config.harem[k].name) || k;
    Object.entries(effects).forEach(([key, value]) => {
      if (key === 'stability' && typeof value === 'number') {
        parts.push(fmt('稳定度', value));
      } else if (key === 'harem' && value && typeof value === 'object') {
        Object.entries(value).forEach(([hk, hv]) => {
          if (typeof hv === 'number') {
            parts.push(fmt(`${haremName(hk)}恩宠`, hv));
          } else if (hv && typeof hv === 'object') {
            if (typeof hv.favor === 'number') parts.push(fmt(`${haremName(hk)}恩宠`, hv.favor));
            if (typeof hv.influence === 'number') parts.push(fmt(`${haremName(hk)}影响力`, hv.influence));
            if (typeof hv.ambition === 'number') parts.push(fmt(`${haremName(hk)}野心`, hv.ambition));
          }
        });
      } else if (config.characters[key]) {
        if (typeof value === 'number') {
          parts.push(fmt(`${charName(key)}好感`, value));
        } else if (value && typeof value === 'object') {
          if (typeof value.favor === 'number') parts.push(fmt(`${charName(key)}好感`, value.favor));
          if (typeof value.power === 'number') parts.push(fmt(`${charName(key)}影响力`, value.power));
          if (typeof value.ability === 'number') parts.push(fmt(`${charName(key)}能力`, value.ability));
        }
      }
    });
    return parts.join(' · ');
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
      }
      // V3.0: 后宫嵌套效果 { harem: { empress: { favor: 10 } } }
      else if (key === 'harem' && state.harem && typeof value === 'object') {
        Object.entries(value).forEach(([hk, hv]) => {
          if (!state.harem[hk] || (state.haremDeceased && state.haremDeceased[hk])) return;
          if (typeof hv === 'number') {
            state.harem[hk].favor = this.clamp(state.harem[hk].favor + hv, -100, 100);
          } else if (typeof hv === 'object') {
            if (typeof hv.favor === 'number') state.harem[hk].favor = this.clamp(state.harem[hk].favor + hv.favor, -100, 100);
            if (typeof hv.influence === 'number') state.harem[hk].influence = this.clamp(state.harem[hk].influence + hv.influence, 0, 100);
            if (typeof hv.ambition === 'number') state.harem[hk].ambition = this.clamp(state.harem[hk].ambition + hv.ambition, 0, 100);
          }
        });
      }
      else if (state.characters[key] && !state.deceased[key]) {
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
      // V3.0: 后宫影响（flat 格式：{ empress: { favor: 10 } }）
      else if (state.harem && state.harem[key] && !(state.haremDeceased && state.haremDeceased[key])) {
        if (typeof value === 'number') {
          state.harem[key].favor = this.clamp(state.harem[key].favor + value, -100, 100);
        } else if (typeof value === 'object') {
          if (typeof value.favor === 'number') state.harem[key].favor = this.clamp(state.harem[key].favor + value.favor, -100, 100);
          if (typeof value.influence === 'number') state.harem[key].influence = this.clamp(state.harem[key].influence + value.influence, 0, 100);
          if (typeof value.ambition === 'number') state.harem[key].ambition = this.clamp(state.harem[key].ambition + value.ambition, 0, 100);
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

  // ========== V3.0 魏征去世系统 ==========
  checkDeceased() {
    const state = this.data.gameState;
    // 魏征有几率在事件后去世（模拟历史：643年去世）
    if (!state.deceased.weizheng && state.day >= 8) {
      const chance = 0.05 + (state.day - 8) * 0.03; // 第8天开始，每天递增3%
      if (Math.random() < chance) {
        state.deceased.weizheng = true;
        state.history.push({
          day: state.day,
          phase: '朝堂',
          action: '魏征去世',
          detail: '一代谏臣魏征病逝，朝野震动。'
        });
        wx.showToast({ title: '魏征病逝', icon: 'none', duration: 3000 });
      }
    }
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
      // V1.5: 累计栽培次数（成就统计）
      this.ensureAchievementStats(state).totalCultivate++;
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
    // V1.5: 累计宴会次数（成就统计）
    this.ensureAchievementStats(state).totalBanquet++;

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
    // V1.5: 累计批阅奏折次数（成就统计）
    this.ensureAchievementStats(this.data.gameState).totalSkipNight++;
    this.nextDay();
  },

  // 成就统计字段兜底（兼容旧存档）
  ensureAchievementStats(state) {
    if (!state.achievementStats) {
      state.achievementStats = { totalCultivate: 0, totalBanquet: 0, totalSkipNight: 0, maxWeizhengFavor: 0 };
    }
    return state.achievementStats;
  },

  // ========== V3.0 后宫系统 ==========
  openHarem() {
    const state = this.data.gameState;
    if (!state.harem || Object.keys(state.harem).length === 0) {
      wx.showToast({ title: '后宫功能即将开放', icon: 'none' });
      return;
    }
    // 随机触发后宫事件
    const haremEvents = config.haremEvents || [];
    const available = haremEvents.filter(e => {
      // prerequisite 可能是函数（用 state 调用）或已触发事件 id（参照 Web 事件抽取逻辑）
      if (e.prerequisite) {
        if (typeof e.prerequisite === 'function') {
          if (!e.prerequisite(state)) return false;
        } else if (!state.triggeredEvents.includes(e.prerequisite)) {
          return false;
        }
      }
      if (e.requiredHarem && state.haremDeceased && state.haremDeceased[e.requiredHarem]) return false;
      return true;
    });

    if (available.length > 0 && Math.random() < 0.5) {
      const event = available[Math.floor(Math.random() * available.length)];
      this.setData({ showHarem: true, currentHaremEvent: event });
    } else {
      this.setData({ showHarem: true, currentHaremEvent: null });
    }
  },

  closeHarem() {
    this.setData({ showHarem: false, currentHaremEvent: null });
  },

  chooseHaremOption(e) {
    const index = e.currentTarget.dataset.index;
    const state = this.data.gameState;
    const event = this.data.currentHaremEvent;
    if (!event || !event.options[index]) return;

    const option = event.options[index];
    this.applyEffects(option.effects);
    state.haremHistory.push({
      day: state.day,
      event: event.title,
      choice: option.text
    });
    state.triggeredEvents.push(event.id);

    // 皇后去世处理（参照 Web：107 号事件后登记 haremDeceased，解锁 108/110 等后续事件）
    if (event.id === 107 && !(state.haremDeceased && state.haremDeceased.empress)) {
      if (!state.haremDeceased) state.haremDeceased = {};
      state.haremDeceased.empress = true;
      if (state.harem && state.harem.empress) state.harem.empress.favor = 0;
    }

    saveManager.saveGame(state);
    this.setData({ gameState: state, showHarem: false, currentHaremEvent: null });
  },

  nextDay() {
    const state = this.data.gameState;
    if (this.isInstantEnding()) {
      this.renderAll();
      return;
    }

    // V1.5: 更新魏征最高好感度（成就统计）
    const stats = this.ensureAchievementStats(state);
    const currentWeizhengFavor = state.characters.weizheng ? state.characters.weizheng.favor : 0;
    if (currentWeizhengFavor > stats.maxWeizhengFavor) {
      stats.maxWeizhengFavor = currentWeizhengFavor;
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

  // ========== V3.0 成就检查 ==========
  checkAchievements(state, titleId) {
    const achievements = config.achievements || [];
    const unlocked = saveManager.getAchievements();

    // 成就持久化数据：谥号/结局收集（参照 Web checkAndUnlockAchievements）
    const extra = saveManager.getAchievementData();
    if (state.endingName && !extra.endingsSeen.includes(state.endingName)) {
      extra.endingsSeen.push(state.endingName);
    }
    if (state.titleId && !extra.titlesSeen.includes(state.titleId)) {
      extra.titlesSeen.push(state.titleId);
    }
    saveManager.saveAchievementData(extra);

    // 周目数据上下文（config.js 保持纯数据，周目成就从这里取数）
    const cycle = saveManager.getCycleData();
    const achData = {
      unlocked,
      titlesSeen: extra.titlesSeen,
      endingsSeen: extra.endingsSeen,
      newgamePlus: {
        cycleCount: cycle.cycleCount,
        scripts: cycle.scripts || {}
      }
    };

    let newUnlocks = 0;
    achievements.forEach(ach => {
      try {
        if (!unlocked.includes(ach.id) && ach.condition && ach.condition(state, achData)) {
          if (saveManager.unlockAchievement(ach.id)) {
            newUnlocks++;
          }
        }
      } catch (e) {
        console.error('成就检查失败', ach.id, e);
      }
    });
    if (newUnlocks > 0) {
      wx.showToast({ title: `解锁 ${newUnlocks} 个成就！`, icon: 'none', duration: 2000 });
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

    if (state.characters.yuchi && state.characters.yuchi.power >= 80) {
      return { name: '功高震主', desc: '尉迟敬德势力过大，你不得不杯酒释兵权。' };
    }
    if (state.characters.changsun && state.characters.changsun.power >= 80) {
      return { name: '外戚专权', desc: '长孙无忌成为实际掌权者，你逐渐沦为傀儡。' };
    }
    if (state.characters.fangxuanling && state.characters.fangxuanling.power >= 80) {
      return { name: '权相治国', desc: '房玄龄权倾朝野，你成为垂拱而治的象征。' };
    }

    return { name: '君臣相得', desc: '虽有波折，但总体平稳。' };
  },

  getPosthumousTitle() {
    const state = this.data.gameState;
    for (const t of config.posthumousTitles) {
      try {
        if (t.condition(state)) return t;
      } catch (e) {
        console.error('谥号条件检查失败', t.id, e);
      }
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
    if (dominant && dominant[1].power >= 70) {
      const nameMap = { changsun: '长孙无忌', yuchi: '尉迟敬德', weizheng: '魏征', fangxuanling: '房玄龄' };
      if (nameMap[dominant[0]]) {
        summary += `${nameMap[dominant[0]]}权柄日重，朝堂倚重。`;
      }
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
        difficultyName: config.difficulties[slot.difficulty]?.name || '未知',
        cycle: slot.cycle || 1
      } : null;
    });
    const cycleData = saveManager.getCycleData();
    this.setData({
      showSettingsModal: true,
      saveSlots: slotData,
      cycleInfo: cycleData,
      showCycleInfo: true
    });
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
    wx.switchTab({ url: '/pages/index/index' });
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

  goToAchievements() {
    wx.switchTab({ url: '/pages/achievements/achievements' });
  },

  preventBubble() {},

  // V3.2: 立绘加载失败回退到emoji
  onPortraitError(e) {
    const key = e.currentTarget.dataset.key;
    const list = this.data.characterList.map(c => c.key === key ? { ...c, portraitError: true } : c);
    this.setData({ characterList: list });
  },

  onHaremPortraitError(e) {
    const key = e.currentTarget.dataset.key;
    const list = this.data.haremList.map(c => c.key === key ? { ...c, portraitError: true } : c);
    this.setData({ haremList: list });
  }
});
