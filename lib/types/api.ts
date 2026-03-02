/**
 * API Request/Response types
 * Types for API contracts
 */

import type { Category, Tag, Post } from './entities'

export interface CreateCategoryRequest {
  name: string
  slug: string
  description?: string
}

export interface UpdateCategoryRequest {
  name: string
  slug: string
  description?: string
}

export interface CreateTagRequest {
  name: string
  slug: string
}

export interface UpdateTagRequest {
  name: string
  slug: string
}

export interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  published?: boolean
  categoryId?: string
  tags?: string[]
  readTime?: number
  publishedDate?: string
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  excerpt?: string
  published?: boolean
  categoryId?: string
  tags?: string[]
  readTime?: number
  publishedDate?: string
}
