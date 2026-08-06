'use client'

import { useState, type FocusEvent, type MouseEvent, type ReactNode } from 'react'
import { ArrowUpRight, Clock3, FileText } from 'lucide-react'

interface PreviewState {
  title: string
  excerpt: string
  category: string
  readTime: string
  left: number
  top: number
}

function previewFromTarget(target: EventTarget | null): PreviewState | null {
  if (!(target instanceof Element)) return null
  const anchor = target.closest<HTMLAnchorElement>('a[data-internal-post-id]')
  if (!anchor) return null
  const rect = anchor.getBoundingClientRect()
  const width = Math.min(360, window.innerWidth - 24)
  const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left))
  const preferredTop = rect.bottom + 10
  const top = preferredTop + 190 < window.innerHeight ? preferredTop : Math.max(12, rect.top - 190)
  return {
    title: anchor.dataset.internalPostTitle || anchor.textContent || '站内文章',
    excerpt: anchor.dataset.internalPostExcerpt || '暂无简介',
    category: anchor.dataset.internalPostCategory || '文章',
    readTime: anchor.dataset.internalPostReadTime || '',
    left,
    top,
  }
}

export function InternalPostPreviewScope({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<PreviewState | null>(null)

  const showMouse = (event: MouseEvent<HTMLDivElement>) => {
    const next = previewFromTarget(event.target)
    if (next) setPreview(next)
  }
  const hideMouse = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = event.target instanceof Element ? event.target.closest('a[data-internal-post-id]') : null
    const relatedAnchor = event.relatedTarget instanceof Element ? event.relatedTarget.closest('a[data-internal-post-id]') : null
    if (anchor && anchor !== relatedAnchor) setPreview(null)
  }
  const showFocus = (event: FocusEvent<HTMLDivElement>) => {
    const next = previewFromTarget(event.target)
    if (next) setPreview(next)
  }

  return (
    <div onMouseOver={showMouse} onMouseOut={hideMouse} onFocus={showFocus} onBlur={() => setPreview(null)}>
      {children}
      {preview && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[80] w-[min(360px,calc(100vw-24px))] rounded-2xl border border-theme-border bg-theme-surface/95 p-4 shadow-2xl backdrop-blur-xl"
          style={{ left: preview.left, top: preview.top }}
        >
          <div className="mb-3 flex items-center justify-between gap-3 text-xs text-theme-accent-primary">
            <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />站内文章 · {preview.category}</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold leading-snug text-theme-text-canvas">{preview.title}</h3>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-theme-text-secondary">{preview.excerpt}</p>
          {preview.readTime && <p className="mt-3 inline-flex items-center gap-1 text-xs text-theme-text-tertiary"><Clock3 className="h-3.5 w-3.5" />{preview.readTime} 分钟阅读</p>}
        </div>
      )}
    </div>
  )
}
