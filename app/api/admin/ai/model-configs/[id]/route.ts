import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import {
  getModelConfigById,
  updateModelConfig,
  deleteModelConfig,
  isConfigNameUnique
} from '@/server/db/queries/ai-model-configs'
import { getAllFunctionMappings } from '@/server/db/queries/ai-function-mappings'

// PUT /api/admin/ai/model-configs/[id] - 更新配置
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { name, provider, model, apiKey, baseUrl, maxTokens, temperature, enabled } = body

    // 检查配置是否存在
    const existing = await getModelConfigById(id)
    if (!existing) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 })
    }

    // 验证名称唯一性（如果更改了名称）
    if (name && name !== existing.name) {
      const isUnique = await isConfigNameUnique(name, id)
      if (!isUnique) {
        return NextResponse.json({ error: '配置名称已存在' }, { status: 400 })
      }
    }

    // 更新配置
    const config = await updateModelConfig(id, {
      name,
      provider,
      model,
      apiKey,
      baseUrl,
      maxTokens,
      temperature,
      enabled,
    })

    // 返回脱敏后的配置
    return NextResponse.json({
      ...config,
      apiKeyEncrypted: config.apiKeyEncrypted ? `${config.apiKeyEncrypted.slice(0, 8)}****` : '',
    })
  } catch (error: any) {
    console.error('更新 AI 模型配置失败:', error)
    return NextResponse.json(
      { error: error.message || '更新配置失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/ai/model-configs/[id] - 删除配置
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

    // 检查配置是否存在
    const existing = await getModelConfigById(id)
    if (!existing) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 })
    }

    // 检查是否被功能映射使用
    const mappings = await getAllFunctionMappings()
    const isInUse = mappings.some(
      m => m.modelConfigId === id
    )

    if (isInUse) {
      return NextResponse.json(
        { error: '该配置正在被 AI 功能使用，请先更换或删除功能映射' },
        { status: 400 }
      )
    }

    // 删除配置
    await deleteModelConfig(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('删除 AI 模型配置失败:', error)
    return NextResponse.json(
      { error: error.message || '删除配置失败' },
      { status: 500 }
    )
  }
}
