'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Music, ArrowDownAZ, ArrowUpZA } from 'lucide-react'
import { SongCard } from '@/components/ui/SongCard'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

interface Song {
  id: string
  slug: string
  title: string
  artist: string | null
  album: string | null
  albumCover: string | null
  originalKey: string
}

interface Playlist {
  id: string
  name: string
  _count?: { songs: number }
}

type SortOrder = 'title_asc' | 'title_desc'

export default function CancionesPage() {
  const { data: session } = useSession()
  const { showToast } = useToast()
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'featured'>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('title_asc')
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null)

  useEffect(() => {
    fetchSongs()
    if (session?.user?.id) {
      fetchPlaylists()
    }
  }, [session, filter, sortOrder])

  async function fetchSongs() {
    try {
      const params = new URLSearchParams()
      if (filter === 'featured') params.set('featured', 'true')
      params.set('sort', sortOrder)

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

  async function fetchPlaylists() {
    try {
      const res = await fetch('/api/playlists')
      if (res.ok) {
        const data = await res.json()
        setPlaylists(data.playlists || [])
      }
    } catch (error) {
      console.error('Error fetching playlists:', error)
    }
  }

  function handleAddToPlaylist(songId: string) {
    if (!session) {
      showToast('Inicia sesion para agregar a una lista', 'warning')
      return
    }
    setSelectedSongId(songId)
    setShowPlaylistModal(true)
  }

  async function addSongToPlaylist(playlistId: string) {
    if (!selectedSongId) return

    try {
      const res = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: selectedSongId }),
      })

      if (res.ok) {
        showToast('Cancion agregada a la lista', 'success')
        setShowPlaylistModal(false)
        setSelectedSongId(null)
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al agregar', 'error')
      }
    } catch (error) {
      showToast('Error al agregar cancion', 'error')
    }
  }

  function toggleSortOrder() {
    setSortOrder(prev => prev === 'title_asc' ? 'title_desc' : 'title_asc')
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
            Sugeridas
          </button>
          <button
            onClick={toggleSortOrder}
            className="px-4 py-2 rounded-xl bg-aviva-gray text-aviva-text hover:bg-aviva-gray-light transition-all flex items-center gap-2"
            title={sortOrder === 'title_asc' ? 'Ordenar Z-A' : 'Ordenar A-Z'}
          >
            {sortOrder === 'title_asc' ? (
              <ArrowDownAZ size={20} />
            ) : (
              <ArrowUpZA size={20} />
            )}
            <span className="hidden sm:inline">{sortOrder === 'title_asc' ? 'A-Z' : 'Z-A'}</span>
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
              onAddToPlaylist={handleAddToPlaylist}
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

      {/* Playlist Selection Modal */}
      <Modal
        isOpen={showPlaylistModal}
        onClose={() => {
          setShowPlaylistModal(false)
          setSelectedSongId(null)
        }}
        title="Agregar a lista"
      >
        {playlists.length > 0 ? (
          <div className="space-y-2">
            {playlists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => addSongToPlaylist(playlist.id)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-aviva-gray hover:bg-aviva-gray-light transition-colors"
              >
                <span className="font-medium">{playlist.name}</span>
                <span className="text-sm text-aviva-text-muted">
                  {playlist._count?.songs || 0} canciones
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-aviva-text-muted mb-4">No tienes listas creadas</p>
            <a href="/listas" className="btn-primary inline-block">
              Crear lista
            </a>
          </div>
        )}
      </Modal>
    </div>
  )
}
