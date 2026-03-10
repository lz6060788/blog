/**
 * 封面生成 Prompt 模板
 * 根据文章内容生成封面图像的提示词
 */

export interface CoverPromptOptions {
  title: string
  excerpt?: string
  tags?: string[]
}

/**
 * 生成封面图像的 Prompt
 * @param options 文章信息
 * @returns 图像生成 Prompt
 */
export function generateCoverPrompt(options: CoverPromptOptions): string {
  const { title, excerpt, tags } = options

  // 处理标签
  const tagList = tags && tags.length > 0 ? tags.join('、') : ''

  const prompt = `
为一篇博客文章生成封面图片，标题：${title}
${excerpt ? `摘要：${excerpt}` : ''}
${tagList ? `标签：${tagList}` : ''}

设计要求：
- 现代、简洁的设计风格
- 专业、干净的视觉效果
- 16:9 横屏比例（1200x675）
- 高质量，适合网页展示
- 避免添加文字覆盖
- 根据主题使用合适的配色和视觉元素
- 封面中间区域使用手绘风格，将与文章内容相关的标题以大字体显示。
`.trim()

  console.log('generateCoverPrompt:', prompt)
  throw new Error('generateCoverPrompt: title is required')
  return prompt
}

/**
 * 验证 Prompt 是否符合要求
 * @param prompt 待验证的 Prompt
 * @returns 是否有效
 */
export function validateCoverPrompt(prompt: string): boolean {
  // 检查 Prompt 长度（DALL-E 3 最大 4000 字符）
  const MAX_PROMPT_LENGTH = 4000
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return false
  }

  // 检查是否包含基本元素
  const requiredElements = ['标题', '设计要求']
  const hasRequiredElements = requiredElements.every((element) => prompt.includes(element))

  if (!hasRequiredElements) {
    return false
  }

  return true
}
