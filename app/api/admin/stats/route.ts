import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { getDashboardStats } from '@/server/db/queries/stats'

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = 'nodejs'

/**
 * GET /api/admin/stats
 * 获取管理端首页统计数据
 */
export async function GET() {
  try {
    // 验证用户登录状态
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '未认证' },
        { status: 401 }
      )
    }

    // 获取统计数据
    const stats = await getDashboardStats()

    // 返回 JSON 格式的统计数据
    return NextResponse.json(stats)
  } catch (error) {
    // 捕获数据库异常返回 500
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
