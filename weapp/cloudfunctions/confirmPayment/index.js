// 云函数：确认支付成功，更新用户购买状态
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { orderId } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 1. 查询订单
    const orderRes = await db.collection('orders').where({
      orderId,
      _openid: openid
    }).get();

    if (orderRes.data.length === 0) {
      return { code: -1, message: '订单不存在' };
    }

    const order = orderRes.data[0];

    // 2. 更新订单状态为已支付
    await db.collection('orders').doc(order._id).update({
      data: {
        status: 'paid',
        payTime: db.serverDate()
      }
    });

    // 3. 更新用户购买记录
    const purchaseRes = await db.collection('user_purchases').where({
      _openid: openid,
      productId: order.productId
    }).get();

    if (purchaseRes.data.length === 0) {
      // 首次购买，新增记录
      await db.collection('user_purchases').add({
        data: {
          _openid: openid,
          productId: order.productId,
          productName: order.productName,
          price: order.price,
          orderId: orderId,
          purchaseTime: db.serverDate()
        }
      });
    } else {
      // 已购买过，更新记录
      await db.collection('user_purchases').doc(purchaseRes.data[0]._id).update({
        data: {
          orderId: orderId,
          purchaseTime: db.serverDate()
        }
      });
    }

    return { code: 0, message: '支付确认成功' };

  } catch (err) {
    console.error('确认支付失败', err);
    return { code: -1, message: '确认支付失败', error: err.message };
  }
};
