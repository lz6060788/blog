import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { posts } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { CoverStatus } from '@/server/ai/types'
import { getCoverService } from '@/server/ai/services/cover'

// 强制动态渲染（API 路由使用 auth() 需要 headers）
export const dynamic = 'force-dynamic'

// POST /api/admin/posts/[id]/generate-cover - 生成 AI 封面
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
      with: {
        tagObjs: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    // 检查当前状态，防止重复生成
    if (post.aiCoverStatus === CoverStatus.GENERATING) {
      return NextResponse.json(
        { error: '封面生成中，请稍后...' },
        { status: 400 }
      )
    }

    // 检查配置是否存在
    const { getModelConfigByFunction } = await import('@/server/ai/services/base')
    const { AIFunction } = await import('@/server/ai/types')

    try {
      await getModelConfigByFunction(AIFunction.COVER)
    } catch (error: any) {
      return NextResponse.json(
        {
          error: '未配置 AI 图像生成模型',
          message: error.message,
          needsConfiguration: true,
        },
        { status: 400 }
      )
    }

    const coverService = getCoverService()

    // 设置状态为 generating
    await coverService.setCoverGenerating(id)

    // 异步生成封面（不阻塞响应）
    coverService
      .generateCover({
        postId: id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || undefined,
        tags: post.tagObjs?.map((t) => t.name),
      })
      .catch((error) => {
        console.error(`异步生成封面失败 (post ${id}):`, error)
        // 设置失败状态
        coverService.setCoverFailed(id, error.message)
      })

    return NextResponse.json({
      success: true,
      message: '已开始生成封面',
      status: CoverStatus.GENERATING,
    })
  } catch (error: any) {
    console.error('生成封面失败:', error)
    return NextResponse.json(
      { error: error.message || '生成封面失败' },
      { status: 500 }
    )
  }
}
