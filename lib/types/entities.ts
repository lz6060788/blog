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
  publishedDate?: string | null
  published?: boolean
  authorId?: string
  createdAt?: string
  updatedAt?: string
  categoryObj?: Category | null
  tagObjs?: Tag[]
  // AI cover fields
  coverImageUrl?: string | null
  aiCoverStatus?: 'pending' | 'generating' | 'done' | 'failed' | 'manual' | null
  aiCoverGeneratedAt?: string | null
  aiCoverPrompt?: string | null
}
