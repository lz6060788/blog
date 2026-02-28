import { posts } from './data'
import { Post } from './types'

/**
 * 服务端数据获取函数：根据 ID 获取文章
 * @param id 文章 ID
 * @returns 文章对象，如果不存在则返回 null
 */
export async function getPost(id: string): Promise<Post | null> {
  // 模拟异步数据获取
  // 未来可以从 API 获取：const response = await fetch(`/api/posts/${id}`)
  return posts.find((p) => p.id === id) || null
}

/**
 * 获取所有文章列表（用于生成静态路径等）
 * @returns 所有文章的 ID 列表
 */
export async function getAllPostIds(): Promise<string[]> {
  return posts.map((p) => p.id)
}
