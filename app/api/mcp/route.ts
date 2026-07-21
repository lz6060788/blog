import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { NextResponse } from 'next/server'

import { authenticateMcpRequest, McpAuthError } from '@/server/mcp/auth'
import { createBlogMcpServer } from '@/server/mcp/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('origin')
  const allowedOrigins = (process.env.MCP_ALLOWED_ORIGINS || 'https://chatgpt.com,https://chat.openai.com')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return {
    ...(origin && allowedOrigins.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID',
    'Access-Control-Expose-Headers': 'MCP-Protocol-Version, MCP-Session-Id',
    Vary: 'Origin',
  }
}

function withCors(response: Response, request: Request): Response {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    if (value !== undefined) headers.set(key, String(value))
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
}

async function handleMcpRequest(request: Request): Promise<Response> {
  try {
    const { userId } = await authenticateMcpRequest(request)
    const server = createBlogMcpServer(userId)
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })

    await server.connect(transport)
    const response = await transport.handleRequest(request)
    return withCors(response, request)
  } catch (error) {
    const status = error instanceof McpAuthError ? error.status : 500
    if (!(error instanceof McpAuthError)) {
      console.error('MCP 请求处理失败:', error)
    }
    const message = error instanceof McpAuthError ? error.message : 'MCP 服务执行失败'
    const response = NextResponse.json(
      {
        jsonrpc: '2.0',
        error: { code: status === 401 ? -32001 : -32603, message },
        id: null,
      },
      {
        status,
        headers: status === 401 ? { 'WWW-Authenticate': 'Bearer realm="personal-blog-mcp"' } : undefined,
      }
    )
    return withCors(response, request)
  }
}

export const GET = handleMcpRequest
export const POST = handleMcpRequest
export const DELETE = handleMcpRequest
