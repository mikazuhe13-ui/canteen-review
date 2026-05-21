Component({
  properties: {
    loading: {
      type: Boolean,
      value: true
    },
    type: {
      type: String,
      value: 'card' // card, list, profile
    },
    rows: {
      type: Number,
      value: 3
    }
  },

  data: {
    skeletonRows: []
  },

  lifetimes: {
    attached() {
      this.updateRows()
    }
  },

  observers: {
    'rows': function() {
      this.updateRows()
    }
  },

  methods: {
    updateRows() {
      const arr = []
      for (let i = 0; i < this.data.rows; i++) {
        arr.push(i)
      }
      this.setData({ skeletonRows: arr })
    }
  }
})
