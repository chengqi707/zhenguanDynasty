// 微信登录与云开发封装

const app = getApp();

// 云开发环境 ID（需在小程序后台开通云开发）
const CLOUD_ENV = 'lingyange-xxx'; // 替换为实际环境 ID

function initCloud() {
  if (!wx.cloud) {
    console.warn('当前版本不支持云开发');
    return false;
  }
  wx.cloud.init({ env: CLOUD_ENV, traceUser: true });
  return true;
}

// 获取用户 openid（静默登录）
function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 云函数获取 openid
          callCloudFunction('login', { code: res.code })
            .then((result) => {
              app.globalData.openid = result.openid;
              resolve(result);
            })
            .catch(reject);
        } else {
          reject(new Error('登录失败'));
        }
      },
      fail: reject
    });
  });
}

// 获取用户信息（需用户授权）
function getUserProfile() {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于展示玩家昵称和头像',
      success: (res) => {
        app.globalData.userInfo = res.userInfo;
        resolve(res.userInfo);
      },
      fail: reject
    });
  });
}

// 调用云函数
function callCloudFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => resolve(res.result),
      fail: reject
    });
  });
}

// 数据库操作封装
const db = wx.cloud ? wx.cloud.database() : null;

function getUserCollection() {
  if (!db) return null;
  return db.collection('users');
}

function getScoreCollection() {
  if (!db) return null;
  return db.collection('scores');
}

// 保存用户数据到云端
function saveUserData(data) {
  if (!app.globalData.openid) return Promise.reject(new Error('未登录'));
  return callCloudFunction('saveUserData', {
    openid: app.globalData.openid,
    data
  });
}

// 获取用户数据
function getUserData() {
  if (!app.globalData.openid) return Promise.reject(new Error('未登录'));
  return callCloudFunction('getUserData', {
    openid: app.globalData.openid
  });
}

// 上报分数到排行榜
function submitScore(score) {
  if (!app.globalData.openid) return Promise.reject(new Error('未登录'));
  return callCloudFunction('submitScore', {
    openid: app.globalData.openid,
    userInfo: app.globalData.userInfo,
    score,
    timestamp: new Date().toISOString()
  });
}

// 获取排行榜
function getLeaderboard(limit = 50) {
  return callCloudFunction('getLeaderboard', { limit });
}

module.exports = {
  initCloud,
  login,
  getUserProfile,
  callCloudFunction,
  getUserCollection,
  getScoreCollection,
  saveUserData,
  getUserData,
  submitScore,
  getLeaderboard
};
