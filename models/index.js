// 数据结构定义 — 纯文档，不参与运行时
// 用于团队协作时对齐字段名和类型

/**
 * 用户 (User)
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像 URL
 * @property {number} creditScore - 信用分
 * @property {number} reviewCount - 评价数
 * @property {number} likeCount - 获赞数
 * @property {Array} creditHistory - 信用变动记录
 * @property {boolean} isAdmin - 是否管理员
 * @property {boolean} hasSetNickname - 是否已设置昵称
 * @property {string} bio - 个人简介
 */

/**
 * 评价 (Review)
 * @property {number} id - 时间戳 ID
 * @property {number} windowId - 窗口 ID
 * @property {string} windowName - 窗口名
 * @property {Object} scores - { taste, value, speed, look }
 * @property {string} totalScore - 加权总分
 * @property {string} text - 原始评价文本
 * @property {string} rewrittenText - AI 润色后文本
 * @property {Array<string>} aiTags - AI 提取的标签
 * @property {Array<string>} likes - 点赞用户 openid 列表
 * @property {string} time - ISO 时间字符串
 * @property {string} nickname - 用户昵称
 * @property {string} avatar - 用户头像
 * @property {string} userId - 用户 openid
 */

/**
 * 窗口 (Window)
 * @property {number} id - 窗口 ID
 * @property {string} name - 窗口名
 * @property {string} location - 位置描述
 * @property {string} image - 图片路径
 * @property {number} canteenId - 所属食堂 ID
 * @property {number} floor - 楼层
 */

/**
 * 食堂 (Canteen)
 * @property {number} id - 食堂 ID
 * @property {string} name - 食堂名
 * @property {string} desc - 描述
 * @property {number} floors - 楼层数
 */

module.exports = {}
