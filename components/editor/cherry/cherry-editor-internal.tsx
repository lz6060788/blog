'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useId } from 'react'
import { toast } from 'react-hot-toast'
import { uploadFile } from '@/lib/api/upload'

// Cherry 类型定义（仅用于类型注解）
type Cherry = any

// 动态导入 Cherry Markdown 和 echarts
const loadCherry = async () => {
  const [{ default: Cherry }, echarts] = await Promise.all([
    import('cherry-markdown'),
    import('echarts')
  ])
  return { Cherry, echarts }
}

export interface CherryEditorRef {
  getContent: () => string
  setContent: (content: string) => void
}

export interface CherryEditorProps {
  initialValue?: string
  onChange?: (content: string) => void
  height?: string
  className?: string
  theme?: 'light' | 'dark'
  // 添加一个可选的 ref 回调 prop，用于动态导入时传递 ref
  onRef?: (ref: CherryEditorRef | null) => void
}

export const CherryEditorInternal = forwardRef<CherryEditorRef, CherryEditorProps>(
  ({ initialValue = '', onChange, height = '500px', className = '', theme = 'light', onRef }, ref) => {
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

          // 动态加载 Cherry 和 echarts
          const { Cherry, echarts } = await loadCherry()

          // 自定义图片上传函数 - 符合 Cherry Markdown 的 fileUpload 规范
          const handleFileUpload = (file: File, callback: (url: string, config?: any) => void) => {
            console.log('Cherry Markdown 触发文件上传:', file.name, file.type)

            uploadFile({
              file,
              onProgress: (progress) => {
                if (progress % 20 === 0) {
                  toast.loading(`正在上传图片... ${progress}%`, { id: 'cherry-upload' })
                }
              },
            })
              .then((result) => {
                console.log('上传成功，URL:', result.url)
                toast.success('图片上传成功', { id: 'cherry-upload' })

                // 根据文件类型返回不同的配置
                if (file.type.startsWith('image/')) {
                  // 图片配置
                  callback(result.url, {
                    name: file.name,
                    isBorder: false,
                    isShadow: false,
                    isRadius: false,
                    width: '100%',
                    height: 'auto',
                  })
                } else {
                  // 其他文件类型
                  callback(result.url)
                }
              })
              .catch((error) => {
                console.error('图片上传失败:', error)
                toast.error('图片上传失败，请重试', { id: 'cherry-upload' })
              })
          }

          const cherry = new Cherry({
            id: editorId,
            el: container,
            value: initialValue,
            height,
            autoSave: false,
            externals: {
              echarts: echarts,
            },
            // Cherry Markdown 文件上传配置 - 使用 fileUpload 而不是 upload
            fileUpload: handleFileUpload,
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

          // 调用 onRef 回调，传递 ref 对象
          if (onRef) {
            onRef({
              getContent: () => {
                try {
                  return cherry.getMarkdown() || currentContentRef.current
                } catch (e) {
                  console.error('获取内容失败:', e)
                  return currentContentRef.current
                }
              },
              setContent: (content: string) => {
                try {
                  currentContentRef.current = content
                  cherry.setMarkdown(content)
                } catch (e) {
                  console.error('设置内容失败:', e)
                }
              },
            })
          }
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
