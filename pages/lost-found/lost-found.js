Page({
  data: {
    categories: [
      { key: 'card', name: '校园卡', emoji: '🪪' },
      { key: 'key', name: '钥匙', emoji: '🔑' },
      { key: 'earphone', name: '耳机', emoji: '🎧' },
      { key: 'cup', name: '水杯', emoji: '🥤' },
      { key: 'book', name: '书本', emoji: '📚' },
      { key: 'phone', name: '手机', emoji: '📱' },
      { key: 'other', name: '其他', emoji: '📦' }
    ],
    currentType: 'all',
    currentCategory: 'all',
    filteredItems: [],
    lostCount: 0,
    foundCount: 0,
    resolvedCount: 0
  },

  onLoad() {
    this.refresh()
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    try {
      const lostFoundService = require('../../services/lostFoundService')
      const { time } = require('../../utils/index.js')

      const all = lostFoundService.getAll() || []
      this.setData({
        lostCount: all.filter(i => i.type === 'lost' && i.status === 'open').length,
        foundCount: all.filter(i => i.type === 'found' && i.status === 'open').length,
        resolvedCount: all.filter(i => i.status === 'resolved').length
      })

      const filtered = lostFoundService.filter(this.data.currentType, this.data.currentCategory) || []
      const items = filtered.map(i => ({
        ...i,
        timeLabel: time.formatRelativeTime(i.createTime),
        categoryName: (this.data.categories.find(c => c.key === i.category) || {}).name || '物品'
      }))

      this.setData({ filteredItems: items })
    } catch (err) {
      console.error('加载失物招领失败:', err)
    }
  },

  switchType(e) {
    this.setData({ currentType: e.currentTarget.dataset.type })
    this.refresh()
  },

  switchCategory(e) {
    this.setData({ currentCategory: e.currentTarget.dataset.category })
    this.refresh()
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/lost-found/detail?id=${e.currentTarget.dataset.id}` })
  },

  goPublish() {
    wx.navigateTo({ url: '/pages/lost-found/publish' })
  },

  onPullDownRefresh() {
    try {
      const lostFoundService = require('../../services/lostFoundService')
      lostFoundService.syncFromCloud().then(() => {
        this.refresh()
        wx.stopPullDownRefresh()
      })
    } catch {
      wx.stopPullDownRefresh()
    }
  }
})
