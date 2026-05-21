const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { type } = event // 'all' | 'value' | 'new'

  try {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const res = await db.collection('feedbacks')
      .where({ createTime: _.gte(weekAgo) })
      .orderBy('createTime', 'desc')
      .limit(500)
      .get()

    const reviews = res.data
    const windowMap = {}

    reviews.forEach(r => {
      const wid = r.windowId
      if (!windowMap[wid]) {
        windowMap[wid] = {
          windowId: wid,
          windowName: r.windowName,
          reviews: [],
          totalScore: 0,
          scoreCount: 0,
          likeCount: 0
        }
      }
      const w = windowMap[wid]
      w.reviews.push(r)
      w.totalScore += (r.totalScore || r.score || 0)
      w.scoreCount++
      w.likeCount += (r.likes ? r.likes.length : 0)
    })

    const rankings = Object.values(windowMap).map(w => {
      const avgScore = w.scoreCount > 0 ? (w.totalScore / w.scoreCount) : 0
      const reviewCount = w.reviews.length
      const likeCount = w.likeCount

      // 热度 = (评分×0.5 + 评论数×0.3 + 点赞数×0.2)
      const hotness = (avgScore * 0.5 + reviewCount * 0.3 + likeCount * 0.2)

      // 时间衰减：越新的评论权重越高
      const dayMs = 24 * 60 * 60 * 1000
      let timeDecay = 0
      w.reviews.forEach(r => {
        const age = (now.getTime() - new Date(r.createTime).getTime()) / dayMs
        timeDecay += Math.max(0.1, 1 - age / 7)
      })
      timeDecay = reviewCount > 0 ? timeDecay / reviewCount : 0

      return {
        windowId: w.windowId,
        windowName: w.windowName,
        avgScore: avgScore.toFixed(1),
        reviewCount,
        likeCount,
        hotness: (hotness * timeDecay).toFixed(1)
      }
    })

    rankings.sort((a, b) => b.hotness - a.hotness)

    return { success: true, rankings }
  } catch (err) {
    console.error('计算榜单失败:', err)
    return { success: false, message: err.message }
  }
}
