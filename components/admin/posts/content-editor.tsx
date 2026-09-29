'use client'

import { useEffect, useRef, useState } from 'react'
import { MilkdownEditor, type MilkdownEditorRef } from '@/components/editor/milkdown/milkdown-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { embedFence, safeMediaUrl } from '@/lib/article-embeds'
import { previewArticle } from '@/server/actions/article-preview'
import { toast } from 'react-hot-toast'

export function ContentEditor({ content, onChange, theme }: { content: string; onChange: (value: string) => void; theme: 'light' | 'dark' }) {
  const editor = useRef<MilkdownEditorRef>(null)
  // Raw HTML has no lossless rich-text representation; keep its source intact.
  const hasRawHtml = /^\s*</m.test(content)
  const [mode, setMode] = useState<'rich' | 'source' | 'preview'>(hasRawHtml ? 'source' : 'rich')
  const [kind, setKind] = useState<'video' | 'audio' | 'html-preview' | 'embed'>('video')
  const [source, setSource] = useState('')
  const [showInsert, setShowInsert] = useState(false)
  const [html, setHtml] = useState('')
  const [previewError, setPreviewError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mode !== 'preview') return
    let active = true
    setLoading(true)
    setPreviewError('')
    void previewArticle(content).then((result) => { if (active) setHtml(result) }).catch((error) => {
      if (active) setPreviewError(error instanceof Error ? error.message : '预览失败')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [content, mode])

  const insert = () => {
    if (!source.trim()) return toast.error('请填写内容')
    if (kind !== 'html-preview' && !safeMediaUrl(source)) return toast.error('请输入 HTTPS 地址或以 / 开头的站内路径')
    const block = embedFence(kind, source)
    if (mode === 'rich' && !hasRawHtml) editor.current?.insertMarkdown(`\n\n${block}\n\n`)
    else onChange(`${content.trimEnd()}\n\n${block}\n`)
    setSource('')
    setShowInsert(false)
  }

  return <section className="min-w-0 space-y-3">
    <div className="flex flex-wrap gap-2" aria-label="正文编辑模式">
      <Button variant={mode === 'rich' && !hasRawHtml ? 'default' : 'outline'} size="sm" disabled={hasRawHtml} onClick={() => setMode('rich')}>可视化编辑</Button>
      <Button variant={mode === 'source' || (mode === 'rich' && hasRawHtml) ? 'default' : 'outline'} size="sm" onClick={() => setMode('source')}>源码</Button>
      <Button variant={mode === 'preview' ? 'default' : 'outline'} size="sm" onClick={() => setMode('preview')}>文章预览</Button>
      <Button variant="outline" size="sm" onClick={() => setShowInsert(!showInsert)}>插入视频 / HTML</Button>
    </div>
    {showInsert && <div className="space-y-3 rounded-xl border border-theme-border bg-theme-surface p-4">
      <label className="block text-sm">内容类型 <select aria-label="内容类型" value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} className="ml-2 rounded border border-theme-border bg-theme-surface p-2">
        <option value="video">视频地址</option><option value="audio">音频地址</option><option value="html-preview">HTML 源码</option><option value="embed">网页地址</option>
      </select></label>
      {kind === 'html-preview' ? <textarea aria-label="HTML 源码" value={source} onChange={(event) => setSource(event.target.value)} rows={8} className="w-full rounded border border-theme-border bg-theme-surface p-3 font-mono text-sm" placeholder="粘贴 HTML，可包含样式与交互脚本" /> : <Input aria-label="媒体地址" value={source} onChange={(event) => setSource(event.target.value)} placeholder={kind === 'embed' ? 'https://example.com/demo.html' : 'https://example.com/video.mp4'} />}
      <p className="text-xs text-theme-text-secondary">视频使用可直接播放的文件地址。HTML 在独立窗口区域内运行；网页需允许被嵌入。插入后可在源码中修改，预览与详情页使用相同渲染规则。</p>
      <Button size="sm" onClick={insert}>插入正文</Button>
    </div>}
    {mode === 'preview' ? <div className="min-h-[640px] rounded-xl border border-theme-border bg-theme-surface p-5">
      {loading ? <p role="status">正在生成预览…</p> : previewError ? <p role="alert">{previewError}</p> : <div className="markdown-article-wrapper"><div className="markdown-article" dangerouslySetInnerHTML={{ __html: html }} /></div>}
    </div> : mode === 'source' || hasRawHtml ? <div>
      {hasRawHtml && <p className="mb-2 text-xs text-theme-text-secondary">包含 HTML 的正文使用源码编辑，以完整保留内容。</p>}
      <textarea aria-label="文章 Markdown 源码" value={content} onChange={(event) => onChange(event.target.value)} spellCheck={false} className="min-h-[640px] w-full rounded-xl border border-theme-border bg-theme-surface p-4 font-mono text-sm leading-6" />
    </div> : <MilkdownEditor ref={editor} initialValue={content} onChange={onChange} theme={theme} className="min-h-[640px]" />}
  </section>
}
