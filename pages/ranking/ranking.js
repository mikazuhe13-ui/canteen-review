const app = getApp()
const { tabBar } = require('../../utils/index.js')

Page({
  data: {
    currentTab: 'all',
    rankings: [],
    top3: [],
    loading: true
  },

  onLoad() {
    this.loadRanking()
  },

  onShow() {
    tabBar.updateTabBar(this)
    this.loadRanking()
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    this.loadRanking()
  },

  async loadRanking() {
    wx.showLoading({ title: '加载中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'calcRanking',
        data: { type: this.data.currentTab },
        timeout: 15000
      })

      if (res.result?.success) {
        const rankings = res.result.rankings
        const top3 = await this.buildTop3(rankings.slice(0, 3))
        this.setData({ rankings, top3 })
      } else {
        this.loadLocalRanking()
      }
    } catch (err) {
      this.loadLocalRanking()
    } finally {
      wx.hideLoading()
    }
  },

  loadLocalRanking() {
    const reviews = app.globalData.reviews
    const windows = app.getWindows()
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    let rankings = windows
      .filter(w => w.reviewCount > 0)
      .map(w => {
        const winReviews = reviews.filter(r => r.windowId == w.id)
        const likeCount = winReviews.reduce((s, r) => s + (r.likes ? r.likes.length : 0), 0)

        // 时间衰减
        let timeDecay = 0
        winReviews.forEach(r => {
          const age = (now - new Date(r.time).getTime()) / dayMs
          timeDecay += Math.max(0.1, 1 - age / 7)
        })
        timeDecay = winReviews.length > 0 ? timeDecay / winReviews.length : 0

        const avgScore = Number(w.totalScore) || 0
        const hotness = (avgScore * 0.5 + w.reviewCount * 0.3 + likeCount * 0.2) * timeDecay

        return {
          windowId: w.id,
          windowName: w.name,
          avgScore: w.totalScore,
          reviewCount: w.reviewCount,
          likeCount,
          hotness: hotness.toFixed(1),
          valueScore: w.avgScores ? Number(w.avgScores.value) : 0
        }
      })

    // 按tab区分排序
    if (this.data.currentTab === 'value') {
      rankings.sort((a, b) => b.valueScore - a.valueScore)
    } else if (this.data.currentTab === 'new') {
      rankings = rankings.filter(r => r.reviewCount <= 5)
      rankings.sort((a, b) => Number(b.avgScore) - Number(a.avgScore))
    } else {
      rankings.sort((a, b) => Number(b.hotness) - Number(a.hotness))
    }

    this.buildTop3(rankings.slice(0, 3)).then(top3 => {
      this.setData({ rankings, top3, loading: false })
    })
  },

  async buildTop3(list) {
    return Promise.all(list.map(async r => ({
      ...r,
      recommendText: await this.getRecommendText(r)
    })))
  },

  async getRecommendText(r) {
    try {
      const model = wx.cloud.extend.AI.createModel('hunyuan-v3')
      const res = await model.generateText({
        model: 'hy3-preview',
        messages: [
          { role: 'system', content: '用一句话推荐这个食堂窗口，15字以内，活泼有趣。' },
          { role: 'user', content: `窗口名:${r.windowName}, 评分:${r.avgScore}, 评价数:${r.reviewCount}` }
        ]
      })
      return res.choices[0].message.content.trim()
    } catch (e) {
      const texts = [
        `连续霸榜！${r.reviewCount}位同学推荐`,
        `全校${r.avgScore}分的宝藏窗口`,
        `${r.reviewCount}条好评的实力选手`
      ]
      return texts[Math.floor(Math.random() * texts.length)]
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  }
})
