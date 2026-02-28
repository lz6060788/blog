'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useId } from 'react'
import Cherry from 'cherry-markdown'
import 'cherry-markdown/dist/cherry-markdown.css'
import * as echarts from 'echarts'

export interface CherryEditorRef {
  getContent: () => string
  setContent: (content: string) => void
}

interface CherryEditorProps {
  initialValue?: string
  onChange?: (content: string) => void
  height?: string
  className?: string
  theme?: 'light' | 'dark'
}

export const CherryEditorInternal = forwardRef<CherryEditorRef, CherryEditorProps>(
  ({ initialValue = '', onChange, height = '500px', className = '', theme = 'light' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const cherryRef = useRef<Cherry | null>(null)
    const onChangeRef = useRef(onChange)
    const generatedId = useId()
    const editorId = `cherry-editor-${generatedId}`
    const [isReady, setIsReady] = useState(false)
    const currentContentRef = useRef(initialValue)

    // 保持 onChange 引用最新
    useEffect(() => {
      onChangeRef.current = onChange
    }, [onChange])

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getContent: () => {
        try {
          return cherryRef.current?.getMarkdown() || currentContentRef.current
        } catch (e) {
          console.error('获取内容失败:', e)
          return currentContentRef.current
        }
      },
      setContent: (content: string) => {
        try {
          currentContentRef.current = content
          if (cherryRef.current) {
            cherryRef.current.setMarkdown(content)
          }
        } catch (e) {
          console.error('设置内容失败:', e)
        }
      },
    }))

    // 初始化 Cherry Markdown（只执行一次）
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      let mounted = true;

      (async () => {
        try {
          if (!mounted) return

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
                'search',
                'shortcutKey',
              ],
            },
            themeSettings: {
              themeList: [
                { className: 'default', label: '默认' },
                { className: 'dark', label: '深色' },
                { className: 'light', label: '浅色' },
              ],
              mainTheme: theme === 'dark' ? 'dark' : 'light',
              codeBlockTheme: theme === 'dark' ? 'dark' : 'default',
            },
            engine: {
              global: {
                urlProcessor: (url: string) => url,
              },
            },
            callback: {
              afterChange: (markdown: string) => {
                currentContentRef.current = markdown
                onChangeRef.current?.(markdown)
              },
            },
          })

          if (!mounted) {
            cherry.destroy()
            return
          }

          cherryRef.current = cherry
          setIsReady(true)
        } catch (error) {
          console.error('Cherry Markdown 初始化失败:', error)
        }
      })()

      return () => {
        mounted = false
        if (cherryRef.current) {
          try {
            cherryRef.current.destroy()
            cherryRef.current = null
          } catch (e) {
            console.error('Cherry Markdown 清理失败:', e)
          }
        }
      }
    }, [editorId])

    // 主题切换
    useEffect(() => {
      if (!cherryRef.current || !isReady) return
      
      const mainTheme = theme === 'dark' ? 'dark' : 'light'
      const codeBlockTheme = theme === 'dark' ? 'dark' : 'default'
      
      try {
        cherryRef.current.setTheme(mainTheme)
        cherryRef.current.setCodeBlockTheme(codeBlockTheme)
      } catch (error) {
        console.error('Cherry Markdown 主题切换失败:', error)
      }
    }, [theme, isReady])

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
