// AI 服务 — 封装所有 AI 调用

const { ai } = require('../config/index.js')

/** 创建 AI 模型实例 */
function createModel() {
  return wx.cloud.extend.AI.createModel(ai.model)
}

/** 构建 prompt 消息 */
function buildPrompt(systemContent, userContent) {
  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: userContent }
  ]
}

/** 通用 AI 调用 */
async function callAI(messages) {
  const model = createModel()
  const res = await model.generateText({ model: ai.modelId, messages })
  return res.choices[0].message.content.trim()
}

/** 内容审核 */
async function checkContent(text) {
  const model = createModel()
  const res = await model.generateText({
    model: ai.modelId,
    messages: [
      { role: 'system', content: ai.contentCheck.system },
      { role: 'user', content: text.trim() }
    ]
  })
  const result = res.choices[0].message.content.trim()
  if (result.startsWith('BLOCK:')) {
    return { blocked: true, reason: result.slice(6) }
  }
  return { blocked: false }
}

/** 评价润色 */
async function polishText(text) {
  const model = createModel()
  const res = await model.generateText({
    model: ai.modelId,
    messages: [
      { role: 'system', content: ai.polish.system },
      { role: 'user', content: text.trim() }
    ]
  })
  return res.choices[0].message.content.trim()
}

/** 提取标签 */
async function extractTags(text) {
  const model = createModel()
  const res = await model.generateText({
    model: ai.modelId,
    messages: [
      { role: 'system', content: ai.extractTags.system },
      { role: 'user', content: text.trim() }
    ]
  })
  return res.choices[0].message.content.split(/[,，、]/).map(t => t.trim()).filter(Boolean)
}

/** 识别菜品 */
async function identifyFood(imageUrl) {
  const model = createModel()
  const res = await model.generateText({
    model: ai.modelId,
    messages: [
      { role: 'system', content: ai.identifyFood.system },
      {
        role: 'user',
        content: [
          { type: 'text', text: ai.identifyFood.user },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ]
  })
  return res.choices[0].message.content.trim()
}

/** AI 写评价 */
async function generateWrite(style) {
  const styleConfig = ai.writeStyles[style]
  if (!styleConfig) throw new Error('未知风格')
  const model = createModel()
  const res = await model.generateText({
    model: ai.modelId,
    messages: [
      { role: 'system', content: ai.writeSystem },
      { role: 'user', content: styleConfig.prompt }
    ]
  })
  return res.choices[0].message.content.trim()
}

module.exports = {
  config: ai,
  createModel, buildPrompt, callAI,
  checkContent, polishText, extractTags, identifyFood, generateWrite
}
