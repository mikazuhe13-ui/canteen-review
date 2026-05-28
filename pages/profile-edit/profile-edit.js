const app = getApp()
const storage = require('../../services/storageService')
const userService = require('../../services/userService')

Page({
  data: {
    avatar: '',
    nickname: '',
    bio: ''
  },

  onLoad() {
    const user = storage.getUser() || app.globalData.user || {}
    this.setData({
      avatar: user.avatar || '',
      nickname: user.nickname || '',
      bio: user.bio || ''
    })
  },

  onChooseAvatar(e) {
    this.setAvatar(e.detail.avatarUrl)
  },

  chooseAvatarFromAlbum() {
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album'],
        success: (res) => {
          const file = res.tempFiles && res.tempFiles[0]
          if (file && file.tempFilePath) this.setAvatar(file.tempFilePath)
        }
      })
      return
    }

    wx.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: (res) => {
        const path = res.tempFilePaths && res.tempFilePaths[0]
        if (path) this.setAvatar(path)
      }
    })
  },

  setAvatar(avatarUrl) {
    this.setData({ avatar: avatarUrl })

    if (!avatarUrl || avatarUrl.indexOf('http') === 0) return

    wx.saveFile({
      tempFilePath: avatarUrl,
      success: (res) => {
        this.setData({ avatar: res.savedFilePath })
      }
    })
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value || '' })
  },

  onBioInput(e) {
    this.setData({ bio: e.detail.value || '' })
  },

  saveProfile() {
    const { avatar, nickname, bio } = this.data
    const trimmedNickname = (nickname || '').trim()

    if (!trimmedNickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })

    this.saveAvatarFile(avatar, (savedAvatar) => {
      const currentUser = storage.getUser() || app.globalData.user || userService.defaultUser()
      const nextUser = Object.assign({}, currentUser, {
        avatar: savedAvatar || '/images/avatar.png',
        nickname: trimmedNickname,
        bio: bio || '',
        hasSetNickname: true
      })

      app.globalData.user = nextUser
      storage.setUser(nextUser)
      userService.updateUser(nextUser)
      this.setData({
        avatar: nextUser.avatar,
        nickname: nextUser.nickname,
        bio: nextUser.bio
      })
      this.refreshPreviousPage()
      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    })
  },

  saveAvatarFile(avatar, done) {
    if (!avatar || avatar.indexOf('/images/') === 0 || avatar.indexOf('http') === 0 || avatar.indexOf('wxfile://') === 0) {
      done(avatar)
      return
    }

    wx.saveFile({
      tempFilePath: avatar,
      success: (res) => done(res.savedFilePath),
      fail: () => done(avatar)
    })
  },

  refreshPreviousPage() {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage && typeof prevPage.loadData === 'function') {
      prevPage.loadData()
    }
  }
})
