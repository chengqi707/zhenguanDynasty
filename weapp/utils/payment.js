// 支付管理器 - 微信支付（V3.0 支持多商品）

const app = getApp();

// 商品配置
const PRODUCTS = {
  removeAds: {
    id: 'remove_ads',
    name: '永久去广告',
    price: 6,
    description: '永久移除所有广告，享受纯净游戏体验'
  },
  // V3.0 名臣卡
  duruhui: {
    id: 'duruhui',
    name: '杜如晦名臣卡',
    price: 3,
    description: '初始能力+10，谋略类事件额外收益'
  },
  lijing: {
    id: 'lijing',
    name: '李靖名臣卡',
    price: 3,
    description: '军事类事件额外收益，武将好感度+10'
  },
  chusuliang: {
    id: 'chusuliang',
    name: '褚遂良名臣卡',
    price: 3,
    description: '政治类事件额外收益，文官好感度+10'
  },
  // V3.0 剧本
  golden_age: {
    id: 'golden_age',
    name: '盛世序章剧本',
    price: 6,
    description: '解锁「太宗」谥号后可用，初始稳定度+10'
  },
  // V3.0 周目加成
  cycleBoost: {
    id: 'cycle_boost',
    name: '周目加成包',
    price: 6,
    description: '立即获得稳定度+5、能力+3的永久加成'
  }
};

const activePurchases = new Set();
const PENDING_KEY = 'lyg_pending_payments';

function callCloud(name, data) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud || !app.globalData.openid) {
      reject(new Error('暂时无法连接支付服务，请登录后重试'));
      return;
    }
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => resolve(res.result),
      fail: () => reject(new Error('支付服务连接失败，请稍后重试'))
    });
  });
}

function isVerifiedReceipt(receipt, productId) {
  return !!receipt && receipt.verified === true && !receipt.simulated && !receipt.local && receipt.productId === productId &&
    typeof receipt.orderId === 'string' && receipt.orderId.length > 0 &&
    typeof receipt.transactionId === 'string' && receipt.transactionId.length > 0;
}

// 未核验的支付保留订单号，下次只重试核验，避免重复扣款。
function getPendingOrders() {
  try {
    const pending = wx.getStorageSync(PENDING_KEY);
    return pending && typeof pending === 'object' && !Array.isArray(pending) ? pending : {};
  } catch (err) {
    throw new Error('读取支付订单失败，请稍后重试');
  }
}

function setPendingOrder(productId, orderId) {
  const pending = getPendingOrders();
  if (orderId) pending[productId] = orderId;
  else delete pending[productId];
  try {
    wx.setStorageSync(PENDING_KEY, pending);
  } catch (err) {
    throw new Error('保存支付订单失败，请稍后重试');
  }
}

async function confirmOrder(orderId, productId) {
  let result;
  try {
    result = await callCloud('confirmPayment', { orderId, productId });
  } catch (err) {
    throw new Error('支付结果尚未核验，请勿重复支付，稍后进入商铺重试');
  }
  if (!result || result.code !== 0 || !isVerifiedReceipt(result, productId) || result.orderId !== orderId) {
    throw new Error('支付结果尚未核验，请勿重复支付，稍后进入商铺重试');
  }
  setPendingOrder(productId, null);
  return { ...result, success: true };
}

async function getVerifiedPurchases(productId) {
  const result = await callCloud('checkPurchase', productId ? { productId } : {});
  if (!result || result.code !== 0) throw new Error('购买记录查询失败，请稍后重试');
  const purchased = result.purchased || {};
  return Object.values(PRODUCTS).map(product => {
    const receipt = purchased[product.id];
    return isVerifiedReceipt(receipt, product.id) ? receipt : null;
  }).filter(receipt => receipt && (!productId || receipt.productId === productId));
}

async function purchase(productId) {
  const product = Object.prototype.hasOwnProperty.call(PRODUCTS, productId) && PRODUCTS[productId];
  if (!product) throw new Error('商品不存在');
  if (activePurchases.has(product.id)) throw new Error('正在处理该商品，请勿重复操作');
  activePurchases.add(product.id);
  try {
    const receipts = await getVerifiedPurchases(product.id);
    if (receipts.length > 0) {
      setPendingOrder(product.id, null);
      return { ...receipts[0], success: true, restored: true };
    }
    const pending = getPendingOrders()[product.id];
    if (pending) return await confirmOrder(pending, product.id);

    // 身份、商品价格均由服务端确定，客户端只提交商品编号。
    const order = await callCloud('createOrder', { productId: product.id });
    if (!order || order.code !== 0 || order.simulated || order.productId !== product.id ||
        !['orderId', 'timeStamp', 'nonceStr', 'package', 'signType', 'paySign']
          .every(key => typeof order[key] === 'string' && order[key].length > 0)) {
      throw new Error((order && order.message) || '支付暂未开通，请稍后再试');
    }
    // 先持久化订单，存储失败时不调起支付。
    setPendingOrder(product.id, order.orderId);
    await new Promise((resolve, reject) => {
      wx.requestPayment({
        timeStamp: order.timeStamp,
        nonceStr: order.nonceStr,
        package: order.package,
        signType: order.signType,
        paySign: order.paySign,
        success: resolve,
        fail: (err) => {
          const cancelled = /cancel/.test((err && err.errMsg) || '');
          if (cancelled) {
            try { setPendingOrder(product.id, null); } catch (e) {}
          }
          reject(new Error(cancelled ? '已取消支付' : '支付结果尚未核验，请勿重复支付，稍后重试'));
        }
      });
    });
    return await confirmOrder(order.orderId, product.id);
  } finally {
    activePurchases.delete(product.id);
  }
}

// 旧版 hasPurchased/noAds 标记可能来自模拟支付，必须取得新版服务端凭证。
async function checkPurchaseStatus(productId = PRODUCTS.removeAds.id) {
  try {
    const receipts = await getVerifiedPurchases(productId);
    const hasPurchased = receipts.length > 0;
    if (productId === PRODUCTS.removeAds.id) {
      app.globalData.noAds = hasPurchased;
      app.saveSettings();
    }
    return hasPurchased;
  } catch (err) {
    return false;
  }
}

module.exports = {
  PRODUCTS,
  purchase,
  checkPurchaseStatus,
  getVerifiedPurchases,
  isVerifiedReceipt
};
