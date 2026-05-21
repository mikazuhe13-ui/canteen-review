// 时间格式化工具 — 纯函数，无副作用

/**
 * 格式化相对时间
 * @param {string|number} dateStr - 时间字符串或时间戳
 * @returns {string} 如 "5分钟前"、"3小时前"、"2天前"、"3月15日"
 */
function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hourMs = 60 * 60 * 1000

  if (diff < hourMs) return `${Math.max(1, Math.floor(diff / 60000))}分钟前`
  if (diff < 24 * hourMs) return `${Math.floor(diff / hourMs)}小时前`
  if (diff < 7 * 24 * hourMs) return `${Math.floor(diff / (24 * hourMs))}天前`

  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 判断是否是今天
 * @param {string|number} dateStr - 时间字符串或时间戳
 * @returns {boolean}
 */
function isToday(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

module.exports = { formatRelativeTime, isToday }
