// TabBar 更新辅助工具

/**
 * 更新自定义 tabBar 选中状态
 * 在每个 tab 页面的 onShow 中调用
 */
function updateTabBar(page) {
  if (typeof page.getTabBar === 'function' && page.getTabBar()) {
    page.getTabBar().updateSelected()
  }
}

module.exports = { updateTabBar }
