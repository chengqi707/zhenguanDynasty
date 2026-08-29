// 云函数：支付回调（虚拟支付预下单）
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { type, userInfo, productId } = event;
  const openid = userInfo.openId;

  try {
    // 记录购买日志
    await db.collection('purchase_logs').add({
      data: {
        _openid: openid,
        productId,
        type,
        status: 'pending',
        createTime: db.serverDate()
      }
    });
    return { code: 0, message: '预下单成功' };
  } catch (err) {
    console.error('支付回调失败', err);
    return { code: -1, message: '支付失败', error: err.message };
  }
};
