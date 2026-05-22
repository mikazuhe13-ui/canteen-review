const app = getApp()
const windowService = require('../../services/windowService')
const { tabBar } = require('../../utils/index.js')

Page({
  data: {
    canteens: [],
    greeting: '',
    totalWindows: 0,
    totalReviews: 0,
    topWindows: [],
    recommendTexts: [],
    loading: true,
    banners: [
      { id: 1, image: '/images/banner1.jpg', tag: '热门活动', title: '今日食堂推荐', desc: '看看同学们最近都在吃什么' },
      { id: 2, image: '/images/banner2.jpg', tag: '新品上线', title: '新菜品尝鲜', desc: '发现窗口新品和隐藏菜单' },
      { id: 3, image: '/images/banner3.jpg', tag: '限时优惠', title: '学生专属福利', desc: '优惠、活动和校园服务入口' }
    ],
    dishCategories: [
      { id: 'hot', name: '热菜', image: '/images/food/18.jpg' },
      { id: 'cold', name: '凉菜', image: '/images/food/19.png' },
      { id: 'noodle', name: '面食', image: '/images/food/16.jpg' },
      { id: 'snack', name: '小吃', image: '/images/food/23.jpg' },
      { id: 'fruit', name: '水果', image: '/images/food/17.jpg' },
      { id: 'mantou', name: '馒饼', image: '/images/food/20.jpg' },
      { id: 'drink', name: '饮品', image: '/images/food/22.jpg' },
      { id: 'dessert', name: '甜品', image: '/images/food/21.jpg' }
    ]
  },

  onLoad() {
    this.updateCanteens()
    this.updateGreeting()
    // 模拟加载延迟
    setTimeout(() => {
      this.setData({ loading: false })
    }, 800)
  },

  onShow() {
    tabBar.updateTabBar(this)
    this.updateCanteens()
    this.updateStats()
    this.updateTopWindows()
  },

  updateGreeting() {
    const hour = new Date().getHours()
    let greeting = ''
    if (hour < 6) greeting = '夜深了，注意休息'
    else if (hour < 11) greeting = '早上好，来份早餐吧'
    else if (hour < 14) greeting = '中午好，午饭时间到'
    else if (hour < 17) greeting = '下午好，来杯下午茶'
    else if (hour < 21) greeting = '晚上好，晚餐吃什么'
    else greeting = '夜宵时间，犒劳自己'
    this.setData({ greeting })
  },

  updateCanteens() {
    const windows = windowService.getWindows()
    const reviews = app.globalData.reviews
    const canteens = windowService.getCanteens().map(c => ({
      ...c,
      windowCount: windows.filter(w => w.canteenId === c.id).length
    }))
    this.setData({
      canteens,
      totalWindows: windows.length,
      totalReviews: reviews.length
    })
  },

  updateStats() {
    const reviews = app.globalData.reviews
    this.setData({ totalReviews: reviews.length })
  },

  goToWindows(e) {
    const canteenId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/windows/windows?canteenId=${canteenId}`
    })
  },

  goToFeedback() {
    wx.navigateTo({ url: '/pages/windows/windows?canteenId=1' })
  },

  goCategory(e) {
    const category = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/windows/windows?category=${category}` })
  },

  onBannerTap(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({ title: `广告${id}详情开发中`, icon: 'none' })
  },

  goSearch() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' })
  },

  goToRanking() {
    if (this.getTabBar()) {
      wx.switchTab({ url: '/pages/ranking/ranking' })
    }
  },

  updateTopWindows() {
    const windows = windowService.getWindows()
    const ranked = windows
      .filter(w => w.reviewCount > 0)
      .sort((a, b) => Number(b.totalScore) - Number(a.totalScore))
      .slice(0, 3)

    const aiTexts = [
      `全校${ranked[0]?.reviewCount || 0}位同学推荐的宝藏窗口！`,
      `连续霸榜的${ranked[0]?.name || '实力选手'}，${ranked[0]?.totalScore || '5.0'}分好评如潮`,
      `${ranked[0]?.name || '人气王'}：口碑与颜值并存的干饭首选`
    ]

    this.setData({
      topWindows: ranked,
      recommendTexts: aiTexts
    })
  },

  onSwiperChange(e) {
    this.setData({ currentSwiper: e.detail.current })
  },

  goWindowDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})
