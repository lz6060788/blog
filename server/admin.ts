/**
 * 管理员权限检查
 */

/**
 * 管理员邮箱列表
 * 在实际生产环境中，这应该从数据库或其他配置中读取
 */
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
  : ['admin@example.com']

/**
 * 检查用户是否是管理员
 * @param email 用户邮箱
 * @returns 是否是管理员
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * 获取管理员邮箱列表
 * @returns 管理员邮箱列表
 */
export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS]
}
