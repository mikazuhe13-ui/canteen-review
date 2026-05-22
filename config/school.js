// 学校数据配置 — 硬编码 fallback，云端数据优先
module.exports = {
  // 食堂列表（真实布局）
  canteens: [
    { id: 1, name: '一餐厅', desc: '沁园一楼，品种丰富', floors: 1, building: '沁园' },
    { id: 2, name: '二餐厅', desc: '沁园二楼，口味多样', floors: 1, building: '沁园' },
    { id: 3, name: '民族餐厅', desc: '沁园三楼，特色风味', floors: 1, building: '沁园' },
    { id: 4, name: '音乐餐厅', desc: '沁园三楼，环境优雅', floors: 1, building: '沁园' },
    { id: 5, name: '馨园餐厅', desc: '经济实惠，菜品精致', floors: 2, building: '馨园' },
    { id: 6, name: '南园餐厅', desc: '近教学楼图书馆，方便快捷', floors: 1, building: '南园' }
  ],

  // 窗口列表
  windows: [
    // 一餐厅（沁园一楼）
    { id: 1, name: '麻辣香锅', location: '沁园一楼', image: '/images/food/7.jpg', canteenId: 1, floor: 1 },
    { id: 2, name: '煎饼果子', location: '沁园一楼', image: '/images/food/14.jpg', canteenId: 1, floor: 1 },
    { id: 3, name: '鸡蛋灌饼', location: '沁园一楼', image: '/images/food/8.jpg', canteenId: 1, floor: 1 },
    // 二餐厅（沁园二楼）
    { id: 4, name: '黄焖鸡', location: '沁园二楼', image: '/images/food/3.jpg', canteenId: 2, floor: 1 },
    { id: 5, name: '烤肉饭', location: '沁园二楼', image: '/images/food/5.jpg', canteenId: 2, floor: 1 },
    { id: 6, name: '水煮肉片', location: '沁园二楼', image: '/images/food/10.jpg', canteenId: 2, floor: 1 },
    // 民族餐厅（沁园三楼）
    { id: 7, name: '兰州拉面', location: '沁园三楼', image: '/images/food/9.jpg', canteenId: 3, floor: 1 },
    { id: 8, name: '麻辣拌', location: '沁园三楼', image: '/images/food/1.webp', canteenId: 3, floor: 1 },
    { id: 9, name: '手抓饼', location: '沁园三楼', image: '/images/food/4.jpg', canteenId: 3, floor: 1 },
    // 音乐餐厅（沁园三楼）
    { id: 10, name: '螺蛳粉', location: '沁园三楼', image: '/images/food/11.jpg', canteenId: 4, floor: 1 },
    { id: 11, name: '盖浇饭', location: '沁园三楼', image: '/images/food/12.jpg', canteenId: 4, floor: 1 },
    { id: 12, name: '炒饭', location: '沁园三楼', image: '/images/food/6.jpg', canteenId: 4, floor: 1 },
    // 馨园一楼
    { id: 13, name: '酸菜鱼', location: '馨园一楼', image: '/images/food/13.jpg', canteenId: 5, floor: 1 },
    { id: 14, name: '麻辣烫', location: '馨园一楼', image: '/images/food/2.jpg', canteenId: 5, floor: 1 },
    // 馨园二楼
    { id: 15, name: '炒面', location: '馨园二楼', image: '/images/food/22.jpg', canteenId: 5, floor: 2 },
    { id: 16, name: '盖饭', location: '馨园二楼', image: '/images/food/21.jpg', canteenId: 5, floor: 2 },
    // 南园餐厅
    { id: 17, name: '快餐', location: '南园餐厅', image: '/images/food/20.jpg', canteenId: 6, floor: 1 },
    { id: 18, name: '面食', location: '南园餐厅', image: '/images/food/16.jpg', canteenId: 6, floor: 1 }
  ],

  // 评分维度
  dimensions: [
    { key: 'taste', name: '口味', emoji: '😋', weight: 0.4 },
    { key: 'value', name: '性价比', emoji: '💰', weight: 0.3 },
    { key: 'speed', name: '出餐速度', emoji: '🚀', weight: 0.2 },
    { key: 'look', name: '颜值', emoji: '✨', weight: 0.1 }
  ],

  // 云环境 ID
  cloudEnv: 'canteen-env-d1gxyqz355fb26062'
}
