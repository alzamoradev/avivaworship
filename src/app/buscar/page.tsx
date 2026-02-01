'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Music } from 'lucide-react'
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

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(!!initialQuery)
  
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [])
  
  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setSearched(true)
    
    try {
      const res = await fetch(`/api/songs?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSongs(data.songs || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query)}`)
      performSearch(query)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-aviva-text-muted" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, artista o álbum..."
            className="input-aviva pl-12 pr-4 py-4 text-lg"
            autoFocus
          />
        </div>
      </form>
      
      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" />
          ))}
        </div>
      ) : searched ? (
        songs.length > 0 ? (
          <div className="space-y-3">
            <p className="text-aviva-text-muted mb-4">
              {songs.length} {songs.length === 1 ? 'resultado' : 'resultados'} para "{query}"
            </p>
            {songs.map(song => (
              <SongCard key={song.id} song={song} showOptions={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Music className="mx-auto mb-4 text-aviva-text-muted" size={48} />
            <p className="text-aviva-text-muted">
              No se encontraron resultados para "{query}"
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <Search className="mx-auto mb-4 text-aviva-text-muted" size={48} />
          <p className="text-aviva-text-muted">
            Busca canciones por título, artista o álbum
          </p>
        </div>
      )}
    </div>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="h-16 skeleton rounded-2xl mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}

