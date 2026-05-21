const { school } = require('./config/index.js')
const storage = require('./services/storageService')
const userService = require('./services/userService')
const windowService = require('./services/windowService')
const reviewService = require('./services/reviewService')
const lostFoundService = require('./services/lostFoundService')

App({
  onLaunch() {
    wx.cloud.init({ env: school.cloudEnv, traceUser: true })

    // 清除旧的窗口缓存，确保使用最新配置图片
    storage.remove('windows')

    // 初始化 services
    userService.setGlobalData(this.globalData)
    reviewService.init(this.globalData)
    windowService.init(this.globalData)
    lostFoundService.init()

    // 从缓存恢复数据
    userService.restoreUser()

    // 登录后同步云端数据
    userService.login().then(() => {
      windowService.syncWindows()
      windowService.syncCanteens()
      lostFoundService.syncFromCloud()
    })
  },

  // 保留 getWindows 兼容旧页面调用
  getWindows() {
    return windowService.getWindows()
  },

  // 保留 saveReviews/saveUser 兼容旧页面调用
  saveReviews() { reviewService.saveReviews() },
  saveUser() { userService.saveUser() },

  globalData: {
    reviews: [],
    user: userService.defaultUser(),
    canteens: school.canteens
  }
})
