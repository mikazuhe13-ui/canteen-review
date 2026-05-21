const app = getApp()
const windowService = require('../../services/windowService')

Page({
  data: {
    canteenId: 0,
    canteenName: '',
    floors: [],
    currentFloor: 0,
    currentWindows: [],
    allWindows: [],
    loading: true
  },

  onLoad(options) {
    const canteenId = Number(options.canteenId)
    const canteens = windowService.getCanteens()
    const canteen = canteens.find(c => c.id === canteenId) || canteens[0]

    const floors = []
    for (let i = 1; i <= canteen.floors; i++) {
      floors.push({ name: `${i}楼`, level: i })
    }

    const allWindows = windowService.getWindows()

    this.setData({
      canteenId,
      canteenName: canteen.name,
      floors,
      allWindows
    })

    this.switchFloor(0)
    this.loadCloudTags()

    setTimeout(() => {
      this.setData({ loading: false })
    }, 600)
  },

  onShow() {
    const { currentFloor } = this.data
    this.filterWindows(currentFloor)
  },

  switchFloor(e) {
    let index = 0
    if (typeof e === 'object' && e.currentTarget) {
      index = e.currentTarget.dataset.index
    }
    this.setData({ currentFloor: index })
    this.filterWindows(index)
  },

  filterWindows(floorIndex) {
    const { allWindows, floors } = this.data
    const floorLevel = floors[floorIndex].level
    const floorStr = `${floorLevel}楼`
    const floorNames = ['一', '二', '三', '四', '五']
    const floorName = floorNames[floorLevel - 1] + '楼'

    const filtered = allWindows.filter(w => {
      return w.floor === floorLevel || w.location.includes(floorStr) || w.location.includes(floorName)
    })

    this.setData({
      currentWindows: filtered.length > 0 ? filtered : allWindows
    })
  },

  goToFeedback(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/feedback/feedback?windowId=${id}&windowName=${encodeURIComponent(name)}`
    })
  },

  async loadCloudTags() {
    const windows = [...this.data.allWindows]
    const needsTags = windows.filter(w => !w.tags || w.tags.length === 0)
    if (needsTags.length === 0) return

    // 并行获取标签
    const results = await Promise.allSettled(
      needsTags.map(w =>
        wx.cloud.callFunction({
          name: 'generateTags',
          data: { windowId: w.id },
          timeout: 15000
        }).then(res => ({ id: w.id, tags: res.result?.tags || [] }))
      )
    )

    let updated = false
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value.tags.length > 0) {
        const win = windows.find(w => w.id === r.value.id)
        if (win) {
          win.tags = r.value.tags.map(t => t.name || t)
          updated = true
        }
      }
    })

    if (updated) {
      this.setData({ allWindows: windows })
      this.filterWindows(this.data.currentFloor)
    }
  }
})
