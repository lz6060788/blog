/**
 * Site Configuration
 *
 * 这是开发环境的默认配置和数据库回退值。
 *
 * 生产环境配置：
 * - 请在管理后台（/admin/settings）修改博客和作者信息
 * - 数据库配置优先于此文件
 * - 此文件仅在数据库无数据时作为回退使用
 */

export const siteConfig = {
  blog: {
    name: 'Irises Blog',
    description: 'A personal blog',
    postsPerPage: 10,
  },
  author: {
    name: 'Irises',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Iris&backgroundColor=c0aede',
    bio: 'All things in the world are but fading blossoms; only the shadow of a dream remains true.',
    location: 'HangZhou, China',
    zodiac: 'Capricorn ♑',
    email: 'ir1seswhite@gmail.com',
    social: {
      github: 'https://github.com/lz6060788',
      twitter: undefined as string | undefined,
      linkedin: undefined as string | undefined,
    },
  },
}
