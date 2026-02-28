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
}

// API Request/Response types
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
