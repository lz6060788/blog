'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'
import { CherryPreviewInternal } from './cherry-preview-internal'

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
