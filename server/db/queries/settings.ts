import { db } from '../index'
import { settings } from '../schema'
import { eq } from 'drizzle-orm'
import type { Author } from '@/lib/types'

/**
 * 获取博客设置（包含作者信息）
 * @returns 博客设置对象，如果不存在则返回默认值
 */
export async function getSettings() {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.id, 'default'))
    .limit(1)

  if (result.length === 0) {
    // 返回默认设置
    return {
      id: 'default',
      blogName: 'My Blog',
      blogDescription: 'A personal blog',
      postsPerPage: 10,
      authorName: 'Alex Chen',
      authorAvatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=c0aede',
      authorBio: 'Designer & Developer crafting digital experiences with code and creativity.',
      authorLocation: 'San Francisco, CA',
      authorZodiac: 'Scorpio ♏',
      authorEmail: 'alex@example.com',
      authorSocialGithub: 'github.com/alexchen',
      authorSocialTwitter: 'twitter.com/alexchen',
      authorSocialLinkedin: undefined,
      updatedAt: new Date().toISOString(),
    }
  }

  return result[0]
}

/**
 * 获取作者信息
 * @returns 作者信息对象
 */
export async function getAuthor(): Promise<Author> {
  const setting = await getSettings()

  return {
    name: setting.authorName,
    avatar: setting.authorAvatar,
    bio: setting.authorBio,
    location: setting.authorLocation,
    zodiac: setting.authorZodiac,
    email: setting.authorEmail,
    social: {
      github: setting.authorSocialGithub || undefined,
      twitter: setting.authorSocialTwitter || undefined,
      linkedin: setting.authorSocialLinkedin || undefined,
    },
  }
}
