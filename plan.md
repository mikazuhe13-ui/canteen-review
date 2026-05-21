# 食堂评价小程序 - 全功能实施计划

## Context
为微信小程序比赛打造完整的食堂评价系统，包含AI评论卫士、多维评分、味觉标签、周榜、信用分、拍照识菜等全部功能。

## 一、数据库结构设计

### feedbacks 集合
```json
{
  "windowId": Number,
  "windowName": String,
  "userId": String,
  "scores": { "taste": Number, "value": Number, "speed": Number, "look": Number },
  "totalScore": Number,
  "text": String,
  "rewrittenText": String,
  "aiTags": [String],
  "likes": [String],
  "createTime": Date
}
```

### users 集合
```json
{
  "_openid": String,
  "nickname": String,
  "avatar": String,
  "creditScore": Number (默认100),
  "reviewCount": Number,
  "likeCount": Number,
  "createTime": Date
}
```

### windows 集合
```json
{
  "id": Number,
  "name": String,
  "canteenId": Number,
  "floor": Number,
  "location": String,
  "image": String,
  "tags": [String],
  "avgScores": { "taste": Number, "value": Number, "speed": Number, "look": Number },
  "totalScore": Number,
  "reviewCount": Number
}
```

## 二、实施步骤（分5个阶段）

### 阶段1：多维评分 + AI评论卫士
**修改文件：**
- `pages/feedback/feedback.wxml` - 4维评分UI（口味/性价比/出餐速度/颜值）
- `pages/feedback/feedback.wxss` - 评分样式
- `pages/feedback/feedback.js` - AI润色+敏感词检测+用户确认机制
- `cloudfunctions/statsFeedback/index.js` - 保存多维分数

### 阶段2：AI帮写 + 味觉标签
**新增/修改：**
- `pages/feedback/feedback.wxml` - 添加"AI帮写"按钮（干饭人语录/凡尔赛式）
- `pages/feedback/feedback.js` - AI帮写逻辑
- `pages/windows/windows.wxml` - 显示窗口味觉标签云
- `pages/windows/windows.js` - 加载标签数据
- `cloudfunctions/generateTags/index.js` - NLP提取标签云函数

### 阶段3：周榜系统
**新增文件：**
- `pages/ranking/ranking.wxml` - 榜单页面（综合榜/性价比榜/新人黑马榜）
- `pages/ranking/ranking.wxss` - 榜单样式
- `pages/ranking/ranking.js` - 热度算法+时间衰减
- `pages/ranking/ranking.json`
- `cloudfunctions/calcRanking/index.js` - 榜单计算云函数

### 阶段4：个人中心 + 信用分
**新增/修改：**
- `pages/profile/profile.wxml` - 重做个人中心（干饭足迹/信用分/学期报告）
- `pages/profile/profile.js` - 用户数据统计
- `pages/profile/profile.wxss` - 新样式

### 阶段5：管理后台增强 + 地图模式
**修改/新增：**
- `pages/admin/admin.wxml` - 增强统计（标签云/趋势图/审核队列）
- `pages/admin/admin.js` - 数据分析逻辑
- `pages/map/map.wxml` - 食堂平面地图
- `pages/map/map.js` - 地图交互

## 三、TabBar 配置
```
食堂 → canteens
榜单 → ranking (新增)
地图 → map (新增)
我的 → profile
管理 → admin
```

## 四、关键技术点
- AI调用：前端 `wx.cloud.extend.AI.createModel('hunyuan-v3').generateText()`
- 榜单算法：热度 = (评分增量×0.5 + 评论数×0.3 + 点赞数×0.2) × 时间衰减
- 标签生成：云函数调用AI提取关键词，聚合生成标签云
- 信用分：初始100分，违规扣分，优质评论加分

## 五、验证方式
每个阶段完成后在开发者工具中测试完整流程，确保：
1. 多维评分提交成功
2. AI润色和帮写正常工作
3. 标签云正确显示
4. 榜单数据计算准确
5. 个人中心数据同步
