// 失物招领服务 — CRUD、状态管理、AI匹配

const storage = require('./storageService')
const aiService = require('./aiService')

const CATEGORIES = [
  { key: 'card',     name: '校园卡', emoji: '🪪' },
  { key: 'key',      name: '钥匙',   emoji: '🔑' },
  { key: 'earphone', name: '耳机',   emoji: '🎧' },
  { key: 'cup',      name: '水杯',   emoji: '🥤' },
  { key: 'book',     name: '书本',   emoji: '📚' },
  { key: 'phone',    name: '手机',   emoji: '📱' },
  { key: 'other',    name: '其他',   emoji: '📦' }
]

let _items = []

/** 初始化，从缓存加载 */
function init() {
  _items = storage.getLostItems() || []
}

/** 获取所有条目 */
function getAll() { return _items }

/** 按类型筛选 */
function getByType(type) {
  return _items.filter(i => i.type === type)
}

/** 按分类筛选 */
function getByCategory(category) {
  return _items.filter(i => i.category === category)
}

/** 按类型和分类筛选 */
function filter(type, category) {
  let list = _items
  if (type !== 'all') list = list.filter(i => i.type === type)
  if (category !== 'all') list = list.filter(i => i.category === category)
  return list
}

/** 根据 ID 获取 */
function getById(id) {
  return _items.find(i => i.id == id || i._id == id)
}

/** 添加条目 */
function add(item) {
  const newItem = {
    id: Date.now(),
    ...item,
    status: 'open',
    viewCount: 0,
    createTime: new Date().toISOString()
  }
  _items.unshift(newItem)
  storage.setLostItems(_items)

  // 异步同步到云端
  syncToCloud(newItem)

  return newItem
}

/** 更新状态 */
function updateStatus(id, status) {
  const item = _items.find(i => i.id == id)
  if (item) {
    item.status = status
    storage.setLostItems(_items)
    updateCloudStatus(id, status)
  }
  return item
}

/** 上传图片到云存储 */
async function uploadImage(filePath) {
  const ext = filePath.split('.').pop() || 'jpg'
  const cloudPath = `lost-found/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
  const res = await wx.cloud.uploadFile({ cloudPath, filePath })
  return res.fileID
}

/** AI 生成标题 */
async function generateTitle(description) {
  try {
    return await aiService.callAI(
      aiService.buildPrompt(aiService.config.lostFound.generateTitle.system, description)
    )
  } catch { return '' }
}

/** AI 提取标签 */
async function extractTags(description) {
  try {
    const result = await aiService.callAI(
      aiService.buildPrompt(aiService.config.lostFound.extractTags.system, description)
    )
    return result.split(/[,，、]/).map(t => t.trim()).filter(Boolean)
  } catch { return [] }
}

/** AI 匹配相似条目 */
function findMatches(item, limit = 5) {
  const oppositeType = item.type === 'lost' ? 'found' : 'lost'
  const candidates = _items.filter(i =>
    i.type === oppositeType && i.status === 'open' && i.id !== item.id
  )

  // 简单匹配：同分类优先，标签重叠加分
  const scored = candidates.map(c => {
    let score = 0
    if (c.category === item.category) score += 3
    if (item.tags && c.tags) {
      const overlap = item.tags.filter(t => c.tags.includes(t)).length
      score += overlap * 2
    }
    if (item.location && c.location && item.location === c.location) score += 2
    return { ...c, matchScore: score }
  })

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit)
}

/** 同步到云端 */
async function syncToCloud(item) {
  try {
    await wx.cloud.callFunction({
      name: 'lostFound',
      timeout: 15000,
      data: { action: 'add', item }
    })
  } catch (err) {
    console.warn('失物招领云同步失败:', err)
  }
}

/** 更新云端状态 */
async function updateCloudStatus(id, status) {
  try {
    await wx.cloud.callFunction({
      name: 'lostFound',
      timeout: 15000,
      data: { action: 'updateStatus', id, status }
    })
  } catch {}
}

/** 从云端同步列表 */
async function syncFromCloud() {
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'lostFound',
      timeout: 15000,
      data: { action: 'list' }
    })
    if (result && result.items) {
      _items = result.items
      storage.setLostItems(_items)
    }
  } catch (err) {
    console.warn('从云端同步失物招领失败:', err)
  }
}

module.exports = {
  CATEGORIES, init, getAll, getByType, getByCategory,
  filter, getById, add, updateStatus, uploadImage,
  generateTitle, extractTags, findMatches, syncFromCloud
}
