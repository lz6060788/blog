import { AIProvider, SUGGESTED_MODELS, PROVIDER_INFO } from './types'

/**
 * 根据提供商获取推荐的模型列表
 * @param provider AI 提供商
 * @returns 推荐的模型列表
 */
export function getRecommendedModels(provider: AIProvider): string[] {
  return SUGGESTED_MODELS[provider]
}

/**
 * 获取所有支持的提供商
 * @returns 提供商列表
 */
export function getSupportedProviders(): Array<{
  value: AIProvider
  label: string
  models: string[]
  defaultBaseUrl?: string
}> {
  return Object.values(AIProvider).map((provider) => ({
    value: provider,
    label: PROVIDER_INFO[provider].label,
    models: SUGGESTED_MODELS[provider],
    defaultBaseUrl: PROVIDER_INFO[provider].defaultBaseUrl,
  }))
}

/**
 * 验证提供商是否支持
 * @param provider 提供商字符串
 * @returns 是否有效
 */
export function isValidProvider(provider: string): provider is AIProvider {
  return Object.values(AIProvider).includes(provider as AIProvider)
}

