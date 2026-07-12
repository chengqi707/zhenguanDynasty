// 支付管理器 - 微信支付去广告

const app = getApp();

// 商品配置
const PRODUCTS = {
  removeAds: {
    id: 'remove_ads',
    name: '永久去广告',
    price: 6, // 单位：元
    description: '永久移除所有广告，享受纯净游戏体验'
  }
};

function purchase(productId) {
  return new Promise((resolve, reject) => {
    const product = PRODUCTS[productId];
    if (!product) {
      reject(new Error('商品不存在'));
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
        
        // 2. 调起微信支付
        wx.requestPayment({
          timeStamp: order.timeStamp,
          nonceStr: order.nonceStr,
          package: order.package,
          signType: order.signType,
          paySign: order.paySign,
          success: (payRes) => {
            // 3. 支付成功，更新用户状态
            app.globalData.noAds = true;
            app.saveSettings();
            
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
      fail: reject
    });
  });
}

function checkPurchaseStatus() {
  return new Promise((resolve) => {
    if (!app.globalData.openid) {
      resolve(false);
      return;
    }
    
    wx.cloud.callFunction({
      name: 'checkPurchase',
      data: { openid: app.globalData.openid },
      success: (res) => {
        const hasPurchased = res.result && res.result.hasPurchased;
        if (hasPurchased) {
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
