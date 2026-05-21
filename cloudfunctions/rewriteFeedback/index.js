const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  const { feedbackId, rawText } = event

  if (!rawText) {
    return { success: false, message: '缺少文本参数' }
  }

  try {
    const model = cloud.extend.AI.createModel('hunyuan-v3')

    const res = await model.generateText({
      model: 'hy3-preview',
      messages: [
        {
          role: 'system',
          content: '你是食堂评价改写助手，把用户的口语化评价改得更通顺、礼貌，保留原意，只输出改写后的文本，不要加任何解释。'
        },
        {
          role: 'user',
          content: `请帮我改写这条食堂评价：${rawText}`
        }
      ]
    })

    const rewrittenText = res.choices[0].message.content

    if (feedbackId) {
      await db.collection('feedbacks').doc(feedbackId).update({
        data: { rewrittenText: rewrittenText.trim() }
      })
    }

    return {
      success: true,
      originalText: rawText,
      rewrittenText: rewrittenText.trim()
    }
  } catch (err) {
    console.error('改写失败:', err)
    return { success: false, message: '改写失败: ' + err.message }
  }
}
