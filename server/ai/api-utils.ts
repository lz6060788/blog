/**
 * AI API 处理工具
 * 提供 API 路由的共享处理逻辑
 */

import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'

/**
 * 验证请求的身份认证
 * @param request NextRequest 对象
 * @returns session 或返回错误响应
 */
export async function validateAuth(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { success: false, error: '需要登录', errorType: 'UNAUTHORIZED' },
        { status: 401 }
      ),
    }
  }

  return { session }
}

/**
 * 返回成功的测试结果
 */
export function successResponse(result: {
  responseTime: number
  message: string
}) {
  return NextResponse.json({
    success: true,
    responseTime: result.responseTime,
    message: result.message,
  })
}

/**
 * 返回失败的测试结果
 * 注意：返回 200 状态码让前端能读取错误消息
 */
export function errorResponse(error: { error: string; errorType?: string }) {
  return NextResponse.json(
    {
      success: false,
      error: error.error,
      ...(error.errorType && { errorType: error.errorType }),
    },
    { status: 200 } // 返回 200 让客户端可以读取错误消息
  )
}

/**
 * 包装异步处理，统一错误捕获
 */
export async function withErrorHandler<T>(
  handler: () => Promise<T>,
  context: string
): Promise<{ data?: T; error?: NextResponse }> {
  try {
    const data = await handler()
    return { data }
  } catch (error: any) {
    console.error(`[${context}] Unexpected error:`, {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    })
    return {
      error: NextResponse.json(
        {
          success: false,
          error: error.message || '操作失败',
        },
        { status: 500 }
      ),
    }
  }
}
