// 数据埋点 - 适配微信自定义分析 + 本地日志

const app = getApp();

const LOGS_KEY = 'lyg_logs';

function logEvent(event, data = {}) {
  const entry = {
    time: new Date().toISOString(),
    event,
    ...data
  };
  
  // 1. 本地日志存储
  try {
    const logs = wx.getStorageSync(LOGS_KEY) || [];
    logs.push(entry);
    wx.setStorageSync(LOGS_KEY, logs.slice(-500)); // 保留最近 500 条
  } catch (e) {}
  
  // 2. 微信自定义分析（如果配置了）
  if (wx.reportEvent) {
    wx.reportEvent(event, data);
  }
  
  // 3. 控制台输出
  console.log('[埋点]', entry);
}

function exportLogs() {
  try {
    const logs = wx.getStorageSync(LOGS_KEY) || [];
    return JSON.stringify(logs, null, 2);
  } catch (e) {
    return '[]';
  }
}

function clearLogs() {
  try {
    wx.removeStorageSync(LOGS_KEY);
  } catch (e) {}
}

// 关键事件快捷方法
function logGameStart(difficulty, from) {
  logEvent('game_start', { difficulty, from });
}

function logEventChoice(day, eventId, optionIndex, effects) {
  logEvent('event_choice', { day, eventId, optionIndex, effects });
}

function logNightAction(day, action, target) {
  logEvent('night_action', { day, action, target });
}

function logChallengeStart(challengeId) {
  logEvent('challenge_start', { challenge: challengeId });
}

function logChallengeEnd(challengeId, rank, score) {
  logEvent('challenge_end', { challenge: challengeId, rank, score });
}

function logEnding(ending, title, day, stability) {
  logEvent('ending_reached', { ending, title, day, stability });
}

function logAdClick(placement) {
  logEvent('ad_click', { placement });
}

function logAdShow(placement) {
  logEvent('ad_show', { placement });
}

function logPurchase(product, price) {
  logEvent('purchase', { product, price });
}

function logShare(scene, path) {
  logEvent('share', { scene, path });
}

module.exports = {
  logEvent,
  exportLogs,
  clearLogs,
  logGameStart,
  logEventChoice,
  logNightAction,
  logChallengeStart,
  logChallengeEnd,
  logEnding,
  logAdClick,
  logAdShow,
  logPurchase,
  logShare
};
