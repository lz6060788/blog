'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'
import { CherryEditorInternal } from './cherry-editor-internal'

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
