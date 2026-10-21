const app = getApp();
const payment = require('../../utils/payment.js');
const saveManager = require('../../utils/saveManager.js');
const config = require('../../utils/config.js');
const analytics = require('../../utils/analytics.js');

Page({
  data: {
    noAds: false,
    purchasingId: '',
    restoring: false,
    // V3.0 商品
    products: [],
    unlockedNameCards: [],
    unlockedScripts: []
  },

  onLoad() {
    this.setData({ noAds: app.globalData.noAds });
    this.loadProducts();
    this.loadUnlockedItems();
  },

  onShow() {
    this.loadUnlockedItems();
    this.restorePurchases(false);
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
    const products = this.data.products.map(p => ({
      ...p,
      purchased: (p.type === 'nameCard' && nameCards.includes(p.id)) ||
        (p.type === 'script' && scripts.includes(p.id)) ||
        (p.id === 'removeAds' && app.globalData.noAds) ||
        (p.id === 'cycleBoost' && (cycle.appliedPurchases || []).includes('cycle_boost'))
    }));
    this.setData({ products, noAds: app.globalData.noAds, unlockedNameCards: nameCards, unlockedScripts: scripts });
  },

  applyReceipt(receipt) {
    saveManager.applyVerifiedPurchase(receipt);
    if (receipt.productId === 'remove_ads') {
      app.globalData.noAds = true;
      app.saveSettings();
    }
  },

  async restorePurchases(showFeedback = true) {
    if (this.data.restoring || this.data.purchasingId) return;
    this.setData({ restoring: true });
    try {
      const receipts = await payment.getVerifiedPurchases();
      receipts.forEach(receipt => this.applyReceipt(receipt));
      this.loadUnlockedItems();
      if (showFeedback !== false) {
        wx.showToast({ title: receipts.length ? '已恢复购买权益' : '暂无已核验的购买记录', icon: 'none' });
      }
    } catch (err) {
      if (showFeedback !== false) wx.showToast({ title: err.message || '权益恢复失败，请稍后重试', icon: 'none' });
    } finally {
      this.setData({ restoring: false });
    }
  },

  async purchaseItem(e) {
    if (this.data.purchasingId || this.data.restoring) return;
    const id = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === id);
    if (!product) return;
    if (product.purchased) {
      wx.showToast({ title: '已获得该商品', icon: 'none' });
      return;
    }

    // 弹出确认框时即锁定，防止连续点击发起多笔购买。
    this.setData({ purchasingId: id });
    try {
      const confirmed = await new Promise((resolve, reject) => {
        wx.showModal({
          title: '确认购买',
          content: product.name + ' ¥' + product.price + '.00，确认支付吗？',
          success: res => resolve(res.confirm),
          fail: () => reject(new Error('无法打开购买确认，请稍后重试'))
        });
      });
      if (!confirmed) return;
      const receipt = await payment.purchase(id);
      const expectedId = payment.PRODUCTS[id].id;
      if (receipt.success !== true || !payment.isVerifiedReceipt(receipt, expectedId)) {
        throw new Error('购买权益尚未通过核验');
      }
      this.applyReceipt(receipt);
      this.loadUnlockedItems();
      // 恢复已有权益不重复记为新购买。
      if (!receipt.restored) analytics.logPurchase(receipt.productId, product.price);
      wx.showToast({ title: receipt.restored ? '已恢复购买权益' : '购买成功', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: err.message || '购买失败，请稍后重试', icon: 'none' });
    } finally {
      this.setData({ purchasingId: '' });
    }
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
