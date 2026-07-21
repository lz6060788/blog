import { loadEnvConfig } from '@next/env'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

loadEnvConfig(process.cwd())

async function main() {
  const token = process.env.BLOG_MCP_API_TOKEN
  if (!token) throw new Error('BLOG_MCP_API_TOKEN 未配置')

  const transport = new StreamableHTTPClientTransport(new URL('http://localhost:3000/api/mcp'), {
    requestInit: {
      headers: { Authorization: `Bearer ${token}` },
    },
  })
  const client = new Client({ name: 'blog-mcp-http-check', version: '0.1.0' })

  try {
    await client.connect(transport)
    const result = await client.listTools()
    const expected = [
      'get_blog_context',
      'list_posts',
      'get_post',
      'update_post',
      'create_post_draft',
      'update_post_draft',
      'upload_post_cover',
      'get_post_preview',
      'publish_post',
    ]
    const actual = result.tools.map((tool) => tool.name)
    const missing = expected.filter((name) => !actual.includes(name))
    if (missing.length > 0) throw new Error(`缺少 MCP 工具：${missing.join(', ')}`)

    const context = await client.callTool({ name: 'get_blog_context', arguments: {} })
    if (context.isError) throw new Error('get_blog_context 调用失败')

    const list = await client.callTool({
      name: 'list_posts',
      arguments: { status: 'all', page: 1, pageSize: 1 },
    })
    if (list.isError) throw new Error('list_posts 调用失败')

    const firstPost = (list.structuredContent as { posts?: Array<{ id: string }> } | undefined)?.posts?.[0]
    if (firstPost) {
      const detail = await client.callTool({ name: 'get_post', arguments: { postId: firstPost.id } })
      if (detail.isError) throw new Error('get_post 调用失败')
    }

    console.log(`HTTP MCP 鉴权、列表和文章读取均通过，共发现 ${actual.length} 个工具：${actual.join(', ')}`)
  } finally {
    await client.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
