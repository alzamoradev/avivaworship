'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Music, ListMusic, Heart, Search } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/canciones', icon: Music, label: 'Canciones' },
  { href: '/buscar', icon: Search, label: 'Buscar' },
  { href: '/listas', icon: ListMusic, label: 'Listas' },
  { href: '/favoritos', icon: Heart, label: 'Favoritos' },
]

export function BottomNav() {
  const pathname = usePathname()
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-darker border-t border-aviva-gray safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || 
            (href !== '/' && pathname.startsWith(href))
          
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive 
                  ? 'text-aviva-gold' 
                  : 'text-aviva-text-muted hover:text-aviva-text'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

