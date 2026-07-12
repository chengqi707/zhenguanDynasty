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
    noAds: false
  },

  onLoad() {
    this.checkSave();
    this.setData({
      soundEnabled: app.globalData.soundEnabled,
      bgmEnabled: app.globalData.bgmEnabled,
      noAds: app.globalData.noAds
    });
  },

  onShow() {
    this.checkSave();
  },

  checkSave() {
    const save = saveManager.loadGame();
    if (save) {
      this.setData({ hasSave: true, saveDay: save.day });
    } else {
      this.setData({ hasSave: false });
    }
  },

  startNewGame() {
    this.setData({ showDifficultyModal: true, selectedDifficulty: 'normal' });
  },

  continueGame() {
    wx.navigateTo({ url: '/pages/game/game?continue=1' });
  },

  selectDifficulty(e) {
    this.setData({ selectedDifficulty: e.currentTarget.dataset.id });
  },

  confirmStart() {
    const difficulty = this.data.selectedDifficulty;
    saveManager.clearSave();
    wx.navigateTo({
      url: `/pages/game/game?difficulty=${difficulty}&new=1`
    });
    this.setData({ showDifficultyModal: false });
  },

  closeDifficultyModal() {
    this.setData({ showDifficultyModal: false });
  },

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
      content: '确定要清空所有存档、设置和解锁内容吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          saveManager.clearAll();
          app.globalData.noAds = false;
          app.globalData.soundEnabled = true;
          app.globalData.bgmEnabled = false;
          app.saveSettings();
          this.setData({ hasSave: false, noAds: false });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  showLeaderboard() {
    wx.showToast({ title: '排行榜开发中', icon: 'none' });
  },

  preventBubble() {}
});
