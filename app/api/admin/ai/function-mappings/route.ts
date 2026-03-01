import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { getAllFunctionMappings, getFunctionMapping } from '@/server/db/queries/ai-function-mappings'

// GET /api/admin/ai/function-mappings - 获取所有功能映射
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    const mappings = await getAllFunctionMappings()

    return NextResponse.json(mappings)
  } catch (error: any) {
    console.error('获取 AI 功能映射失败:', error)
    return NextResponse.json(
      { error: error.message || '获取功能映射失败' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/ai/function-mappings - 更新功能映射
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    const body = await request.json()
    const { functionName, modelConfigId } = body

    // 验证必需字段
    if (!functionName) {
      return NextResponse.json(
        { error: '缺少功能名称' },
        { status: 400 }
      )
    }

    // 更新功能映射
    const { updateFunctionMapping } = await import('@/server/db/queries/ai-function-mappings')
    const mapping = await updateFunctionMapping(functionName, modelConfigId || null)

    // 获取完整的映射信息（包括模型配置）
    const fullMapping = await getFunctionMapping(functionName)

    return NextResponse.json(fullMapping)
  } catch (error: any) {
    console.error('更新 AI 功能映射失败:', error)
    return NextResponse.json(
      { error: error.message || '更新功能映射失败' },
      { status: 500 }
    )
  }
}

// POST /api/admin/ai/function-mappings/cleanup - 清理无效的功能映射
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    console.log('[POST /api/admin/ai/function-mappings/cleanup] Cleaning up invalid mappings')

    // 查找所有指向不存在模型配置的映射
    const invalidMappings = await db
      .select({
        id: aiFunctionMappings.id,
        functionName: aiFunctionMappings.functionName,
        modelConfigId: aiFunctionMappings.modelConfigId,
      })
      .from(aiFunctionMappings)
      .where(sql`${aiFunctionMappings.modelConfigId} IS NOT NULL`)
      .leftJoin(aiModelConfigs, eq(aiFunctionMappings.modelConfigId, aiModelConfigs.id))
      .where(sql`${aiModelConfigs.id} IS NULL`)

    console.log('[POST /api/admin/ai/function-mappings/cleanup] Found invalid mappings:', invalidMappings.length)

    if (invalidMappings.length > 0) {
      // 清理无效映射（设置为 null）
      for (const mapping of invalidMappings) {
        await db
          .update(aiFunctionMappings)
          .set({
            modelConfigId: null,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(aiFunctionMappings.id, mapping.id))

        console.log('[POST /api/admin/ai/function-mappings/cleanup] Cleaned mapping:', mapping.functionName)
      }
    }

    return NextResponse.json({
      success: true,
      message: `已清理 ${invalidMappings.length} 个无效的功能映射`,
      cleanedCount: invalidMappings.length,
    })
  } catch (error: any) {
    console.error('清理 AI 功能映射失败:', error)
    return NextResponse.json(
      { error: error.message || '清理功能映射失败' },
      { status: 500 }
    )
  }
}
