'use client'

import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo, useCallback } from 'react'

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

export const CherryEditor = forwardRef<CherryEditorRef, CherryEditorProps>(
  ({ initialValue = '', onChange, height = '500px', className = '' }, ref) => {
    const [isMounted, setIsMounted] = useState(false)
    const [CherryComponent, setCherryComponent] = useState<any>(null)
    const cherryRef = useRef<any>(null)
    const onChangeRef = useRef(onChange)

    // 保持 onChange 引用最新
    useEffect(() => {
      onChangeRef.current = onChange
    }, [onChange])

    useImperativeHandle(ref, () => ({
      getContent: () => cherryRef.current?.getContent?.() || '',
      setContent: (content: string) => {
        cherryRef.current?.setContent?.(content)
      },
    }))

    useEffect(() => {
      setIsMounted(true)

      // 动态导入 Cherry Markdown 内部组件（只执行一次）
      import('./cherry-editor-internal').then((mod) => {
        setCherryComponent(() => mod.CherryEditorInternal)
      })
      // 空依赖数组，确保只执行一次
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 使用 useCallback 创建稳定的 onChange 回调
    const handleChange = useCallback((content: string) => {
      onChangeRef.current?.(content)
    }, [])

    if (!isMounted || !CherryComponent) {
      return (
        <div className={className}>
          <div style={{ height }} className="bg-theme-bg-surface border border-theme-border rounded-xl flex items-center justify-center">
            <div className="text-theme-text-tertiary">加载编辑器...</div>
          </div>
        </div>
      )
    }

    return (
      <div className={className}>
        <CherryComponent
          ref={cherryRef}
          initialValue={initialValue}
          onChange={handleChange}
          height={height}
        />
      </div>
    )
  }
)

CherryEditor.displayName = 'CherryEditor'
