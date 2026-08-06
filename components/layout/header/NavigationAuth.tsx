'use client'

import { SessionProvider } from '@/components/auth/SessionProvider'
import { UserMenu } from '@/components/auth/UserMenu'

export function NavigationAuth() {
  return (
    <SessionProvider>
      <UserMenu />
    </SessionProvider>
  )
}
