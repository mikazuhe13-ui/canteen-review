const app = getApp()
const { tabBar } = require('../../utils/index.js')

Page({
  data: {
    period: 'daily',
    currentTab: 'hot',
    rankings: [],
    top3: [],
    champion: null,
    updateTime: '',
    aiObserve: '',
    loading: true,
    overview: {
      windowCount: 0,
      reviewCount: 0,
      avgScore: '0.0',
      scoreText: '--',
      reviewText: '暂无评价'
    },
    dailyTabs: [
      { key: 'hot', name: '人气榜', icon: '🔥' },
      { key: 'score', name: '高分榜', icon: '⭐' },
      { key: 'dark', name: '黑马榜', icon: '🐴' },
      { key: 'speed', name: '出餐快', icon: '⚡' },
      { key: 'warn', name: '避雷榜', icon: '⚠️' }
    ],
    weeklyTabs: [
      { key: 'hot', name: '综合榜', icon: '🏆' },
      { key: 'value', name: '性价比', icon: '💰' },
      { key: 'rising', name: '口碑上升', icon: '📈' },
      { key: 'love', name: '学生最爱', icon: '❤️' },
      { key: 'ai', name: 'AI推荐', icon: '🤖' }
    ],
    quickCats: [
      { key: 'hot', name: '人气', emoji: '🔥' },
      { key: 'score', name: '高分', emoji: '⭐' },
      { key: 'speed', name: '速度', emoji: '⚡' },
      { key: 'value', name: '省钱', emoji: '💰' },
      { key: 'night', name: '夜宵', emoji: '🌙' },
      { key: 'ai', name: 'AI荐', emoji: '🤖' }
    ],
    tasteMatch: []
  },

  onLoad() {
    this.loadRanking()
  },

  onShow() {
    tabBar.updateTabBar(this)
    this.loadRanking()
  },

  switchPeriod(e) {
    const period = e.currentTarget.dataset.period
    this.setData({ period, currentTab: 'hot' })
    this.loadRanking()
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    this.loadRanking()
  },

  switchQuick(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ currentTab: key })
    this.loadRanking()
  },

  updateUpdateTime() {
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    this.setData({ updateTime: `${h}:${m}` })
  },

  getTabs() {
    return this.data.period === 'daily' ? this.data.dailyTabs : this.data.weeklyTabs
  },

  loadRanking() {
    this.updateUpdateTime()

    // 确保有评价数据
    if (!app.globalData.reviews || app.globalData.reviews.length === 0) {
      if (typeof app._seedReviews === 'function') {
        app.globalData.reviews = app._seedReviews()
      }
    }

    const reviews = app.globalData.reviews || []
    const windows = app.getWindows() || []
    const now = Date.now()
    const dayMs = 86400000
    const periodDays = this.data.period === 'daily' ? 1 : 7
    const cutoff = now - periodDays * dayMs

    // 按时间窗口筛选评价
    const periodReviews = reviews.filter(r => new Date(r.time).getTime() > cutoff)

    let rankings = windows.map(w => {
      const winReviews = periodReviews.filter(r => r.windowId == w.id)
      const allWinReviews = reviews.filter(r => r.windowId == w.id)
      const likeCount = winReviews.reduce((s, r) => s + (r.likes ? r.likes.length : 0), 0)
      const avgScore = winReviews.length > 0
        ? (winReviews.reduce((s, r) => s + Number(r.totalScore || 0), 0) / winReviews.length).toFixed(1)
        : w.totalScore || '0.0'
      const badCount = winReviews.filter(r => Number(r.totalScore || 0) <= 2).length
      const badRatio = winReviews.length > 0 ? badCount / winReviews.length : 0

      // 时间衰减
      let timeDecay = 0
      winReviews.forEach(r => {
        const age = (now - new Date(r.time).getTime()) / dayMs
        timeDecay += Math.max(0.1, 1 - age / periodDays)
      })
      timeDecay = winReviews.length > 0 ? timeDecay / winReviews.length : 0

      const hotness = (Number(avgScore) * 0.4 + winReviews.length * 0.35 + likeCount * 0.25) * (timeDecay || 0.3)

      // 环比（本周 vs 上周）
      const lastPeriodCutoff = cutoff - periodDays * dayMs
      const lastPeriodReviews = reviews.filter(r => {
        const t = new Date(r.time).getTime()
        return r.windowId == w.id && t > lastPeriodCutoff && t <= cutoff
      })
      const lastAvg = lastPeriodReviews.length > 0
        ? lastPeriodReviews.reduce((s, r) => s + Number(r.totalScore || 0), 0) / lastPeriodReviews.length
        : 0
      const rise = Number(avgScore) - lastAvg

      return {
        windowId: w.id,
        windowName: w.name,
        location: w.location || '',
        avgScore,
        reviewCount: winReviews.length,
        totalReviewCount: allWinReviews.length,
        likeCount,
        hotness: hotness.toFixed(1),
        badRatio,
        rise: rise.toFixed(1),
        valueScore: w.avgScores ? Number(w.avgScores.value) : 0,
        speedScore: w.avgScores ? Number(w.avgScores.speed) : 0
      }
    })

    const tab = this.data.currentTab

    // 每日榜筛选
    if (this.data.period === 'daily') {
      if (tab === 'hot') {
        rankings.sort((a, b) => Number(b.hotness) - Number(a.hotness))
      } else if (tab === 'score') {
        rankings = rankings.filter(r => r.reviewCount > 0)
        rankings.sort((a, b) => Number(b.avgScore) - Number(a.avgScore))
      } else if (tab === 'dark') {
        rankings = rankings.filter(r => r.totalReviewCount <= 5 && r.reviewCount > 0)
        rankings.sort((a, b) => Number(b.avgScore) - Number(a.avgScore))
      } else if (tab === 'speed') {
        rankings.sort((a, b) => b.speedScore - a.speedScore)
      } else if (tab === 'warn') {
        rankings = rankings.filter(r => r.reviewCount > 0 && r.badRatio > 0)
        rankings.sort((a, b) => b.badRatio - a.badRatio)
      }
    } else {
      // 每周榜筛选
      if (tab === 'hot') {
        rankings.sort((a, b) => Number(b.hotness) - Number(a.hotness))
      } else if (tab === 'value') {
        rankings.sort((a, b) => b.valueScore - a.valueScore)
      } else if (tab === 'rising') {
        rankings = rankings.filter(r => r.reviewCount > 0)
        rankings.sort((a, b) => Number(b.rise) - Number(a.rise))
      } else if (tab === 'love') {
        rankings.sort((a, b) => b.likeCount - a.likeCount)
      } else if (tab === 'ai') {
        rankings.sort((a, b) => Number(b.hotness) - Number(a.hotness))
      }
    }

    // 过滤无数据项（除避雷榜外）
    if (tab !== 'warn') {
      rankings = rankings.filter(r => r.reviewCount > 0 || Number(r.avgScore) > 0)
    }

    const top3 = rankings.slice(0, 3)
    const champion = top3[0] || null
    const scoredRankings = rankings.filter(r => Number(r.avgScore) > 0)
    const avgScore = scoredRankings.length > 0
      ? (scoredRankings.reduce((sum, r) => sum + Number(r.avgScore), 0) / scoredRankings.length).toFixed(1)
      : '0.0'
    const totalReviews = periodReviews.length
    const overview = {
      windowCount: windows.length,
      reviewCount: totalReviews,
      avgScore,
      scoreText: champion ? champion.hotness : '--',
      reviewText: totalReviews > 0 ? `${totalReviews} 条评价` : '暂无评价'
    }

    // AI 观察
    const aiObserve = this.generateAiObserve(rankings, periodReviews)

    // 口味匹配
    const tasteMatch = rankings.slice(0, 3).map((r, i) => ({
      ...r,
      matchReason: ['综合评分最高', '近期热度飙升', '口碑持续好评'][i] || '值得一试'
    }))

    this.setData({ rankings, top3, champion, overview, aiObserve, tasteMatch, loading: false })
  },

  generateAiObserve(rankings, reviews) {
    const topName = rankings[0]?.windowName || '热门窗口'
    const totalReviews = reviews.length
    const period = this.data.period === 'daily' ? '今日' : '本周'

    if (totalReviews === 0) {
      return `${period}还没有新的评价数据，发布第一条评价后会自动生成AI战报。`
    }

    const observes = [
      `${period}共收到${totalReviews}条评价，${topName}关注度最高。`,
      `${topName}${period}表现突出，同学们评价集中在口味和性价比。`,
      `${period}窗口竞争激烈，${topName}凭借稳定品质领先。`
    ]
    return observes[Math.floor(Math.random() * observes.length)]
  },

  getRecommendText(r) {
    const texts = [
      `${r.reviewCount}位同学的共同选择`,
      `评分${r.avgScore}的实力选手`,
      `${r.reviewCount}条好评，值得打卡`
    ]
    return texts[Math.floor(Math.random() * texts.length)]
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' })
  }
})
