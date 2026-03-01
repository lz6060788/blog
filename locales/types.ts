/**
 * 翻译消息类型定义
 */

export interface CommonMessages {
  siteName: string
  siteDescription: string
}

export interface NavMessages {
  home: string
  archive: string
}

export interface HomeMessages {
  greeting: string
  title: string
  description: string
  latestPosts: string
}

export interface LoginMessages {
  welcome: string
  subtitle: string
  github: string
  google: string
  brand: {
    title: string
    subtitle: string
  }
  footer: {
    terms: string
    privacy: string
    backToHome: string
  }
}

export interface AIMessages {
  summary: string
  cover: string
  search: string
  status: {
    pending: string
    generating: string
    done: string
    failed: string
  }
  provider: {
    deepseek: string
    zhipu: string
    qwen: string
    moonshot: string
    baichuan: string
    openai: string
  }
  model: {
    // 模型名称不需要国际化，直接显示原始模型 ID
    [key: string]: string
  }
  config: {
    title: string
    addModel: string
    editModel: string
    deleteModel: string
    testModel: string
    toggleModel: string
    modelName: string
    provider: string
    model: string
    apiKey: string
    baseUrl: string
    maxTokens: string
    temperature: string
    enabled: string
    save: string
    cancel: string
    deleteConfirm: string
    testing: string
    testSuccess: string
    testFailed: string
    noConfigs: string
    noConfigsDesc: string
  }
  functionMapping: {
    title: string
    summaryFunction: string
    coverFunction: string
    searchFunction: string
    selectModel: string
    notConfigured: string
    comingSoon: string
    configureFirst: string
  }
  logs: {
    title: string
    totalLogs: string
    filters: string
    clearFilters: string
    status: string
    time: string
    action: string
    model: string
    tokens: string
    duration: string
    inputTokens: string
    outputTokens: string
    totalTokens: string
    noLogs: string
    noMatchingLogs: string
    statusSuccess: string
    statusFailed: string
    statusRetrying: string
    actionGenerateSummary: string
  }
  stats: {
    aiGenerated: string
    aiGeneratedDesc: string
    aiPending: string
    aiPendingDesc: string
    aiFailed: string
    aiFailedDesc: string
    aiTotalTokens: string
    aiTotalTokensDesc: string
  }
  generateButton: string
  regenerateButton: string
  generating: string
  generateSummary: string
  summaryPlaceholder: string
  summaryGenerating: string
  summaryGenerateFailed: string
  summaryNotConfigured: string
  summaryNotConfiguredDesc: string
  lockedDuringGeneration: string
}

export interface AdminMessages {
  title: string
  settings: string
  posts: string
  drafts: string
  categories: string
  tags: string
  aiLogs: string
  dashboard: string
  stats: {
    totalPosts: string
    publishedPosts: string
    draftPosts: string
    recentPosts: string
  }
}

export interface Messages {
  common: CommonMessages
  nav: NavMessages
  home: HomeMessages
  login: LoginMessages
  ai: AIMessages
  admin: AdminMessages
}

export type Locale = 'en' | 'zh'

export const locales: Locale[] = ['en', 'zh']

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
}
