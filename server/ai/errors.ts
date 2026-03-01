/**
 * AI 错误处理工具
 * 解析 AI Provider 返回的错误并返回友好的错误消息
 */

/**
 * AI 错误类型
 */
export enum AIErrorType {
  INVALID_API_KEY = 'INVALID_API_KEY',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 解析 AI 错误消息
 * @param error 错误对象
 * @returns 解析后的错误类型和消息
 */
export function parseAIError(error: unknown): {
  type: AIErrorType
  message: string
  original?: string
} {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  console.error('[AI Error]', {
    message: errorMessage,
    stack: errorStack,
    cause: error instanceof Error ? error.cause : undefined,
  })

  // 401 Unauthorized - 无效的 API Key
  if (
    errorMessage.includes('401') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('INVALID_API_KEY') ||
    errorMessage.includes('incorrect API key') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('认证')
  ) {
    return {
      type: AIErrorType.INVALID_API_KEY,
      message: 'API Key 无效或已过期',
      original: errorMessage,
    }
  }

  // 404 Not Found - 模型不存在
  if (
    errorMessage.includes('404') ||
    errorMessage.includes('not found') ||
    errorMessage.includes('model_not_found') ||
    errorMessage.includes('does not exist') ||
    errorMessage.includes('模型不存在')
  ) {
    return {
      type: AIErrorType.MODEL_NOT_FOUND,
      message: '模型不存在或未启用',
      original: errorMessage,
    }
  }

  // 429 Rate Limited - 请求过于频繁
  if (
    errorMessage.includes('429') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('Rate limit') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('quota') ||
    errorMessage.includes('请求过于频繁')
  ) {
    return {
      type: AIErrorType.RATE_LIMITED,
      message: '请求过于频繁，请稍后再试',
      original: errorMessage,
    }
  }

  // 5xx Server Error - 服务器错误
  if (
    errorMessage.includes('500') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503') ||
    errorMessage.includes('504') ||
    errorMessage.includes('server error') ||
    errorMessage.includes('内部错误')
  ) {
    return {
      type: AIErrorType.SERVER_ERROR,
      message: 'AI 服务暂时不可用，请稍后再试',
      original: errorMessage,
    }
  }

  // Network Error - 网络错误
  if (
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ENOTFOUND') ||
    errorMessage.includes('ETIMEDOUT') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('network') ||
    errorMessage.includes('连接失败')
  ) {
    return {
      type: AIErrorType.NETWORK_ERROR,
      message: '网络连接失败，请检查网络设置',
      original: errorMessage,
    }
  }

  // 默认返回原始错误消息（截取前 100 字符）
  return {
    type: AIErrorType.UNKNOWN,
    message: errorMessage.slice(0, 100),
    original: errorMessage,
  }
}

/**
 * 格式化错误响应（用于 API 返回）
 * @param error 错误对象
 * @returns 格式化的错误响应对象
 */
export function formatErrorResponse(error: unknown) {
  const { type, message } = parseAIError(error)

  return {
    success: false,
    error: message,
    errorType: type,
  }
}
