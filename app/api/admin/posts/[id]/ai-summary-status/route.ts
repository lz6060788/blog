import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { posts } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/admin/posts/[id]/ai-summary-status - 获取摘要生成状态
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    const { id } = params

    // 查询文章的摘要状态
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      columns: {
        aiSummary: true,
        aiSummaryStatus: true,
        aiSummaryGeneratedAt: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    return NextResponse.json({
      status: post.aiSummaryStatus,
      summary: post.aiSummary,
      generatedAt: post.aiSummaryGeneratedAt,
    })
  } catch (error: any) {
    console.error('获取摘要状态失败:', error)
    return NextResponse.json(
      { error: error.message || '获取摘要状态失败' },
      { status: 500 }
    )
  }
}
