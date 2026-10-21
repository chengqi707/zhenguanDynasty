// 真实支付回调尚未接通验签与查单，拒绝伪造通知，不写订单或购买权益。
exports.main = async () => ({
  code: -1,
  reason: 'PAYMENT_NOT_CONFIGURED',
  message: '支付回调尚未开通'
});
