// 云函数：创建微信支付订单（统一下单）
// ⚠️ 生产环境需要配置真实的微信支付商户号信息
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { productId, productName, price, openid } = event;

  try {
    // 1. 生成唯一订单号
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // 2. 记录订单到数据库
    await db.collection('orders').add({
      data: {
        _openid: openid,
        orderId,
        productId,
        productName,
        price,
        status: 'unpaid',
        createTime: db.serverDate()
      }
    });

    // 3. 生产环境：调用微信支付统一下单API获取 prepay_id
    // 需要配置：商户号(mchId)、API密钥(apiKey)、商户证书等
    // 参考文档：https://pay.weixin.qq.com/wiki/doc/api/wxpay_v2.jsapi.php
    /*
    const wxpay = require('wxpay');
    const unifiedOrder = await wxpay.unifiedOrder({
      body: productName,
      out_trade_no: orderId,
      total_fee: price * 100, // 单位：分
      openid: openid,
      trade_type: 'JSAPI',
      notify_url: 'https://你的云函数地址/paymentCallback'
    });
    const prepayId = unifiedOrder.prepay_id;
    
    // 4. 生成前端调起支付所需的参数
    const timeStamp = String(Math.floor(Date.now() / 1000));
    const nonceStr = Math.random().toString(36).substr(2, 15);
    const packageStr = 'prepay_id=' + prepayId;
    const signType = 'MD5';
    
    // 5. 生成签名
    const sign = wxpay.generateSign({
      appId: cloud.getWXContext().APPID,
      timeStamp, nonceStr, package: packageStr, signType
    }, apiKey, signType);
    
    return {
      orderId,
      timeStamp,
      nonceStr,
      package: packageStr,
      signType,
      paySign: sign
    };
    */

    // 当前为开发/测试模式：返回模拟订单，客户端会走 simulated 支付流程
    // 开发者需在上面接入真实微信支付后删除下面的模拟返回
    return {
      orderId,
      simulated: true,
      message: '未配置真实微信支付商户号，当前为模拟支付。请在云函数中配置 mchId、apiKey 后启用真实支付。'
    };

  } catch (err) {
    console.error('创建订单失败', err);
    return { error: err.message };
  }
};
