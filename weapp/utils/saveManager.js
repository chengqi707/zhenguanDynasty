// 存档管理器 - 适配微信小程序 Storage API

const SAVE_KEY = 'lyg_save';
const SAVE_SLOTS_KEY = 'lyg_save_slots';
const SETTINGS_KEY = 'lyg_settings';
const ARCHIVE_KEY = 'lyg_archive_unlocks';

function saveGame(state) {
  try {
    wx.setStorageSync(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('存档失败', e);
    return false;
  }
}

function loadGame() {
  try {
    const raw = wx.getStorageSync(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // 兼容性处理
    if (!saved.difficulty) saved.difficulty = 'normal';
    if (!saved.triggeredEvents) saved.triggeredEvents = [];
    if (!saved.deceased) saved.deceased = {};
    if (!saved.completedChallenges) saved.completedChallenges = {};
    if (!saved.challengeResults) saved.challengeResults = {};
    Object.keys(saved.characters || {}).forEach(key => {
      if (typeof saved.characters[key].ability !== 'number') {
        saved.characters[key].ability = 30;
      }
    });
    return saved;
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
    timestamp: new Date().toISOString()
  };
  setSaveSlots(slots);
  return slots[slotId];
}

function loadFromSlot(slotId) {
  const slots = getSaveSlots();
  return slots[slotId] ? JSON.parse(JSON.stringify(slots[slotId].state)) : null;
}

function deleteSlot(slotId) {
  const slots = getSaveSlots();
  slots[slotId] = null;
  setSaveSlots(slots);
}

function clearAll() {
  try {
    wx.removeStorageSync(SAVE_KEY);
    wx.removeStorageSync(SAVE_SLOTS_KEY);
    wx.removeStorageSync(SETTINGS_KEY);
    wx.removeStorageSync(ARCHIVE_KEY);
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
  clearAll
};
