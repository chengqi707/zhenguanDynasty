const app = getApp();
const payment = require('../../utils/payment.js');
const saveManager = require('../../utils/saveManager.js');
const config = require('../../utils/config.js');
const analytics = require('../../utils/analytics.js');

Page({
  data: {
    noAds: false,
    // V3.0 商品
    products: [],
    unlockedNameCards: [],
    unlockedScripts: []
  },

  onLoad() {
    this.setData({ noAds: app.globalData.noAds });
    this.loadProducts();
    this.loadUnlockedItems();
    // 检查云端购买状态
    payment.checkPurchaseStatus().then((hasPurchased) => {
      this.setData({ noAds: hasPurchased || app.globalData.noAds });
    });
  },

  onShow() {
    this.loadUnlockedItems();
  },

  loadProducts() {
    const products = [
      {
        id: 'removeAds',
        type: 'utility',
        name: '永久去广告',
        desc: '永久移除所有广告，享受纯净游戏体验',
        price: 6,
        icon: '🛡️',
        purchased: false
      },
      ...Object.values(config.nameCards).map(nc => ({
        id: nc.id,
        type: 'nameCard',
        name: nc.name + ' · ' + nc.title,
        desc: nc.desc,
        price: nc.price,
        icon: nc.emoji,
        purchased: false
      })),
      ...Object.values(config.scripts).filter(s => s.price > 0).map(s => ({
        id: s.id,
        type: 'script',
        name: s.name + '剧本',
        desc: s.desc,
        price: s.price,
        icon: '📜',
        purchased: false
      })),
      {
        id: 'cycleBoost',
        type: 'boost',
        name: '周目加成包',
        desc: '立即获得稳定度+5、能力+3的永久加成（不可重复购买）',
        price: 6,
        icon: '⚡',
        purchased: false
      }
    ];
    this.setData({ products });
  },

  loadUnlockedItems() {
    const cycle = saveManager.getCycleData();
    const nameCards = cycle.unlockedNameCards || [];
    const scripts = cycle.unlockedScripts || [];
    const products = this.data.products.map(p => {
      if (p.type === 'nameCard' && nameCards.includes(p.id)) {
        return { ...p, purchased: true };
      }
      if (p.type === 'script' && scripts.includes(p.id)) {
        return { ...p, purchased: true };
      }
      if (p.id === 'removeAds' && app.globalData.noAds) {
        return { ...p, purchased: true };
      }
      return p;
    });
    this.setData({ products, unlockedNameCards: nameCards, unlockedScripts: scripts });
  },

  purchaseItem(e) {
    const id = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === id);
    if (!product) return;

    if (product.purchased) {
      wx.showToast({ title: '已购买', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认购买',
      content: `${product.name} ¥${product.price}.00，确认支付吗？`,
      success: (res) => {
        if (res.confirm) {
          if (product.type === 'nameCard') {
            this.purchaseNameCard(product);
          } else if (product.type === 'script') {
            this.purchaseScript(product);
          } else if (product.type === 'boost') {
            this.purchaseBoost(product);
          } else {
            this.purchaseRemoveAds(product);
          }
        }
      }
    });
  },

  purchaseRemoveAds(product) {
    payment.purchase('removeAds').then(() => {
      app.globalData.noAds = true;
      app.saveSettings();
      this.loadUnlockedItems();
      analytics.logPurchase('remove_ads', product.price);
      wx.showToast({ title: '购买成功', icon: 'success' });
    }).catch((err) => {
      wx.showToast({ title: err.message || '购买失败', icon: 'none' });
    });
  },

  purchaseNameCard(product) {
    payment.purchase(product.id).then(() => {
      saveManager.unlockNameCard(product.id);
      const cycle = saveManager.getCycleData();
      if (!cycle.unlockedNameCards.includes(product.id)) {
        cycle.unlockedNameCards.push(product.id);
        saveManager.saveCycleData(cycle);
      }
      this.loadUnlockedItems();
      analytics.logPurchase('namecard_' + product.id, product.price);
      wx.showToast({ title: `获得名臣卡：${product.name}`, icon: 'success' });
    }).catch((err) => {
      wx.showToast({ title: err.message || '购买失败', icon: 'none' });
    });
  },

  purchaseScript(product) {
    payment.purchase(product.id).then(() => {
      const cycle = saveManager.getCycleData();
      if (!cycle.unlockedScripts.includes(product.id)) {
        cycle.unlockedScripts.push(product.id);
        saveManager.saveCycleData(cycle);
      }
      this.loadUnlockedItems();
      analytics.logPurchase('script_' + product.id, product.price);
      wx.showToast({ title: `解锁剧本：${product.name}`, icon: 'success' });
    }).catch((err) => {
      wx.showToast({ title: err.message || '购买失败', icon: 'none' });
    });
  },

  purchaseBoost(product) {
    payment.purchase(product.id).then(() => {
      const cycle = saveManager.getCycleData();
      cycle.permanentBonus.stability += 5;
      cycle.permanentBonus.ability += 3;
      saveManager.saveCycleData(cycle);
      this.loadUnlockedItems();
      analytics.logPurchase('cycle_boost', product.price);
      wx.showToast({ title: '永久加成已应用', icon: 'success' });
    }).catch((err) => {
      wx.showToast({ title: err.message || '购买失败', icon: 'none' });
    });
  },

  onShareAppMessage() {
    return {
      title: '凌烟阁密档 - 名臣卡/剧本包限时特惠，快来选购！',
      path: '/pages/shop/shop',
      imageUrl: ''
    };
  },

  onShareTimeline() {
    return {
      title: '凌烟阁密档 - 商铺限时特惠',
      query: '',
      imageUrl: ''
    };
  }
});
