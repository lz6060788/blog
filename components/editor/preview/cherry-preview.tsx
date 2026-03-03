'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'
import dynamic from 'next/dynamic'
import { CherryPreviewStylesLoader } from './cherry-styles-loader'
import type { CherryPreviewRef, CherryPreviewProps } from './cherry-preview-internal'

// 动态导入 CherryPreviewInternal 以避免 SSR 时的 document 错误
const CherryPreviewInternal = dynamic(
  () => import('./cherry-preview-internal').then(mod => mod.CherryPreviewInternal),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[200px] border border-theme-border rounded-lg">
        <div className="text-theme-text-tertiary">加载预览...</div>
      </div>
    )
  }
)

// 使用 forwardRef 包装
export const CherryPreview = forwardRef<CherryPreviewRef, CherryPreviewProps>(
  ({ content = '', theme = 'light', className = '' }, ref) => {
    const internalRef = useRef<CherryPreviewRef | null>(null)

    // 将内部 ref 暴露给外部
    useImperativeHandle(ref, () => internalRef.current || {} as CherryPreviewRef)

    return (
      <div className={className}>
        <CherryPreviewStylesLoader />
        <CherryPreviewInternal
          content={content}
          theme={theme}
          onRef={(previewRef) => {
            internalRef.current = previewRef
          }}
        />
      </div>
    )
  }
)

CherryPreview.displayName = 'CherryPreview'

// 导出类型
export type { CherryPreviewRef }
export type { CherryPreviewProps }
