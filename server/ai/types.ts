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
