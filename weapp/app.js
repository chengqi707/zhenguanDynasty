App({
  globalData: {
    userInfo: null,
    openid: null,
    noAds: false,
    soundEnabled: true,
    bgmEnabled: false,
    difficulty: 'normal'
  },

  onLaunch(options) {
    console.log('凌烟阁密档 小程序启动', options);
    this.checkUpdate();
    this.loadSettings();
  },

  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) updateManager.applyUpdate();
              }
            });
          });
        }
      });
    }
  },

  loadSettings() {
    try {
      const settings = wx.getStorageSync('lyg_settings');
      if (settings) {
        this.globalData.soundEnabled = settings.sound !== false;
        this.globalData.bgmEnabled = settings.bgm === true;
        this.globalData.noAds = settings.noAds === true;
      }
    } catch (e) {
      console.error('加载设置失败', e);
    }
  },

  saveSettings() {
    try {
      wx.setStorageSync('lyg_settings', {
        sound: this.globalData.soundEnabled,
        bgm: this.globalData.bgmEnabled,
        noAds: this.globalData.noAds
      });
    } catch (e) {
      console.error('保存设置失败', e);
    }
  }
});
