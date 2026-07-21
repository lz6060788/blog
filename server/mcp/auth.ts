import { timingSafeEqual } from 'crypto'
import { sql } from 'drizzle-orm'

import { db } from '@/server/db'
import { users } from '@/server/db/schema'

export class McpAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'McpAuthError'
  }
}

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return null
  return authorization.slice('Bearer '.length).trim()
}

function tokensMatch(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}

export async function authenticateMcpRequest(request: Request): Promise<{ userId: string }> {
  const expectedToken = process.env.BLOG_MCP_API_TOKEN
  if (!expectedToken || expectedToken.length < 32) {
    throw new McpAuthError('BLOG_MCP_API_TOKEN 未配置或长度不足 32 个字符', 503)
  }

  const actualToken = bearerToken(request)
  if (!actualToken || !tokensMatch(actualToken, expectedToken)) {
    throw new McpAuthError('无效的 MCP Bearer Token', 401)
  }

  return resolveMcpAdminUser()
}

export async function resolveMcpAdminUser(): Promise<{ userId: string }> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (!adminEmail) {
    throw new McpAuthError('ADMIN_EMAIL 未配置', 503)
  }

  const adminRows = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${adminEmail}`)
    .limit(1)

  if (!adminRows[0]) {
    throw new McpAuthError('找不到与 ADMIN_EMAIL 对应的博客用户，请先登录博客一次', 403)
  }

  return { userId: adminRows[0].id }
}
