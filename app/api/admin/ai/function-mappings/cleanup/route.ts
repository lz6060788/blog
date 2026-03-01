import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { aiFunctionMappings, aiModelConfigs } from '@/server/db/schema'
import { eq, sql } from 'drizzle-orm'

// POST /api/admin/ai/function-mappings/cleanup - 清理无效的功能映射
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    console.log('[POST /api/admin/ai/function-mappings/cleanup] Cleaning up invalid mappings')

    // 获取所有功能映射
    const allMappings = await db.query.aiFunctionMappings.findMany()

    const invalidMappings: Array<{ id: string; functionName: string; modelConfigId: string }> = []

    // 检查每个映射的模型配置是否存在
    for (const mapping of allMappings) {
      if (mapping.modelConfigId) {
        const modelConfig = await db.query.aiModelConfigs.findFirst({
          where: eq(aiModelConfigs.id, mapping.modelConfigId),
        })

        if (!modelConfig) {
          invalidMappings.push({
            id: mapping.id,
            functionName: mapping.functionName,
            modelConfigId: mapping.modelConfigId,
          })
        }
      }
    }

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
      cleanedMappings: invalidMappings.map((m) => m.functionName),
    })
  } catch (error: any) {
    console.error('清理 AI 功能映射失败:', error)
    return NextResponse.json(
      { error: error.message || '清理功能映射失败' },
      { status: 500 }
    )
  }
}
