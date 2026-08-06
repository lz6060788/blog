/**
 * Entity types
 * Core domain entities for the application
 */

export interface Author {
  name: string
  avatar: string
  bio: string
  location: string
  zodiac: string
  email: string
  social: {
    github?: string
    twitter?: string
    linkedin?: string
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface Series {
  id: string
  name: string
  slug: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: number
  category: string
  tags: string[]
  // Database fields (optional for backward compatibility)
  categoryId?: string | null
  seriesId?: string | null
  seriesOrder?: number | null
  publishedDate?: string | null
  published?: boolean
  authorId?: string
  createdAt?: string
  updatedAt?: string
  categoryObj?: Category | null
  seriesObj?: Series | null
  tagObjs?: Tag[]
  // AI cover fields
  coverImageUrl?: string | null
  aiCoverStatus?: 'pending' | 'generating' | 'done' | 'failed' | 'manual' | null
  aiCoverGeneratedAt?: string | null
  aiCoverPrompt?: string | null
}

/**
 * Public listing payload. Article bodies stay on the detail page so archive
 * and timeline client components do not receive every published Markdown file.
 */
export type PostSummary = Omit<Post, 'content'>

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  snippet: string
  date: string
  readTime: number
  category: string
  categorySlug?: string
  tags: string[]
}

// Music Player Types
export interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration: number // in seconds
  audioUrl: string
  lyrics?: string
}

export interface Playlist {
  id: string
  name: string
  description?: string
  songs: Song[]
  createdAt: string
}
