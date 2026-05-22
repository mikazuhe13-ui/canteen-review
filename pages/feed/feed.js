const app = getApp()
const reviewService = require('../../services/reviewService')
const { time, tabBar } = require('../../utils/index.js')

Page({
  data: {
    activities: [],
    filteredActivities: [],
    filter: 'all',
    loading: true,
    bulletins: [
      { id: 1, text: '二食堂二楼窗口营业时间调整至 20:30', icon: '📢' },
      { id: 2, text: '民族餐厅新增兰州拉面窗口，欢迎品尝', icon: '🍜' },
      { id: 3, text: '本周五校园美食节，沁园一楼有活动', icon: '🎉' }
    ],
    devRoadmap: [
      { name: '校园问答', status: 'doing', icon: '🚧' },
      { name: 'AI选餐助手', status: 'doing', icon: '🤖' },
      { name: '二手交易', status: 'plan', icon: '💡' },
      { name: '校园活动', status: 'plan', icon: '📋' }
    ],
    aiDaily: '',
    todayStats: { reviews: 0, likes: 0, windows: 0 }
  },

  onLoad() {
    this.loadActivities()
  },

  onShow() {
    tabBar.updateTabBar(this)
    this.loadActivities()
  },

  loadActivities() {
    // 确保有评价数据
    if (!app.globalData.reviews || app.globalData.reviews.length === 0) {
      if (typeof app._seedReviews === 'function') {
        app.globalData.reviews = app._seedReviews()
      }
    }

    const reviews = app.globalData.reviews || []
    const openid = app.globalData.openid

    const activities = reviews
      .slice()
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

    // 今日统计
    const now = Date.now()
    const dayMs = 86400000
    const todayReviews = reviews.filter(r => new Date(r.time).getTime() > now - dayMs)
    const todayLikes = todayReviews.reduce((s, r) => s + (r.likes ? r.likes.length : 0), 0)
    const todayWindows = new Set(todayReviews.map(r => r.windowId)).size

    const todayStats = {
      reviews: todayReviews.length,
      likes: todayLikes,
      windows: todayWindows
    }

    // AI 每日观察
    const aiDaily = this.generateAiDaily(todayStats, activities)

    this.setData({
      activities,
      filteredActivities: this.filterActivities(activities, this.data.filter),
      loading: false,
      todayStats,
      aiDaily
    })
  },

  generateAiDaily(stats, activities) {
    if (stats.reviews === 0) {
      return '今日还没有新的评价，快去发布第一条吧！'
    }
    const topActivity = activities[0]
    const windowName = topActivity?.windowName || '热门窗口'
    const tips = [
      `今日收到${stats.reviews}条评价，${windowName}最受关注。出餐快的同学评价较多，午高峰推荐！`,
      `${windowName}今日热度最高，${stats.reviews}条新评价。性价比和口味是同学们最关心的。`,
      `今日${stats.windows}个窗口被评价，${windowName}表现突出。同学们反馈集中在"分量足"和"价格合理"。`
    ]
    return tips[Math.floor(Math.random() * tips.length)]
  },

  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      filter,
      filteredActivities: this.filterActivities(this.data.activities, filter)
    })
  },

  filterActivities(activities, filter) {
    if (filter === 'hot') {
      return activities.filter(item => item.likeCount > 0)
    }
    if (filter === 'new') {
      return activities.filter(item => item.timeLabel.indexOf('分钟') !== -1 || item.timeLabel.indexOf('小时') !== -1)
    }
    return activities
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

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' })
  },

  goLostFound() {
    wx.navigateTo({ url: '/pages/lost-found/lost-found' })
  },

  onPullDownRefresh() {
    this.loadActivities()
    wx.stopPullDownRefresh()
  }
})
