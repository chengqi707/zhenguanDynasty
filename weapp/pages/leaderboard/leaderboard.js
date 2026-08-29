const app = getApp();
const cloudManager = require('../../utils/cloudManager.js');

const DIFFICULTY_NAMES = { easy: '太宗之路', normal: '贞观之治', hard: '凌烟阁主' };

Page({
  data: {
    leaderboard: [],
    myRank: null,
    loading: true,
    isMock: false
  },

  onLoad() {
    this.loadLeaderboard();
  },

  loadLeaderboard() {
    this.setData({ loading: true });
    // 未开通云环境时直接回退到示例数据
    if (!wx.cloud) {
      this.loadMockData();
      return;
    }
    cloudManager.getLeaderboard().then((result) => {
      if (result && result.code === 0 && result.list && result.list.length > 0) {
        const list = result.list.map(item => ({
          rank: item.rank,
          nickname: item.name || item.nickname || '匿名玩家',
          score: item.score,
          meta: (item.title ? item.title + ' · ' : '') + '第' + (item.cycle || 1) + '周目',
          isMe: !!item.isMe
        }));
        this.setData({
          leaderboard: list,
          myRank: result.myRank > 0 ? result.myRank : null,
          isMock: false,
          loading: false
        });
      } else {
        this.loadMockData();
      }
    }).catch(() => {
      this.loadMockData();
    });
  },

  // 云函数不可用/失败时的示例数据
  loadMockData() {
    const mockData = [
      { rank: 1, nickname: '李世民', score: 95, meta: '太宗 · ' + DIFFICULTY_NAMES.hard, isMe: false },
      { rank: 2, nickname: '玩家A', score: 88, meta: '武帝 · ' + DIFFICULTY_NAMES.normal, isMe: false },
      { rank: 3, nickname: '玩家B', score: 82, meta: '文宗 · ' + DIFFICULTY_NAMES.normal, isMe: false }
    ];
    this.setData({ leaderboard: mockData, myRank: null, isMock: true, loading: false });
  },

  onPullDownRefresh() {
    this.loadLeaderboard();
    wx.stopPullDownRefresh();
  },

  onShareAppMessage() {
    const myRank = this.data.myRank;
    const title = myRank
      ? `我在凌烟阁密档排名第 ${myRank}，来超越我吧！`
      : '凌烟阁密档 - 看看你在贞观朝臣中排名第几';
    return {
      title,
      path: '/pages/leaderboard/leaderboard',
      imageUrl: ''
    };
  },

  onShareTimeline() {
    return {
      title: '凌烟阁密档 - 贞观朝臣排行榜',
      query: '',
      imageUrl: ''
    };
  }
});
