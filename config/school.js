// 学校数据配置 — 硬编码 fallback，云端数据优先
module.exports = {
  // 食堂列表
  canteens: [
    { id: 1, name: '一食堂', desc: '品种丰富，口味多样', floors: 3 },
    { id: 2, name: '二食堂', desc: '经济实惠，分量充足', floors: 2 },
    { id: 3, name: '三食堂', desc: '环境优雅，菜品精致', floors: 2 }
  ],

  // 窗口列表
  windows: [
    { id: 1, name: '一楼麻辣香锅', location: '一食堂一楼A区', image: '/images/food/7.jpg', canteenId: 1, floor: 1 },
    { id: 2, name: '二楼黄焖鸡', location: '一食堂二楼B区', image: '/images/food/3.jpg', canteenId: 1, floor: 2 },
    { id: 3, name: '三楼螺蛳粉', location: '二食堂三楼', image: '/images/food/11.jpg', canteenId: 2, floor: 3 },
    { id: 4, name: '一楼煎饼果子', location: '二食堂一楼', image: '/images/food/14.jpg', canteenId: 2, floor: 1 },
    { id: 5, name: '二楼麻辣烫', location: '一食堂二楼A区', image: '/images/food/2.jpg', canteenId: 1, floor: 2 },
    { id: 6, name: '一楼兰州拉面', location: '三食堂一楼', image: '/images/food/9.jpg', canteenId: 3, floor: 1 },
    { id: 7, name: '二楼烤肉饭', location: '一食堂二楼C区', image: '/images/food/5.jpg', canteenId: 1, floor: 2 },
    { id: 8, name: '一楼酸菜鱼', location: '二食堂一楼B区', image: '/images/food/13.jpg', canteenId: 2, floor: 1 },
    { id: 9, name: '二楼麻辣拌', location: '三食堂二楼', image: '/images/food/1.webp', canteenId: 3, floor: 2 },
    { id: 10, name: '一楼鸡蛋灌饼', location: '一食堂一楼B区', image: '/images/food/8.jpg', canteenId: 1, floor: 1 },
    { id: 11, name: '二楼盖浇饭', location: '二食堂二楼A区', image: '/images/food/12.jpg', canteenId: 2, floor: 2 },
    { id: 12, name: '一楼手抓饼', location: '三食堂一楼B区', image: '/images/food/4.jpg', canteenId: 3, floor: 1 },
    { id: 13, name: '二楼水煮肉片', location: '一食堂二楼D区', image: '/images/food/10.jpg', canteenId: 1, floor: 2 },
    { id: 14, name: '一楼炒饭', location: '二食堂一楼C区', image: '/images/food/6.jpg', canteenId: 2, floor: 1 }
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
