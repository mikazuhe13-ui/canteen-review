const app = getApp()
const lostFoundService = require('../../services/lostFoundService')
const { time } = require('../../utils/index.js')

Page({
  data: {
    item: {},
    categoryName: '',
    isOwner: false,
    matches: []
  },

  onLoad(options) {
    this.itemId = options.id
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const item = lostFoundService.getById(this.itemId)
    if (!item) {
      wx.showToast({ title: '信息不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const category = lostFoundService.CATEGORIES.find(c => c.key === item.category)
    const categoryName = category ? `${category.emoji} ${category.name}` : '📦 其他'
    const isOwner = item.userId === app.globalData.openid

    // 格式化时间
    const displayItem = {
      ...item,
      timeLabel: time.formatRelativeTime(item.createTime)
    }

    // AI 匹配
    const matches = lostFoundService.findMatches(item).map(m => ({
      ...m,
      timeLabel: time.formatRelativeTime(m.createTime)
    }))

    this.setData({ item: displayItem, categoryName, isOwner, matches })
  },

  previewImage(e) {
    wx.previewImage({ urls: this.data.item.images, current: e.currentTarget.dataset.src })
  },

  markResolved() {
    wx.showModal({
      title: '确认',
      content: '确定标记为已解决吗？',
      success: (res) => {
        if (res.confirm) {
          lostFoundService.updateStatus(this.itemId, 'resolved')
          this.refresh()
          wx.showToast({ title: '已标记', icon: 'success' })
        }
      }
    })
  },

  markOpen() {
    lostFoundService.updateStatus(this.itemId, 'open')
    this.refresh()
    wx.showToast({ title: '已重新开放', icon: 'success' })
  },

  goMatchDetail(e) {
    wx.navigateTo({ url: `/pages/lost-found/detail?id=${e.currentTarget.dataset.id}` })
  }
})
