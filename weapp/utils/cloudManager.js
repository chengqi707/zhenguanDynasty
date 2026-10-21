// 云开发管理器 V3.2
// 封装云函数调用，提供云端存档、排行榜、用户资料等功能

const app = getApp();

let openid = null;

const cloudManager = {
  // 初始化：获取用户openid
  async init() {
    if (!wx.cloud) {
      console.log('当前环境不支持云开发');
      return false;
    }
    try {
      const res = await wx.cloud.callFunction({ name: 'login' });
      openid = res.result.openid;
      app.globalData.openid = openid;
      console.log('云开发初始化成功，openid:', openid);
      return true;
    } catch (err) {
      console.error('云开发初始化失败', err);
      return false;
    }
  },

  getOpenid() {
    return openid || app.globalData.openid;
  },

  // 云端存档
  async saveToCloud(saveData, slotId = 'main') {
    const id = this.getOpenid();
    if (!id) return { code: -1, message: '未登录' };
    try {
      const res = await wx.cloud.callFunction({
        name: 'saveGame',
        data: { saveData, slotId }
      });
      return res.result;
    } catch (err) {
      console.error('云端保存失败', err);
      return { code: -1, message: '云端保存失败' };
    }
  },

  async loadFromCloud(slotId = 'main') {
    const id = this.getOpenid();
    if (!id) return { code: -1, message: '未登录' };
    try {
      const res = await wx.cloud.callFunction({
        name: 'loadGame',
        data: { slotId }
      });
      return res.result;
    } catch (err) {
      console.error('云端读取失败', err);
      return { code: -1, message: '云端读取失败' };
    }
  },

  // 排行榜
  async getLeaderboard() {
    const id = this.getOpenid();
    try {
      const res = await wx.cloud.callFunction({
        name: 'leaderboard',
        data: { type: 'global', openid: id }
      });
      return res.result;
    } catch (err) {
      console.error('排行榜加载失败', err);
      return { code: -1, message: '排行榜加载失败' };
    }
  },

  async submitScore(score, title, cycle = 1) {
    const id = this.getOpenid();
    if (!id) return { code: -1, message: '未登录' };
    try {
      const db = wx.cloud.database();
      const collection = db.collection('leaderboard');
      const existing = await collection.where({ _openid: id }).get();
      const data = {
        score,
        title,
        cycle,
        updateTime: db.serverDate()
      };
      if (existing.data.length > 0) {
        // 只更新更高分
        if (existing.data[0].score < score) {
          await collection.doc(existing.data[0]._id).update({ data });
        }
      } else {
        const userInfo = app.globalData.userInfo || {};
        await collection.add({
          data: {
            _openid: id,
            nickname: userInfo.nickName || '匿名玩家',
            ...data
          }
        });
      }
      return { code: 0, message: '提交成功' };
    } catch (err) {
      console.error('提交分数失败', err);
      return { code: -1, message: '提交失败' };
    }
  },

  // 用户资料
  async getUserProfile() {
    const id = this.getOpenid();
    if (!id) return null;
    try {
      const db = wx.cloud.database();
      const res = await db.collection('user_profiles').where({ _openid: id }).get();
      return res.data.length > 0 ? res.data[0] : null;
    } catch (err) {
      console.error('获取用户资料失败', err);
      return null;
    }
  },

  async updateUserProfile(data) {
    const id = this.getOpenid();
    if (!id) return false;
    try {
      const db = wx.cloud.database();
      const existing = await db.collection('user_profiles').where({ _openid: id }).get();
      const updateData = { ...data, updateTime: db.serverDate() };
      if (existing.data.length > 0) {
        await db.collection('user_profiles').doc(existing.data[0]._id).update({ data: updateData });
      } else {
        await db.collection('user_profiles').add({
          data: {
            _openid: id,
            ...updateData,
            createTime: db.serverDate()
          }
        });
      }
      return true;
    } catch (err) {
      console.error('更新用户资料失败', err);
      return false;
    }
  }
};

module.exports = cloudManager;
