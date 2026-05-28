const app = getApp()
const storage = require('../../services/storageService')
const userService = require('../../services/userService')
const { tabBar } = require('../../utils/index.js')

Page({
  data: {
    user: {},
    totalLikes: 0
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    tabBar.updateTabBar(this)
    this.loadData()
  },

  loadData() {
    const cachedUser = storage.getUser()
    const user = cachedUser || app.globalData.user
    if (cachedUser) app.globalData.user = Object.assign({}, app.globalData.user, cachedUser)
    const reviews = app.globalData.reviews || []
    let totalLikes = 0
    reviews.forEach(r => { totalLikes += (r.likes ? r.likes.length : 0) })
    this.setData({ user: Object.assign({}, user), totalLikes })
  },

  goEditProfile() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' })
  },

  goAI() {
    wx.showToast({ title: 'AI助手开发中', icon: 'none' })
  },

  goFeed() {
    wx.showToast({ title: '我的发布开发中', icon: 'none' })
  },

  goMyReviews() {
    wx.showToast({ title: '我的评价开发中', icon: 'none' })
  },

  goFavorites() {
    wx.showToast({ title: '收藏功能开发中', icon: 'none' })
  },

  goHistory() {
    wx.showToast({ title: '浏览记录开发中', icon: 'none' })
  },

  goFeedback() {
    wx.showToast({ title: '反馈功能开发中', icon: 'none' })
  },

  goLostFound() {
    wx.navigateTo({ url: '/pages/lost-found/lost-found' })
  },

  goCoupons() {
    wx.showToast({ title: '卡券功能开发中', icon: 'none' })
  },

  goSettings() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' })
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' })
  },

  onShare() {
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
  },

  onShareAppMessage() {
    return { title: '校园生活助手 - 发现你最爱的窗口', path: '/pages/canteens/canteens' }
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmColor: '#6C5CE7',
      success: (res) => {
        if (res.confirm) {
          userService.logout()
          userService.login()
          wx.reLaunch({ url: '/pages/canteens/canteens' })
        }
      }
    })
  }
})
