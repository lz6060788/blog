import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { posts } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { getCoverService } from '@/server/ai/services/cover'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// DELETE /api/admin/posts/[id]/cover - 删除文章封面
export async function DELETE(
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

    const coverService = getCoverService()
    await coverService.removeCover(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('删除封面失败:', error)
    return NextResponse.json(
      { error: error.message || '删除封面失败' },
      { status: 500 }
    )
  }
}
