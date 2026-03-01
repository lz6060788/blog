import { NextRequest } from 'next/server'
import { testModelConfig } from '@/server/db/queries/ai-model-configs'
import { validateAuth, successResponse, errorResponse, withErrorHandler } from '@/server/ai/api-utils'

// POST /api/admin/ai/model-configs/[id]/test - 测试配置
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[POST /api/admin/ai/model-configs/[id]/test] Starting request')

  // 验证身份认证
  const authResult = await validateAuth(request)
  if (authResult.error) return authResult.error

  const { id } = params
  console.log('[POST /api/admin/ai/model-configs/[id]/test] Testing config ID:', id)

  // 执行测试
  const result = await withErrorHandler(async () => {
    return await testModelConfig(id)
  }, 'testModelConfig')

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
