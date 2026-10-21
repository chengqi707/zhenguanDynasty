// 云函数：真实支付尚未接通时拒绝下单，不生成模拟成功订单。
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const PRODUCTS = ['remove_ads', 'duruhui', 'lijing', 'chusuliang', 'golden_age', 'cycle_boost'];

exports.main = async (event) => {
  const openid = cloud.getWXContext().OPENID;
  if (typeof openid !== 'string' || !openid) return { code: -1, message: '请登录后再购买' };
  const { productId } = event || {};
  if (typeof productId !== 'string' || !PRODUCTS.includes(productId)) {
    return { code: -1, message: '商品不存在' };
  }
  // 后续接入须使用服务端定价和可信支付服务，不得信任客户端价格、身份。
  return { code: -1, reason: 'PAYMENT_NOT_CONFIGURED', message: '支付暂未开通，请稍后再试' };
};
