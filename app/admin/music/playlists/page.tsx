'use client'

import { useState, useEffect } from 'react'
import { ListMusic, Plus, Edit, Trash2, Play, Music as MusicIcon } from 'lucide-react'
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
import { Dialog } from '@/components/ui/dialog'

interface Playlist {
  id: string
  name: string
  description?: string
  coverColor: string
  isPublic: boolean
  createdAt: string
  songs?: Song[]
}

interface Song {
  id: string
  title: string
  artist: string
  duration: number
}

export const dynamic = 'force-dynamic'

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [showSongsDialog, setShowSongsDialog] = useState(false)
  const [showAddSongsDialog, setShowAddSongsDialog] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

  useEffect(() => {
    document.title = '歌单管理 - 管理后台'
  }, [])

  useEffect(() => {
    loadPlaylists()
    loadSongs()
  }, [])

  async function loadPlaylists() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/music/playlists')
      if (!response.ok) throw new Error('获取歌单列表失败')

      const data = await response.json()
      setPlaylists(data || [])
    } catch (error) {
      toast.error('加载歌单失败')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadSongs() {
    try {
      const response = await fetch('/api/music/songs')
      if (!response.ok) throw new Error('获取歌曲列表失败')

      const data = await response.json()
      setAllSongs(data.data || [])
    } catch (error) {
      console.error('加载歌曲失败:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个歌单吗？歌单中的歌曲也会被移除。')) return
    try {
      const response = await fetch(`/api/music/playlists/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除失败')

      toast.success('删除成功')
      loadPlaylists()
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist)
    setShowDialog(true)
  }

  const handleCreate = () => {
    setEditingPlaylist(null)
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingPlaylist(null)
  }

  const handleSaved = () => {
    loadPlaylists()
    handleCloseDialog()
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
          <h1 className="text-2xl font-semibold text-theme-text-canvas">歌单管理</h1>
          <p className="text-sm text-theme-text-secondary mt-1">
            管理音乐歌单（共 {playlists.length} 个）
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          新建歌单
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {playlists.length === 0 ? (
          <div className="col-span-full bg-theme-surface border border-theme-border rounded-xl p-12 text-center">
            <ListMusic className="w-12 h-12 text-theme-text-tertiary mx-auto mb-2" />
            <p className="text-theme-text-secondary">还没有任何歌单</p>
            <Button onClick={handleCreate} variant="outline" className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              创建第一个歌单
            </Button>
          </div>
        ) : (
          playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-theme-surface border border-theme-border rounded-xl overflow-hidden hover:border-theme-accent-primary transition-colors"
            >
              {/* 歌单封面 */}
              <div
                className="h-32 relative"
                style={{
                  background: `linear-gradient(135deg, ${playlist.coverColor} 0%, ${playlist.coverColor}dd 100%)`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <ListMusic className="w-16 h-16 text-white/30" />
                </div>
              </div>

              {/* 歌单信息 */}
              <div className="p-4">
                <h3 className="font-semibold text-theme-text-canvas truncate">
                  {playlist.name}
                </h3>
                <p className="text-sm text-theme-text-secondary mt-1 line-clamp-2">
                  {playlist.description || '暂无描述'}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-theme-text-tertiary">
                  <span>{playlist.songs?.length || 0} 首歌曲</span>
                  <span>•</span>
                  <span>{playlist.isPublic ? '公开' : '私有'}</span>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedPlaylist(playlist)
                      setShowSongsDialog(true)
                    }}
                    title="查看歌曲"
                  >
                    <MusicIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(playlist)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(playlist.id)}
                    className="text-theme-error-primary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {showDialog && (
        <PlaylistForm
          playlist={editingPlaylist}
          onSave={handleSaved}
          onCancel={handleCloseDialog}
        />
      )}

      {showSongsDialog && selectedPlaylist && (
        <PlaylistSongsDialog
          playlist={selectedPlaylist}
          allSongs={allSongs}
          onClose={() => {
            setShowSongsDialog(false)
            setSelectedPlaylist(null)
            loadPlaylists()
          }}
        />
      )}
    </div>
  )
}

// 歌单歌曲列表对话框
function PlaylistSongsDialog({
  playlist,
  allSongs,
  onClose
}: {
  playlist: Playlist
  allSongs: Song[]
  onClose: () => void
}) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleRemoveSong = async (songId: string) => {
    if (!confirm('确定要从歌单中移除这首歌吗？')) return

    try {
      const response = await fetch(`/api/music/playlists/${playlist.id}/songs/${songId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('移除失败')

      toast.success('移除成功')
      onClose()
    } catch (error: any) {
      toast.error(error.message || '移除失败')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface border border-theme-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-theme-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-theme-text-canvas">{playlist.name}</h3>
            <p className="text-sm text-theme-text-secondary">
              共 {playlist.songs?.length || 0} 首歌曲
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              添加歌曲
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        {/* 歌曲列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {(!playlist.songs || playlist.songs.length === 0) ? (
            <div className="text-center py-12">
              <MusicIcon className="w-12 h-12 text-theme-text-tertiary mx-auto mb-2" />
              <p className="text-theme-text-secondary">歌单还没有歌曲</p>
              <Button onClick={() => setShowAddDialog(true)} variant="outline" className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                添加歌曲
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {playlist.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-3 bg-theme-canvas border border-theme-border rounded-lg"
                >
                  <span className="text-xs text-theme-text-tertiary font-mono w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-theme-text-canvas truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-theme-text-secondary truncate">
                      {song.artist}
                    </p>
                  </div>
                  <span className="text-xs text-theme-text-tertiary font-mono">
                    {formatDuration(song.duration)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSong(song.id)}
                    className="text-theme-error-primary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddDialog && (
          <AddSongsDialog
            playlist={playlist}
            allSongs={allSongs}
            onClose={() => {
              setShowAddDialog(false)
              onClose()
            }}
          />
        )}
      </div>
    </div>
  )
}

// 添加歌曲对话框
function AddSongsDialog({
  playlist,
  allSongs,
  onClose
}: {
  playlist: Playlist
  allSongs: Song[]
  onClose: () => void
}) {
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set())
  const [isAdding, setIsAdding] = useState(false)

  const existingSongIds = new Set(playlist.songs?.map(s => s.id) || [])
  const availableSongs = allSongs.filter(song => !existingSongIds.has(song.id))

  const toggleSong = (songId: string) => {
    const newSelected = new Set(selectedSongs)
    if (newSelected.has(songId)) {
      newSelected.delete(songId)
    } else {
      newSelected.add(songId)
    }
    setSelectedSongs(newSelected)
  }

  const handleAddSongs = async () => {
    if (selectedSongs.size === 0) {
      toast.error('请选择要添加的歌曲')
      return
    }

    setIsAdding(true)
    try {
      // 转换Set为数组
      const songIds = Array.from(selectedSongs)

      // 逐个添加歌曲
      for (const songId of songIds) {
        const response = await fetch(`/api/music/playlists/${playlist.id}/songs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId }),
        })

        if (!response.ok) throw new Error('添加失败')
      }

      toast.success(`成功添加 ${selectedSongs.size} 首歌曲`)
      onClose()
    } catch (error: any) {
      toast.error(error.message || '添加失败')
    } finally {
      setIsAdding(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-theme-surface border border-theme-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-theme-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-theme-text-canvas">添加歌曲到歌单</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          </div>
          <p className="text-sm text-theme-text-secondary">
            已选择 {selectedSongs.size} 首歌曲
          </p>
        </div>

        {/* 歌曲列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {availableSongs.length === 0 ? (
            <div className="text-center py-12">
              <MusicIcon className="w-12 h-12 text-theme-text-tertiary mx-auto mb-2" />
              <p className="text-theme-text-secondary">没有可添加的歌曲</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => toggleSong(song.id)}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSongs.has(song.id)
                      ? 'bg-theme-accent-bg border-theme-accent-primary'
                      : 'bg-theme-canvas border-theme-border hover:border-theme-accent-primary'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSongs.has(song.id)}
                    onChange={() => toggleSong(song.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-theme-text-canvas truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-theme-text-secondary truncate">
                      {song.artist}
                    </p>
                  </div>
                  <span className="text-xs text-theme-text-tertiary font-mono">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-theme-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isAdding}>
            取消
          </Button>
          <Button onClick={handleAddSongs} disabled={selectedSongs.size === 0 || isAdding}>
            {isAdding ? '添加中...' : `添加 ${selectedSongs.size} 首歌曲`}
          </Button>
        </div>
      </div>
    </div>
  )
}

// 歌单表单组件
function PlaylistForm({
  playlist,
  onSave,
  onCancel
}: {
  playlist: Playlist | null
  onSave: () => void
  onCancel: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: playlist?.name || '',
    description: playlist?.description || '',
    coverColor: playlist?.coverColor || '#6366f1',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = playlist
        ? `/api/music/playlists/${playlist.id}`
        : '/api/music/playlists'

      const method = playlist ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('操作失败')

      toast.success(playlist ? '更新成功' : '创建成功')
      onSave()
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const coverColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#0ea5e9', '#3b82f6'
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface border border-theme-border rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-theme-text-canvas mb-4">
          {playlist ? '编辑歌单' : '新建歌单'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              歌单名称 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-theme-canvas border border-theme-border rounded-lg text-theme-text-canvas focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              描述
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-theme-canvas border border-theme-border rounded-lg text-theme-text-canvas focus:outline-none focus:ring-2 focus:ring-theme-accent-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              封面颜色
            </label>
            <div className="flex flex-wrap gap-2">
              {coverColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, coverColor: color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.coverColor === color
                      ? 'border-theme-accent-primary scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : playlist ? '更新' : '创建'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
