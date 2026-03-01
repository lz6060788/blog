/**
 * AI 服务模块
 * 提供统一的 AI 功能接口
 */

// 导出类型
export * from './types'
export { PROVIDER_INFO, SUGGESTED_MODELS, modelIdToLocaleKey } from './types'

// 导出加密工具
export { encrypt, decrypt, maskApiKey, validateApiKeyFormat } from './crypto'

// 导出安全工具
export { isPrivateUrl, validateUrlSafety } from './security'

// 导出错误处理工具
export { parseAIError, formatErrorResponse, AIErrorType } from './errors'

// 导出 API 工具
export { validateAuth, successResponse, errorResponse, withErrorHandler } from './api-utils'

// 导出客户端工具
export { getRecommendedModels, getSupportedProviders, isValidProvider } from './client'

// 导出服务
export { AIService, getModelConfigByFunction, decryptApiKey } from './services/base'
export { SummaryService, summaryService } from './services/summary'

// 导出 Provider 工厂
export { getAIModel, createProviderOptionsFromDB, createProviderOptionsFromTest } from './providers'

// 导出 Prompt 模板
export { getSummaryPrompt, SUMMARY_SYSTEM_PROMPT } from './prompts/summary'
