/**
 * Slug 生成工具
 * 用于将字符串转换为 URL 友好的 slug 格式
 */

/**
 * 生成 slug
 * @param name - 原始字符串
 * @returns slug 格式的字符串
 * @example
 * generateSlug("Hello World") // "hello-world"
 * generateSlug("你好世界") // "你好世界"
 * generateSlug("Test@#$%String") // "test-string"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
