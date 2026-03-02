import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { getDefaultModelMappings } from '@/server/db/queries/ai-function-mappings'

// 强制动态渲染（API 路由使用 auth() 需要 headers）
export const dynamic = 'force-dynamic'

// GET /api/admin/ai/default-models - 获取各功能的默认模型
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    const mappings = await getDefaultModelMappings()

    return NextResponse.json(mappings)
  } catch (error: any) {
    console.error('获取默认模型映射失败:', error)
    return NextResponse.json(
      { error: error.message || '获取默认模型映射失败' },
      { status: 500 }
    )
  }
}
