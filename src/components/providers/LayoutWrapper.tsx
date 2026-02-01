'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/ui/Header'
import { BottomNav } from '@/components/ui/BottomNav'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

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
