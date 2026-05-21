const app = getApp()
const windowService = require('../../services/windowService')
const reviewService = require('../../services/reviewService')
const { score, tag } = require('../../utils/index.js')

Page({
  data: {
    window: {},
    reviews: [],
    allTags: [],
    activeTag: '',
    filteredReviews: [],
    loading: true
  },

  onLoad(options) {
    this.windowId = options.id
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const openid = app.globalData.openid
    const windows = windowService.getWindows()
    const win = windows.find(w => w.id == this.windowId) || windows[0]

    const reviews = reviewService.getReviews(this.windowId).map(r => ({
      ...r,
      liked: (r.likes || []).length,
      isLiked: (r.likes || []).includes(openid),
      userInitial: (r.nickname || '匿')[0],
      hasRewrite: r.rewrittenText && r.rewrittenText !== r.text
    }))

    const tagList = tag.aggregateTags(reviews, 12).map((t, i) => ({
      ...t,
      delay: i * 0.15,
      size: Math.min(28, 20 + t.count * 2)
    }))

    this.setData({
      window: win,
      reviews,
      allTags: tagList,
      filteredReviews: reviews,
      loading: false
    })
  },

  filterByTag(e) {
    const activeTag = e.currentTarget.dataset.tag
    if (this.data.activeTag === activeTag) {
      this.setData({ activeTag: '', filteredReviews: this.data.reviews })
    } else {
      const filtered = this.data.reviews.filter(r => r.aiTags && r.aiTags.includes(activeTag))
      this.setData({ activeTag, filteredReviews: filtered.length > 0 ? filtered : this.data.reviews })
    }
  },

  onDimRate(e) {
    const { dim, rate } = e.currentTarget.dataset
    const win = { ...this.data.window }
    if (!win.avgScores) win.avgScores = {}
    win.avgScores[dim] = rate
    win.totalScore = score.calcTotalScore(win.avgScores)
    this.setData({ window: win })
  },

  goReview(e) {
    wx.navigateTo({ url: `/pages/feedback/feedback?windowId=${e.currentTarget.dataset.id}&windowName=${encodeURIComponent(this.data.window.name)}` })
  },

  onLike(e) {
    if (!app.globalData.openid) {
      wx.showToast({ title: '请稍后再试', icon: 'none' })
      return
    }
    reviewService.toggleLike(e.currentTarget.dataset.id)
    this.refresh()
  }
})
