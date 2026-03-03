'use client'

import Link from 'next/link'
import { ArticleCover } from './article-cover'
import { cn } from '@/lib/utils'

/**
 * 文章封面卡片组件
 * 用于列表页面的展示，支持点击交互
 */
interface ArticleCoverCardProps {
  /** 文章 ID */
  articleId: string
  /** 文章 slug（用于构建链接） */
  slug: string
  /** 封面图片 URL */
  coverUrl?: string | null
  /** 文章标题 */
  title: string
  /** 文章摘要 */
  excerpt?: string | null
  /** 是否优先加载 */
  priority?: boolean
  /** 点击行为（'link' 跳转到文章详情，'none' 不可点击） */
  clickable?: 'link' | 'none'
  /** 自定义类名 */
  className?: string
}

export function ArticleCoverCard({
  articleId,
  slug,
  coverUrl,
  title,
  excerpt,
  priority = false,
  clickable = 'link',
  className,
}: ArticleCoverCardProps) {
  const cardContent = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-theme-border',
        'hover:border-theme-accent-primary/50',
        'transition-all duration-200',
        'hover:shadow-lg hover:shadow-theme-accent-primary/10',
        clickable === 'link' && 'cursor-pointer',
        className
      )}
    >
      {/* 封面图片 */}
      <ArticleCover
        src={coverUrl}
        alt={title}
        priority={priority}
        lazy={!priority}
        className="w-full"
      />

      {/* 悬停时的遮罩效果 */}
      {clickable === 'link' && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}

      {/* 悬停时的标题提示 */}
      {clickable === 'link' && excerpt && (
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <p className="text-white text-sm line-clamp-2 drop-shadow-lg">
            {excerpt}
          </p>
        </div>
      )}
    </div>
  )

  // 如果可点击，用 Link 包裹
  if (clickable === 'link') {
    return (
      <Link href={`/post/${articleId}`} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
