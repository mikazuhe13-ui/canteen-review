const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { windowId, windowName, scores, totalScore, feedbackText, rewrittenText, aiTags } = event

  if (!feedbackText || !windowId) {
    return { success: false, message: '参数不完整' }
  }

  try {
    const result = await db.collection('feedbacks').add({
      data: {
        userId: OPENID,
        windowId,
        windowName,
        scores: scores || {},
        totalScore: Number(totalScore) || 0,
        score: Math.round(Number(totalScore)) || 3,
        text: feedbackText,
        rewrittenText: rewrittenText || feedbackText,
        aiTags: aiTags || [],
        likes: [],
        createTime: db.serverDate()
      }
    })

    return {
      success: true,
      id: result._id,
      message: '评价保存成功'
    }
  } catch (err) {
    console.error('保存失败:', err)
    return { success: false, message: '保存失败: ' + err.message }
  }
}
