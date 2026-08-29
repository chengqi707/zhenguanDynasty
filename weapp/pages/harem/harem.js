const config = require('../../utils/config.js');

Page({
  data: {
    characters: []
  },

  onLoad() {
    this.loadHarem();
  },

  loadHarem() {
    const haremData = config.harem || {};
    const list = Object.entries(haremData).map(([key, val]) => ({ key, ...val }));
    this.setData({ characters: list });
  }
});
