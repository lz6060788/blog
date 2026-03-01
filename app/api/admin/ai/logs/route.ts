import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { AICallStatus } from '@/server/ai/types'

// GET /api/admin/ai/logs - 获取 AI 调用日志
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const modelConfigId = searchParams.get('modelConfigId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // 导入日志查询函数
    const { getCallLogs } = await import('@/server/db/queries/ai-logs')

    const result = await getCallLogs({
      page,
      limit,
      modelConfigId: modelConfigId || undefined,
      status: (status || undefined) as AICallStatus | undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('获取 AI 日志失败:', error)
    return NextResponse.json(
      { error: error.message || '获取日志失败' },
      { status: 500 }
    )
  }
}
