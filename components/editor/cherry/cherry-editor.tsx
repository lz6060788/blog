'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'
import dynamic from 'next/dynamic'
import { CherryStylesLoader } from './cherry-styles-loader'
import type { CherryEditorRef, CherryEditorProps } from './cherry-editor-internal'

// 动态导入 CherryEditorInternal 以避免 SSR 时的 document 错误
const CherryEditorInternal = dynamic(
  () => import('./cherry-editor-internal').then(mod => mod.CherryEditorInternal),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] border border-theme-border rounded-lg animate-pulse">
        <div className="text-theme-text-tertiary">加载编辑器...</div>
      </div>
    )
  }
)

// 使用 forwardRef 包装
export const CherryEditor = forwardRef<CherryEditorRef, CherryEditorProps>(
  ({ initialValue = '', onChange, height = '500px', className = '', theme = 'light' }, ref) => {
    const internalRef = useRef<CherryEditorRef | null>(null)

    // 将内部 ref 暴露给外部
    useImperativeHandle(ref, () => internalRef.current || {} as CherryEditorRef)

    return (
      <div className={className}>
        <CherryStylesLoader />
        <CherryEditorInternal
          initialValue={initialValue}
          onChange={onChange}
          height={height}
          theme={theme}
          onRef={(editorRef) => {
            internalRef.current = editorRef
          }}
        />
      </div>
    )
  }
)

CherryEditor.displayName = 'CherryEditor'

// 导出类型
export type { CherryEditorRef }
export type { CherryEditorProps }
