const app = getApp()
const windowService = require('../../services/windowService')

Page({
  data: {
    canteens: [],
    currentCanteen: 1,
    currentCanteenName: '',
    currentFloor: 1,
    floorList: [],
    mapWindows: []
  },

  onLoad() {
    const canteens = windowService.getCanteens()
    this.setData({ canteens })
    this.switchCanteen({ currentTarget: { dataset: { id: 1 } } })
  },

  onShow() {
    this.refreshMap()
  },

  switchCanteen(e) {
    const id = e.currentTarget.dataset.id
    const canteens = windowService.getCanteens()
    const canteen = canteens.find(c => c.id === id) || canteens[0]
    const floorList = []
    for (let i = 1; i <= canteen.floors; i++) floorList.push(i)

    this.setData({
      currentCanteen: id,
      currentCanteenName: canteen.name,
      floorList,
      currentFloor: 1
    })
    this.refreshMap()
  },

  switchFloor(e) {
    this.setData({ currentFloor: e.currentTarget.dataset.floor })
    this.refreshMap()
  },

  refreshMap() {
    const { currentCanteen, currentFloor } = this.data
    const windows = windowService.getWindows()
    let mapWindows = windows.filter(w => {
      return w.canteenId === currentCanteen && w.floor === currentFloor
    })
    if (mapWindows.length === 0) mapWindows = windows.slice(0, 3)

    // 分配空间定位坐标
    const positions = [
      { left: '4%', top: '8%' },
      { left: '52%', top: '8%' },
      { left: '4%', top: '38%' },
      { left: '52%', top: '38%' },
      { left: '4%', top: '68%' },
      { left: '52%', top: '68%' }
    ]
    mapWindows = mapWindows.map((w, i) => ({
      ...w,
      pos: positions[i] || positions[i % positions.length]
    }))

    this.setData({ mapWindows })
  },

  goToFeedback(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/feedback/feedback?windowId=${id}&windowName=${encodeURIComponent(name)}`
    })
  }
})
