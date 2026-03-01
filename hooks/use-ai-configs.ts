'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

interface ModelConfig {
  id: string
  name: string
  provider: string
  model: string
  apiKeyEncrypted: string
  baseUrl: string | null
  maxTokens: number
  temperature: number
  enabled: number
  createdAt: string
  updatedAt: string
}

interface FunctionMapping {
  id: string
  functionName: string
  modelConfigId: string | null
  modelConfig?: {
    id: string
    name: string
    provider: string
    model: string
    enabled: number
  }
}

// 使用单例模式缓存数据
let cachedConfigs: ModelConfig[] | null = null
let cachedMappings: FunctionMapping[] | null = null
let isLoading = false
let loadPromise: Promise<void> | null = null

export function useAIConfigs() {
  const [configs, setConfigs] = useState<ModelConfig[]>([])
  const [mappings, setMappings] = useState<FunctionMapping[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const isInitialized = useRef(false)

  const loadConfigs = async (forceRefresh = false) => {
    // 如果正在加载，等待现有的加载完成
    if (isLoading && loadPromise) {
      await loadPromise
      return
    }

    // 如果有缓存且不强制刷新，直接使用缓存
    if (!forceRefresh && cachedConfigs && cachedMappings) {
      setConfigs(cachedConfigs)
      setMappings(cachedMappings)
      setIsInitialLoading(false)
      return
    }

    isLoading = true
    if (!forceRefresh) {
      setIsInitialLoading(true)
    } else {
      setIsRefreshing(true)
    }

    loadPromise = (async () => {
      try {
        const [mappingsRes, configsRes] = await Promise.all([
          fetch('/api/admin/ai/function-mappings'),
          fetch('/api/admin/ai/model-configs'),
        ])

        if (!mappingsRes.ok || !configsRes.ok) {
          throw new Error('加载数据失败')
        }

        const [mappingsData, configsData] = await Promise.all([
          mappingsRes.json(),
          configsRes.json(),
        ])

        // 更新缓存
        cachedMappings = mappingsData
        cachedConfigs = configsData

        setMappings(mappingsData)
        setConfigs(configsData)
      } catch (error: any) {
        console.error('加载数据失败:', error)
        toast.error(error.message || '加载数据失败')
      } finally {
        isLoading = false
        setIsInitialLoading(false)
        setIsRefreshing(false)
        loadPromise = null
      }
    })()

    await loadPromise
  }

  const reloadConfigs = () => loadConfigs(true)

  useEffect(() => {
    // 只在第一次挂载时加载数据
    if (!isInitialized.current) {
      isInitialized.current = true
      loadConfigs()
    }
  }, [])

  return {
    configs,
    mappings,
    isLoading: isInitialLoading,
    isRefreshing,
    reloadConfigs,
  }
}
