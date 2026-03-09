import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Song } from '@/lib/types/entities'

export interface MusicState {
  // Player state
  isPlaying: boolean
  currentSong: Song | null
  progress: number
  volume: number
  duration: number

  // Playlist state
  playlist: Song[]
  currentIndex: number
  playMode: 'sequential' | 'random' | 'loop-one'

  // UI state
  isExpanded: boolean
  activeTab: 'player' | 'lyrics' | 'playlist'

  // Audio element (kept outside of component lifecycle)
  audio: HTMLAudioElement | null

  // Error state
  error: string | null
  isLoading: boolean
}

export interface MusicActions {
  // Player controls
  play: (song?: Song) => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setProgress: (progress: number) => void

  // Playlist management
  setPlaylist: (songs: Song[]) => void
  addToPlaylist: (song: Song) => void
  removeFromPlaylist: (songId: string) => void
  playSongAtIndex: (index: number) => void
  setPlayMode: (mode: 'sequential' | 'random' | 'loop-one') => void

  // UI actions
  toggleExpand: () => void
  setActiveTab: (tab: 'player' | 'lyrics' | 'playlist') => void

  // Audio setup
  initializeAudio: () => void
  cleanup: () => void

  // Error handling
  clearError: () => void
  retry: () => void
}

export type MusicStore = MusicState & MusicActions

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isPlaying: false,
      currentSong: null,
      progress: 0,
      volume: 75,
      duration: 0,
      playlist: [],
      currentIndex: -1,
      playMode: 'sequential',
      isExpanded: false,
      activeTab: 'player',
      audio: null,
      error: null,
      isLoading: false,

      // Player controls
      play: (song) => {
        const { audio, playlist } = get()

        set({ isLoading: true, error: null })

        if (song) {
          // Play specific song
          if (!audio) {
            const newAudio = new Audio()
            set({ audio: newAudio })
          }

          const index = playlist.findIndex((s) => s.id === song.id)
          set({
            currentSong: song,
            currentIndex: index >= 0 ? index : -1,
            isPlaying: true
          })

          // Update audio source
          const audioElement = get().audio || new Audio()
          audioElement.src = song.audioUrl

          audioElement.play()
            .then(() => {
              set({ isLoading: false })
            })
            .catch((err) => {
              console.error('Failed to play audio:', err)
              set({
                error: '播放失败，请检查网络连接或音频源',
                isLoading: false,
                isPlaying: false
              })
            })
        } else if (get().currentSong) {
          // Resume current song
          audio?.play()
            .then(() => {
              set({ isLoading: false, isPlaying: true })
            })
            .catch((err) => {
              console.error('Failed to resume audio:', err)
              set({
                error: '播放失败，请检查网络连接',
                isLoading: false,
                isPlaying: false
              })
            })
        } else {
          set({ isLoading: false })
        }
      },

      pause: () => {
        const { audio } = get()
        audio?.pause()
        set({ isPlaying: false })
      },

      toggle: () => {
        const { isPlaying } = get()
        if (isPlaying) {
          get().pause()
        } else {
          get().play()
        }
      },

      next: () => {
        const { playlist, currentIndex, playMode } = get()

        if (playlist.length === 0) return

        let nextIndex: number

        if (playMode === 'random') {
          nextIndex = Math.floor(Math.random() * playlist.length)
        } else {
          nextIndex = (currentIndex + 1) % playlist.length
        }

        get().playSongAtIndex(nextIndex)
      },

      prev: () => {
        const { playlist, currentIndex } = get()

        if (playlist.length === 0) return

        const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1
        get().playSongAtIndex(prevIndex)
      },

      seek: (time) => {
        const { audio } = get()
        if (audio) {
          audio.currentTime = time
        }
        set({ progress: (time / get().duration) * 100 })
      },

      setVolume: (volume) => {
        const { audio } = get()
        if (audio) {
          audio.volume = volume / 100
        }
        set({ volume })
      },

      setProgress: (progress) => {
        const { duration } = get()
        set({ progress })
        if (duration > 0) {
          get().seek((progress / 100) * duration)
        }
      },

      // Playlist management
      setPlaylist: (songs) => {
        set({ playlist: songs, currentIndex: songs.length > 0 ? 0 : -1 })
      },

      addToPlaylist: (song) => {
        const { playlist } = get()
        set({ playlist: [...playlist, song] })
      },

      removeFromPlaylist: (songId) => {
        const { playlist, currentIndex, currentSong } = get()
        const newPlaylist = playlist.filter((s) => s.id !== songId)
        const newIndex = currentSong?.id === songId
          ? Math.min(currentIndex, newPlaylist.length - 1)
          : currentIndex

        set({ playlist: newPlaylist, currentIndex: newIndex })
      },

      playSongAtIndex: (index) => {
        const { playlist } = get()
        if (index >= 0 && index < playlist.length) {
          get().play(playlist[index])
        }
      },

      setPlayMode: (mode) => {
        set({ playMode: mode })
      },

      // UI actions
      toggleExpand: () => {
        set((state) => ({ isExpanded: !state.isExpanded }))
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab })
      },

      // Audio setup
      initializeAudio: () => {
        if (typeof window === 'undefined') return

        // Check if already initialized
        if (get().audio) {
          return
        }

        const audio = new Audio()

        // Set volume immediately after creating audio
        audio.volume = 0.75

        // Set up event listeners
        const updateTime = () => {
          const { duration } = audio
          if (duration > 0) {
            set({
              progress: (audio.currentTime / duration) * 100,
              duration
            })
          }
        }

        audio.addEventListener('timeupdate', updateTime)
        audio.addEventListener('ended', () => {
          const { playMode } = get()
          if (playMode === 'loop-one') {
            audio.currentTime = 0
            audio.play().catch(console.error)
          } else {
            get().next()
          }
        })

        audio.addEventListener('loadedmetadata', () => {
          set({ duration: audio.duration, isLoading: false })
        })

        audio.addEventListener('canplay', () => {
          set({ isLoading: false })
        })

        audio.addEventListener('error', (e) => {
          console.error('Audio error:', e)
          const error = (e as any).target.error
          let errorMessage = '播放失败'

          if (error) {
            switch (error.code) {
              case error.MEDIA_ERR_ABORTED:
                errorMessage = '播放被中止'
                break
              case error.MEDIA_ERR_NETWORK:
                errorMessage = '网络错误，请检查网络连接'
                break
              case error.MEDIA_ERR_DECODE:
                errorMessage = '音频解码失败'
                break
              case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = '音频格式不支持或文件不存在'
                break
            }
          }

          set({
            error: errorMessage,
            isLoading: false,
            isPlaying: false
          })
        })

        audio.addEventListener('waiting', () => {
          set({ isLoading: true })
        })

        set({ audio })

        // Ensure volume is synced after setting audio
        const currentVolume = get().volume
        if (audio && audio.volume !== currentVolume / 100) {
          audio.volume = currentVolume / 100
        }
      },

      cleanup: () => {
        const { audio } = get()
        audio?.pause()
        audio?.remove()
        set({
          audio: null,
          isPlaying: false
        })
      },

      // Error handling
      clearError: () => {
        set({ error: null })
      },

      retry: () => {
        const { currentSong } = get()
        if (currentSong) {
          get().play(currentSong)
        }
      }
    }),
    {
      name: 'music-storage',
      partialize: (state) => ({
        volume: state.volume,
        playMode: state.playMode,
        playlist: state.playlist,
        isExpanded: state.isExpanded,
        activeTab: state.activeTab
      })
    }
  )
)
