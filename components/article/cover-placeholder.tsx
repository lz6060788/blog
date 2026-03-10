import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 封面占位符组件
 * 用于无封面时的显示
 */
interface CoverPlaceholderProps {
  /** 容器宽度 */
  width?: number | string
  /** 容器高度 */
  height?: number | string
  /** 自定义类名 */
  className?: string
  /** 占位符样式类型 */
  variant?: 'icon' | 'gradient'
}

export function CoverPlaceholder({
  width = '100%',
  height = 'auto',
  className,
  variant = 'icon',
}: CoverPlaceholderProps) {
  const aspectRatio = 'aspect-[16/9]'

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-theme-subtle border border-theme-border',
        aspectRatio,
        className
      )}
      style={{ width, height }}
    >
      {variant === 'icon' ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-theme-text-tertiary opacity-50" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-theme-surface to-theme-subtle flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-theme-text-tertiary opacity-30" />
        </div>
      )}
    </div>
  )
}
