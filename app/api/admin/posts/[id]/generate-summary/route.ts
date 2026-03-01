import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { posts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { SummaryStatus } from '@/server/ai/types'
import { summaryService } from '@/server/ai/services/summary'

// POST /api/admin/posts/[id]/generate-summary - 生成 AI 摘要
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    const { id } = params

    // 查询文章
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    })

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    // 检查当前状态，防止重复生成
    if (post.aiSummaryStatus === SummaryStatus.GENERATING) {
      return NextResponse.json(
        { error: '摘要生成中，请稍后...' },
        { status: 400 }
      )
    }

    // 检查配置是否存在
    const { getModelConfigByFunction } = await import('@/server/ai/services/base')
    const { AIFunction } = await import('@/server/ai/types')

    try {
      await getModelConfigByFunction(AIFunction.SUMMARY)
    } catch (error: any) {
      return NextResponse.json(
        {
          error: '未配置 AI 模型',
          message: error.message,
          needsConfiguration: true,
        },
        { status: 400 }
      )
    }

    // 异步生成摘要（不阻塞响应）
    summaryService
      .generateAndUpdate(id, post.title, post.content)
      .catch((error) => {
        console.error(`异步生成摘要失败 (post ${id}):`, error)
      })

    return NextResponse.json({
      success: true,
      message: '已开始生成摘要',
      status: SummaryStatus.GENERATING,
    })
  } catch (error: any) {
    console.error('生成摘要失败:', error)
    return NextResponse.json(
      { error: error.message || '生成摘要失败' },
      { status: 500 }
    )
  }
}
