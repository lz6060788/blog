/**
 * AI Provider 工厂模块
 * 提供统一的 AI 模型创建接口，支持多种厂商
 *
 * 参考: D:\workspace\learn\next-ai-draw-io\lib\ai-providers.ts
 */

import { createOpenAI } from '@ai-sdk/openai'
import { LanguageModel } from 'ai'
import { PROVIDER_INFO, AIProvider } from './types'
import { validateUrlSafety } from './security'

/**
 * Provider 初始化选项
 */
export interface ProviderOptions {
  provider: AIProvider
  model: string
  apiKey: string
  baseUrl?: string
  maxTokens?: number
  temperature?: number
}

/**
 * 模型配置返回值
 */
export interface ModelConfig {
  model: LanguageModel
  modelId: string
  provider: AIProvider
}

/**
 * 创建 OpenAI 兼容的模型实例
 * 适用于：DeepSeek、智谱、通义千问、Kimi、百川等
 */
function createOpenAICompatibleModel(
  apiKey: string,
  modelId: string,
  baseUrl?: string
): LanguageModel {
  const openai = createOpenAI({
    apiKey,
    ...(baseUrl && { baseURL: baseUrl }),
  })
  // OpenAI 兼容 API 使用 .chat() 方法
  return openai.chat(modelId)
}

/**
 * 创建 OpenAI 原生模型实例
 * 与 OpenAI 兼容 API 的区别在于直接调用而不使用 .chat()
 */
function createNativeOpenAIModel(
  apiKey: string,
  modelId: string,
  baseUrl?: string
): LanguageModel {
  const openai = createOpenAI({
    apiKey,
    ...(baseUrl && { baseURL: baseUrl }),
  })
  // OpenAI 原生 API 可以直接传入 modelId
  return openai(modelId)
}

/**
 * 获取 AI 模型实例（工厂函数）
 * @param options Provider 配置选项
 * @returns Vercel AI SDK LanguageModel 实例
 */
export function getAIModel(options: ProviderOptions): ModelConfig {
  const { provider, model: modelId, apiKey, baseUrl: customBaseUrl } = options

  // 获取默认 baseUrl（如果 provider 定义了）
  const defaultBaseUrl = PROVIDER_INFO[provider]?.defaultBaseUrl
  const resolvedBaseUrl = customBaseUrl || defaultBaseUrl

  console.log('[getAIModel] Creating model:', {
    provider,
    modelId,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length,
    customBaseUrl,
    defaultBaseUrl,
    resolvedBaseUrl,
  })

  // SSRF 安全检查（仅在有 baseUrl 时）
  if (resolvedBaseUrl) {
    validateUrlSafety(resolvedBaseUrl)
  }

  let model: LanguageModel

  switch (provider) {
    case AIProvider.OPENAI: {
      // OpenAI - 如果有自定义 baseUrl，使用 createOpenAI，否则使用默认
      if (resolvedBaseUrl || customBaseUrl) {
        console.log('[getAIModel] Using custom OpenAI endpoint with .chat()')
        model = createOpenAICompatibleModel(apiKey, modelId, resolvedBaseUrl)
      } else {
        console.log('[getAIModel] Using native OpenAI endpoint')
        model = createNativeOpenAIModel(apiKey, modelId)
      }
      break
    }

    case AIProvider.DEEPSEEK:
    case AIProvider.ZHIPU:
    case AIProvider.QWEN:
    case AIProvider.MOONSHOT:
    case AIProvider.BAICHUAN: {
      // 国内 OpenAI 兼容 API
      console.log(`[getAIModel] Using ${provider} (OpenAI-compatible)`)
      model = createOpenAICompatibleModel(apiKey, modelId, resolvedBaseUrl)
      break
    }

    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }

  console.log('[getAIModel] Model created successfully')

  return {
    model,
    modelId,
    provider,
  }
}

/**
 * 从数据库模型配置创建 Provider Options
 * @param modelConfig 从数据库获取的模型配置
 * @returns Provider Options
 */
export function createProviderOptionsFromDB(modelConfig: {
  provider: string
  model: string
  apiKeyEncrypted: string
  baseUrl?: string | null
  maxTokens?: number | null
  temperature?: number | null
}): Omit<ProviderOptions, 'apiKey'> & { apiKeyEncrypted: string } {
  return {
    provider: modelConfig.provider as AIProvider,
    model: modelConfig.model,
    apiKeyEncrypted: modelConfig.apiKeyEncrypted,
    baseUrl: modelConfig.baseUrl || undefined,
    maxTokens: modelConfig.maxTokens || undefined,
    temperature: modelConfig.temperature
      ? modelConfig.temperature / 100
      : undefined,
  }
}

/**
 * 从前端临时配置创建 Provider Options（用于测试）
 * @param tempConfig 前端传入的临时配置
 * @returns Provider Options
 */
export function createProviderOptionsFromTest(tempConfig: {
  provider: string
  model: string
  apiKey: string
  baseUrl?: string
}): ProviderOptions {
  return {
    provider: tempConfig.provider as AIProvider,
    model: tempConfig.model,
    apiKey: tempConfig.apiKey,
    baseUrl: tempConfig.baseUrl,
  }
}
