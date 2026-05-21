const app = getApp()
const userService = require('../../services/userService')
const { tabBar, time } = require('../../utils/index.js')

Page({
  data: {
    reviews: [],
    totalCount: 0,
    avgScore: '0.0',
    todayCount: 0,
    dimAvgs: [],
    topTags: [],
    windowRankings: [],
    trend: [],
    moderationFilter: 'all',
    loading: true
  },

  async onLoad() {
    try {
      await userService.checkAdmin()
      if (!app.globalData.user.isAdmin) {
        wx.showToast({ title: '无管理员权限', icon: 'none' })
        setTimeout(() => wx.switchTab({ url: '/pages/canteens/canteens' }), 1500)
        return
      }
    } catch {
      wx.showToast({ title: '权限验证失败', icon: 'none' })
      setTimeout(() => wx.switchTab({ url: '/pages/canteens/canteens' }), 1500)
      return
    }
    this.loadReviews()
  },

  onShow() {
    tabBar.updateTabBar(this)
    this.loadReviews()
  },

  async loadReviews() {
    let reviews = []

    try {
      const db = wx.cloud.database()
      const res = await db.collection('feedbacks')
        .orderBy('createTime', 'desc')
        .limit(100)
        .get()
      reviews = res.data.length > 0 ? res.data : app.globalData.reviews
    } catch (err) {
      reviews = app.globalData.reviews
    }

    this.processReviews(reviews)
  },

  processReviews(reviews) {
    const totalCount = reviews.length
    const avgScore = totalCount > 0
      ? (reviews.reduce((s, r) => s + (r.totalScore || r.score || 0), 0) / totalCount).toFixed(1)
      : '0.0'

    const todayCount = reviews.filter(r => time.isToday(r.time || r.createTime)).length

    // 多维平均分
    const dimKeys = [
      { key: 'taste', name: '口味' },
      { key: 'value', name: '性价比' },
      { key: 'speed', name: '出餐速度' },
      { key: 'look', name: '颜值' }
    ]
    const dimAvgs = dimKeys.map(d => {
      const scores = reviews.filter(r => r.scores && r.scores[d.key]).map(r => r.scores[d.key])
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0.0'
      return { key: d.key, name: d.name, score: avg }
    })

    // 热门标签
    const tagCounts = {}
    reviews.forEach(r => {
      if (r.aiTags) r.aiTags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 })
    })
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }))

    // 窗口排行
    const winMap = {}
    reviews.forEach(r => {
      const wid = r.windowId
      if (!winMap[wid]) winMap[wid] = { id: wid, name: r.windowName, total: 0, count: 0 }
      winMap[wid].total += (r.totalScore || r.score || 0)
      winMap[wid].count++
    })
    const windowRankings = Object.values(winMap)
      .map(w => ({ ...w, avgScore: (w.total / w.count).toFixed(1), reviewCount: w.count }))
      .sort((a, b) => b.avgScore - a.avgScore)

    // 7日趋势
    const dayMs = 24 * 60 * 60 * 1000
    const now = new Date()
    const trend = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const dayEnd = new Date(dayStart.getTime() + dayMs)
      const dayReviews = reviews.filter(r => {
        const t = new Date(r.time || r.createTime)
        return t >= dayStart && t < dayEnd
      })
      const dayAvg = dayReviews.length > 0
        ? (dayReviews.reduce((s, r) => s + (r.totalScore || r.score || 0), 0) / dayReviews.length).toFixed(1)
        : '0.0'
      trend.push({
        label: `${dayStart.getMonth() + 1}/${dayStart.getDate()}`,
        count: dayReviews.length,
        avgScore: dayAvg
      })
    }

    // 添加审核状态
    reviews.forEach(r => {
      if (!r.status) r.status = 'pending'
    })

    this.setData({ reviews, totalCount, avgScore, todayCount, dimAvgs, topTags, windowRankings, trend, loading: false })
  },

  onModerationFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ moderationFilter: filter })
  },

  get filteredReviews() {
    const { reviews, moderationFilter } = this.data
    if (moderationFilter === 'pending') return reviews.filter(r => r.status === 'pending')
    return reviews
  },

  async approveReview(e) {
    const id = e.currentTarget.dataset.id
    try {
      const db = wx.cloud.database()
      await db.collection('feedbacks').doc(id).update({ data: { status: 'approved' } })
    } catch (e) { /* local only */ }
    const reviews = this.data.reviews.map(r => {
      if ((r._id || r.id) == id) r.status = 'approved'
      return r
    })
    this.setData({ reviews })
    wx.showToast({ title: '已通过', icon: 'success' })
  },

  async rejectReview(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认拒绝',
      content: '拒绝后该评价将被隐藏',
      success: async (res) => {
        if (res.confirm) {
          try {
            const db = wx.cloud.database()
            await db.collection('feedbacks').doc(id).update({ data: { status: 'rejected' } })
          } catch (e) { /* local only */ }
          const reviews = this.data.reviews.map(r => {
            if ((r._id || r.id) == id) r.status = 'rejected'
            return r
          })
          this.setData({ reviews })
          wx.showToast({ title: '已拒绝', icon: 'success' })
        }
      }
    })
  },

  onPullDownRefresh() {
    this.loadReviews()
    wx.stopPullDownRefresh()
  }
})
