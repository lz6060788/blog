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

export interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: number
  category: string
  tags: string[]
}
