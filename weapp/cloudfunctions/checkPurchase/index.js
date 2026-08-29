// 云函数：查询用户购买状态
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { productId } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 1. 查询用户购买记录
    const query = { _openid: openid };
    if (productId) {
      query.productId = productId;
    }

    const purchaseRes = await db.collection('user_purchases').where(query).get();

    // 2. 构建返回结果
    const purchased = {};
    purchaseRes.data.forEach(item => {
      purchased[item.productId] = {
        hasPurchased: true,
        purchaseTime: item.purchaseTime,
        productName: item.productName
      };
    });

    // 如果没有指定具体商品，返回所有购买记录
    if (!productId) {
      return {
        code: 0,
        hasPurchased: purchaseRes.data.length > 0,
        purchased,
        count: purchaseRes.data.length
      };
    }

    // 指定了商品ID，返回该商品的购买状态
    const item = purchaseRes.data[0];
    return {
      code: 0,
      hasPurchased: !!item,
      productId: productId,
      purchaseTime: item ? item.purchaseTime : null,
      productName: item ? item.productName : null
    };

  } catch (err) {
    console.error('查询购买状态失败', err);
    return { code: -1, message: '查询失败', error: err.message };
  }
};
