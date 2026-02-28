import Navigation from '@/components/Navigation'
import { Link as IntlLink } from '@/app/i18n/routing'

export default function NotFound() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-theme-text-canvas mb-4">
            文章未找到
          </h1>
          <p className="text-theme-text-secondary mb-8">
            您访问的文章不存在或已被删除。
          </p>
          <IntlLink
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-theme-accent-primary text-theme-accent-fg rounded-xl hover:opacity-90 transition-opacity"
          >
            返回首页
          </IntlLink>
        </div>
      </div>
    </>
  )
}
