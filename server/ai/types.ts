/**
 * AI Provider 枚举
 * 支持的 AI 提供商
 */
export enum AIProvider {
  DEEPSEEK = 'deepseek',
  ZHIPU = 'zhipu',
  QWEN = 'qwen',
  MOONSHOT = 'moonshot',
  BAICHUAN = 'baichuan',
  OPENAI = 'openai',
}

/**
 * AI 能力类型
 * 区分文本生成和图像生成
 */
export enum AICapabilityType {
  TEXT = 'text',
  IMAGE = 'image',
}

/**
 * Provider 信息（显示名称和默认 Base URL）
 * 单一事实来源 (Source of Truth)
 * defaultBaseUrl 为可选的，某些 Provider 使用 SDK 默认端点
 */
export const PROVIDER_INFO: Record<
  AIProvider,
  { label: string; defaultBaseUrl?: string }
> = {
  [AIProvider.DEEPSEEK]: {
    label: 'DeepSeek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
  },
  [AIProvider.ZHIPU]: {
    label: '智谱 GLM',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  },
  [AIProvider.QWEN]: {
    label: '通义千问',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
  [AIProvider.MOONSHOT]: {
    label: '月之暗面 Kimi',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
  },
  [AIProvider.BAICHUAN]: {
    label: '百川智能',
    defaultBaseUrl: 'https://api.baichuan-ai.com/v1',
  },
  [AIProvider.OPENAI]: {
    label: 'OpenAI',
    // OpenAI SDK 使用默认端点，无需指定
  },
}

/**
 * 推荐的模型列表（用于下拉选择）
 * 单一事实来源 (Source of Truth)
 */
export const SUGGESTED_MODELS: Record<AIProvider, string[]> = {
  [AIProvider.DEEPSEEK]: [
    'deepseek-chat',
    'deepseek-reasoner',
    'deepseek-coder',
  ],
  [AIProvider.ZHIPU]: [
    'glm-4-flash',
    'glm-4-plus',
    'glm-4-air',
    'glm-4-flashx',
  ],
  [AIProvider.QWEN]: [
    'qwen-turbo',
    'qwen-plus',
    'qwen-max',
    'qwen-long',
  ],
  [AIProvider.MOONSHOT]: [
    'moonshot-v1-8k',
    'moonshot-v1-32k',
    'moonshot-v1-128k',
  ],
  [AIProvider.BAICHUAN]: [
    'Baichuan2-Turbo',
    'Baichuan2-53B',
    'Baichuan3-Turbo',
    'Baichuan3-53B',
  ],
  [AIProvider.OPENAI]: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
  ],
}

/**
 * 推荐的图像生成模型列表
 * 仅支持图像生成能力的提供商
 */
export const SUGGESTED_IMAGE_MODELS: Partial<Record<AIProvider, string[]>> = {
  [AIProvider.OPENAI]: [
    'dall-e-3',
    'dall-e-2',
  ],
  // TODO: 添加更多图像生成提供商（通义万相、百度文心一格等）
}

/**
 * 将模型 ID 转换为 i18n key
 * i18n 不支持点号，需要转换
 * @param modelId 模型 ID
 * @returns i18n key
 */
export function modelIdToLocaleKey(modelId: string): string {
  return modelId.replace(/\./g, '_').replace(/-/g, '_')
}

/**
 * AI 功能类型
 */
export enum AIFunction {
  SUMMARY = 'summary',
  COVER = 'cover',
  SEARCH = 'search',
}

/**
 * 摘要生成状态
 */
export enum SummaryStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  DONE = 'done',
  FAILED = 'failed',
}

/**
 * AI 摘要请求
 */
export interface AISummaryRequest {
  postId: string
  title: string
  content: string
  language?: string
}

/**
 * AI 摘要响应
 */
export interface AISummaryResponse {
  summary: string
  modelConfigId: string
  provider: AIProvider
  model: string
  inputTokens: number
  outputTokens: number
  durationMs: number
}

/**
 * AI 调用日志状态
 */
export enum AICallStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

/**
 * 封面生成状态
 */
export enum CoverStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  DONE = 'done',
  FAILED = 'failed',
  MANUAL = 'manual',
}

/**
 * AI 封面请求
 */
export interface AICoverRequest {
  postId: string
  title: string
  content: string
  excerpt?: string
  tags?: string[]
}

/**
 * AI 封面响应
 */
export interface AICoverResponse {
  imageUrl: string
  prompt: string
  modelConfigId: string
  provider: AIProvider
  model: string
  imageSize?: string
  imageFormat?: string
  durationMs: number
}

/**
 * 图像生成选项
 */
export interface ImageGenerationOptions {
  size?: '1024x1024' | '1792x1024' | '1024x1792' | '1200x675' // 支持常见的封面尺寸
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  format?: 'url' | 'b64_json'
}
