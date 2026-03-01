import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import {
  getAllModelConfigs,
  createModelConfig,
  isConfigNameUnique
} from '@/server/db/queries/ai-model-configs'

// GET /api/admin/ai/model-configs - 获取所有模型配置
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    const configs = await getAllModelConfigs({ includeDisabled: true })

    // 脱敏 API Key
    const maskedConfigs = configs.map(config => ({
      ...config,
      apiKeyEncrypted: config.apiKeyEncrypted ? `${config.apiKeyEncrypted.slice(0, 8)}****` : '',
    }))

    return NextResponse.json(maskedConfigs)
  } catch (error: any) {
    console.error('获取 AI 模型配置失败:', error)
    return NextResponse.json(
      { error: error.message || '获取配置失败' },
      { status: 500 }
    )
  }
}

// POST /api/admin/ai/model-configs - 创建新配置
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    const body = await request.json()
    const { name, provider, model, apiKey, baseUrl, maxTokens, temperature, enabled } = body

    // 验证必需字段
    if (!name || !provider || !model || !apiKey) {
      return NextResponse.json(
        { error: '缺少必需字段' },
        { status: 400 }
      )
    }

    // 验证名称唯一性
    const isUnique = await isConfigNameUnique(name)
    if (!isUnique) {
      return NextResponse.json(
        { error: '配置名称已存在' },
        { status: 400 }
      )
    }

    // 创建配置
    const config = await createModelConfig({
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
    return NextResponse.json(
      {
        ...config,
        apiKeyEncrypted: `${config.apiKeyEncrypted.slice(0, 8)}****`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('创建 AI 模型配置失败:', error)
    return NextResponse.json(
      { error: error.message || '创建配置失败' },
      { status: 500 }
    )
  }
}
