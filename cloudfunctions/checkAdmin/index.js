const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    const db = cloud.database()
    const { data } = await db.collection('admins').where({ openid: OPENID }).limit(1).get()
    return { isAdmin: data.length > 0 }
  } catch (err) {
    console.error('检查管理员权限失败:', err)
    return { isAdmin: false }
  }
}
