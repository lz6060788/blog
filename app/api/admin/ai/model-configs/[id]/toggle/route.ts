import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { getModelConfigById, toggleModelConfig } from '@/server/db/queries/ai-model-configs'

// PATCH /api/admin/ai/model-configs/[id]/toggle - 启用/禁用配置
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    const { id } = params

    // 检查配置是否存在
    const existing = await getModelConfigById(id)
    if (!existing) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 })
    }

    // 切换启用状态
    const config = await toggleModelConfig(id)

    // 返回脱敏后的配置
    return NextResponse.json({
      ...config,
      apiKeyEncrypted: config.apiKeyEncrypted ? `${config.apiKeyEncrypted.slice(0, 8)}****` : '',
    })
  } catch (error: any) {
    console.error('切换 AI 模型配置状态失败:', error)
    return NextResponse.json(
      { error: error.message || '切换状态失败' },
      { status: 500 }
    )
  }
}
