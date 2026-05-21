// 评价服务 — 评价 CRUD、点赞、云端同步

const storage = require('./storageService')
const { score } = require('../utils/index.js')

let _globalData = null

function init(gd) { _globalData = gd }

/** 获取评价列表 */
function getReviews(windowId) {
  const reviews = _globalData?.reviews || []
  if (windowId) return reviews.filter(r => r.windowId == windowId)
  return reviews
}

/** 保存评价到本地 */
function saveReviews() {
  if (_globalData) storage.setReviews(_globalData.reviews)
}

/** 添加评价 */
function addReview(reviewData) {
  if (!_globalData) return
  const review = {
    id: Date.now(),
    ...reviewData,
    likes: [],
    time: new Date().toISOString()
  }
  _globalData.reviews.unshift(review)
  saveReviews()
  _globalData.user.reviewCount++
  return review
}

/** 切换点赞 */
function toggleLike(reviewId) {
  if (!_globalData) return null
  const openid = _globalData.openid
  if (!openid) return null

  const review = _globalData.reviews.find(r => r.id == reviewId)
  if (!review) return null

  if (!review.likes) review.likes = []
  const idx = review.likes.indexOf(openid)
  if (idx > -1) {
    review.likes.splice(idx, 1)
  } else {
    review.likes.push(openid)
  }
  saveReviews()

  // 异步同步到云端
  syncLikeToCloud(reviewId, review.likes)

  return review
}

/** 同步点赞到云端 */
async function syncLikeToCloud(reviewId, likes) {
  try {
    const db = wx.cloud.database()
    const res = await db.collection('feedbacks').where({ id: reviewId }).get()
    if (res.data.length > 0) {
      await db.collection('feedbacks').doc(res.data[0]._id).update({ data: { likes } })
    }
  } catch {}
}

/** 同步评价到云端 */
async function syncToCloud(reviewData) {
  try {
    await wx.cloud.callFunction({
      name: 'statsFeedback',
      timeout: 15000,
      data: reviewData
    })
  } catch (err) {
    console.warn('云函数调用失败，仅保存本地:', err)
  }
}

module.exports = { init, getReviews, saveReviews, addReview, toggleLike, syncToCloud }
