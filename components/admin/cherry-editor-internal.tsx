'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback, useRef as useRefCallback } from 'react'
import Cherry from 'cherry-markdown'
import 'cherry-markdown/dist/cherry-markdown.css';
import * as echarts from 'echarts';

export interface CherryEditorRef {
  getContent: () => string
  setContent: (content: string) => void
}

interface CherryEditorProps {
  initialValue?: string
  onChange?: (content: string) => void
  height?: string
  className?: string
}

export const CherryEditorInternal = forwardRef<CherryEditorRef, CherryEditorProps>(
  ({ initialValue = '', onChange, height = '500px', className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const cherryRef = useRef<Cherry | null>(null)
    const onChangeRef = useRefCallback(onChange)
    const [editorId] = useState(() => `cherry-editor-${Date.now()}-${Math.random().toString(36).substring(7)}`)
    const [isReady, setIsReady] = useState(false)

    // 保持 onChange 引用最新
    useEffect(() => {
      onChangeRef.current = onChange
    }, [onChange])

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getContent: () => {
        try {
          return cherryRef.current?.getMarkdown() || ''
        } catch (e) {
          console.error('获取内容失败:', e)
          return ''
        }
      },
      setContent: (content: string) => {
        try {
          if (cherryRef.current) {
            cherryRef.current.setMarkdown(content)
          }
        } catch (e) {
          console.error('设置内容失败:', e)
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
        console.log('开始初始化 Cherry Markdown, editorId:', editorId)

        const cherry = new Cherry({
          id: editorId,
          el: container,
          value: initialValue,
          height,
          autoSave: false,
          externals: {
            echarts: echarts,
          },
          toolbars: {
            toolbar: [
              'bold',
              'italic',
              {
                strikethrough: ['strikethrough', 'underline', 'sub', 'sup', 'ruby', 'customMenuAName'],
              },
              'size',
              '|',
              'color',
              'header',
              '|',
              'drawIo',
              '|',
              'ol',
              'ul',
              'checklist',
              'panel',
              'align',
              'detail',
              '|',
              'formula',
              {
                insert: [
                  'image',
                  'audio',
                  'video',
                  'link',
                  'hr',
                  'br',
                  'code',
                  'inlineCode',
                  'formula',
                  'toc',
                  'table',
                  'pdf',
                  'word',
                  'file',
                ],
              },
              'graph',
              'proTable',
              // 'customMenuTable',
              'togglePreview',
              'search',
              'shortcutKey',
            ],
          },
          engine: {
            global: {
              urlProcessor: (url: string) => url,
            },
          },
          callback: {
            afterChange: (markdown: string) => {
              // 使用 ref 中最新的 onChange
              onChangeRef.current?.(markdown)
            },
          },
        })

        cherryRef.current = cherry
        setIsReady(true)
        console.log('Cherry Markdown 初始化成功')
      } catch (error) {
        console.error('Cherry Markdown 初始化失败:', error)
      }
    // 移除 onChange 依赖，只保留初始化相关的依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editorId, initialValue, height])

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
            console.error('Cherry Markdown 清理失败:', e)
          }
        }
      }
    }, [initCherry])

    return (
      <div
        ref={containerRef}
        id={editorId}
        className="cherry-editor-container"
        style={{
          minHeight: height,
          height: height,
          visibility: isReady ? 'visible' : 'hidden',
        }}
      />
    )
  }
)

CherryEditorInternal.displayName = 'CherryEditorInternal'
