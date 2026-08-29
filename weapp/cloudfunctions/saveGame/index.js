// 云函数：保存游戏存档到云端
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { openid, saveData, slotId = 'main' } = event;
  if (!openid || !saveData) {
    return { code: -1, message: '参数缺失' };
  }
  try {
    const collection = db.collection('game_saves');
    const existing = await collection.where({ _openid: openid, slotId }).get();
    if (existing.data.length > 0) {
      await collection.doc(existing.data[0]._id).update({
        data: {
          saveData,
          updateTime: db.serverDate()
        }
      });
    } else {
      await collection.add({
        data: {
          _openid: openid,
          slotId,
          saveData,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      });
    }
    return { code: 0, message: '保存成功' };
  } catch (err) {
    console.error('保存失败', err);
    return { code: -1, message: '保存失败', error: err.message };
  }
};
