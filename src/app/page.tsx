'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Search, Music, ListMusic, Heart, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'
import { SongCard } from '@/components/ui/SongCard'

interface Song {
  id: string
  slug: string
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
    <div className="-mt-16">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/hero-worship.webp"
            alt="Worship"
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-aviva-black/60 via-aviva-black/40 to-aviva-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-aviva-black via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
          {/* Welcome Message */}
          <p className="text-aviva-gold text-sm font-semibold tracking-[0.3em] uppercase mb-4">
            Cancionero digital
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[0.9] tracking-tight">
            {session?.user?.name ? (
              <>
                <span className="text-aviva-text">HOLA, </span>
                <span className="gradient-text">{session.user.name.split(' ')[0].toUpperCase()}</span>
              </>
            ) : (
              <>
                <span className="text-aviva-text">BIENVENIDO A </span>
                <br className="sm:hidden" />
                <span className="gradient-text">AVIVA</span>
              </>
            )}
          </h1>
          <p className="text-aviva-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Encontrá letras y acordes para momentos de adoración
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-aviva-text-muted" size={22} />
              <input
                type="text"
                placeholder="Buscar canciones, artistas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-aviva-dark/80 backdrop-blur-sm border border-aviva-gray-light/50 rounded-full pl-14 pr-6 py-4 text-lg text-aviva-text placeholder:text-aviva-text-muted focus:outline-none focus:border-aviva-gold focus:ring-2 focus:ring-aviva-gold/20 transition-all"
              />
            </div>
          </form>

          {/* CTA Button */}
          <Link
            href="/canciones"
            className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-4 rounded-full"
          >
            Explorar canciones
            <ArrowRight size={20} />
          </Link>
        </div>

      </section>

      {/* Quick Actions */}
      <section className="relative z-10 -mt-8 max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/canciones"
            className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-aviva-dark-lighter/90 backdrop-blur-sm border border-aviva-gray hover:border-aviva-gold hover:bg-aviva-dark-lighter transition-all group"
          >
            <div className="p-3 rounded-xl bg-aviva-gold/10 group-hover:bg-aviva-gold/20 transition-colors">
              <Music className="text-aviva-gold" size={26} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wide">Canciones</span>
          </Link>

          <Link
            href="/listas"
            className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-aviva-dark-lighter/90 backdrop-blur-sm border border-aviva-gray hover:border-aviva-gold hover:bg-aviva-dark-lighter transition-all group"
          >
            <div className="p-3 rounded-xl bg-aviva-gold/10 group-hover:bg-aviva-gold/20 transition-colors">
              <ListMusic className="text-aviva-gold" size={26} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wide">Mis Listas</span>
          </Link>

          <Link
            href="/favoritos"
            className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-aviva-dark-lighter/90 backdrop-blur-sm border border-aviva-gray hover:border-aviva-gold hover:bg-aviva-dark-lighter transition-all group"
          >
            <div className="p-3 rounded-xl bg-aviva-gold/10 group-hover:bg-aviva-gold/20 transition-colors">
              <Heart className="text-aviva-gold" size={26} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wide">Favoritos</span>
          </Link>

          <Link
            href="/buscar"
            className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-aviva-dark-lighter/90 backdrop-blur-sm border border-aviva-gray hover:border-aviva-gold hover:bg-aviva-dark-lighter transition-all group"
          >
            <div className="p-3 rounded-xl bg-aviva-gold/10 group-hover:bg-aviva-gold/20 transition-colors">
              <Search className="text-aviva-gold" size={26} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wide">Buscar</span>
          </Link>
        </div>
      </section>

      {/* Featured Songs */}
      {featuredSongs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="text-aviva-gold" size={24} />
              <h2 className="text-xl font-bold tracking-wide">DESTACADAS</h2>
            </div>
            <Link
              href="/canciones?featured=true"
              className="flex items-center gap-1 text-sm text-aviva-gold hover:underline font-medium"
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
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Music className="text-aviva-gold" size={24} />
            <h2 className="text-xl font-bold tracking-wide">TODAS LAS CANCIONES</h2>
          </div>
          <Link
            href="/canciones"
            className="flex items-center gap-1 text-sm text-aviva-gold hover:underline font-medium"
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
            <div className="text-center py-16 bg-aviva-dark-lighter rounded-2xl border border-aviva-gray">
              <Music className="mx-auto mb-4 text-aviva-text-muted" size={56} />
              <p className="text-aviva-text-muted text-lg mb-2">
                No hay canciones disponibles
              </p>
              <p className="text-aviva-text-muted/60 text-sm mb-6">
                Agregá canciones desde el panel de administración
              </p>
              {session?.user?.role === 'admin' && (
                <Link href="/admin/canciones/nueva" className="btn-primary inline-flex items-center gap-2">
                  Agregar primera canción
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
