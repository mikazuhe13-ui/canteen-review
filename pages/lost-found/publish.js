const app = getApp()
const lostFoundService = require('../../services/lostFoundService')

Page({
  data: {
    categories: lostFoundService.CATEGORIES,
    formType: 'lost',
    formCategory: 'other',
    formTitle: '',
    formDescription: '',
    formLocation: '',
    formContact: '',
    images: [],
    aiTags: [],
    aiResultText: '',
    aiIdentified: false,
    generatingTitle: false,
    identifying: false,
    submitting: false
  },

  setType(e) {
    this.setData({ formType: e.currentTarget.dataset.type })
  },

  setCategory(e) {
    this.setData({ formCategory: e.currentTarget.dataset.key })
  },

  onTitleInput(e) { this.setData({ formTitle: e.detail.value }) },
  onDescInput(e) { this.setData({ formDescription: e.detail.value }) },
  onLocationInput(e) { this.setData({ formLocation: e.detail.value }) },
  onContactInput(e) { this.setData({ formContact: e.detail.value }) },

  addImage() {
    const remaining = 3 - this.data.images.length
    if (remaining <= 0) return
    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ images: [...this.data.images, ...newImages] })
      }
    })
  },

  removeImage(e) {
    const images = [...this.data.images]
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({ images, aiIdentified: false, aiTags: [], aiResultText: '' })
  },

  async aiIdentify() {
    if (this.data.images.length === 0) return
    this.setData({ identifying: true })
    try {
      const filePath = this.data.images[0]
      const fileID = await lostFoundService.uploadImage(filePath)
      const urlRes = await wx.cloud.getTempFileURL({ fileList: [fileID] })
      const imageUrl = urlRes.fileList[0].tempFileURL

      const aiService = require('../../services/aiService')
      const result = await aiService.callAI([
        { role: 'system', content: aiService.config.lostFound.identifyItem.system },
        { role: 'user', content: [
          { type: 'text', text: aiService.config.lostFound.identifyItem.user },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]}
      ])

      const parts = result.split(/[,，、]/).map(t => t.trim()).filter(Boolean)
      const tags = parts.slice(1)
      this.setData({
        aiTags: tags,
        aiResultText: result,
        aiIdentified: true,
        formTitle: this.data.formTitle || parts[0] || ''
      })
    } catch (err) {
      wx.showToast({ title: '识别失败', icon: 'none' })
    }
    this.setData({ identifying: false })
  },

  async aiGenerateTitle() {
    if (!this.data.formDescription) return
    this.setData({ generatingTitle: true })
    try {
      const title = await lostFoundService.generateTitle(this.data.formDescription)
      if (title) this.setData({ formTitle: title })
    } catch {
      wx.showToast({ title: '生成失败', icon: 'none' })
    }
    this.setData({ generatingTitle: false })
  },

  async onSubmit() {
    const { formType, formCategory, formTitle, formDescription, formLocation, formContact, images, aiTags } = this.data

    if (!formTitle.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    if (!formDescription.trim()) {
      wx.showToast({ title: '请输入描述', icon: 'none' })
      return
    }

    this.setData({ submitting: true })

    try {
      // 上传图片
      const imageIDs = []
      for (const img of images) {
        const fileID = await lostFoundService.uploadImage(img)
        imageIDs.push(fileID)
      }

      // AI 提取标签（如果没有通过图片识别）
      let tags = aiTags
      if (tags.length === 0 && formDescription.length > 5) {
        try {
          tags = await lostFoundService.extractTags(formDescription)
        } catch {}
      }

      // 保存
      lostFoundService.add({
        type: formType,
        category: formCategory,
        title: formTitle.trim(),
        description: formDescription.trim(),
        location: formLocation.trim(),
        contact: formContact.trim(),
        images: imageIDs,
        tags,
        nickname: app.globalData.user.nickname,
        avatar: app.globalData.user.avatar,
        userId: app.globalData.openid
      })

      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) {
      wx.showToast({ title: '发布失败', icon: 'none' })
    }

    this.setData({ submitting: false })
  }
})
