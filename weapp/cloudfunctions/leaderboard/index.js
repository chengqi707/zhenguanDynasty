// 云函数：排行榜
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const MAX_RANK = 100;

exports.main = async (event, context) => {
  const { type = 'global', openid } = event;
  try {
    const collection = db.collection('leaderboard');
    // 获取排行榜前100名
    const topResult = await collection.orderBy('score', 'desc').limit(MAX_RANK).get();
    let rank = -1;
    if (openid) {
      // 查找用户自己的排名
      const userScores = await collection.where({ _openid: openid }).orderBy('score', 'desc').limit(1).get();
      if (userScores.data.length > 0) {
        const allHigher = await collection.where({ score: db.command.gt(userScores.data[0].score) }).count();
        rank = allHigher.total + 1;
      }
    }
    return {
      code: 0,
      list: topResult.data.map((item, idx) => ({
        rank: idx + 1,
        name: item.nickname || '匿名玩家',
        score: item.score,
        title: item.title || '',
        cycle: item.cycle || 1,
        isMe: item._openid === openid
      })),
      myRank: rank
    };
  } catch (err) {
    console.error('排行榜失败', err);
    return { code: -1, message: '排行榜加载失败', error: err.message };
  }
};
