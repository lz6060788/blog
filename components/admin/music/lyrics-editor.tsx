'use client'

import { useState, useEffect } from 'react'
import { Music, Clock, Save, X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LrcLine {
  time: number // 时间（秒）
  text: string // 歌词文本
  id: string // 唯一标识
}

interface LyricsEditorProps {
  initialLyrics?: string
  songId?: string
  onSave?: (lyrics: string) => void
  onCancel?: () => void
}

export function LyricsEditor({
  initialLyrics = '',
  songId,
  onSave,
  onCancel
}: LyricsEditorProps) {
  const [lines, setLines] = useState<LrcLine[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [editingText, setEditingText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  // 解析LRC歌词
  useEffect(() => {
    if (initialLyrics) {
      const parsedLines = parseLrc(initialLyrics)
      setLines(parsedLines)
    }
  }, [initialLyrics])

  // 解析LRC格式
  function parseLrc(lrc: string): LrcLine[] {
    const lines: LrcLine[] = []
    const lrcLines = lrc.split('\n')

    for (const line of lrcLines) {
      // 匹配 [mm:ss.xx] 格式
      const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseFloat(match[2])
        const time = minutes * 60 + seconds
        const text = match[3].trim()

        if (text) {
          lines.push({
            id: crypto.randomUUID(),
            time,
            text
          })
        }
      }
    }

    return lines.sort((a, b) => a.time - b.time)
  }

  // 格式化为LRC
  function formatLrc(lines: LrcLine[]): string {
    return lines.map(line => {
      const minutes = Math.floor(line.time / 60)
      const seconds = line.time % 60
      const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toFixed(2).padStart(5, '0')}`
      return `[${timeStr}]${line.text}`
    }).join('\n')
  }

  // 格式化时间显示
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toFixed(2).padStart(5, '0')}`
  }

  // 添加新行
  const addLine = () => {
    const newLine: LrcLine = {
      id: crypto.randomUUID(),
      time: currentTime,
      text: ''
    }
    setLines([...lines, newLine].sort((a, b) => a.time - b.time))
    setEditingId(newLine.id)
    setEditingText('')
  }

  // 删除行
  const deleteLine = (id: string) => {
    setLines(lines.filter(line => line.id !== id))
  }

  // 更新行文本
  const updateLineText = (id: string, text: string) => {
    setLines(lines.map(line =>
      line.id === id ? { ...line, text } : line
    ))
  }

  // 更新行时间
  const updateLineTime = (id: string, time: number) => {
    const newLines = lines.map(line =>
      line.id === id ? { ...line, time } : line
    ).sort((a, b) => a.time - b.time)
    setLines(newLines)
  }

  // 设置当前时间为行的时间
  const setLineTimeToCurrent = (id: string) => {
    updateLineTime(id, currentTime)
  }

  // 保存
  const handleSave = () => {
    const lrcString = formatLrc(lines)
    onSave?.(lrcString)
  }

  // 批量导入LRC文本
  const handleImportLrc = (lrcText: string) => {
    const parsedLines = parseLrc(lrcText)
    setLines(parsedLines)
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-theme-accent-primary" />
          <h3 className="text-lg font-semibold text-theme-text-canvas">歌词编辑器</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* LRC导入区域 */}
      <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-4">
        <label className="block text-sm font-medium text-theme-text-secondary mb-2">
          导入LRC歌词
        </label>
        <textarea
          placeholder="[00:12.50]第一行歌词&#10;[00:16.30]第二行歌词&#10;..."
          className="w-full h-32 px-3 py-2 bg-theme-bg-canvas border border-theme-border rounded-lg text-theme-text-canvas text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
          onChange={(e) => {
            if (e.target.value) {
              handleImportLrc(e.target.value)
            }
          }}
        />
        <p className="text-xs text-theme-text-tertiary mt-2">
          粘贴LRC格式的歌词，系统会自动解析并生成可编辑的时间轴
        </p>
      </div>

      {/* 歌词列表 */}
      <div className="bg-theme-bg-surface border border-theme-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-theme-border flex items-center justify-between">
          <span className="text-sm font-medium text-theme-text-secondary">
            时间轴编辑（{lines.length} 行）
          </span>
          <Button size="sm" variant="outline" onClick={addLine} className="gap-2">
            <Plus className="w-4 h-4" />
            添加行
          </Button>
        </div>

        <div className="divide-y divide-theme-border max-h-96 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="p-8 text-center">
              <Music className="w-12 h-12 text-theme-text-tertiary mx-auto mb-2" />
              <p className="text-theme-text-secondary">还没有歌词</p>
              <p className="text-sm text-theme-text-tertiary mt-1">
                导入LRC歌词或手动添加
              </p>
            </div>
          ) : (
            lines.map((line, index) => (
              <div
                key={line.id}
                className={`p-3 flex items-center gap-3 hover:bg-theme-bg-muted transition-colors ${
                  line.id === editingId ? 'bg-theme-accent-bg' : ''
                }`}
              >
                {/* 序号 */}
                <span className="text-xs text-theme-text-tertiary font-mono w-6">
                  {index + 1}
                </span>

                {/* 时间标签 */}
                <button
                  onClick={() => setLineTimeToCurrent(line.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-theme-bg-canvas border border-theme-border rounded text-theme-text-secondary hover:border-theme-accent-primary transition-colors"
                  title="点击设置为当前时间"
                >
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-mono">{formatTime(line.time)}</span>
                </button>

                {/* 歌词文本 */}
                {line.id === editingId ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => {
                      setEditingText(e.target.value)
                      updateLineText(line.id, e.target.value)
                    }}
                    onBlur={() => {
                      setEditingId(null)
                      setEditingText('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingId(null)
                        setEditingText('')
                      }
                    }}
                    autoFocus
                    className="flex-1 px-2 py-1 bg-theme-bg-canvas border border-theme-accent-primary rounded text-theme-text-canvas text-sm focus:outline-none"
                  />
                ) : (
                  <div
                    onClick={() => {
                      setEditingId(line.id)
                      setEditingText(line.text)
                    }}
                    className="flex-1 px-2 py-1 text-theme-text-canvas text-sm cursor-pointer hover:bg-theme-bg-canvas rounded transition-colors"
                  >
                    {line.text || '(空)'}
                  </div>
                )}

                {/* 删除按钮 */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteLine(line.id)}
                  className="text-theme-error-primary hover:text-theme-error-primary"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* LRC预览 */}
      {lines.length > 0 && (
        <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-4">
          <label className="block text-sm font-medium text-theme-text-secondary mb-2">
            LRC预览
          </label>
          <pre className="text-xs text-theme-text-tertiary font-mono bg-theme-bg-canvas p-3 rounded-lg overflow-x-auto">
            {formatLrc(lines)}
          </pre>
        </div>
      )}

      {/* 底部按钮 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          保存歌词
        </Button>
      </div>
    </div>
  )
}
