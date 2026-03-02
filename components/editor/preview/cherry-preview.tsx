'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'
import dynamic from 'next/dynamic'
import { CherryPreviewStylesLoader } from './cherry-styles-loader'

// 动态导入 CherryPreviewInternal 以避免 SSR 时的 document 错误
const CherryPreviewInternal = dynamic(
  () => import('./cherry-preview-internal').then(mod => ({ default: mod.CherryPreviewInternal })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[200px] border border-theme-border rounded-lg">
        <div className="text-theme-text-tertiary">加载预览...</div>
      </div>
    )
  }
)

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
    const cherryRef = useRef<any>(null)

    useImperativeHandle(ref, () => ({
      setContent: (markdown: string) => {
        cherryRef.current?.setContent?.(markdown)
      },
      getContent: () => {
        return cherryRef.current?.getContent?.() || content
      },
    }))

    return (
      <div className={className}>
        <CherryPreviewStylesLoader />
        <CherryPreviewInternal
          ref={cherryRef}
          content={content}
          theme={theme}
        />
      </div>
    )
  }
)

CherryPreview.displayName = 'CherryPreview'
