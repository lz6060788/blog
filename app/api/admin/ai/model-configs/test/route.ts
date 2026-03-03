import { NextRequest } from 'next/server'
import { testModelConfigTemp } from '@/server/db/queries/ai-model-configs'
import { validateAuth, successResponse, errorResponse, withErrorHandler } from '@/server/ai/api-utils'

// 强制动态渲染（API 路由使用 auth() 需要 headers）
export const dynamic = 'force-dynamic'

// POST /api/admin/ai/model-configs/test - 测试临时配置（保存前测试）
export async function POST(request: NextRequest) {
  console.log('[POST /api/admin/ai/model-configs/test] Starting request')

  // 验证身份认证
  const authResult = await validateAuth(request)
  if (authResult.error) return authResult.error

  // 解析请求体
  const body = await request.json()
  const { provider, model, apiKey, baseUrl, capabilityType } = body

  console.log('[POST /api/admin/ai/model-configs/test] Request body:', {
    provider,
    model,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length,
    baseUrl,
    capabilityType,
  })

  // 验证必填字段
  if (!provider || !model || !apiKey) {
    return errorResponse({
      error: '缺少必填字段: provider, model, apiKey',
    })
  }

  // 执行测试
  const result = await withErrorHandler(async () => {
    return await testModelConfigTemp({
      provider,
      model,
      apiKey,
      baseUrl,
      capabilityType,
    })
  }, 'testModelConfigTemp')

  if (result.error) return result.error

  // 返回结果
  const testResult = result.data!
  if (testResult.success) {
    return successResponse(testResult)
  } else {
    return errorResponse({
      error: testResult.error,
      errorType: testResult.errorType,
    })
  }
}
