// 存档管理器 V3.0 - 支持多周目继承、剧本解锁、名臣卡、成就系统

const SAVE_KEY = 'lyg_save';
const SAVE_SLOTS_KEY = 'lyg_save_slots';
const SETTINGS_KEY = 'lyg_settings';
const ARCHIVE_KEY = 'lyg_archive_unlocks';
const ACHIEVEMENTS_KEY = 'lyg_achievements';
const ACHIEVEMENT_DATA_KEY = 'lyg_achievement_data';
const CYCLE_KEY = 'lyg_cycle';
const NAMECARDS_KEY = 'lyg_namecards';
const SCRIPTS_KEY = 'lyg_scripts';

function saveGame(state) {
  try {
    wx.setStorageSync(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('存档失败', e);
    return false;
  }
}

// 存档兼容性补全（loadGame / loadFromSlot 共用）
function normalizeState(saved) {
  if (!saved) return saved;
  if (!saved.difficulty) saved.difficulty = 'normal';
  if (!saved.triggeredEvents) saved.triggeredEvents = [];
  if (!saved.deceased) saved.deceased = {};
  if (!saved.completedChallenges) saved.completedChallenges = {};
  if (!saved.challengeResults) saved.challengeResults = {};
  if (!saved.achievementUnlocks) saved.achievementUnlocks = [];
  if (!saved.cycle) saved.cycle = 1;
  if (!saved.selectedNameCards) saved.selectedNameCards = [];
  if (!saved.selectedScript) saved.selectedScript = null;
  if (!saved.haremHistory) saved.haremHistory = [];
  if (!saved.haremDeceased) saved.haremDeceased = {};
  // V1.5: 补全成就统计字段
  if (!saved.achievementStats) {
    saved.achievementStats = { totalCultivate: 0, totalBanquet: 0, totalSkipNight: 0, maxWeizhengFavor: 0 };
  }
  // V3.0: 补全周目结算标记（已完结的旧存档视为已结算，防止重复计数）
  if (typeof saved.cycleCounted !== 'boolean') saved.cycleCounted = saved.day > saved.maxDay;
  Object.keys(saved.characters || {}).forEach(key => {
    if (typeof saved.characters[key].ability !== 'number') {
      saved.characters[key].ability = 30;
    }
  });
  return saved;
}

function loadGame() {
  try {
    const raw = wx.getStorageSync(SAVE_KEY);
    if (!raw) return null;
    return normalizeState(JSON.parse(raw));
  } catch (e) {
    console.error('读档失败', e);
    return null;
  }
}

function hasSave() {
  try {
    return !!wx.getStorageSync(SAVE_KEY);
  } catch (e) {
    return false;
  }
}

function clearSave() {
  try {
    wx.removeStorageSync(SAVE_KEY);
  } catch (e) {}
}

function getSaveSlots() {
  try {
    const raw = wx.getStorageSync(SAVE_SLOTS_KEY);
    return raw ? JSON.parse(raw) : { auto: null, slot1: null, slot2: null, slot3: null };
  } catch (e) {
    return { auto: null, slot1: null, slot2: null, slot3: null };
  }
}

function setSaveSlots(slots) {
  try {
    wx.setStorageSync(SAVE_SLOTS_KEY, JSON.stringify(slots));
  } catch (e) {}
}

function saveToSlot(slotId, state, name) {
  const slots = getSaveSlots();
  slots[slotId] = {
    name: name || (slotId === 'auto' ? '自动存档' : '存档位 ' + slotId.replace('slot', '')),
    state: JSON.parse(JSON.stringify(state)),
    day: state.day,
    difficulty: state.difficulty,
    cycle: state.cycle || 1,
    timestamp: new Date().toISOString()
  };
  setSaveSlots(slots);
  return slots[slotId];
}

function loadFromSlot(slotId) {
  const slots = getSaveSlots();
  return slots[slotId] ? normalizeState(JSON.parse(JSON.stringify(slots[slotId].state))) : null;
}

function deleteSlot(slotId) {
  const slots = getSaveSlots();
  slots[slotId] = null;
  setSaveSlots(slots);
}

// ==================== V3.0 多周目系统 ====================
function getDefaultCycleData() {
  return {
    cycleCount: 0,
    totalPlayTime: 0,
    bestEnding: null,
    unlockedScripts: ['default'],
    unlockedNameCards: [],
    permanentBonus: { stability: 0, ability: 0 },
    endings: [],
    // 各剧本通关次数（供「百变君主」成就）
    scripts: {}
  };
}

function getCycleData() {
  try {
    const raw = wx.getStorageSync(CYCLE_KEY);
    if (!raw) return getDefaultCycleData();
    const data = JSON.parse(raw);
    const merged = { ...getDefaultCycleData(), ...data };
    if (!merged.permanentBonus) merged.permanentBonus = { stability: 0, ability: 0 };
    if (!merged.scripts) merged.scripts = {};
    if (!merged.endings) merged.endings = [];
    return merged;
  } catch (e) {
    return getDefaultCycleData();
  }
}

function saveCycleData(data) {
  try {
    wx.setStorageSync(CYCLE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('周目数据保存失败', e);
  }
}

function recordCycleEnd(endingData) {
  const cycle = getCycleData();
  cycle.cycleCount += 1;
  const scriptId = endingData.script || 'default';
  cycle.endings.push({
    ending: endingData.ending,
    title: endingData.title,
    day: endingData.day,
    stability: endingData.stability,
    difficulty: endingData.difficulty,
    script: scriptId,
    timestamp: new Date().toISOString()
  });
  // 记录剧本通关次数
  if (!cycle.scripts[scriptId]) cycle.scripts[scriptId] = { clearedCount: 0 };
  cycle.scripts[scriptId].clearedCount += 1;
  // 永久加成
  cycle.permanentBonus.stability += 2;
  cycle.permanentBonus.ability += 1;
  // 解锁剧本
  if (endingData.ending === 'taizong' && !cycle.unlockedScripts.includes('golden_age')) {
    cycle.unlockedScripts.push('golden_age');
  }
  if (endingData.ending === 'yang' && !cycle.unlockedScripts.includes('crisis')) {
    cycle.unlockedScripts.push('crisis');
  }
  saveCycleData(cycle);
  return cycle;
}

// ==================== V3.0 成就系统 ====================
function getAchievements() {
  try {
    return wx.getStorageSync(ACHIEVEMENTS_KEY) || [];
  } catch (e) {
    return [];
  }
}

function unlockAchievement(id) {
  const list = getAchievements();
  if (!list.includes(id)) {
    list.push(id);
    try {
      wx.setStorageSync(ACHIEVEMENTS_KEY, list);
    } catch (e) {}
    return true;
  }
  return false;
}

// 成就收集数据（titlesSeen / endingsSeen，参照 Web lyg_achievements 扩展字段）
function getAchievementData() {
  try {
    const raw = wx.getStorageSync(ACHIEVEMENT_DATA_KEY);
    const data = raw ? JSON.parse(raw) : {};
    if (!data.titlesSeen) data.titlesSeen = [];
    if (!data.endingsSeen) data.endingsSeen = [];
    return data;
  } catch (e) {
    return { titlesSeen: [], endingsSeen: [] };
  }
}

function saveAchievementData(data) {
  try {
    wx.setStorageSync(ACHIEVEMENT_DATA_KEY, JSON.stringify(data));
  } catch (e) {}
}

// ==================== V3.0 名臣卡 ====================
function getNameCards() {
  try {
    return wx.getStorageSync(NAMECARDS_KEY) || [];
  } catch (e) {
    return [];
  }
}

function unlockNameCard(id) {
  const list = getNameCards();
  if (!list.includes(id)) {
    list.push(id);
    try {
      wx.setStorageSync(NAMECARDS_KEY, list);
    } catch (e) {}
    return true;
  }
  return false;
}

// ==================== V3.0 剧本解锁 ====================
function getScripts() {
  const cycle = getCycleData();
  return cycle.unlockedScripts || ['default'];
}

// ==================== 清空所有数据 ====================
function clearAll() {
  try {
    wx.removeStorageSync(SAVE_KEY);
    wx.removeStorageSync(SAVE_SLOTS_KEY);
    wx.removeStorageSync(SETTINGS_KEY);
    wx.removeStorageSync(ARCHIVE_KEY);
    wx.removeStorageSync(ACHIEVEMENTS_KEY);
    wx.removeStorageSync(ACHIEVEMENT_DATA_KEY);
    wx.removeStorageSync(CYCLE_KEY);
    wx.removeStorageSync(NAMECARDS_KEY);
    wx.removeStorageSync(SCRIPTS_KEY);
    wx.removeStorageSync('lyg_logs');
    wx.removeStorageSync('lyg_noads');
    wx.removeStorageSync('lyg_sound');
    wx.removeStorageSync('lyg_bgm');
  } catch (e) {}
}

module.exports = {
  saveGame,
  loadGame,
  hasSave,
  clearSave,
  getSaveSlots,
  setSaveSlots,
  saveToSlot,
  loadFromSlot,
  deleteSlot,
  clearAll,
  // V3.0
  getCycleData,
  saveCycleData,
  recordCycleEnd,
  getAchievements,
  unlockAchievement,
  getAchievementData,
  saveAchievementData,
  getNameCards,
  unlockNameCard,
  getScripts
};
