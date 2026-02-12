'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/ui/Header'
import { BottomNav } from '@/components/ui/BottomNav'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const isFullscreenPage = pathname?.includes('/tocar')

  // Fullscreen pages (like play mode) don't show header/nav
  if (isFullscreenPage) {
    return <>{children}</>
  }

  return (
    <>
      {!isLoginPage && <Header />}
      <main className={`min-h-screen ${!isLoginPage ? 'pt-16 pb-20 md:pb-6' : ''}`}>
        {children}
      </main>
      {!isLoginPage && <BottomNav />}
    </>
  )
}
