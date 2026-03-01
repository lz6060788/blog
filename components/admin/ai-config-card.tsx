'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Power, Loader2, Brain, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { useAIConfigs } from '@/hooks/use-ai-configs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

const PROVIDERS = [
  { value: 'deepseek', label: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
  { value: 'zhipu', label: '智谱 GLM', models: ['glm-4-flash', 'glm-4-plus', 'glm-4-air'] },
  { value: 'qwen', label: '通义千问', models: ['qwen-turbo', 'qwen-plus', 'qwen-max'] },
  { value: 'moonshot', label: '月之暗面 Kimi', models: ['moonshot-v1-8k', 'moonshot-v1-32k'] },
  { value: 'baichuan', label: '百川智能', models: ['Baichuan2-Turbo', 'Baichuan2-53B'] },
  { value: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt_3_5_turbo'] },
]

const FUNCTION_NAMES = [
  { value: 'summary', label: '摘要生成', available: true, icon: '📝' },
  { value: 'cover', label: '封面生成', available: false, icon: '🎨' },
  { value: 'search', label: '智能搜索', available: false, icon: '🔍' },
]

// 整合的 AI 配置卡片
export function AIConfigCard() {
  const { configs, mappings, isLoading, isRefreshing, reloadConfigs } = useAIConfigs()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ModelConfig | null>(null)
  const [testingConfig, setTestingConfig] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'models' | 'mappings'>('models')

  async function handleDelete(config: ModelConfig) {
    if (!confirm(`确定要删除配置"${config.name}"吗？`)) return

    try {
      const res = await fetch(`/api/admin/ai/model-configs/${config.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '删除失败')
      }
      toast.success('删除成功')
      reloadConfigs()
    } catch (error: any) {
      console.error('删除配置失败:', error)
      toast.error(error.message || '删除失败')
    }
  }

  async function handleToggle(config: ModelConfig) {
    try {
      const res = await fetch(`/api/admin/ai/model-configs/${config.id}/toggle`, {
        method: 'PATCH',
      })
      if (!res.ok) throw new Error('切换状态失败')
      reloadConfigs()
    } catch (error: any) {
      console.error('切换状态失败:', error)
      toast.error(error.message || '切换状态失败')
    }
  }

  async function handleTest(config: ModelConfig) {
    if (!config?.id) {
      toast.error('配置 ID 无效，请刷新页面重试')
      return
    }

    setTestingConfig(config.id)
    try {
      const res = await fetch(`/api/admin/ai/model-configs/${config.id}/test`, {
        method: 'POST',
      })
      
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const data = await res.json()
        if (data.success) {
          toast.success(`测试成功！响应时间: ${data.responseTime}ms`)
        } else {
          toast.error(`测试失败: ${data.error || '未知错误'}`)
        }
      } else {
        // 非 JSON 响应，可能是 404 页面或其他错误
        if (!res.ok) {
          throw new Error(`请求失败: ${res.status} ${res.statusText}`)
        }
        throw new Error('服务器返回了无效的响应格式')
      }
    } catch (error: any) {
      console.error('测试配置失败:', error)
      toast.error(error.message || '测试失败')
    } finally {
      setTestingConfig(null)
    }
  }

  const enabledConfigs = configs.filter(c => c.enabled)

  if (isLoading) {
    return (
      <div className="bg-theme-bg-surface border border-theme-border rounded-xl">
        <div className="p-6 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-theme-accent-primary" />
            <h2 className="text-lg font-medium text-theme-text-canvas">AI 配置中心</h2>
          </div>
        </div>
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-theme-accent-primary" />
        </div>
      </div>
    )
  }

  // 首次配置引导
  const showFirstTimeGuide = configs.length === 0

  return (
    <div className="bg-theme-bg-surface border border-theme-border rounded-xl overflow-hidden">
      {/* 头部 */}
      <div className="p-6 border-b border-theme-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-theme-accent-primary/10 rounded-lg">
              <Brain className="w-5 h-5 text-theme-accent-primary" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-theme-text-canvas">AI 配置中心</h2>
              <p className="text-sm text-theme-text-secondary mt-0.5">
                配置 AI 模型和功能映射
              </p>
            </div>
            {isRefreshing && (
              <Loader2 className="w-4 h-4 animate-spin text-theme-text-tertiary" />
            )}
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加模型
          </Button>
        </div>

        {/* 标签切换 */}
        {!showFirstTimeGuide && configs.length > 0 && (
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('models')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'models'
                  ? 'bg-theme-accent-primary text-white'
                  : 'bg-theme-bg-canvas text-theme-text-secondary hover:bg-theme-bg-muted'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              模型配置
            </button>
            <button
              onClick={() => setActiveTab('mappings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'mappings'
                  ? 'bg-theme-accent-primary text-white'
                  : 'bg-theme-bg-canvas text-theme-text-secondary hover:bg-theme-bg-muted'
              }`}
            >
              <span className="mr-2">⚡</span>
              功能映射
            </button>
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="p-6">
        {showFirstTimeGuide ? (
          /* 首次引导 */
          <div className="bg-gradient-to-r from-theme-accent-bg to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-theme-accent-primary/30 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-theme-accent-primary/10 rounded-lg">
                <Brain className="w-6 h-6 text-theme-accent-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-medium text-theme-text-canvas">开始使用 AI 功能</h3>
                <p className="text-sm text-theme-text-secondary">
                  配置您的第一个 AI 模型，即可开始使用文章摘要生成等智能功能
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                '选择 AI 提供商（支持 DeepSeek、智谱 GLM、通义千问等）',
                '输入 API Key 并配置模型参数',
                '测试配置并启用模型',
                '在功能映射中配置摘要生成功能',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-theme-accent-primary text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-theme-text-secondary">{step}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                添加第一个模型配置
              </Button>
            </div>
          </div>
        ) : activeTab === 'models' ? (
          /* 模型配置列表 */
          <div className="space-y-3">
            {configs.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between p-4 bg-theme-bg-canvas border border-theme-border rounded-lg hover:border-theme-accent-primary/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-theme-text-canvas">{config.name}</h3>
                    {!config.enabled && (
                      <span className="px-2 py-0.5 text-xs bg-theme-bg-muted text-theme-text-tertiary rounded">
                        已禁用
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-theme-text-secondary mt-1">
                    {PROVIDERS.find(p => p.value === config.provider)?.label} · {config.model}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTest(config)}
                    disabled={testingConfig === config.id}
                    title="测试连接"
                  >
                    {testingConfig === config.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      '测试'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingConfig(config)}
                    title="编辑配置"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(config)}
                    title={config.enabled ? '禁用模型' : '启用模型'}
                  >
                    <Power className={`w-4 h-4 ${config.enabled ? 'text-theme-accent-primary' : 'text-theme-text-tertiary'}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(config)}
                    title="删除配置"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 功能映射 */
          <div className="space-y-4">
            {enabledConfigs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-theme-text-secondary">请先添加并启用 AI 模型配置</p>
              </div>
            ) : (
              <div className="space-y-4">
                {FUNCTION_NAMES.map((fn) => {
                  const mapping = mappings.find(m => m.functionName === fn.value)
                  const currentConfigId = mapping?.modelConfig?.id || ''

                  const handleUpdate = async (value: string) => {
                    try {
                      const res = await fetch('/api/admin/ai/function-mappings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ functionName: fn.value, modelConfigId: value || null }),
                      })
                      if (!res.ok) throw new Error('更新失败')
                      toast.success('已更新')
                      reloadConfigs()
                    } catch (error) {
                      toast.error('更新失败')
                    }
                  }

                  return (
                    <div
                      key={fn.value}
                      className="flex items-center justify-between p-4 bg-theme-bg-canvas border border-theme-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{fn.icon}</span>
                          <label className="text-sm font-medium text-theme-text-canvas">
                            {fn.label}
                          </label>
                          {!fn.available && (
                            <span className="px-2 py-0.5 text-xs bg-theme-bg-muted text-theme-text-tertiary rounded">
                              即将推出
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-theme-text-tertiary mt-1">
                          {mapping?.modelConfig
                            ? `当前使用: ${mapping.modelConfig.name}`
                            : '未配置模型'}
                        </p>
                      </div>

                      <Select
                        value={currentConfigId || "__none__"}
                        onValueChange={(value) => handleUpdate(value === "__none__" ? "" : value)}
                        disabled={!fn.available}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="选择模型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">未配置</SelectItem>
                          {enabledConfigs.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 添加/编辑模态框 */}
      {(showAddModal || editingConfig) && (
        <AIConfigModal
          config={editingConfig}
          onClose={() => {
            setShowAddModal(false)
            setEditingConfig(null)
          }}
          onSave={() => {
            setShowAddModal(false)
            setEditingConfig(null)
            reloadConfigs()
          }}
        />
      )}
    </div>
  )
}

function AIConfigModal({
  config,
  onClose,
  onSave,
}: {
  config: ModelConfig | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: config?.name || '',
    provider: config?.provider || 'deepseek',
    model: config?.model || 'deepseek-chat',
    apiKey: '',
    baseUrl: config?.baseUrl || '',
    maxTokens: config?.maxTokens || 300,
    temperature: (config?.temperature ?? 70) / 100 || 0.7,
    enabled: config?.enabled !== 0,
  })
  const [isSaving, setIsSaving] = useState(false)

  const selectedProvider = PROVIDERS.find(p => p.value === formData.provider)
  const recommendedModels = selectedProvider?.models || []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('请输入配置名称')
      return
    }

    if (!formData.apiKey.trim() && !config) {
      toast.error('请输入 API Key')
      return
    }

    setIsSaving(true)
    try {
      const url = config
        ? `/api/admin/ai/model-configs/${config.id}`
        : '/api/admin/ai/model-configs'

      const res = await fetch(url, {
        method: config ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '保存失败')
      }

      toast.success('保存成功')
      onSave()
    } catch (error: any) {
      console.error('保存配置失败:', error)
      toast.error(error.message || '保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-medium text-theme-text-canvas mb-4">
          {config ? '编辑模型配置' : '添加模型配置'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              配置名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="DeepSeek 摘要专用"
              className="w-full px-4 py-2 bg-theme-bg-canvas border border-theme-border rounded-xl text-theme-text-canvas focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              AI 提供商
            </label>
            <Select
              value={formData.provider}
              onValueChange={(value) => setFormData({
                ...formData,
                provider: value,
                model: PROVIDERS.find(p => p.value === value)?.models[0] || '',
              })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择提供商" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              模型
            </label>
            <Select
              value={formData.model}
              onValueChange={(value) => setFormData({ ...formData, model: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {recommendedModels.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              API Key
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder={config ? '留空不修改' : 'sk-...'}
              className="w-full px-4 py-2 bg-theme-bg-canvas border border-theme-border rounded-xl text-theme-text-canvas focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              required={!config}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Base URL（可选）
            </label>
            <input
              type="text"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              placeholder="自定义 API 端点"
              className="w-full px-4 py-2 bg-theme-bg-canvas border border-theme-border rounded-xl text-theme-text-canvas focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                最大 Tokens
              </label>
              <input
                type="number"
                value={formData.maxTokens}
                onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) || 300 })}
                min={1}
                max={8000}
                className="w-full px-4 py-2 bg-theme-bg-canvas border border-theme-border rounded-xl text-theme-text-canvas focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                温度
              </label>
              <input
                type="number"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0.7 })}
                min={0}
                max={2}
                step={0.1}
                className="w-full px-4 py-2 bg-theme-bg-canvas border border-theme-border rounded-xl text-theme-text-canvas focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="enabled" className="text-sm text-theme-text-secondary">
              启用此配置
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
