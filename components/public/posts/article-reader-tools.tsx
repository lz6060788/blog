'use client'

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useLocale } from 'next-intl'
import { ArrowUp, X } from 'lucide-react'

interface HeadingItem {
  id: string
  text: string
  level: number
}

interface LightboxImage {
  src: string
  alt: string
}

export function ArticleReaderTools({ contentKey }: { contentKey: string }) {
  const isZh = useLocale() === 'zh'
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [activeId, setActiveId] = useState('')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [inArticle, setInArticle] = useState(false)
  const [desktopOutlineOpen, setDesktopOutlineOpen] = useState(false)
  const [lightbox, setLightbox] = useState<LightboxImage | null>(null)
  const mobileToggleRef = useRef<HTMLButtonElement>(null)
  const mobilePanelRef = useRef<HTMLDivElement>(null)
  const desktopOutlineRef = useRef<HTMLOListElement>(null)
  const desktopOutlineRegionRef = useRef<HTMLElement>(null)
  const lightboxReturnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const article = document.querySelector<HTMLElement>('[data-article-reader] .markdown-article')
    if (!article) return
    const headingElements = Array.from(article.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'))
    setHeadings(headingElements.map((heading) => ({
      id: heading.id,
      text: heading.dataset.outlineTitle?.trim() || heading.textContent?.trim() || heading.id,
      level: Number(heading.tagName.slice(1)),
    })))
    setOutlineOpen(false)
    setDesktopOutlineOpen(false)
    if (desktopOutlineRef.current) desktopOutlineRef.current.scrollTop = 0

    let frame = 0
    const updatePosition = () => {
      frame = 0
      let currentId = headingElements[0]?.id || ''
      for (const heading of headingElements) {
        if (heading.getBoundingClientRect().top > 128) break
        currentId = heading.id
      }
      setActiveId(currentId)
      setShowBackToTop(window.scrollY > 480)
      const bounds = article.getBoundingClientRect()
      const isReading = bounds.top <= 128 && bounds.bottom > 128
      setInArticle(isReading)
      if (!isReading) {
        setOutlineOpen(false)
        setDesktopOutlineOpen(false)
      }
    }
    const schedulePosition = () => {
      if (!frame) frame = window.requestAnimationFrame(updatePosition)
    }
    const openImage = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') return
      const image = event.target instanceof Element ? event.target.closest<HTMLImageElement>('img[data-zoomable="true"]') : null
      if (!image) return
      event.preventDefault()
      lightboxReturnFocusRef.current = image
      setLightbox({ src: image.currentSrc || image.src, alt: image.alt || (isZh ? '文章图片' : 'Article image') })
    }
    const resizeObserver = new ResizeObserver(schedulePosition)
    resizeObserver.observe(article)
    updatePosition()
    window.addEventListener('scroll', schedulePosition, { passive: true })
    window.addEventListener('resize', schedulePosition)
    article.addEventListener('click', openImage)
    article.addEventListener('keydown', openImage)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', schedulePosition)
      window.removeEventListener('resize', schedulePosition)
      article.removeEventListener('click', openImage)
      article.removeEventListener('keydown', openImage)
    }
  }, [contentKey, isZh])

  useEffect(() => {
    const list = desktopOutlineRef.current
    const activeLink = list?.querySelector<HTMLElement>('[aria-current="location"]')
    if (!list || !activeLink) return
    const listRect = list.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()
    if (linkRect.top < listRect.top || linkRect.bottom > listRect.bottom) {
      list.scrollTop += linkRect.top - listRect.top - list.clientHeight / 2
    }
  }, [activeId, desktopOutlineOpen, headings])

  useEffect(() => {
    if (!outlineOpen) return
    mobilePanelRef.current?.querySelector<HTMLAnchorElement>('a[aria-current="location"], a')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOutlineOpen(false)
        mobileToggleRef.current?.focus()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !mobilePanelRef.current?.contains(event.target) && !mobileToggleRef.current?.contains(event.target)) setOutlineOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [outlineOpen])

  useEffect(() => {
    if (!lightbox) return
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null)
      // The close button is the only control in this modal.
      if (event.key === 'Tab') event.preventDefault()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      lightboxReturnFocusRef.current?.focus({ preventScroll: true })
    }
  }, [lightbox])

  const minimumLevel = useMemo(() => Math.min(...headings.map((heading) => heading.level)), [headings])
  const navigateToHeading = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    setOutlineOpen(false)
    setActiveId(id)
    window.history.replaceState(window.history.state, '', `#${encodeURIComponent(id)}`)
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }
  const renderLinks = () => headings.map((heading) => (
    <li key={heading.id}>
      <a
        href={`#${encodeURIComponent(heading.id)}`}
        onClick={(event) => navigateToHeading(event, heading.id)}
        aria-current={activeId === heading.id ? 'location' : undefined}
        className="article-outline-link"
        style={{ paddingInlineStart: `${Math.min(heading.level - minimumLevel, 3) * 0.8 + 0.75}rem` }}
      >
        {heading.text}
      </a>
    </li>
  ))
  const outlineLabel = isZh ? '文章目录' : 'On this page'

  return (
    <>
      {headings.length > 0 && (
        <aside
          ref={desktopOutlineRegionRef}
          className="article-outline-desktop"
          aria-label={outlineLabel}
          tabIndex={inArticle ? 0 : -1}
          data-visible={inArticle}
          data-open={desktopOutlineOpen}
          aria-hidden={!inArticle}
          onMouseEnter={() => setDesktopOutlineOpen(true)}
          onMouseLeave={(event) => {
            if (!event.currentTarget.contains(document.activeElement)) setDesktopOutlineOpen(false)
          }}
          onFocusCapture={() => setDesktopOutlineOpen(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setDesktopOutlineOpen(false)
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            desktopOutlineRegionRef.current?.focus({ preventScroll: true })
            setDesktopOutlineOpen(false)
          }}
        >
          <nav aria-label={outlineLabel} className="article-outline-panel">
            <ol id="desktop-article-outline" ref={desktopOutlineRef} className="article-outline-scroll min-h-0 overflow-y-auto">
              {renderLinks()}
            </ol>
          </nav>
        </aside>
      )}
      {headings.length > 0 && (
        <div className="article-outline-mobile" data-visible={inArticle} aria-hidden={!inArticle}>
          <button ref={mobileToggleRef} type="button" onClick={() => setOutlineOpen((open) => !open)} className="article-outline-mobile-trigger fixed bottom-44 right-5 z-40" aria-label={outlineOpen ? (isZh ? '关闭文章目录' : 'Close outline') : outlineLabel} aria-expanded={outlineOpen} aria-controls="mobile-article-outline">
            {outlineOpen ? (isZh ? '收起目录' : 'Close outline') : (isZh ? '目录' : 'Contents')}
          </button>
          {outlineOpen && (
            <div ref={mobilePanelRef} id="mobile-article-outline" className="article-outline-mobile-panel fixed bottom-60 right-5 z-40 flex max-h-[min(55dvh,32rem)] w-[min(21rem,calc(100vw-2.5rem))] flex-col">
              <nav aria-label={outlineLabel} className="article-outline-scroll min-h-0 overflow-y-auto"><ol>{renderLinks()}</ol></nav>
            </div>
          )}
        </div>
      )}
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })} className={`article-reader-button fixed bottom-28 right-5 z-40 transition-opacity motion-reduce:transition-none ${showBackToTop ? 'opacity-100' : 'pointer-events-none opacity-0'}`} tabIndex={showBackToTop ? 0 : -1} aria-label={isZh ? '回到顶部' : 'Back to top'}>
        <ArrowUp className="h-4 w-4" />
      </button>
      {lightbox && createPortal(
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm md:p-10" role="dialog" aria-modal="true" aria-label={lightbox.alt} onClick={() => setLightbox(null)}>
          <button type="button" onClick={() => setLightbox(null)} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/80" aria-label={isZh ? '关闭图片预览' : 'Close image'} autoFocus>
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.src} alt={lightbox.alt} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
        </div>,
        document.body,
      )}
    </>
  )
}
