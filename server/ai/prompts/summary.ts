/**
 * 摘要生成 Prompt 模板
 */

/**
 * 获取摘要生成的 Prompt
 * @param title 文章标题
 * @param content 文章内容
 * @param language 语言（可选，默认中文）
 * @returns Prompt 文本
 */
export function getSummaryPrompt(
  title: string,
  content: string,
  language: string = 'zh'
): string {
  const languageInstruction =
    language === 'zh'
      ? '请用中文回答'
      : language === 'en'
        ? 'Please answer in English'
        : `Please answer in ${language}`

  return `你是一个专业的内容编辑助手。请为以下文章生成一个简洁的摘要。

${languageInstruction}。

文章标题：${title}

文章内容：
${content}

要求：
1. 摘要长度控制在 200 字以内
2. 捕捉文章的核心观点和关键信息
3. 使用简洁、清晰的语言
4. 不要添加原文中没有的信息
5. 不要使用列表或分点，使用段落形式

请直接输出摘要内容，不要包含任何前缀或解释。`
}

/**
 * 系统提示词
 */
export const SUMMARY_SYSTEM_PROMPT = `你是一个专业的内容编辑助手，擅长为文章撰写简洁准确的摘要。
你的摘要应该：
- 简洁明了，通常在 200 字以内
- 准确反映文章的核心内容
- 使用自然流畅的语言
- 不添加原文中没有的信息
- 不使用列表或分点，使用段落形式`
