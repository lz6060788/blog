'use client'

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

export interface CherryPreviewRef {
  setContent: (content: string) => void
  getContent: () => string
}

interface CherryPreviewProps {
  content?: string
  theme?: 'light' | 'dark'
  className?: string
}

export const CherryPreview = forwardRef<CherryPreviewRef, CherryPreviewProps>(
  ({ content = '', theme = 'light', className = '' }, ref) => {
    const [isMounted, setIsMounted] = useState(false)
    const [CherryComponent, setCherryComponent] = useState<any>(null)
    const cherryRef = useRef<any>(null)

    useImperativeHandle(ref, () => ({
      setContent: (markdown: string) => {
        cherryRef.current?.setContent?.(markdown)
      },
      getContent: () => {
        return cherryRef.current?.getContent?.() || content
      },
    }))

    useEffect(() => {
      setIsMounted(true)

      // 动态导入 Cherry Markdown 预览内部组件
      import('./cherry-preview-internal').then((mod) => {
        setCherryComponent(() => mod.CherryPreviewInternal)
      })
    }, [])

    if (!isMounted || !CherryComponent) {
      return (
        <div className={className}>
          <div className="bg-theme-bg-surface border border-theme-border rounded-xl flex items-center justify-center min-h-[200px]">
            <div className="text-theme-text-tertiary">加载预览...</div>
          </div>
        </div>
      )
    }

    return (
      <div className={className}>
        <CherryComponent
          ref={cherryRef}
          content={content}
          theme={theme}
        />
      </div>
    )
  }
)

CherryPreview.displayName = 'CherryPreview'
