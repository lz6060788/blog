import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { posts } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

// 强制动态渲染（API 路由使用 auth() 需要 headers）
export const dynamic = 'force-dynamic'

// GET /api/admin/posts/[id]/ai-cover-status - 获取封面生成状态
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

    // 查询文章的封面状态
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      columns: {
        coverImageUrl: true,
        aiCoverStatus: true,
        aiCoverGeneratedAt: true,
        aiCoverPrompt: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    return NextResponse.json({
      status: post.aiCoverStatus || 'pending',
      coverImageUrl: post.coverImageUrl,
      generatedAt: post.aiCoverGeneratedAt,
      prompt: post.aiCoverPrompt,
    })
  } catch (error: any) {
    console.error('获取封面状态失败:', error)
    return NextResponse.json(
      { error: error.message || '获取封面状态失败' },
      { status: 500 }
    )
  }
}
