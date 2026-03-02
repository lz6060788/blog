'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'
import dynamic from 'next/dynamic'
import { CherryStylesLoader } from './cherry-styles-loader'

// 动态导入 CherryEditorInternal 以避免 SSR 时的 document 错误
const CherryEditorInternal = dynamic(
  () => import('./cherry-editor-internal').then(mod => ({ default: mod.CherryEditorInternal })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] border border-theme-border rounded-lg animate-pulse">
        <div className="text-theme-text-tertiary">加载编辑器...</div>
      </div>
    )
  }
)

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

export const CherryEditor = forwardRef<CherryEditorRef, CherryEditorProps>(
  ({ initialValue = '', onChange, height = '500px', className = '', theme = 'light' }, ref) => {
    const cherryRef = useRef<any>(null)

    useImperativeHandle(ref, () => ({
      getContent: () => cherryRef.current?.getContent?.() || '',
      setContent: (content: string) => {
        cherryRef.current?.setContent?.(content)
      },
    }))

    return (
      <div className={className}>
        <CherryStylesLoader />
        <CherryEditorInternal
          ref={cherryRef}
          initialValue={initialValue}
          onChange={onChange}
          height={height}
          theme={theme}
        />
      </div>
    )
  }
)

CherryEditor.displayName = 'CherryEditor'
