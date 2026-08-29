const config = require('../../utils/config.js');

Page({
  data: {
    achievements: [],
    filteredAchievements: [],
    categories: [
      { id: 'all', name: '全部' },
      { id: 'title', name: '谥号' },
      { id: 'difficulty', name: '难度' },
      { id: 'collection', name: '收集' },
      { id: 'challenge', name: '挑战' },
      { id: 'behavior', name: '行为' }
    ],
    activeCategory: 'all',
    unlockedCount: 0,
    totalCount: 0
  },

  onLoad() {
    this.loadAchievements();
  },

  // tabBar 页：每次切入都刷新（成就可能刚解锁）
  onShow() {
    this.loadAchievements();
  },

  loadAchievements() {
    const unlocked = wx.getStorageSync('lyg_achievements') || [];
    const list = config.achievements.map(a => ({
      ...a,
      unlocked: unlocked.includes(a.id)
    }));
    const unlockedCount = list.filter(a => a.unlocked).length;
    this.setData({
      achievements: list,
      filteredAchievements: this.filterByCategory(list, this.data.activeCategory),
      unlockedCount,
      totalCount: list.length
    });
  },

  switchCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      activeCategory: id,
      filteredAchievements: this.filterByCategory(this.data.achievements, id)
    });
  },

  filterByCategory(achievements, category) {
    if (category === 'all') return achievements;
    return achievements.filter(a => a.category === category);
  },

  onShareAppMessage() {
    const { unlockedCount, totalCount } = this.data;
    return {
      title: `我在凌烟阁密档已解锁 ${unlockedCount}/${totalCount} 个成就，来挑战我吧！`,
      path: '/pages/achievements/achievements',
      imageUrl: ''
    };
  },

  onShareTimeline() {
    const { unlockedCount, totalCount } = this.data;
    return {
      title: `凌烟阁密档 - 已解锁 ${unlockedCount}/${totalCount} 个成就`,
      query: '',
      imageUrl: ''
    };
  }
});
