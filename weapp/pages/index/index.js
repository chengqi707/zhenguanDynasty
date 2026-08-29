const app = getApp();
const config = require('../../utils/config.js');
const saveManager = require('../../utils/saveManager.js');

Page({
  data: {
    version: config.version,
    characters: Object.entries(config.characters).map(([key, val]) => ({ key, ...val })),
    hasSave: false,
    saveDay: 1,
    difficulties: Object.values(config.difficulties),
    selectedDifficulty: 'normal',
    showDifficultyModal: false,
    showSettingsModal: false,
    soundEnabled: true,
    bgmEnabled: false,
    noAds: false,
    // V3.0
    cycleCount: 0,
    permanentBonus: { stability: 0, ability: 0 },
    unlockedScripts: [],
    selectedScript: 'default',
    selectedScriptName: '默认开局',
    unlockedNameCards: [],
    selectedNameCards: [],
    showScriptModal: false,
    showNameCardModal: false
  },

  onLoad() {
    this.checkSave();
    this.loadCycleData();
    this.setData({
      soundEnabled: app.globalData.soundEnabled,
      bgmEnabled: app.globalData.bgmEnabled,
      noAds: app.globalData.noAds
    });
  },

  onShow() {
    this.checkSave();
    this.loadCycleData();
  },

  checkSave() {
    const save = saveManager.loadGame();
    if (save) {
      this.setData({ hasSave: true, saveDay: save.day });
    } else {
      this.setData({ hasSave: false });
    }
  },

  loadCycleData() {
    const cycle = saveManager.getCycleData();
    const scripts = Object.values(config.scripts).map(s => ({
      ...s,
      unlocked: !s.locked || cycle.unlockedScripts.includes(s.id)
    }));
    const nameCards = Object.values(config.nameCards).map(nc => ({
      ...nc,
      unlocked: cycle.unlockedNameCards.includes(nc.id)
    }));
    this.setData({
      cycleCount: cycle.cycleCount,
      permanentBonus: cycle.permanentBonus || { stability: 0, ability: 0 },
      unlockedScripts: scripts,
      unlockedNameCards: nameCards
    });
  },

  startNewGame() {
    this.setData({
      showDifficultyModal: true,
      selectedDifficulty: 'normal',
      selectedScript: 'default',
      selectedNameCards: []
    });
  },

  continueGame() {
    // game 是 tabBar 页，switchTab 不能带 query，通过 globalData 传递意图
    app.globalData.pendingGameParams = { continue: true };
    wx.switchTab({ url: '/pages/game/game' });
  },

  selectDifficulty(e) {
    this.setData({ selectedDifficulty: e.currentTarget.dataset.id });
  },

  confirmStart() {
    const difficulty = this.data.selectedDifficulty;
    const script = this.data.selectedScript;
    const nameCards = this.data.selectedNameCards.join(',');
    saveManager.clearSave();
    // game 是 tabBar 页，开局参数写入 globalData，由 game 页 onShow 消费
    app.globalData.pendingGameParams = { new: true, difficulty, script, nameCards };
    wx.switchTab({ url: '/pages/game/game' });
    this.setData({ showDifficultyModal: false });
  },

  closeDifficultyModal() {
    this.setData({ showDifficultyModal: false });
  },

  // V3.0 剧本选择
  openScriptSelector() {
    this.setData({ showScriptModal: true });
  },

  closeScriptModal() {
    this.setData({ showScriptModal: false });
  },

  selectScript(e) {
    const id = e.currentTarget.dataset.id;
    const script = this.data.unlockedScripts.find(s => s.id === id);
    if (script && script.unlocked) {
      this.setData({ selectedScript: id, selectedScriptName: script.name, showScriptModal: false });
    } else {
      wx.showToast({ title: '该剧本尚未解锁', icon: 'none' });
    }
  },

  // V3.0 名臣卡选择
  openNameCardSelector() {
    this.setData({ showNameCardModal: true });
  },

  closeNameCardModal() {
    this.setData({ showNameCardModal: false });
  },

  toggleNameCard(e) {
    const id = e.currentTarget.dataset.id;
    const cards = this.data.selectedNameCards;
    if (cards.includes(id)) {
      this.setData({ selectedNameCards: cards.filter(c => c !== id) });
    } else if (cards.length < 2) {
      this.setData({ selectedNameCards: [...cards, id] });
    } else {
      wx.showToast({ title: '最多选择2张名臣卡', icon: 'none' });
    }
  },

  // 排行榜
  showLeaderboard() {
    wx.navigateTo({ url: '/pages/leaderboard/leaderboard' });
  },

  // 成就
  showAchievements() {
    wx.switchTab({ url: '/pages/achievements/achievements' });
  },

  // 设置
  showSettings() {
    this.setData({ showSettingsModal: true });
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

  clearAllData() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有存档、周目数据、成就和解锁内容吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          saveManager.clearAll();
          app.globalData.noAds = false;
          app.globalData.soundEnabled = true;
          app.globalData.bgmEnabled = false;
          app.saveSettings();
          this.setData({ hasSave: false, noAds: false, cycleCount: 0 });
          this.loadCycleData();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  preventBubble() {},

  onShareAppMessage() {
    const save = saveManager.loadGame();
    const day = save ? save.day : 1;
    return {
      title: `凌烟阁密档 - 扮演李世民，书写你的贞观传奇（第${day}天）`,
      path: '/pages/index/index',
      imageUrl: ''
    };
  },

  onShareTimeline() {
    return {
      title: '凌烟阁密档 - 扮演李世民，书写你的贞观传奇',
      query: '',
      imageUrl: ''
    };
  }
});
