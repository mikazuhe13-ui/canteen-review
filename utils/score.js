// 评分计算工具 — 纯函数，无副作用

const weights = { taste: 0.4, value: 0.3, speed: 0.2, look: 0.1 }

/**
 * 计算加权总分
 * @param {Object} scores - { taste, value, speed, look }
 * @returns {string} 保留一位小数的总分
 */
function calcTotalScore(scores) {
  let total = 0
  for (const [key, weight] of Object.entries(weights)) {
    total += (scores[key] || 0) * weight
  }
  return total.toFixed(1)
}

/**
 * 计算窗口平均分
 * @param {Array} reviews - 评价列表
 * @returns {Object} { taste, value, speed, look, total }
 */
function calcWindowAvg(reviews) {
  if (reviews.length === 0) return { taste: '0.0', value: '0.0', speed: '0.0', look: '0.0', total: '暂无' }

  const dims = { taste: 0, value: 0, speed: 0, look: 0 }
  reviews.forEach(r => {
    for (const key of Object.keys(dims)) {
      dims[key] += (r.scores?.[key] || r.score || 0)
    }
  })

  const avg = {}
  for (const [key, sum] of Object.entries(dims)) {
    avg[key] = (sum / reviews.length).toFixed(1)
  }
  avg.total = calcTotalScore(avg)
  return avg
}

module.exports = { calcTotalScore, calcWindowAvg, weights }
