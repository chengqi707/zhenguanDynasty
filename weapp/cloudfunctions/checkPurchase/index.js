// 云函数：只返回当前用户且与可信支付订单相符的购买凭证。
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const openid = cloud.getWXContext().OPENID;
  if (typeof openid !== 'string' || !openid) return { code: -1, message: '请登录后查询购买记录' };
  const { productId } = event || {};
  const products = ['remove_ads', 'duruhui', 'lijing', 'chusuliang', 'golden_age', 'cycle_boost'];
  if (productId !== undefined && !products.includes(productId)) {
    return { code: -1, message: '商品不存在' };
  }
  if (process.env.PAYMENT_RECEIPTS_ENABLED !== 'true') {
    return { code: 0, purchased: {}, hasPurchased: false };
  }
  try {
    const query = { _openid: openid, paymentVerified: true };
    if (productId) query.productId = productId;
    const result = await db.collection('user_purchases').where(query).get();
    const purchased = {};
    for (const receipt of result.data) {
      if (!products.includes(receipt.productId) || typeof receipt.orderId !== 'string' || !receipt.orderId ||
          typeof receipt.transactionId !== 'string' || !receipt.transactionId) continue;
      const orders = await db.collection('orders').where({
        _openid: openid, orderId: receipt.orderId, productId: receipt.productId
      }).limit(1).get();
      const order = orders.data[0];
      if (!order || order.status !== 'paid' || order.paymentVerified !== true ||
          order.transactionId !== receipt.transactionId || !Number.isInteger(order.amount) ||
          order.amount <= 0 || order.amountPaid !== order.amount) continue;
      purchased[receipt.productId] = {
        verified: true,
        productId: receipt.productId,
        orderId: receipt.orderId,
        transactionId: receipt.transactionId
      };
    }
    return { code: 0, purchased, hasPurchased: Object.keys(purchased).length > 0 };
  } catch (err) {
    console.error('查询购买记录失败', err);
    return { code: -1, message: '查询购买记录失败，请稍后重试' };
  }
};
