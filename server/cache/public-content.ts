import { revalidatePath, revalidateTag } from 'next/cache'
import { locales } from '@/i18n.config'
import { localizedPath } from '@/lib/seo'

export function revalidatePublicContent(postId?: string) {
  revalidateTag('public-posts')
  // Lists, series, category/tag pages and internal references all depend on visibility.
  for (const locale of locales) {
    revalidatePath(localizedPath(locale, '/'), 'layout')
    if (postId) revalidatePath(localizedPath(locale, `/post/${postId}`))
  }
  revalidatePath('/sitemap.xml')
  revalidatePath('/rss.xml')
}
