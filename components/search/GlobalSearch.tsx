'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Clock, MagnifyingGlass, X } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/app/i18n/routing'
import type { SearchResult } from '@/lib/types'

export function GlobalSearch() {
  const t = useTranslations('search')
  const articleT = useTranslations('article')
  const pathname = usePathname()
  const router = useRouter()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [shortcut, setShortcut] = useState('Ctrl K')

  useEffect(() => {
    setMounted(true)
    setShortcut(navigator.platform.toLowerCase().includes('mac') ? '⌘ K' : 'Ctrl K')
  }, [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(current => !current)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 20)
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      setResults([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Search request failed')
        const payload = (await response.json()) as { results?: SearchResult[] }
        setResults(payload.results || [])
        setActiveIndex(0)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setResults([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 180)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const selectResult = (result: SearchResult) => {
    setOpen(false)
    router.push(`/post/${result.id}`)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!results.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(index => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(index => (index - 1 + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      selectResult(results[activeIndex])
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('label')}
        className="hidden lg:flex h-10 w-56 items-center gap-2 rounded-full border border-theme-border bg-theme-surface px-3 text-theme-text-secondary shadow-sm transition-colors hover:border-theme-accent-primary hover:text-theme-text-canvas"
      >
        <MagnifyingGlass size={16} />
        <span className="min-w-0 flex-1 truncate text-left text-sm">{t('label')}</span>
        <kbd className="rounded-md border border-theme-border-muted bg-theme-surface-alt px-1.5 py-0.5 font-mono text-[10px] text-theme-text-tertiary">
          {shortcut}
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('label')}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-theme-border bg-theme-surface text-theme-text-secondary shadow-sm transition-colors hover:border-theme-accent-primary hover:text-theme-text-canvas lg:hidden"
      >
        <MagnifyingGlass size={18} />
      </button>

      {mounted && open && createPortal(
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/45 px-3 py-4 backdrop-blur-sm sm:px-6 sm:py-16"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${inputId}-title`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-theme-border bg-theme-card-bg shadow-2xl">
            <div className="flex items-center gap-3 border-b border-theme-border px-4 py-4 sm:px-6">
              <MagnifyingGlass size={21} className="shrink-0 text-theme-accent-primary" />
              <div className="min-w-0 flex-1">
                <h2 id={`${inputId}-title`} className="sr-only">{t('title')}</h2>
                <input
                  ref={inputRef}
                  id={inputId}
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={t('placeholder')}
                  autoComplete="off"
                  className="w-full bg-transparent text-base text-theme-text-canvas outline-none placeholder:text-theme-text-tertiary sm:text-lg"
                  aria-controls={`${inputId}-results`}
                />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-theme-text-tertiary transition-colors hover:bg-theme-surface-alt hover:text-theme-text-canvas"
              >
                <X size={18} />
              </button>
            </div>

            <div id={`${inputId}-results`} className="max-h-[min(68vh,36rem)] overflow-y-auto p-2 sm:p-3">
              {!query.trim() && (
                <div className="px-4 py-16 text-center">
                  <p className="text-sm text-theme-text-secondary">{t('hint')}</p>
                  <p className="mt-3 font-mono text-xs text-theme-text-tertiary">{shortcut}</p>
                </div>
              )}
              {query.trim() && loading && (
                <div className="px-4 py-16 text-center text-sm text-theme-text-secondary">{t('searching')}</div>
              )}
              {query.trim() && !loading && results.length === 0 && (
                <div className="px-4 py-16 text-center text-sm text-theme-text-secondary">{t('noResults')}</div>
              )}
              {!loading && results.length > 0 && (
                <>
                  <p className="px-3 pb-2 pt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-theme-text-tertiary">
                    {t('resultCount', { count: results.length })}
                  </p>
                  <div className="space-y-1">
                    {results.map((result, index) => (
                      <Link
                        key={result.id}
                        href={`/post/${result.id}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => setOpen(false)}
                        className={`group block rounded-2xl border px-4 py-3 transition-colors ${
                          activeIndex === index
                            ? 'border-theme-accent-primary bg-theme-accent-bg'
                            : 'border-transparent hover:bg-theme-surface-alt'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium text-theme-text-canvas">{result.title}</h3>
                              <span className="rounded-full bg-theme-surface-alt px-2 py-0.5 text-[11px] text-theme-accent-primary">
                                {result.category}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-theme-text-secondary">
                              {result.snippet || result.excerpt}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-theme-text-tertiary">
                              <Clock size={12} />
                              <span>{articleT('minutesRead', { count: result.readTime })}</span>
                              {result.tags.slice(0, 2).map(tag => <span key={tag}>#{tag}</span>)}
                            </div>
                          </div>
                          <ArrowRight size={17} className="mt-1 shrink-0 text-theme-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-theme-accent-primary" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
