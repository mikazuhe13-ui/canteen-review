const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  const { windowId } = event

  if (!windowId) {
    return { success: false, message: '缺少windowId' }
  }

  try {
    const res = await db.collection('feedbacks')
      .where({ windowId: Number(windowId) })
      .orderBy('createTime', 'desc')
      .limit(50)
      .get()

    const reviews = res.data
    if (reviews.length === 0) {
      return { success: true, tags: [] }
    }

    const allTags = []
    reviews.forEach(r => {
      if (r.aiTags && Array.isArray(r.aiTags)) {
        allTags.push(...r.aiTags)
      }
    })

    const tagCounts = {}
    allTags.forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1
    })

    const tags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    return { success: true, tags }
  } catch (err) {
    console.error('生成标签失败:', err)
    return { success: false, message: err.message }
  }
}
