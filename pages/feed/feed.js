const app = getApp()
const reviewService = require('../../services/reviewService')
const { time, tabBar } = require('../../utils/index.js')

Page({
  data: {
    activities: [],
    filter: 'all',
    loading: true
  },

  onLoad() {
    this.loadActivities()
  },

  onShow() {
    tabBar.updateTabBar(this)
    this.loadActivities()
  },

  loadActivities() {
    const reviews = app.globalData.reviews.slice()
    const openid = app.globalData.openid

    const activities = reviews
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 50)
      .map(r => ({
        ...r,
        timeLabel: time.formatRelativeTime(r.time),
        userInitial: (r.nickname || '匿')[0],
        likeCount: r.likes ? r.likes.length : 0,
        isLiked: (r.likes || []).includes(openid),
        hasRewrite: r.rewrittenText && r.rewrittenText !== r.text
      }))

    this.setData({ activities, loading: false })
  },

  switchFilter(e) {
    this.setData({ filter: e.currentTarget.dataset.filter })
  },

  onLike(e) {
    const id = e.currentTarget.dataset.id
    if (!app.globalData.openid) {
      wx.showToast({ title: '请稍后再试', icon: 'none' })
      return
    }
    reviewService.toggleLike(id)
    this.loadActivities()
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  onPullDownRefresh() {
    this.loadActivities()
    wx.stopPullDownRefresh()
  }
})
