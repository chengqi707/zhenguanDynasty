App({
  globalData: {
    userInfo: null,
    openid: null,
    noAds: false,
    soundEnabled: true,
    bgmEnabled: false,
    difficulty: 'normal',
    // 跨 tab 页传参（switchTab 不能带 query），由 game 页 onShow 消费并清除
    pendingGameParams: null
  },

  onLaunch(options) {
    console.log('凌烟阁密档 小程序启动', options);
    // V3.2: 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({ env: 'lyg-cloud-env', traceUser: true });
      // 静默登录获取 openid，失败不阻断游戏
      this.cloudLogin();
    }
    // 激励视频广告：仅当配置了广告位 ID 才初始化
    const adManager = require('./utils/adManager.js');
    if (adManager.AD_UNIT_ID) {
      adManager.initRewardedAd(adManager.AD_UNIT_ID);
    }
    this.checkUpdate();
    this.loadSettings();
    // V3.2: 适龄提示
    this.showAgeTip();
  },

  // 调用 login 云函数获取 openid（静默降级）
  cloudLogin() {
    wx.cloud.callFunction({
      name: 'login',
      success: (res) => {
        if (res.result && res.result.openid) {
          this.globalData.openid = res.result.openid;
          console.log('登录成功，openid 已获取');
        }
      },
      fail: (err) => {
        console.warn('login 云函数调用失败（未部署或未开通云环境），已降级为游客模式', err);
      }
    });
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
  },

  // V3.2: 适龄提示
  showAgeTip() {
    const shown = wx.getStorageSync('lyg_age_tip_shown');
    if (shown) return;
    wx.showModal({
      title: '适龄提示',
      content: '本游戏适合16周岁及以上用户。游戏内含有虚拟付费内容，请理性消费。游戏剧情基于历史事件改编，不代表真实历史。',
      showCancel: false,
      confirmText: '我知道了',
      success: () => {
        wx.setStorageSync('lyg_age_tip_shown', true);
      }
    });
  }
});
