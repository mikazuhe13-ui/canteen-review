// 窗口/食堂服务 — 数据获取、标签聚合、排行

const storage = require('./storageService')
const { school } = require('../config/index.js')
const { score, tag } = require('../utils/index.js')

let _globalData = null

function init(gd) { _globalData = gd }

/** 获取窗口列表（带评分计算） */
function getWindows() {
  const reviews = _globalData?.reviews || []
  const cloudData = _globalData?._cloudWindows
  const cached = storage.getWindows()
  const windows = cloudData || cached || school.windows

  return windows.map(w => {
    const winReviews = reviews.filter(r => r.windowId == w.id)
    const avgScores = score.calcWindowAvg(winReviews)
    const topTags = tag.aggregateTags(winReviews, 5)
    return {
      ...w,
      avgScores,
      totalScore: avgScores.total,
      reviewCount: winReviews.length,
      tags: tag.tagNames(topTags)
    }
  })
}

/** 获取食堂列表 */
function getCanteens() {
  return _globalData?.canteens || school.canteens
}

/** 从云端同步窗口数据 */
async function syncWindows() {
  try {
    const db = wx.cloud.database()
    const { data } = await db.collection('windows').limit(100).get()
    if (data.length > 0) {
      if (_globalData) _globalData._cloudWindows = data
      storage.setWindows(data)
    }
  } catch (err) {
    console.error('同步窗口数据失败:', err)
  }
}

/** 从云端同步食堂数据 */
async function syncCanteens() {
  try {
    const db = wx.cloud.database()
    const { data } = await db.collection('canteens').limit(100).get()
    if (data.length > 0) {
      if (_globalData) _globalData.canteens = data
      storage.setCanteens(data)
    }
  } catch (err) {
    console.error('同步食堂数据失败:', err)
  }
}

module.exports = { init, getWindows, getCanteens, syncWindows, syncCanteens }
