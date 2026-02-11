'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

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

  async function removeFavorite(songId: string) {
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
          {favorites.length} {favorites.length === 1 ? 'cancion guardada' : 'canciones guardadas'}
        </p>
      </div>

      {/* Favorites List */}
      <div className="space-y-3">
        {favorites.length > 0 ? (
          favorites.map(favorite => (
            <div key={favorite.id} className="card-aviva group relative">
              <Link href={`/canciones/${favorite.song.slug}`} className="flex items-center gap-4">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-aviva-gray flex-shrink-0">
                  {favorite.song.albumCover ? (
                    <img
                      src={favorite.song.albumCover}
                      alt={favorite.song.album || favorite.song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-aviva-gold/20 to-aviva-gold/5">
                      <span className="text-2xl font-bold text-aviva-gold/50">
                        {favorite.song.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-aviva-text truncate group-hover:text-aviva-gold transition-colors">
                    {favorite.song.title}
                  </h3>
                  {favorite.song.artist && (
                    <p className="text-sm text-aviva-text-muted truncate">{favorite.song.artist}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-aviva-gold/20 text-aviva-gold font-medium">
                      {favorite.song.originalKey}
                    </span>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => removeFavorite(favorite.songId)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-all"
                title="Eliminar de favoritos"
              >
                <Heart size={20} fill="currentColor" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Heart className="mx-auto mb-4 text-aviva-text-muted" size={64} />
            <h2 className="text-xl font-semibold mb-2">No tienes favoritos</h2>
            <p className="text-aviva-text-muted mb-6">
              Guarda tus canciones favoritas para acceder rapidamente
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
