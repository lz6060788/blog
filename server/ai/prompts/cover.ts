/**
 * 封面生成 Prompt 模板
 * 根据文章内容生成封面图像的提示词
 */

export interface CoverPromptOptions {
  title: string
  excerpt?: string
  tags?: string[]
  language?: string
}

/**
 * 生成封面图像的 Prompt
 * @param options 文章信息
 * @returns 图像生成 Prompt
 */
export function generateCoverPrompt(options: CoverPromptOptions): string {
  const { title, excerpt, tags, language = 'zh-CN' } = options

  // 基础 Prompt
  let prompt = `Generate a blog post cover image with the following details:\n`
  prompt += `- Title: ${title}\n`

  // 添加摘要（如果有）
  if (excerpt) {
    // 截取摘要的前 200 字符
    const summary = excerpt.length > 200 ? excerpt.substring(0, 200) + '...' : excerpt
    prompt += `- Summary: ${summary}\n`
  }

  // 添加标签（如果有）
  if (tags && tags.length > 0) {
    prompt += `- Tags: ${tags.join(', ')}\n`
  }

  // 设计要求
  prompt += `\nDesign Requirements:\n`
  prompt += `- Modern, minimalist design\n`
  prompt += `- Professional and clean style\n`
  prompt += `- 16:9 aspect ratio (1200x675)\n`
  prompt += `- High quality, suitable for web display\n`
  prompt += `- Avoid text overlays\n`
  prompt += `- Use appropriate colors and visual elements based on the topic\n`

  // 根据标签添加风格建议
  if (tags && tags.length > 0) {
    const styleHints = getStyleHintsFromTags(tags)
    if (styleHints.length > 0) {
      prompt += `\nStyle Suggestions:\n`
      prompt += `- ${styleHints.join('\n- ')}\n`
    }
  }

  // 语言适配（如果是英文文章，Prompt 也用英文）
  if (language.startsWith('en')) {
    prompt = convertPromptToEnglish(prompt, title, excerpt, tags)
  }

  return prompt
}

/**
 * 从标签获取风格提示
 * @param tags 文章标签
 * @returns 风格提示列表
 */
function getStyleHintsFromTags(tags: string[]): string[] {
  const hints: string[] = []
  const lowerTags = tags.map((t) => t.toLowerCase())

  // 技术类
  if (lowerTags.some((t) => ['tech', 'technology', 'code', 'programming', '开发', '技术', '编程'].includes(t))) {
    hints.push('Use geometric shapes and abstract tech elements')
    hints.push('Consider blue, purple, or cyan color schemes')
  }

  // 设计类
  if (lowerTags.some((t) => ['design', 'designer', 'ui', 'ux', '设计'].includes(t))) {
    hints.push('Use clean, modern design with bold colors')
    hints.push('Incorporate design elements like grids or patterns')
  }

  // 商业/创业
  if (lowerTags.some((t) => ['business', 'startup', 'entrepreneur', '商业', '创业'].includes(t))) {
    hints.push('Use professional, trustworthy colors (blue, green)')
    hints.push('Incorporate growth or success symbolism')
  }

  // 生活/个人
  if (lowerTags.some((t) => ['life', 'personal', 'lifestyle', '生活'].includes(t))) {
    hints.push('Use warm, inviting colors')
    hints.push('Include organic, natural elements')
  }

  // 教育/教程
  if (lowerTags.some((t) => ['education', 'tutorial', 'guide', '学习', '教程', '指南'].includes(t))) {
    hints.push('Use clear, organized visual elements')
    hints.push('Consider instructional or educational symbolism')
  }

  return hints
}

/**
 * 将 Prompt 转换为英文（用于英文文章）
 * @param chinesePrompt 中文 Prompt
 * @param title 文章标题
 * @param excerpt 文章摘要
 * @param tags 文章标签
 * @returns 英文 Prompt
 */
function convertPromptToEnglish(
  chinesePrompt: string,
  title: string,
  excerpt?: string,
  tags?: string[]
): string {
  let prompt = `Generate a blog post cover image with the following details:\n`
  prompt += `- Title: ${title}\n`

  if (excerpt) {
    const summary = excerpt.length > 200 ? excerpt.substring(0, 200) + '...' : excerpt
    prompt += `- Summary: ${summary}\n`
  }

  if (tags && tags.length > 0) {
    prompt += `- Tags: ${tags.join(', ')}\n`
  }

  prompt += `\nDesign Requirements:\n`
  prompt += `- Modern, minimalist design\n`
  prompt += `- Professional and clean style\n`
  prompt += `- 16:9 aspect ratio (1200x675)\n`
  prompt += `- High quality, suitable for web display\n`
  prompt += `- Avoid text overlays\n`
  prompt += `- Use appropriate colors and visual elements based on the topic\n`

  // 根据标签添加风格建议
  if (tags && tags.length > 0) {
    const styleHints = getStyleHintsFromTags(tags)
    if (styleHints.length > 0) {
      prompt += `\nStyle Suggestions:\n`
      prompt += `- ${styleHints.join('\n- ')}\n`
    }
  }

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
  const requiredElements = ['Title:', 'Design Requirements:']
  const hasRequiredElements = requiredElements.every((element) => prompt.includes(element))

  if (!hasRequiredElements) {
    return false
  }

  return true
}
