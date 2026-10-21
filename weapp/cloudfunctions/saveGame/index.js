// 云函数：保存游戏存档到云端
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const openid = cloud.getWXContext().OPENID;
  if (typeof openid !== 'string' || !openid) return { code: -1, message: '请登录后保存存档' };
  const { saveData, slotId = 'main' } = event || {};
  if (!saveData || typeof saveData !== 'object' || Array.isArray(saveData) ||
      typeof slotId !== 'string' || !/^[A-Za-z0-9_-]{1,32}$/.test(slotId)) {
    return { code: -1, message: '存档参数不正确' };
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
    return { code: -1, message: '保存失败，请稍后重试' };
  }
};
