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
      const list = [
        { path: '/pages/feed/feed', text: '动态', name: 'feed', icon: '/images/tabbar/feed.png', activeIcon: '/images/tabbar/feed-active.png' },
        { path: '/pages/ranking/ranking', text: '榜单', name: 'ranking', icon: '/images/tabbar/ranking.png', activeIcon: '/images/tabbar/ranking-active.png' },
        { path: '/pages/canteens/canteens', text: '食堂', name: 'canteen', icon: '/images/tabbar/canteen.png', activeIcon: '/images/tabbar/canteen-active.png' },
        { path: '/pages/profile/profile', text: '我的', name: 'profile', icon: '/images/tabbar/profile.png', activeIcon: '/images/tabbar/profile-active.png' }
      ]
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
