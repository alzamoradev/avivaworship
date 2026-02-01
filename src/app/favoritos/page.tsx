'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { SongCard } from '@/components/ui/SongCard'
import { useToast } from '@/components/ui/Toast'

interface Favorite {
  id: string
  songId: string
  song: {
    id: string
    slug: string
    title: string
    artist: string | null
    album: string | null
    albumCover: string | null
    originalKey: string
  }
}

export default function FavoritosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/favoritos')
    } else if (session?.user?.id) {
      fetchFavorites()
    }
  }, [session, status])
  
  async function fetchFavorites() {
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function toggleFavorite(songId: string) {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      })
      
      if (res.ok) {
        const data = await res.json()
        if (!data.favorited) {
          setFavorites(prev => prev.filter(f => f.songId !== songId))
          showToast('Eliminado de favoritos', 'info')
        }
      }
    } catch (error) {
      showToast('Error al actualizar', 'error')
    }
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="h-8 w-32 skeleton rounded-lg mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Mis favoritos</h1>
        <p className="text-aviva-text-muted">
          {favorites.length} {favorites.length === 1 ? 'canción guardada' : 'canciones guardadas'}
        </p>
      </div>
      
      {/* Favorites List */}
      <div className="space-y-3">
        {favorites.length > 0 ? (
          favorites.map(favorite => (
            <SongCard
              key={favorite.id}
              song={favorite.song}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <Heart className="mx-auto mb-4 text-aviva-text-muted" size={64} />
            <h2 className="text-xl font-semibold mb-2">No tienes favoritos</h2>
            <p className="text-aviva-text-muted mb-6">
              Guarda tus canciones favoritas para acceder rápidamente
            </p>
            <button
              onClick={() => router.push('/canciones')}
              className="btn-primary"
            >
              Explorar canciones
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

