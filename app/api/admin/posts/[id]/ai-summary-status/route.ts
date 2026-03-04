import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { summaryService } from '@/server/ai/services/summary'

// 强制动态渲染（API 路由使用 auth() 需要 headers）
export const dynamic = 'force-dynamic'

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

    // 使用 summaryService 的 getSummaryStatus 方法
    // 该方法通过查询 ai_call_logs 表判断状态
    const statusInfo = await summaryService.getSummaryStatus(id)

    return NextResponse.json(statusInfo)
  } catch (error: any) {
    console.error('获取摘要状态失败:', error)
    return NextResponse.json(
      { error: error.message || '获取摘要状态失败' },
      { status: 500 }
    )
  }
}
