import { getSettings } from '@/server/db/queries/settings'
import Navigation from './Navigation'

/**
 * Navigation Provider - 服务端组件
 * 从数据库获取配置并传递给客户端 Navigation 组件
 */
export async function NavigationProvider() {
  const settings = await getSettings()

  return <Navigation blogName={settings.blogName} />
}
