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

function purchase(productId) {
  return new Promise((resolve, reject) => {
    const product = PRODUCTS[productId];
    if (!product) {
      reject(new Error('商品不存在'));
      return;
    }

    // 检查是否是本地商品（不需要云支付的）
    if (productId === 'cycleBoost') {
      // 周目加成包是本地计算，不需要真实支付
      resolve({ success: true, local: true });
      return;
    }

    // 1. 调用云函数创建订单
    wx.cloud.callFunction({
      name: 'createOrder',
      data: {
        productId: product.id,
        productName: product.name,
        price: product.price,
        openid: app.globalData.openid
      },
      success: (res) => {
        const order = res.result;
        if (!order || !order.timeStamp) {
          // 云函数未部署，使用模拟支付（开发测试）
          console.warn('云函数未返回订单，使用模拟支付');
          resolve({ success: true, simulated: true });
          return;
        }
        
        // 2. 调起微信支付
        wx.requestPayment({
          timeStamp: order.timeStamp,
          nonceStr: order.nonceStr,
          package: order.package,
          signType: order.signType,
          paySign: order.paySign,
          success: (payRes) => {
            // 3. 支付成功，更新用户状态
            if (productId === 'removeAds') {
              app.globalData.noAds = true;
              app.saveSettings();
            }
            
            // 4. 通知服务器确认支付
            wx.cloud.callFunction({
              name: 'confirmPayment',
              data: { orderId: order.orderId }
            });
            
            resolve({ success: true, orderId: order.orderId });
          },
          fail: (err) => {
            reject(new Error('支付失败：' + err.errMsg));
          }
        });
      },
      fail: (err) => {
        console.warn('云函数调用失败，使用模拟支付', err);
        resolve({ success: true, simulated: true });
      }
    });
  });
}

// 查询指定商品的购买状态（默认查询去广告商品，shop 页用于恢复购买）
function checkPurchaseStatus(productId = PRODUCTS.removeAds.id) {
  return new Promise((resolve) => {
    if (!app.globalData.openid) {
      resolve(false);
      return;
    }

    wx.cloud.callFunction({
      name: 'checkPurchase',
      data: { openid: app.globalData.openid, productId },
      success: (res) => {
        const result = res.result || {};
        let hasPurchased = false;
        if (result.purchased && typeof result.purchased === 'object') {
          // 云函数未按商品过滤时，前端按 productId 过滤，避免买过任意商品被当成已去广告
          hasPurchased = !!(result.purchased[productId] && result.purchased[productId].hasPurchased);
        } else {
          hasPurchased = result.hasPurchased === true;
        }
        if (hasPurchased && productId === PRODUCTS.removeAds.id) {
          app.globalData.noAds = true;
          app.saveSettings();
        }
        resolve(hasPurchased);
      },
      fail: () => resolve(false)
    });
  });
}

module.exports = {
  PRODUCTS,
  purchase,
  checkPurchaseStatus
};
