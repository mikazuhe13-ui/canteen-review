const app = getApp()

Component({
  data: {
    selected: 0,
    list: []
  },
  attached() {
    this.updateList()
    this.updateSelected()
  },
  methods: {
    updateList() {
      const isAdmin = app.globalData.user.isAdmin
      const allTabs = [
        { path: '/pages/feed/feed', text: '动态', name: 'feed', icon: '/custom-tab-bar/动态.png', activeIcon: '/custom-tab-bar/动态.png' },
        { path: '/pages/ranking/ranking', text: '榜单', name: 'ranking', icon: '/custom-tab-bar/榜单.png', activeIcon: '/custom-tab-bar/榜单.png' },
        { path: '/pages/canteens/canteens', text: '食堂', name: 'canteen', icon: '/custom-tab-bar/食堂.png', activeIcon: '/custom-tab-bar/食堂.png' },
        { path: '/pages/profile/profile', text: '我的', name: 'profile', icon: '/custom-tab-bar/我的.png', activeIcon: '/custom-tab-bar/我的.png' },
        { path: '/pages/admin/admin', text: '管理', name: 'admin', icon: '/images/tabbar/admin.svg', activeIcon: '/images/tabbar/admin-active.svg', isAdmin: true }
      ]
      const list = isAdmin ? allTabs : allTabs.filter(t => !t.isAdmin)
      this.setData({ list })
    },
    updateSelected() {
      const pages = getCurrentPages()
      if (!pages.length) return
      const route = '/' + pages[pages.length - 1].route
      const idx = this.data.list.findIndex(t => t.path === route)
      if (idx >= 0) this.setData({ selected: idx })
    },
    switchTab(e) {
      const idx = e.currentTarget.dataset.index
      const item = this.data.list[idx]
      if (!item || idx === this.data.selected) return
      wx.switchTab({ url: item.path })
    }
  }
})
