/**
 * AI 安全工具
 * 提供 SSRF 防护等安全功能
 */

/**
 * 检查 URL 是否为私有/内网地址
 * 用于防止 SSRF 攻击
 * @param url URL 字符串
 * @returns 是否为私有地址
 */
export function isPrivateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    // 检查 localhost 变体
    if (hostname === 'localhost' || hostname === 'localhost.localdomain') {
      return true
    }

    // 检查 127.0.0.0/8 环回地址
    if (hostname.startsWith('127.')) {
      return true
    }

    // 检查 IPv6 环回地址
    if (hostname === '::1' || hostname === '[::1]') {
      return true
    }

    // 检查 0.0.0.0
    if (hostname === '0.0.0.0' || hostname === '[::]') {
      return true
    }

    // 检查内网 IPv4 地址
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
    if (ipv4Match) {
      const [, a, b, c, d] = ipv4Match.map(Number)
      // 10.0.0.0/8
      if (a === 10) return true
      // 172.16.0.0/12
      if (a === 172 && b >= 16 && b <= 31) return true
      // 192.168.0.0/16
      if (a === 192 && b === 168) return true
      // 169.254.0.0/16 (链路本地)
      if (a === 169 && b === 254) return true
    }

    // 检查内网 IPv6 地址
    // fc00::/7 (唯一本地地址)
    if (hostname.startsWith('fc') || hostname.startsWith('fd')) {
      return true
    }
    // fe80::/10 (链路本地地址)
    if (hostname.startsWith('fe')) {
      return true
    }

    // 检查常见的内网主机名
    const privateHostnames = [
      'local',
      'internal',
      'intranet',
      'corp',
      'private',
    ]
    if (privateHostnames.some(h => hostname === h || hostname.endsWith(`.${h}`))) {
      return true
    }

    return false
  } catch {
    // 如果 URL 解析失败，视为不安全
    return true
  }
}

/**
 * 验证 URL 是否安全可访问
 * @param url URL 字符串
 * @throws Error 如果 URL 为私有地址
 */
export function validateUrlSafety(url: string): void {
  if (isPrivateUrl(url)) {
    throw new Error(
      `Access to private/internal addresses is not allowed for security reasons. URL: ${url}`
    )
  }
}
