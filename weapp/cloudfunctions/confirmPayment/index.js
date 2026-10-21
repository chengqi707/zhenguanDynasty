// 云函数：只读确认已核验的订单。客户端成功回调不构成付款凭证。
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const openid = cloud.getWXContext().OPENID;
  if (typeof openid !== 'string' || !openid) return { code: -1, message: '请登录后核验支付' };
  const { orderId, productId } = event || {};
  if (typeof orderId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(orderId) ||
      typeof productId !== 'string' || !/^[a-z_]{1,32}$/.test(productId)) {
    return { code: -1, message: '订单参数不正确' };
  }
  // 可信渠道及数据库权限未完成验收前，即使库内存在标记也不开放凭证恢复。
  if (process.env.PAYMENT_RECEIPTS_ENABLED !== 'true') {
    return { code: -1, reason: 'PAYMENT_NOT_CONFIGURED', message: '支付核验暂未开通' };
  }
  try {
    const orders = await db.collection('orders').where({ _openid: openid, orderId, productId }).limit(1).get();
    const order = orders.data[0];
    // 该标记只能由可信支付服务写入，旧版直接标为 paid 的订单不予认可。
    if (!order || order.status !== 'paid' || order.paymentVerified !== true ||
        typeof order.transactionId !== 'string' || !order.transactionId ||
        !Number.isInteger(order.amount) || order.amount <= 0 || order.amountPaid !== order.amount) {
      return { code: -1, message: '订单尚未通过支付核验' };
    }
    const purchases = await db.collection('user_purchases').where({
      _openid: openid, productId, orderId, paymentVerified: true
    }).limit(1).get();
    const receipt = purchases.data[0];
    if (!receipt || receipt.transactionId !== order.transactionId) {
      return { code: -1, message: '购买权益尚未确认，请稍后重试' };
    }
    return { code: 0, verified: true, productId, orderId, transactionId: order.transactionId };
  } catch (err) {
    console.error('核验支付失败', err);
    return { code: -1, message: '核验支付失败，请稍后重试' };
  }
};
