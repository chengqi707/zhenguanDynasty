const app = getApp();
const payment = require('../../utils/payment.js');
const analytics = require('../../utils/analytics.js');

Page({
  data: {
    noAds: false
  },

  onLoad() {
    this.setData({ noAds: app.globalData.noAds });
    // 检查云端购买状态
    payment.checkPurchaseStatus().then((hasPurchased) => {
      this.setData({ noAds: hasPurchased || app.globalData.noAds });
    });
  },

  purchaseRemoveAds() {
    if (this.data.noAds) {
      wx.showToast({ title: '已购买', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认购买',
      content: '永久去广告 ¥6.00，确认支付吗？',
      success: (res) => {
        if (res.confirm) {
          payment.purchase('removeAds').then((result) => {
            app.globalData.noAds = true;
            app.saveSettings();
            this.setData({ noAds: true });
            analytics.logPurchase('remove_ads', 6);
            wx.showToast({ title: '购买成功', icon: 'success' });
          }).catch((err) => {
            wx.showToast({ title: err.message || '购买失败', icon: 'none' });
          });
        }
      }
    });
  }
});
