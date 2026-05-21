// 标签聚合工具 — 纯函数，无副作用

/**
 * 从评价列表中聚合标签
 * @param {Array} reviews - 评价列表（每条可能有 aiTags 数组）
 * @param {number} limit - 最多返回标签数
 * @returns {Array} [{ name, count }]
 */
function aggregateTags(reviews, limit = 10) {
  const counts = {}
  reviews.forEach(r => {
    if (r.aiTags) r.aiTags.forEach(t => { counts[t] = (counts[t] || 0) + 1 })
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

/**
 * 从标签数组提取名称列表
 * @param {Array} tags - [{ name, count }] 或字符串数组
 * @returns {Array} 字符串数组
 */
function tagNames(tags) {
  return tags.map(t => typeof t === 'string' ? t : t.name)
}

module.exports = { aggregateTags, tagNames }
