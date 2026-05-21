// 本地缓存服务 — 统一管理 wx.setStorageSync/getStorageSync

const KEYS = {
  REVIEWS: 'reviews',
  USER: 'user',
  WINDOWS: 'windows',
  CANTEENS: 'canteens',
  LOST_ITEMS: 'lostItems'
}

function get(key) {
  try { return wx.getStorageSync(key) || null } catch { return null }
}

function set(key, value) {
  try { wx.setStorageSync(key, value) } catch (e) { console.error('缓存写入失败:', key, e) }
}

function remove(key) {
  try { wx.removeStorageSync(key) } catch {}
}

function clear() {
  try { wx.clearStorageSync() } catch {}
}

module.exports = {
  KEYS,
  getReviews: () => get(KEYS.REVIEWS),
  setReviews: (v) => set(KEYS.REVIEWS, v),
  getUser: () => get(KEYS.USER),
  setUser: (v) => set(KEYS.USER, v),
  getWindows: () => get(KEYS.WINDOWS),
  setWindows: (v) => set(KEYS.WINDOWS, v),
  getCanteens: () => get(KEYS.CANTEENS),
  setCanteens: (v) => set(KEYS.CANTEENS, v),
  getLostItems: () => get(KEYS.LOST_ITEMS),
  setLostItems: (v) => set(KEYS.LOST_ITEMS, v),
  clear
}
