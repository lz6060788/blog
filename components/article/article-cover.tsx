'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CoverPlaceholder } from './cover-placeholder'
import { cn } from '@/lib/utils'

/**
 * 文章封面展示组件
 * 纯展示组件，支持多种尺寸配置
 */
interface ArticleCoverProps {
  /** 封面图片 URL */
  src?: string | null
  /** 替代文本（默认为文章标题） */
  alt?: string
  /** 容器宽度 */
  width?: number | string
  /** 容器高度（数字或 'auto'） */
  height?: number | string | 'auto'
  /** 是否优先加载（用于首屏图片） */
  priority?: boolean
  /** 是否懒加载 */
  lazy?: boolean
  /** 图片适应方式 */
  objectFit?: 'cover' | 'contain' | 'fill'
  /** 自定义类名 */
  className?: string
  /** 占位符类型 */
  placeholderVariant?: 'icon' | 'gradient'
  /** 加载失败回调 */
  onError?: () => void
  /** 图片加载成功回调 */
  onLoad?: () => void
}

export function ArticleCover({
  src,
  alt = '文章封面',
  width = '100%',
  height = 'auto',
  priority = false,
  lazy = true,
  objectFit = 'cover',
  className,
  placeholderVariant = 'gradient',
  onError,
  onLoad,
}: ArticleCoverProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 如果没有封面图片或加载失败，显示占位符
  if (!src || imageError) {
    return (
      <CoverPlaceholder
        width={width}
        height={height}
        variant={placeholderVariant}
        className={className}
      />
    )
  }

  // 计算显示尺寸
  const isNumericWidth = typeof width === 'number'
  const isNumericHeight = typeof height === 'number'

  // Next.js Image 组件的配置
  const imageProps = {
    src,
    alt,
    width: isNumericWidth ? width : undefined,
    height: isNumericHeight ? height : undefined,
    fill: !isNumericWidth || !isNumericHeight,
    priority,
    loading: lazy && !priority ? ('lazy' as const) : undefined,
    className: cn(
      'w-full h-full object-cover',
      objectFit === 'cover' && 'object-cover',
      objectFit === 'contain' && 'object-contain',
      objectFit === 'fill' && 'object-fill',
      isLoading && 'opacity-0',
      !isLoading && 'opacity-100 transition-opacity duration-300',
      className
    ),
    onError: () => {
      setImageError(true)
      setIsLoading(false)
      onError?.()
    },
    onLoad: () => {
      setIsLoading(false)
      onLoad?.()
    },
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden aspect-[16/9]',
        className
      )}
      style={{
        width: isNumericWidth ? undefined : width,
      }}
    >
      <Image {...imageProps} />

      {/* 加载中的占位符 */}
      {isLoading && (
        <div className="absolute inset-0 bg-theme-subtle animate-pulse" />
      )}
    </div>
  )
}
