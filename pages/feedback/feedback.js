const app = getApp()

Page({
  data: {
    windowId: 0,
    windowName: '',
    foodPhoto: '',
    aiDishName: '',
    suggestWindows: [],
    dimensions: [
      { key: 'taste', name: '口味', emoji: '😋', score: 5 },
      { key: 'value', name: '性价比', emoji: '💰', score: 5 },
      { key: 'speed', name: '出餐速度', emoji: '🚀', score: 5 },
      { key: 'look', name: '颜值', emoji: '✨', score: 5 }
    ],
    totalScore: '5.0',
    feedbackText: '',
    rewrittenText: '',
    submitting: false,
    showAiPanel: false,
    warningMsg: '',
    aiPolishOn: true,
    showCompare: false,
    originalText: '',
    polishedText: '',
    showNicknameModal: false,
    tempNickname: '',
    aiStyles: [
      { key: 'foodie', icon: '🍜', name: '干饭人语录', desc: '接地气的真实评价' },
      { key: 'versailles', icon: '✨', name: '凡尔赛式', desc: '优雅中带点小傲娇' },
      { key: 'poet', icon: '🌸', name: '文艺青年', desc: '诗意的美食感悟' },
      { key: 'pro', icon: '👨‍🍳', name: '专业点评', desc: '像美食家一样点评' }
    ]
  },

  onLoad(options) {
    this.setData({
      windowId: Number(options.windowId),
      windowName: decodeURIComponent(options.windowName || '未知窗口'),
      user: app.globalData.user
    })
  },

  onDimRate(e) {
    const { dim, rate } = e.currentTarget.dataset
    const dimensions = this.data.dimensions.map(d => {
      if (d.key === dim) return { ...d, score: rate }
      return d
    })
    const totalScore = this.calcTotal(dimensions)
    this.setData({ dimensions, totalScore })
  },

  calcTotal(dimensions) {
    const t = dimensions.find(d => d.key === 'taste').score
    const v = dimensions.find(d => d.key === 'value').score
    const s = dimensions.find(d => d.key === 'speed').score
    const l = dimensions.find(d => d.key === 'look').score
    return (t * 0.4 + v * 0.3 + s * 0.2 + l * 0.1).toFixed(1)
  },

  onInput(e) {
    this.setData({ feedbackText: e.detail.value, warningMsg: '' })
  },

  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath
        this.setData({ foodPhoto: tempPath })
        this.identifyFood(tempPath)
      }
    })
  },

  async identifyFood(imagePath) {
    wx.showLoading({ title: 'AI识别中...' })
    try {
      // 上传图片到云存储获取临时URL
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath: `food/${Date.now()}.jpg`,
        filePath: imagePath
      })
      const urlRes = await wx.cloud.getTempFileURL({ fileList: [uploadRes.fileID] })
      const imageUrl = urlRes.fileList[0].tempFileURL

      const model = wx.cloud.extend.AI.createModel('hunyuan-v3')
      const res = await model.generateText({
        model: 'hy3-preview',
        messages: [
          {
            role: 'system',
            content: '你是菜品识别助手。根据图片识别菜品名称，只输出菜品名，不要其他内容。'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: '请识别这张图片中的菜品，只输出菜名。如果无法识别，输出"未识别"' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ]
      })
      const dishName = res.choices[0].message.content.trim()

      if (dishName && dishName !== '未识别') {
        this.setData({ aiDishName: dishName })

        // 匹配窗口
        const windows = app.getWindows()
        const keywords = dishName.split(/[,，、\s]/).filter(Boolean)
        const matched = windows.filter(w => {
          return keywords.some(k => w.name.includes(k) || k.includes(w.name.replace(/楼/g, '')))
        })

        this.setData({
          suggestWindows: matched.length > 0 ? matched : windows.slice(0, 3)
        })
      } else {
        this.setData({ aiDishName: '未能识别，请手动选择窗口' })
      }
    } catch (err) {
      console.warn('识别失败:', err)
      this.setData({ aiDishName: '识别失败，请手动输入' })
    } finally {
      wx.hideLoading()
    }
  },

  selectWindow(e) {
    const { id, name } = e.currentTarget.dataset
    this.setData({
      windowId: id,
      windowName: name
    })
    wx.showToast({ title: `已选择: ${name}`, icon: 'none' })
  },

  showAiOptions() {
    this.setData({ showAiPanel: !this.data.showAiPanel })
  },

  async aiWrite(e) {
    const style = e.currentTarget.dataset.style
    const stylePrompts = {
      foodie: '用接地气的"干饭人"语气，像同学之间聊天一样写一条简短的食堂评价',
      versailles: '用凡尔赛式的优雅语气，带点小傲娇地写一条食堂评价',
      poet: '用文艺清新的诗意语言写一条食堂评价',
      pro: '用专业美食评论家的口吻，从色香味形四个方面写一条食堂评价'
    }

    wx.showLoading({ title: 'AI创作中...' })

    try {
      const model = wx.cloud.extend.AI.createModel('hunyuan-v3')
      const res = await model.generateText({
        model: 'hy3-preview',
        messages: [
          { role: 'system', content: '你是创意美食评价写手。只输出评价文本，不要任何解释。控制在50字以内。' },
          { role: 'user', content: stylePrompts[style] }
        ]
      })
      const text = res.choices[0].message.content
      this.setData({ feedbackText: text, showAiPanel: false })
    } catch (err) {
      wx.showToast({ title: 'AI创作失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  useRewritten() {
    this.setData({ feedbackText: this.data.rewrittenText })
  },

  togglePolish() {
    this.setData({ aiPolishOn: !this.data.aiPolishOn })
  },

  useOriginal() {
    this.setData({
      showCompare: false,
      rewrittenText: this.data.originalText
    })
    this.doSubmit(this.data.originalText)
  },

  usePolished() {
    this.setData({
      showCompare: false,
      feedbackText: this.data.polishedText,
      rewrittenText: this.data.polishedText
    })
    this.doSubmit(this.data.polishedText)
  },

  closeCompare() {
    this.setData({ showCompare: false })
  },

  // 昵称设置
  showNicknameModal() {
    this.setData({ showNicknameModal: true })
  },

  async onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    this.setNicknameAvatar(avatarUrl)
  },

  chooseNicknameAvatar() {
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album'],
        success: (res) => {
          const file = res.tempFiles && res.tempFiles[0]
          if (file && file.tempFilePath) this.setNicknameAvatar(file.tempFilePath)
        }
      })
      return
    }

    wx.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: (res) => {
        const path = res.tempFilePaths && res.tempFilePaths[0]
        if (path) this.setNicknameAvatar(path)
      }
    })
  },

  async setNicknameAvatar(avatarUrl) {
    wx.showLoading({ title: '检查头像中...' })

    try {
      // 上传图片到云存储
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath: `avatars/${Date.now()}.jpg`,
        filePath: avatarUrl
      })

      // 调用内容安全API检查
      const checkRes = await wx.cloud.callFunction({
        name: 'checkImage',
        data: { fileID: uploadRes.fileID },
        timeout: 15000
      })

      if (checkRes.result && checkRes.result.safe) {
        // 头像合规
        app.globalData.user.avatar = avatarUrl
        this.setData({ 'user.avatar': avatarUrl })
        wx.showToast({ title: '头像已更新', icon: 'success' })
      } else {
        // 头像不合规
        wx.showModal({
          title: '头像不符合规范',
          content: '请更换一张头像，避免使用不当内容',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    } catch (err) {
      console.warn('头像检查失败:', err)
      // 检查失败时允许使用
      app.globalData.user.avatar = avatarUrl
      this.setData({ 'user.avatar': avatarUrl })
    } finally {
      wx.hideLoading()
    }
  },

  onNicknameInput(e) {
    this.setData({ tempNickname: e.detail.value })
  },

  confirmNickname() {
    const nickname = this.data.tempNickname.trim()
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    app.globalData.user.nickname = nickname
    app.globalData.user.hasSetNickname = true
    app.saveUser()
    this.setData({
      showNicknameModal: false,
      'user.nickname': nickname
    })
    // 继续提交流程
    this.submit()
  },

  skipNickname() {
    this.setData({ showNicknameModal: false })
    // 继续提交流程
    this.submit()
  },

  async submit() {
    const { windowId, windowName, dimensions, feedbackText, aiPolishOn } = this.data

    if (!feedbackText.trim()) {
      wx.showToast({ title: '请输入评价内容', icon: 'none' })
      return
    }

    // 检查是否已设置昵称
    if (!app.globalData.user.hasSetNickname) {
      this.showNicknameModal()
      return
    }

    this.setData({ submitting: true, warningMsg: '' })

    // AI内容检测
    try {
      const model = wx.cloud.extend.AI.createModel('hunyuan-v3')
      const res = await model.generateText({
        model: 'hy3-preview',
        messages: [
          {
            role: 'system',
            content: `你是内容审核助手。检查文本是否包含侮辱性、攻击性、低俗内容。如果有，在第一行输出"BLOCK:原因"。如果没有，输出"OK"。`
          },
          { role: 'user', content: feedbackText.trim() }
        ]
      })
      const result = res.choices[0].message.content.trim()

      if (result.startsWith('BLOCK:')) {
        this.setData({
          warningMsg: '您的评价包含不当内容：' + result.slice(6) + '，请修改后重新提交。',
          submitting: false
        })
        app.globalData.user.creditScore = Math.max(0, app.globalData.user.creditScore - 5)
        if (!app.globalData.user.creditHistory) app.globalData.user.creditHistory = []
        app.globalData.user.creditHistory.unshift({
          date: new Date().toISOString(),
          change: -5,
          reason: '评价包含不当内容'
        })
        app.saveUser()
        return
      }
    } catch (err) {
      console.warn('内容检测失败:', err)
      this.setData({
        warningMsg: '内容审核服务暂时不可用，请稍后重试。',
        submitting: false
      })
      return
    }

    // 如果开启AI润色，显示对比卡
    if (aiPolishOn) {
      try {
        const model = wx.cloud.extend.AI.createModel('hunyuan-v3')
        const res = await model.generateText({
          model: 'hy3-preview',
          messages: [
            {
              role: 'system',
              content: '你是食堂评价润色助手。将用户的口语化评价改写得更通顺、礼貌、有建设性，保留原意。只输出改写后的文本，不要加任何解释。'
            },
            { role: 'user', content: feedbackText.trim() }
          ]
        })
        const polished = res.choices[0].message.content.trim()
        this.setData({
          showCompare: true,
          originalText: feedbackText.trim(),
          polishedText: polished,
          submitting: false
        })
        return
      } catch (err) {
        console.warn('AI润色失败，直接提交:', err)
      }
    }

    // 直接提交
    this.doSubmit(feedbackText.trim())
  },

  async doSubmit(finalText) {
    const { windowId, windowName, dimensions, feedbackText } = this.data
    this.setData({ submitting: true })

    const scores = {}
    dimensions.forEach(d => { scores[d.key] = d.score })
    const totalScore = this.calcTotal(dimensions)

    // 标签提取和云函数保存并行执行
    const [aiTags] = await Promise.all([
      // 标签提取
      (async () => {
        try {
          const model = wx.cloud.extend.AI.createModel('hunyuan-v3')
          const tagRes = await model.generateText({
            model: 'hy3-preview',
            messages: [
              { role: 'system', content: '从评价中提取3-5个关键词标签，用逗号分隔，只输出标签，不要其他内容。例如：量大,实惠,辣,排队久' },
              { role: 'user', content: feedbackText.trim() }
            ]
          })
          return tagRes.choices[0].message.content.split(/[,，、]/).map(t => t.trim()).filter(Boolean)
        } catch (err) {
          console.warn('标签提取失败:', err)
          return []
        }
      })(),
      // 保存到云数据库
      wx.cloud.callFunction({
        name: 'statsFeedback',
        timeout: 15000,
        data: {
          windowId, windowName, scores, totalScore,
          feedbackText: feedbackText.trim(),
          rewrittenText: finalText,
          aiTags: [] // 云端会在后续补充标签
        }
      }).catch(err => console.warn('云函数调用失败，仅保存本地:', err))
    ])

    // 保存到本地
    const review = {
      id: Date.now(),
      windowId, windowName, scores, totalScore,
      score: Math.round(Number(totalScore)),
      text: feedbackText.trim(),
      rewrittenText: finalText,
      aiTags,
      likes: [],
      time: new Date().toISOString(),
      nickname: app.globalData.user.nickname,
      avatar: app.globalData.user.avatar,
      userId: app.globalData.openid
    }
    app.globalData.reviews.unshift(review)
    app.saveReviews()

    // 更新用户数据
    app.globalData.user.reviewCount++
    app.saveUser()

    wx.showToast({ title: '评价成功', icon: 'success' })
    setTimeout(() => {
      this.setData({ submitting: false })
      wx.navigateBack()
    }, 1500)
  }
})
