'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback, useRef as useRefCallback } from 'react'
import Cherry from 'cherry-markdown'
import 'cherry-markdown/dist/cherry-markdown.css'

export interface CherryPreviewRef {
  setContent: (content: string) => void
  getContent: () => string
}

interface CherryPreviewProps {
  content?: string
  theme?: 'light' | 'dark'
  className?: string
}

export const CherryPreviewInternal = forwardRef<CherryPreviewRef, CherryPreviewProps>(
  ({ content = '', theme = 'light', className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const cherryRef = useRef<Cherry | null>(null)
    const [previewId] = useState(() => `cherry-preview-${Date.now()}-${Math.random().toString(36).substring(7)}`)
    const [isReady, setIsReady] = useState(false)

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      setContent: (markdown: string) => {
        try {
          if (cherryRef.current) {
            cherryRef.current.setMarkdown(markdown)
          }
        } catch (e) {
          console.error('设置预览内容失败:', e)
        }
      },
      getContent: () => {
        try {
          return cherryRef.current?.getMarkdown() || content
        } catch (e) {
          console.error('获取预览内容失败:', e)
          return content
        }
      },
    }))

    const initCherry = useCallback(() => {
      const container = containerRef.current
      if (!container || cherryRef.current) return

      // 检查容器是否在 DOM 中
      if (!document.body.contains(container)) {
        console.log('容器尚未挂载到 DOM')
        return
      }

      try {
        console.log('开始初始化 Cherry Markdown 预览, previewId:', previewId)

        const cherry = new Cherry({
          id: previewId,
          el: container,
          value: content,
          // 只读预览模式配置
          readonly: true,
          // 只显示预览，隐藏编辑器
          preview: true,
          // 不显示工具栏
          toolbars: {
            toolbar: [],
          },
          // 隐藏编辑器相关 UI
          editor: {
            show: false,
          },
          // 主题配置
          theme: theme,
          engine: {
            global: {
              urlProcessor: (url: string) => url,
            },
          },
        })

        cherryRef.current = cherry
        setIsReady(true)
        console.log('Cherry Markdown 预览初始化成功')
      } catch (error) {
        console.error('Cherry Markdown 预览初始化失败:', error)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewId, content, theme])

    // 当 content 或 theme 变化时更新内容
    useEffect(() => {
      if (cherryRef.current && isReady) {
        try {
          cherryRef.current.setMarkdown(content)
        } catch (e) {
          console.error('更新预览内容失败:', e)
        }
      }
    }, [content, isReady])

    // 当 theme 变化时重新初始化
    useEffect(() => {
      if (cherryRef.current && isReady) {
        try {
          // Cherry Markdown 需要重新初始化来应用主题变化
          cherryRef.current.destroy()
          cherryRef.current = null
          setIsReady(false)
        } catch (e) {
          console.error('销毁预览实例失败:', e)
        }
      }
    }, [theme])

    useEffect(() => {
      // 使用 requestAnimationFrame 确保 DOM 完全渲染
      const rafId = requestAnimationFrame(() => {
        // 再用 setTimeout 确保 Cherry Markdown 的内部逻辑准备就绪
        const timerId = setTimeout(() => {
          initCherry()
        }, 50)

        return () => clearTimeout(timerId)
      })

      return () => {
        cancelAnimationFrame(rafId)
        if (cherryRef.current) {
          try {
            cherryRef.current.destroy()
            cherryRef.current = null
          } catch (e) {
            console.error('Cherry Markdown 预览清理失败:', e)
          }
        }
      }
    }, [initCherry, theme])

    return (
      <div
        ref={containerRef}
        id={previewId}
        className={`cherry-preview-container ${className}`}
        style={{
          visibility: isReady ? 'visible' : 'hidden',
          minHeight: '200px',
        }}
      />
    )
  }
)

CherryPreviewInternal.displayName = 'CherryPreviewInternal'
