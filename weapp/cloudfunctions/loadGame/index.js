// 云函数：从云端读取游戏存档
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { openid, slotId = 'main' } = event;
  if (!openid) {
    return { code: -1, message: '参数缺失' };
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
    return { code: -1, message: '读取失败', error: err.message };
  }
};
