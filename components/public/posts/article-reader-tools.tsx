'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUp, ChevronDown, ChevronRight, ListTree, X } from 'lucide-react'

interface HeadingItem {
  id: string
  text: string
  level: number
}

interface HeadingNode extends HeadingItem {
  children: HeadingNode[]
}

interface LightboxImage {
  src: string
  alt: string
}

function buildHeadingTree(headings: HeadingItem[]): HeadingNode[] {
  const roots: HeadingNode[] = []
  const stack: HeadingNode[] = []

  headings.forEach((heading) => {
    const node: HeadingNode = { ...heading, children: [] }
    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop()
    }
    const parent = stack[stack.length - 1]
    if (parent) parent.children.push(node)
    else roots.push(node)
    stack.push(node)
  })

  return roots
}

export function ArticleReaderTools() {
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [activeId, setActiveId] = useState('')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [outlineCollapsed, setOutlineCollapsed] = useState(false)
  const [lightbox, setLightbox] = useState<LightboxImage | null>(null)
  const [collapsedHeadingIds, setCollapsedHeadingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const article = document.querySelector<HTMLElement>('.markdown-article')
    if (!article) return

    const headingElements = Array.from(
      article.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
    )
    setHeadings(headingElements.map((heading) => ({
      id: heading.id,
      text: heading.textContent?.trim() || heading.id,
      level: Number(heading.tagName.slice(1)),
    })))

    const updateActiveHeading = () => {
      const readingLine = window.scrollY + 144
      let currentId = headingElements[0]?.id || ''

      for (const heading of headingElements) {
        const headingTop = heading.getBoundingClientRect().top + window.scrollY
        if (headingTop > readingLine) break
        currentId = heading.id
      }

      setActiveId(currentId)
      setShowBackToTop(window.scrollY > 480)
    }
    const openImage = (image: HTMLImageElement) => {
      setLightbox({ src: image.currentSrc || image.src, alt: image.alt || '文章图片' })
    }
    const handleArticleClick = (event: MouseEvent) => {
      const image = (event.target as Element).closest<HTMLImageElement>('img[data-zoomable="true"]')
      if (!image) return
      event.preventDefault()
      openImage(image)
    }
    const handleArticleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      const image = (event.target as Element).closest<HTMLImageElement>('img[data-zoomable="true"]')
      if (!image) return
      event.preventDefault()
      openImage(image)
    }

    updateActiveHeading()
    window.addEventListener('scroll', updateActiveHeading, { passive: true })
    article.addEventListener('click', handleArticleClick)
    article.addEventListener('keydown', handleArticleKeyDown)
    return () => {
      window.removeEventListener('scroll', updateActiveHeading)
      article.removeEventListener('click', handleArticleClick)
      article.removeEventListener('keydown', handleArticleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!lightbox) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setLightbox(null)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [lightbox])

  const headingTree = useMemo(() => buildHeadingTree(headings), [headings])

  const toggleHeading = (id: string) => {
    setCollapsedHeadingIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderHeadingNodes = (nodes: HeadingNode[]) => nodes.map((heading) => {
    const hasChildren = heading.children.length > 0
    const isCollapsed = collapsedHeadingIds.has(heading.id)
    const isActive = activeId === heading.id

    return (
      <li key={heading.id}>
        <div className="flex items-start gap-0.5">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleHeading(heading.id)}
              className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-theme-text-tertiary transition-colors hover:bg-theme-muted hover:text-theme-text-canvas"
              aria-label={isCollapsed ? `展开 ${heading.text}` : `收起 ${heading.text}`}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="h-5 w-5 shrink-0" />
          )}
          <a
            href={`#${heading.id}`}
            title={heading.text}
            onClick={() => setOutlineOpen(false)}
            className={`min-w-0 flex-1 truncate rounded-md px-1.5 py-1 text-xs leading-4 transition-colors ${
              isActive
                ? 'bg-theme-accent-bg text-theme-accent-primary'
                : 'text-theme-text-secondary hover:bg-theme-muted hover:text-theme-text-canvas'
            }`}
          >
            {heading.text}
          </a>
        </div>
        {hasChildren && !isCollapsed && (
          <ol className="ml-2.5 border-l border-theme-border pl-1.5">
            {renderHeadingNodes(heading.children)}
          </ol>
        )}
      </li>
    )
  })

  const outline = (
    <nav aria-label="文章目录" className="flex max-h-[inherit] min-h-0 flex-col">
      <button
        type="button"
        onClick={() => setOutlineCollapsed((collapsed) => !collapsed)}
        className={`flex w-full shrink-0 items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-xs font-semibold text-theme-text-canvas transition-colors hover:bg-theme-muted ${outlineCollapsed ? '' : 'mb-2'}`}
        aria-label={outlineCollapsed ? '展开文章目录' : '收起文章目录'}
        aria-expanded={!outlineCollapsed}
      >
        <ListTree className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1">文章目录</span>
        {outlineCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-theme-text-tertiary" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-theme-text-tertiary" />
        )}
      </button>
      {!outlineCollapsed && (
        <ol className="article-outline-scroll min-h-0 flex-1 space-y-0.5 overflow-y-auto border-t border-theme-border pt-2 pr-1">
          {renderHeadingNodes(headingTree)}
        </ol>
      )}
    </nav>
  )

  return (
    <>
      {headings.length > 0 && (
        <aside className="fixed right-12 top-24 z-30 hidden max-h-[calc(100vh-12rem)] w-56 overflow-hidden rounded-xl border border-theme-card bg-theme-card-bg/95 p-4 shadow-card backdrop-blur-md 2xl:block">
          {outline}
        </aside>
      )}
      {headings.length > 0 && (
        <div className="2xl:hidden">
          <button type="button" onClick={() => setOutlineOpen((open) => !open)} className="fixed bottom-28 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-theme-border bg-theme-surface/90 text-theme-text-canvas shadow-card backdrop-blur-md" aria-label={outlineOpen ? '关闭文章目录' : '打开文章目录'} aria-expanded={outlineOpen}>
            {outlineOpen ? <X className="h-5 w-5" /> : <ListTree className="h-5 w-5" />}
          </button>
          {outlineOpen && (
            <div className="fixed bottom-44 right-6 z-40 max-h-[60vh] w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-theme-border bg-theme-surface p-5 shadow-card">
              {outline}
            </div>
          )}
        </div>
      )}
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-theme-border bg-theme-surface/90 text-theme-text-canvas shadow-card backdrop-blur-md transition-all 2xl:right-12 ${showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`} aria-label="回到顶部">
        <ArrowUp className="h-5 w-5" />
      </button>
      {lightbox && createPortal(
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm md:p-10" role="dialog" aria-modal="true" aria-label={lightbox.alt} onClick={() => setLightbox(null)}>
          <button type="button" onClick={() => setLightbox(null)} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/80" aria-label="关闭图片预览" autoFocus>
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.src} alt={lightbox.alt} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
        </div>,
        document.body
      )}
    </>
  )
}
