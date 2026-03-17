import { db } from '../index'
import { settings } from '../schema'
import { eq } from 'drizzle-orm'
import type { Author } from '@/lib/types'
import { siteConfig } from '@/config/site'

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
    // 返回配置文件中的默认设置
    return {
      id: 'default',
      blogName: siteConfig.blog.name,
      blogDescription: siteConfig.blog.description,
      postsPerPage: siteConfig.blog.postsPerPage,
      authorName: siteConfig.author.name,
      authorAvatar: siteConfig.author.avatar,
      authorBio: siteConfig.author.bio,
      authorLocation: siteConfig.author.location,
      authorZodiac: siteConfig.author.zodiac,
      authorEmail: siteConfig.author.email,
      authorSocialGithub: siteConfig.author.social.github,
      authorSocialTwitter: siteConfig.author.social.twitter,
      authorSocialLinkedin: siteConfig.author.social.linkedin,
      updatedAt: new Date().toISOString(),
    }
  }

  return result[0]
}

/**
 * 获取作者信息
 * @returns 作者信息对象（从数据库读取，回退到配置文件）
 */
export async function getAuthor(): Promise<Author> {
  // 从数据库获取设置（包含回退逻辑）
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
