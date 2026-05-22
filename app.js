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

    // 生成模拟评价数据（调试用）
    this.globalData.reviews = this._seedReviews()
  },

  _seedReviews() {
    const windows = school.windows
    const mockUsers = this._getMockUsers()
    const texts = [
      '味道不错，下次还会来',
      '性价比很高，推荐大家试试',
      '出餐速度很快，适合赶时间的同学',
      '分量很足，吃饱没问题',
      '味道一般，没有特别惊艳',
      '排队太久了，等了好久',
      '价格偏贵，学生党吃不起',
      '食材新鲜，口味地道',
      '超级好吃！强烈推荐！',
      '分量有点少，不太够吃',
      '环境干净，服务态度好',
      '麻辣鲜香，越吃越上瘾',
      '份量适中，味道稳定',
      '窗口阿姨人很好，给的多',
      '新出的菜品很好吃，值得尝试'
    ]
    const tagPool = ['好吃', '分量足', '性价比高', '出餐快', '排队久', '味道好', '价格实惠', '推荐', '干净卫生', '口味重', '清淡', '麻辣', '分量少', '有点贵']

    const reviews = []
    const now = Date.now()
    let idCounter = now

    windows.forEach(w => {
      const count = 3 + Math.floor(Math.random() * 3) // 每窗口 3-5 条评价
      for (let i = 0; i < count; i++) {
        idCounter++
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)]
        const taste = 2 + Math.random() * 3
        const value = 2 + Math.random() * 3
        const speed = 2 + Math.random() * 3
        const look = 2 + Math.random() * 3
        const total = ((taste * 0.4 + value * 0.3 + speed * 0.2 + look * 0.1)).toFixed(1)
        const daysAgo = Math.floor(Math.random() * 7)
        const hoursAgo = Math.floor(Math.random() * 24)
        const time = new Date(now - daysAgo * 86400000 - hoursAgo * 3600000)
        const likeCount = Math.floor(Math.random() * 8)
        const likes = Array.from({ length: likeCount }, () => mockUsers[Math.floor(Math.random() * mockUsers.length)].id)
        const tagCount = 1 + Math.floor(Math.random() * 3)
        const aiTags = []
        for (let t = 0; t < tagCount; t++) {
          const tag = tagPool[Math.floor(Math.random() * tagPool.length)]
          if (!aiTags.includes(tag)) aiTags.push(tag)
        }

        reviews.push({
          id: idCounter,
          windowId: w.id,
          windowName: w.name,
          scores: {
            taste: Math.round(taste * 10) / 10,
            value: Math.round(value * 10) / 10,
            speed: Math.round(speed * 10) / 10,
            look: Math.round(look * 10) / 10
          },
          totalScore: total,
          score: Math.round(Number(total)),
          text: texts[Math.floor(Math.random() * texts.length)],
          nickname: user.nickname,
          avatar: user.avatar,
          likes,
          aiTags,
          time: time.toISOString(),
          userId: user.id
        })
      }
    })

    return reviews
  },

  _getMockUsers() {
    return [
      { id: 'u001', nickname: '干饭小王子', avatar: '' },
      { id: 'u002', nickname: '美食探险家', avatar: '' },
      { id: 'u003', nickname: '食堂常客', avatar: '' },
      { id: 'u004', nickname: '吃货一枚', avatar: '' },
      { id: 'u005', nickname: '今天吃什么', avatar: '' },
      { id: 'u006', nickname: '校园美食家', avatar: '' },
      { id: 'u007', nickname: '麻辣香锅爱好者', avatar: '' },
      { id: 'u008', nickname: '面食达人', avatar: '' },
      { id: 'u009', nickname: '省钱干饭人', avatar: '' },
      { id: 'u010', nickname: '大胃王小刘', avatar: '' },
      { id: 'u011', nickname: '测评小能手', avatar: '' },
      { id: 'u012', nickname: '每天不重样', avatar: '' },
      { id: 'u013', nickname: '早起干饭人', avatar: '' },
      { id: 'u014', nickname: '夜宵选手', avatar: '' },
      { id: 'u015', nickname: '碳水爱好者', avatar: '' },
      { id: 'u016', nickname: '麻辣烫狂热者', avatar: '' },
      { id: 'u017', nickname: '米饭杀手', avatar: '' },
      { id: 'u018', nickname: '快乐干饭', avatar: '' },
      { id: 'u019', nickname: '食堂铁粉', avatar: '' },
      { id: 'u020', nickname: '味蕾旅行家', avatar: '' },
      { id: 'u021', nickname: '校园小馋猫', avatar: '' },
      { id: 'u022', nickname: '干饭不排队', avatar: '' },
      { id: 'u023', nickname: '今天吃鸡排', avatar: '' },
      { id: 'u024', nickname: '拉面控', avatar: '' },
      { id: 'u025', nickname: '煎饼果子粉', avatar: '' },
      { id: 'u026', nickname: '螺蛳粉战士', avatar: '' },
      { id: 'u027', nickname: '盖浇饭忠实粉', avatar: '' },
      { id: 'u028', nickname: '酸菜鱼选手', avatar: '' },
      { id: 'u029', nickname: '出餐速度党', avatar: '' },
      { id: 'u030', nickname: '性价比猎人', avatar: '' }
    ]
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
