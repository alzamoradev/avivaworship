'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Search, Music, ListMusic, Heart, ChevronRight, Sparkles } from 'lucide-react'
import { SongCard } from '@/components/ui/SongCard'

interface Song {
  id: string
  title: string
  artist: string | null
  album: string | null
  albumCover: string | null
  originalKey: string
}

export default function HomePage() {
  const { data: session } = useSession()
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  useEffect(() => {
    async function fetchSongs() {
      try {
        const [featuredRes, recentRes] = await Promise.all([
          fetch('/api/songs?featured=true&limit=6'),
          fetch('/api/songs?limit=10')
        ])
        
        if (featuredRes.ok) {
          const data = await featuredRes.json()
          setFeaturedSongs(data.songs || [])
        }
        
        if (recentRes.ok) {
          const data = await recentRes.json()
          setRecentSongs(data.songs || [])
        }
      } catch (error) {
        console.error('Error fetching songs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSongs()
  }, [])
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(searchQuery)}`
    }
  }
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-aviva-gold/10 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-aviva-gold/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-12">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              {session?.user?.name ? (
                <>
                  <span className="text-aviva-text">Hola, </span>
                  <span className="gradient-text">{session.user.name.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <span className="text-aviva-text">Bienvenido a </span>
                  <span className="gradient-text">AVIVA</span>
                </>
              )}
            </h1>
            <p className="text-aviva-text-muted text-lg">
              Tu cancionero digital para la adoración
            </p>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-aviva-text-muted" size={20} />
              <input
                type="text"
                placeholder="Buscar canciones, artistas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-aviva pl-12 pr-4 py-4 text-lg"
              />
            </div>
          </form>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <Link 
              href="/canciones"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-aviva-dark-lighter border border-aviva-gray hover:border-aviva-gold transition-all group"
            >
              <div className="p-3 rounded-xl bg-aviva-gold/10 group-hover:bg-aviva-gold/20 transition-colors">
                <Music className="text-aviva-gold" size={24} />
              </div>
              <span className="text-sm font-medium">Canciones</span>
            </Link>
            
            <Link 
              href="/listas"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-aviva-dark-lighter border border-aviva-gray hover:border-aviva-gold transition-all group"
            >
              <div className="p-3 rounded-xl bg-aviva-gold/10 group-hover:bg-aviva-gold/20 transition-colors">
                <ListMusic className="text-aviva-gold" size={24} />
              </div>
              <span className="text-sm font-medium">Mis Listas</span>
            </Link>
            
            <Link 
              href="/favoritos"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-aviva-dark-lighter border border-aviva-gray hover:border-aviva-gold transition-all group"
            >
              <div className="p-3 rounded-xl bg-aviva-gold/10 group-hover:bg-aviva-gold/20 transition-colors">
                <Heart className="text-aviva-gold" size={24} />
              </div>
              <span className="text-sm font-medium">Favoritos</span>
            </Link>
            
            <Link 
              href="/buscar"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-aviva-dark-lighter border border-aviva-gray hover:border-aviva-gold transition-all group"
            >
              <div className="p-3 rounded-xl bg-aviva-gold/10 group-hover:bg-aviva-gold/20 transition-colors">
                <Search className="text-aviva-gold" size={24} />
              </div>
              <span className="text-sm font-medium">Buscar</span>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Songs */}
      {featuredSongs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-aviva-gold" size={24} />
              <h2 className="text-xl font-bold">Destacadas</h2>
            </div>
            <Link 
              href="/canciones?featured=true"
              className="flex items-center gap-1 text-sm text-aviva-gold hover:underline"
            >
              Ver todas
              <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid gap-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl skeleton" />
              ))
            ) : (
              featuredSongs.slice(0, 6).map(song => (
                <SongCard key={song.id} song={song} showOptions={false} />
              ))
            )}
          </div>
        </section>
      )}
      
      {/* Recent Songs */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Music className="text-aviva-gold" size={24} />
            <h2 className="text-xl font-bold">Todas las Canciones</h2>
          </div>
          <Link 
            href="/canciones"
            className="flex items-center gap-1 text-sm text-aviva-gold hover:underline"
          >
            Ver todas
            <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid gap-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl skeleton" />
            ))
          ) : recentSongs.length > 0 ? (
            recentSongs.map(song => (
              <SongCard key={song.id} song={song} showOptions={false} />
            ))
          ) : (
            <div className="text-center py-12">
              <Music className="mx-auto mb-4 text-aviva-text-muted" size={48} />
              <p className="text-aviva-text-muted">
                No hay canciones disponibles
              </p>
              {session?.user?.role === 'admin' && (
                <Link href="/admin/canciones/nueva" className="btn-primary inline-block mt-4">
                  Agregar primera canción
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
