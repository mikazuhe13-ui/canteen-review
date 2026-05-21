const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const col = db.collection('lost_items')

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { action } = event

  switch (action) {
    case 'add': {
      const item = {
        ...event.item,
        userId: OPENID,
        createTime: db.serverDate(),
        viewCount: 0
      }
      delete item.id
      delete item._id
      const res = await col.add({ data: item })
      return { success: true, _id: res._id }
    }

    case 'list': {
      const { type, category, limit = 50 } = event
      const where = {}
      if (type && type !== 'all') where.type = type
      if (category && category !== 'all') where.category = category
      const query = where.status ? col.where(where) : col.where({ ...where, status: 'open' })
      const res = await query.orderBy('createTime', 'desc').limit(limit).get()
      return { items: res.data }
    }

    case 'detail': {
      const { id } = event
      await col.doc(id).update({ data: { viewCount: db.command.inc(1) } })
      const res = await col.doc(id).get()
      return { item: res.data }
    }

    case 'updateStatus': {
      const { id, status } = event
      await col.where({ _id: id, userId: OPENID }).update({ data: { status } })
      return { success: true }
    }

    default:
      return { error: '未知操作' }
  }
}
