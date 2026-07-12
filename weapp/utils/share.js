// 分享工具 - 带参数挑战同一局

const app = getApp();

function generateShareSeed(state) {
  // 生成一个基于当前游戏状态的种子字符串
  // 包含：天数、已触发事件、当前数值
  const seed = {
    d: state.day,
    diff: state.difficulty,
    te: state.triggeredEvents,
    s: state.stability,
    c: Object.entries(state.characters).map(([k, v]) => ({
      k,
      f: v.favor,
      p: v.power,
      a: v.ability
    }))
  };
  return encodeURIComponent(JSON.stringify(seed));
}

function parseShareSeed(seedStr) {
  try {
    return JSON.parse(decodeURIComponent(seedStr));
  } catch (e) {
    return null;
  }
}

function getShareTitle(ending, title) {
  if (ending && title) {
    return `我在凌烟阁密档中获得了「${title}」谥号，结局：${ending}`;
  }
  return '来凌烟阁密档，扮演李世民，书写你的贞观传奇';
}

function getSharePath(seed) {
  if (seed) {
    return `/pages/game/game?seed=${seed}`;
  }
  return '/pages/index/index';
}

function getShareImageUrl() {
  // 使用云存储中的分享图片，或动态生成
  return 'cloud://lingyange-xxx/share-card.png'; // 替换为实际云存储路径
}

module.exports = {
  generateShareSeed,
  parseShareSeed,
  getShareTitle,
  getSharePath,
  getShareImageUrl
};
