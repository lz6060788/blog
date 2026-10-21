'use client'

import { useEffect, useRef, useState } from 'react'
import { MilkdownEditor, type EmbedDialogKind, type EmbedDialogRequest, type MilkdownEditorRef } from '@/components/editor/milkdown/milkdown-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { uploadFile } from '@/lib/api/upload'
import type { FileValidationConfig } from '@/lib/types/upload'
import { embedFence, safeMediaUrl } from '@/lib/article-embeds'
import { previewArticle } from '@/server/actions/article-preview'
import { toast } from 'react-hot-toast'

const FILE_POLICIES: Record<EmbedDialogKind, FileValidationConfig> = {
  video: { maxSize: 100 * 1024 * 1024, allowedExtensions: ['mp4', 'mov', 'webm'] },
  audio: { maxSize: 50 * 1024 * 1024, allowedExtensions: ['mp3', 'ogg', 'wav', 'flac', 'm4a', 'aac'] },
  html: { maxSize: 10 * 1024 * 1024, allowedExtensions: ['html', 'htm'] },
  webpage: { maxSize: 0, allowedExtensions: [] },
}

const FILE_ACCEPT: Record<EmbedDialogKind, string> = {
  video: '.mp4,.mov,.webm,video/mp4,video/quicktime,video/webm',
  audio: '.mp3,.ogg,.wav,.flac,.m4a,.aac,audio/*',
  html: '.html,.htm,text/html',
  webpage: '',
}

const KIND_LABEL: Record<EmbedDialogKind, string> = {
  video: '视频',
  audio: '音频',
  html: 'HTML 内容',
  webpage: '网页',
}

type InputMode = 'url' | 'file' | 'source'

export function ContentEditor({ content, onChange, theme }: { content: string; onChange: (value: string) => void; theme: 'light' | 'dark' }) {
  const editor = useRef<MilkdownEditorRef>(null)
  const [mode, setMode] = useState<'rich' | 'source' | 'preview'>('rich')
  const [dialog, setDialog] = useState<EmbedDialogRequest | null>(null)
  const [inputMode, setInputMode] = useState<InputMode>('url')
  const [source, setSource] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
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

  const openEmbedDialog = (request: EmbedDialogRequest) => {
    setDialog(request)
    setSource(request.source || '')
    setFile(null)
    setInputMode(request.kind === 'html' && !(request.range && request.source && safeMediaUrl(request.source)) ? 'source' : 'url')
  }

  const closeDialog = () => {
    if (uploading) return
    setDialog(null)
    setFile(null)
  }

  const insertBlock = (kind: EmbedDialogKind, url: string, range?: { from: number; to: number }) => {
    const blockKind = kind === 'html' ? 'html-url' : kind === 'webpage' ? 'embed' : kind
    const markdown = embedFence(blockKind, url)
    if (range) {
      editor.current?.replaceMarkdownRange(range, `\n\n${markdown}\n\n`)
    } else {
      editor.current?.insertMarkdown(`\n\n${markdown}\n\n`)
    }
  }

  const confirmInsert = async () => {
    if (!dialog || uploading) return
    let url = ''
    let upload: File | null = file

    if (inputMode === 'url') {
      url = source.trim()
      if (!safeMediaUrl(url)) return toast.error('请输入 HTTPS 地址或以 / 开头的站内路径')
    } else if (inputMode === 'source') {
      if (!source.trim()) return toast.error('请填写 HTML 源码')
      upload = new File([source], 'embedded-content.html', { type: 'text/html' })
    }

    if (!url && !upload) return toast.error(dialog.kind === 'html' ? '请选择 HTML 文件或填写源码' : `请选择${KIND_LABEL[dialog.kind]}文件`)

    if (upload) {
      if (dialog.kind === 'webpage') return toast.error('网页嵌入请填写在线 URL')
      if (upload.size === 0) return toast.error('文件不能为空')
      setUploading(true)
      try {
        const result = await uploadFile({ file: upload, validation: FILE_POLICIES[dialog.kind] })
        url = result.url
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '上传失败，请稍后重试')
        return
      } finally {
        setUploading(false)
      }
    }

    if (!safeMediaUrl(url)) return toast.error('上传未返回有效链接，请重试')
    if (dialog.range) insertBlock(dialog.kind, url, dialog.range)
    else insertBlock(dialog.kind, url)
    setDialog(null)
    setFile(null)
    setSource('')
  }

  const isHtml = dialog?.kind === 'html'
  const acceptsUrl = dialog?.kind !== 'html' || Boolean(dialog.range)

  return <>
    <section className="min-w-0 space-y-3">
      <div className="flex flex-wrap gap-2" aria-label="正文编辑模式">
        <Button variant={mode === 'rich' ? 'default' : 'outline'} size="sm" onClick={() => setMode('rich')}>可视化编辑</Button>
        <Button variant={mode === 'source' ? 'default' : 'outline'} size="sm" onClick={() => setMode('source')}>源码</Button>
        <Button variant={mode === 'preview' ? 'default' : 'outline'} size="sm" onClick={() => setMode('preview')}>文章预览</Button>
      </div>
      {mode === 'preview' ? <div className="min-h-[640px] rounded-xl border border-theme-border bg-theme-surface p-5">
        {loading ? <p role="status">正在生成预览…</p> : previewError ? <p role="alert">{previewError}</p> : <div className="markdown-article-wrapper"><div className="markdown-article" dangerouslySetInnerHTML={{ __html: html }} /></div>}
      </div> : mode === 'source' ? <div>
        <p className="mb-2 text-xs text-theme-text-secondary">可直接编辑 Markdown 和嵌入语法；切换回可视化编辑不会锁定或清空正文。</p>
        <textarea aria-label="文章 Markdown 源码" value={content} onChange={(event) => onChange(event.target.value)} spellCheck={false} className="min-h-[640px] w-full rounded-xl border border-theme-border bg-theme-surface p-4 font-mono text-sm leading-6" />
      </div> : <MilkdownEditor ref={editor} initialValue={content} onChange={onChange} onOpenEmbedDialog={openEmbedDialog} theme={theme} className="min-h-[640px]" />}
    </section>

    <Dialog open={Boolean(dialog)} onOpenChange={(open) => { if (!open) closeDialog() }}>
      {dialog && <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{dialog.range ? `编辑${KIND_LABEL[dialog.kind]}` : `插入${KIND_LABEL[dialog.kind]}`}</DialogTitle>
          <DialogDescription>
            {dialog.kind === 'html' ? 'HTML 源码或文件会先上传到对象存储，正文只保存生成的链接。' : dialog.kind === 'webpage' ? '填写允许嵌入的网页地址。' : `填写在线${KIND_LABEL[dialog.kind]}地址，或上传文件到对象存储后插入链接。`}
          </DialogDescription>
        </DialogHeader>

        {acceptsUrl && <div className="flex gap-2" role="tablist" aria-label="内容来源">
          <Button type="button" size="sm" variant={inputMode === 'url' ? 'default' : 'outline'} onClick={() => { setInputMode('url'); setFile(null) }}>在线 URL</Button>
          {dialog.kind !== 'webpage' && <Button type="button" size="sm" variant={inputMode === 'file' ? 'default' : 'outline'} onClick={() => { setInputMode('file'); setFile(null) }}>上传文件</Button>}
        </div>}
        {isHtml && <div className="flex gap-2" role="tablist" aria-label="HTML 来源">
          {dialog.range && <Button type="button" size="sm" variant={inputMode === 'url' ? 'default' : 'outline'} onClick={() => { setInputMode('url'); setFile(null) }}>链接</Button>}
          <Button type="button" size="sm" variant={inputMode === 'source' ? 'default' : 'outline'} onClick={() => { setInputMode('source'); setFile(null) }}>粘贴源码</Button>
          <Button type="button" size="sm" variant={inputMode === 'file' ? 'default' : 'outline'} onClick={() => { setInputMode('file'); setFile(null) }}>上传 HTML 文件</Button>
        </div>}

        {inputMode === 'url' && <Input aria-label={`${KIND_LABEL[dialog.kind]}在线地址`} value={source} onChange={(event) => setSource(event.target.value)} placeholder={dialog.kind === 'webpage' ? 'https://example.com/page' : `https://example.com/${dialog.kind === 'video' ? 'video.mp4' : 'audio.mp3'}`} />}
        {inputMode === 'source' && <Textarea aria-label="HTML 源码" value={source} onChange={(event) => setSource(event.target.value)} rows={10} className="font-mono text-sm" placeholder="粘贴 HTML 源码" />}
        {inputMode === 'file' && dialog.kind !== 'webpage' && <div className="space-y-2">
          <Input aria-label={`选择${KIND_LABEL[dialog.kind]}文件`} type="file" accept={FILE_ACCEPT[dialog.kind]} onChange={(event) => setFile(event.target.files?.[0] || null)} />
          {file && <p className="text-xs text-theme-text-secondary">{file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB</p>}
          <p className="text-xs text-theme-text-secondary">{dialog.kind === 'video' ? '支持 MP4、MOV、WebM，最大 100 MB。' : dialog.kind === 'audio' ? '支持 MP3、OGG、WAV、FLAC、M4A、AAC，最大 50 MB。' : '支持 HTML/HTM，最大 10 MB。'}</p>
        </div>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeDialog} disabled={uploading}>取消</Button>
          <Button type="button" onClick={() => void confirmInsert()} disabled={uploading}>{uploading ? '正在上传…' : dialog.range ? '保存修改' : '插入正文'}</Button>
        </DialogFooter>
      </DialogContent>}
    </Dialog>
  </>
}
