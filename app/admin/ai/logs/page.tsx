'use client'

import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AISummaryStatusLabel } from '@/components/admin/ai-summary-status'
import { AICallStatus } from '@/server/ai/types'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

interface LogEntry {
  id: string
  postId: string | null
  modelConfigId: string
  action: string
  provider: string
  model: string
  inputTokens: number | null
  outputTokens: number | null
  status: string
  errorMessage: string | null
  durationMs: number
  createdAt: string
  configName?: string
  postTitle?: string
}

interface LogsResponse {
  logs: LogEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AILogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConfig, setSelectedConfig] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // 加载日志数据
  useEffect(() => {
    loadLogs()
  }, [currentPage, selectedConfig, selectedStatus])

  async function loadLogs() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })

      if (selectedConfig) params.append('modelConfigId', selectedConfig)
      if (selectedStatus) params.append('status', selectedStatus)

      const res = await fetch(`/api/admin/ai/logs?${params}`)
      if (!res.ok) throw new Error('加载日志失败')

      const data: LogsResponse = await res.json()
      setLogs(data.logs)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error: any) {
      console.error('加载日志失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 格式化持续时间
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case AICallStatus.SUCCESS:
        return 'text-green-500'
      case AICallStatus.FAILED:
        return 'text-theme-error-primary'
      case AICallStatus.RETRYING:
        return 'text-theme-accent-primary'
      default:
        return 'text-theme-text-tertiary'
    }
  }

  // 获取状态标签
  const getStatusLabel = (status: string) => {
    switch (status) {
      case AICallStatus.SUCCESS:
        return '成功'
      case AICallStatus.FAILED:
        return '失败'
      case AICallStatus.RETRYING:
        return '重试中'
      default:
        return status
    }
  }

  // 清除筛选
  const clearFilters = () => {
    setSelectedConfig('')
    setSelectedStatus('')
    setCurrentPage(1)
  }

  const hasActiveFilters = selectedConfig || selectedStatus

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-theme-text-canvas">AI 调用日志</h1>
          <p className="text-sm text-theme-text-secondary mt-1">
            查看所有 AI 功能的调用记录（共 {total} 条）
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          筛选
        </Button>
      </div>

      {/* 筛选器 */}
      {showFilters && (
        <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-theme-text-canvas">筛选条件</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-3 h-3 mr-1" />
                清除筛选
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-theme-text-secondary mb-2">
                状态
              </label>
              <Select value={selectedStatus} onValueChange={(value) => {
                setSelectedStatus(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value={AICallStatus.SUCCESS}>成功</SelectItem>
                  <SelectItem value={AICallStatus.FAILED}>失败</SelectItem>
                  <SelectItem value={AICallStatus.RETRYING}>重试中</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* 日志表格 */}
      <div className="bg-theme-bg-surface border border-theme-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-theme-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-theme-text-secondary">
              {hasActiveFilters ? '没有符合条件的日志' : '暂无 AI 调用日志'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme-border">
                  <th className="text-left p-4 text-sm font-medium text-theme-text-secondary">时间</th>
                  <th className="text-left p-4 text-sm font-medium text-theme-text-secondary">操作</th>
                  <th className="text-left p-4 text-sm font-medium text-theme-text-secondary">模型</th>
                  <th className="text-left p-4 text-sm font-medium text-theme-text-secondary">Tokens</th>
                  <th className="text-left p-4 text-sm font-medium text-theme-text-secondary">耗时</th>
                  <th className="text-left p-4 text-sm font-medium text-theme-text-secondary">状态</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-theme-border hover:bg-theme-bg-muted">
                    <td className="p-4 text-sm text-theme-text-secondary">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-sm font-medium text-theme-text-canvas">
                          {log.action === 'generate-summary' ? '生成摘要' : log.action}
                        </div>
                        {log.postTitle && (
                          <div className="text-xs text-theme-text-tertiary mt-1">
                            文章: {log.postTitle}
                          </div>
                        )}
                        {log.configName && (
                          <div className="text-xs text-theme-text-tertiary">
                            配置: {log.configName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-theme-text-secondary">
                      <div>{log.provider}</div>
                      <div className="text-xs text-theme-text-tertiary">{log.model}</div>
                    </td>
                    <td className="p-4 text-sm text-theme-text-secondary">
                      {log.inputTokens !== null || log.outputTokens !== null ? (
                        <div>
                          {log.inputTokens !== null && <div>输入: {log.inputTokens}</div>}
                          {log.outputTokens !== null && <div>输出: {log.outputTokens}</div>}
                          {(log.inputTokens !== null || log.outputTokens !== null) && (
                            <div className="text-theme-accent-primary font-medium">
                              总计: {(log.inputTokens || 0) + (log.outputTokens || 0)}
                            </div>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4 text-sm text-theme-text-secondary">
                      {formatDuration(log.durationMs)}
                    </td>
                    <td className="p-4">
                      <div className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                        {getStatusLabel(log.status)}
                      </div>
                      {log.errorMessage && (
                        <div className="text-xs text-theme-error-primary mt-1" title={log.errorMessage}>
                          {log.errorMessage.length > 50
                            ? log.errorMessage.slice(0, 50) + '...'
                            : log.errorMessage}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-theme-text-secondary">
            第 {currentPage} / {totalPages} 页，共 {total} 条记录
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
