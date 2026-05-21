const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { fileID } = event

  if (!fileID) {
    return { success: false, message: '缺少图片参数' }
  }

  try {
    // 下载云存储文件获取真实图片内容
    const fileRes = await cloud.downloadFile({ fileID })
    const imageBuffer = fileRes.fileContent

    // 调用微信内容安全API检查图片
    const result = await cloud.openapi.security.msgSecCheck({
      media: {
        header: { 'Content-Type': 'application/octet-stream' },
        value: imageBuffer
      },
      media_type: 2,
      version: 2
    })

    if (result.result && result.result.suggest === 'pass') {
      return { success: true, safe: true }
    } else {
      return {
        success: true,
        safe: false,
        suggest: result.result?.suggest || 'review',
        label: result.result?.label || 'unknown'
      }
    }
  } catch (err) {
    console.error('图片审核失败:', err)
    // 审核失败时默认拒绝，安全优先
    return { success: false, safe: false, message: '图片审核服务异常，请稍后重试', error: err.message }
  }
}
