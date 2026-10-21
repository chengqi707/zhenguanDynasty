// 云函数：从云端读取游戏存档
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const openid = cloud.getWXContext().OPENID;
  if (typeof openid !== 'string' || !openid) return { code: -1, message: '请登录后读取存档' };
  const { slotId = 'main' } = event || {};
  if (typeof slotId !== 'string' || !/^[A-Za-z0-9_-]{1,32}$/.test(slotId)) {
    return { code: -1, message: '存档位不正确' };
  }
  try {
    const collection = db.collection('game_saves');
    const result = await collection.where({ _openid: openid, slotId }).orderBy('updateTime', 'desc').limit(1).get();
    if (result.data.length > 0) {
      return { code: 0, data: result.data[0].saveData, updateTime: result.data[0].updateTime };
    }
    return { code: 0, data: null, message: '无存档' };
  } catch (err) {
    console.error('读取失败', err);
    return { code: -1, message: '读取失败，请稍后重试' };
  }
};
