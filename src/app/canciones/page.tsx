'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Filter, Music } from 'lucide-react'
import { SongCard } from '@/components/ui/SongCard'
import { useToast } from '@/components/ui/Toast'

interface Song {
  id: string
  title: string
  artist: string | null
  album: string | null
  albumCover: string | null
  originalKey: string
}

export default function CancionesPage() {
  const { data: session } = useSession()
  const { showToast } = useToast()
  const [songs, setSongs] = useState<Song[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'featured'>('all')
  
  useEffect(() => {
    fetchSongs()
    if (session?.user?.id) {
      fetchFavorites()
    }
  }, [session, filter])
  
  async function fetchSongs() {
    try {
      const params = new URLSearchParams()
      if (filter === 'featured') params.set('featured', 'true')
      
      const res = await fetch(`/api/songs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSongs(data.songs || [])
      }
    } catch (error) {
      console.error('Error fetching songs:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function fetchFavorites() {
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(new Set(data.favorites.map((f: { songId: string }) => f.songId)))
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }
  
  async function toggleFavorite(songId: string) {
    if (!session) {
      showToast('Inicia sesión para guardar favoritos', 'warning')
      return
    }
    
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setFavorites(prev => {
          const newSet = new Set(prev)
          if (data.favorited) {
            newSet.add(songId)
            showToast('Agregado a favoritos', 'success')
          } else {
            newSet.delete(songId)
            showToast('Eliminado de favoritos', 'info')
          }
          return newSet
        })
      }
    } catch (error) {
      showToast('Error al actualizar favoritos', 'error')
    }
  }
  
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Canciones</h1>
        <p className="text-aviva-text-muted">
          {songs.length} canciones disponibles
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-aviva-text-muted" size={18} />
          <input
            type="text"
            placeholder="Buscar canciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-aviva pl-11"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'bg-aviva-gold text-aviva-black'
                : 'bg-aviva-gray text-aviva-text hover:bg-aviva-gray-light'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'featured'
                ? 'bg-aviva-gold text-aviva-black'
                : 'bg-aviva-gray text-aviva-text hover:bg-aviva-gray-light'
            }`}
          >
            Destacadas
          </button>
        </div>
      </div>
      
      {/* Songs List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl skeleton" />
          ))
        ) : filteredSongs.length > 0 ? (
          filteredSongs.map(song => (
            <SongCard
              key={song.id}
              song={song}
              isFavorite={favorites.has(song.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <Music className="mx-auto mb-4 text-aviva-text-muted" size={48} />
            <p className="text-aviva-text-muted">
              {searchQuery ? 'No se encontraron canciones' : 'No hay canciones disponibles'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

