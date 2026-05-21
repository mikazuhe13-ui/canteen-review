const app = getApp()
const userService = require('../../services/userService')

Page({
  data: {
    user: {}
  },

  onLoad() {
    this.setData({ user: { ...app.globalData.user } })
  },

  onChooseAvatar(e) {
    this.setData({ 'user.avatar': e.detail.avatarUrl })
  },

  onNicknameInput(e) {
    this.setData({ 'user.nickname': e.detail.value })
  },

  onBioInput(e) {
    this.setData({ 'user.bio': e.detail.value })
  },

  saveProfile() {
    const { avatar, nickname, bio } = this.data.user
    userService.updateUser({ avatar, nickname, bio })
    wx.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1000)
  }
})
