// 用户服务 — 登录、管理员验证、用户信息管理

const storage = require('./storageService')
const { school } = require('../config/index.js')

// 内存中的 globalData 引用（与 app.globalData 同步）
let _globalData = null

function getGlobalData() {
  return _globalData
}

function setGlobalData(ref) {
  _globalData = ref
}

// 默认用户
const defaultUser = () => ({
  nickname: 'suser' + Math.floor(Math.random() * 9000 + 1000),
  avatar: '/images/avatar.png',
  creditScore: 100,
  reviewCount: 0,
  likeCount: 0,
  creditHistory: [],
  isAdmin: true,
  hasSetNickname: false,
  bio: ''
})

/** 从缓存恢复用户 */
function restoreUser() {
  if (!_globalData) return
  const cached = storage.getUser()
  _globalData.user = cached || defaultUser()
  const reviews = storage.getReviews()
  if (reviews) _globalData.reviews = reviews
}

/** 静默登录获取 openid */
async function login(retry = 2) {
  if (!_globalData) return
  try {
    const { result } = await wx.cloud.callFunction({ name: 'login', timeout: 15000 })
    if (result && result.openid) {
      _globalData.openid = result.openid
      console.log('登录成功，openid:', result.openid)
      await checkAdmin()
    }
  } catch (err) {
    if (retry > 0) {
      await new Promise(r => setTimeout(r, 3000))
      return login(retry - 1)
    }
  }
}

/** 检查管理员权限 */
async function checkAdmin() {
  if (!_globalData) return
  try {
    const { result } = await wx.cloud.callFunction({ name: 'checkAdmin', timeout: 10000 })
    _globalData.user.isAdmin = !!result.isAdmin
    saveUser()
    refreshCurrentPage()
  } catch (err) {
    console.error('检查管理员权限失败:', err)
  }
}

/** 保存用户到缓存 */
function saveUser() {
  if (_globalData) storage.setUser(_globalData.user)
}

/** 更新用户信息 */
function updateUser(fields) {
  if (!_globalData) return
  const nextFields = Object.assign({}, fields)
  if (typeof nextFields.nickname === 'string') {
    nextFields.nickname = nextFields.nickname.trim()
    nextFields.hasSetNickname = !!nextFields.nickname
  }
  Object.assign(_globalData.user, nextFields)
  saveUser()
}

/** 扣除信用分 */
function deductCredit(amount, reason) {
  if (!_globalData) return
  _globalData.user.creditScore = Math.max(0, _globalData.user.creditScore - amount)
  if (!_globalData.user.creditHistory) _globalData.user.creditHistory = []
  _globalData.user.creditHistory.unshift({
    date: new Date().toISOString(),
    change: -amount,
    reason
  })
  saveUser()
}

/** 退出登录 */
function logout() {
  storage.clear()
  if (_globalData) {
    _globalData.user = defaultUser()
    _globalData.reviews = []
    _globalData.openid = ''
  }
}

/** 刷新当前页面 */
function refreshCurrentPage() {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const page = pages[pages.length - 1]
    if (page.onShow) page.onShow()
  }
}

module.exports = {
  getGlobalData, setGlobalData, restoreUser, login,
  checkAdmin, saveUser, updateUser, deductCredit,
  logout, refreshCurrentPage, defaultUser
}
