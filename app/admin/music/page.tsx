'use client'

import { useState, useEffect } from 'react'
import { Music, Plus, Upload, Trash2, Play, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { LyricsEditor } from '@/components/admin/music/lyrics-editor'

export const dynamic = 'force-dynamic'

interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  audioUrl: string
  lyrics?: string
  createdAt: string
}

export default function MusicPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showLyricsEditor, setShowLyricsEditor] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // 设置页面标题
  useEffect(() => {
    document.title = '音乐管理 - 管理后台'
  }, [])

  useEffect(() => {
    loadSongs()
  }, [])

  async function loadSongs() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/music/songs')
      if (!response.ok) throw new Error('获取歌曲列表失败')

      const data = await response.json()
      setSongs(data.data || [])
    } catch (error) {
      toast.error('加载歌曲失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这首歌吗？')) return
    try {
      const response = await fetch(`/api/music/songs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除失败')

      toast.success('删除成功')
      loadSongs()
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-theme-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-theme-text-canvas">音乐管理</h1>
          <p className="text-sm text-theme-text-secondary mt-1">
            管理音乐库（共 {songs.length} 首）
          </p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
          <Upload className="w-4 h-4" />
          上传音乐
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-theme-bg-surface border border-theme-border rounded-xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-b border-theme-border hover:bg-transparent">
              <TableHead className="text-theme-text-secondary font-medium">歌曲</TableHead>
              <TableHead className="text-theme-text-secondary font-medium">艺术家</TableHead>
              <TableHead className="text-theme-text-secondary font-medium">专辑</TableHead>
              <TableHead className="text-theme-text-secondary font-medium">时长</TableHead>
              <TableHead className="text-theme-text-secondary font-medium text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Music className="w-12 h-12 text-theme-text-tertiary" />
                    <p className="text-theme-text-secondary">还没有任何音乐</p>
                    <Button onClick={() => setShowUploadDialog(true)} variant="outline" className="gap-2">
                      <Upload className="w-4 h-4" />
                      上传第一首歌
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              songs.map((song) => (
                <TableRow
                  key={song.id}
                  className="border-b border-theme-border hover:bg-theme-bg-muted"
                >
                  <TableCell className="font-medium text-theme-text-canvas">{song.title}</TableCell>
                  <TableCell className="text-theme-text-secondary">{song.artist}</TableCell>
                  <TableCell className="text-theme-text-tertiary">{song.album || '-'}</TableCell>
                  <TableCell className="text-theme-text-secondary">{formatDuration(song.duration)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedSong(song)
                          setShowLyricsEditor(true)
                        }}
                        title="编辑歌词"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="播放">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(song.id)}
                        className="text-theme-error-primary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {showUploadDialog && (
        <UploadDialog
          onClose={() => setShowUploadDialog(false)}
          onUploaded={() => {
            loadSongs()
            setShowUploadDialog(false)
          }}
        />
      )}

      {showLyricsEditor && selectedSong && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-bg-surface border border-theme-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <LyricsEditor
              initialLyrics={selectedSong.lyrics}
              songId={selectedSong.id}
              onSave={async (lyrics) => {
                try {
                  const response = await fetch(`/api/music/songs/${selectedSong.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lyrics }),
                  })

                  if (!response.ok) throw new Error('保存失败')

                  toast.success('歌词保存成功')
                  loadSongs()
                  setShowLyricsEditor(false)
                } catch (error) {
                  toast.error('保存失败')
                }
              }}
              onCancel={() => {
                setShowLyricsEditor(false)
                setSelectedSong(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// 上传对话框组件
function UploadDialog({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证文件类型
      const validTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/aac']
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|ogg|wav|flac|m4a|aac)$/i)) {
        toast.error('请选择音频文件（mp3, ogg, wav, flac, m4a, aac）')
        return
      }

      // 验证文件大小（50MB）
      if (file.size > 50 * 1024 * 1024) {
        toast.error('文件大小不能超过 50MB')
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('请选择文件')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Extract duration client-side
      let duration = 0
      try {
        const audio = new Audio()
        const objectUrl = URL.createObjectURL(selectedFile)

        duration = await new Promise<number>((resolve, reject) => {
          audio.addEventListener('loadedmetadata', () => {
            URL.revokeObjectURL(objectUrl)
            if (audio.duration && !isNaN(audio.duration)) {
              resolve(Math.round(audio.duration))
            } else {
              reject(new Error('无法获取音频时长'))
            }
          })

          audio.addEventListener('error', () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('音频加载失败'))
          })

          audio.src = objectUrl
        })

        console.log('提取的音频时长:', duration)
      } catch (error) {
        console.error('提取音频时长失败:', error)
        toast.error('无法获取音频时长，请重试')
        setIsUploading(false)
        setUploadProgress(0)
        return
      }

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('duration', duration.toString())

      // 模拟进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/music/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '上传失败')
      }

      toast.success('上传成功')
      onUploaded()
    } catch (error: any) {
      toast.error(error.message || '上传失败')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-theme-text-canvas mb-4">上传音乐</h2>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-theme-border rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".mp3,.ogg,.wav,.flac,.m4a,.aac,audio/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
              id="audio-file-input"
            />
            <label
              htmlFor="audio-file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-12 h-12 text-theme-text-tertiary" />
              <span className="text-theme-text-secondary">
                {selectedFile ? selectedFile.name : '点击选择音频文件'}
              </span>
              <span className="text-xs text-theme-text-tertiary">
                支持 MP3, OGG, WAV, FLAC, M4A, AAC（最大 50MB）
              </span>
            </label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-theme-text-secondary">上传中...</span>
                <span className="text-theme-text-secondary">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-theme-bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-theme-accent-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              取消
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? '上传中...' : '上传'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
