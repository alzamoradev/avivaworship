'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Star, ArrowLeft, Music } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface Song {
  id: string
  slug: string
  title: string
  artist: string | null
  album: string | null
  albumCover: string | null
  originalKey: string
  isFeatured: boolean
  createdAt: string
}

export default function AdminCancionesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchSongs()
    }
  }, [session, status])
  
  async function fetchSongs() {
    try {
      const res = await fetch('/api/songs?limit=100')
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
  
  async function deleteSong(songId: string, title: string) {
    if (!confirm(`¿Estás seguro de eliminar "${title}"?`)) return
    
    try {
      const res = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        setSongs(prev => prev.filter(s => s.id !== songId))
        showToast('Canción eliminada', 'success')
      } else {
        showToast('Error al eliminar', 'error')
      }
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }
  
  async function toggleFeatured(songId: string, currentValue: boolean) {
    try {
      const res = await fetch(`/api/songs/${songId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentValue }),
      })
      
      if (res.ok) {
        setSongs(prev => prev.map(s => 
          s.id === songId ? { ...s, isFeatured: !currentValue } : s
        ))
        showToast(
          !currentValue ? 'Marcada como destacada' : 'Ya no es destacada',
          'success'
        )
      }
    } catch (error) {
      showToast('Error al actualizar', 'error')
    }
  }
  
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  if (status === 'loading' || session?.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-aviva-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="p-2 rounded-lg hover:bg-aviva-gray transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Gestionar canciones</h1>
          <p className="text-aviva-text-muted">{songs.length} canciones</p>
        </div>
        <Link href="/admin/canciones/nueva" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nueva canción
        </Link>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar canciones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-aviva max-w-md"
        />
      </div>
      
      {/* Songs Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-xl" />
          ))}
        </div>
      ) : filteredSongs.length > 0 ? (
        <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-aviva-gray">
                  <th className="text-left p-4 text-aviva-text-muted font-medium">Canción</th>
                  <th className="text-left p-4 text-aviva-text-muted font-medium hidden sm:table-cell">Artista</th>
                  <th className="text-left p-4 text-aviva-text-muted font-medium hidden md:table-cell">Tonalidad</th>
                  <th className="text-center p-4 text-aviva-text-muted font-medium">Destacada</th>
                  <th className="text-right p-4 text-aviva-text-muted font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.map(song => (
                  <tr key={song.id} className="border-b border-aviva-gray/50 hover:bg-aviva-gray/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-aviva-gray flex-shrink-0">
                          {song.albumCover ? (
                            <img src={song.albumCover} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-aviva-gold/10">
                              <Music size={16} className="text-aviva-gold/50" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{song.title}</p>
                          <p className="text-sm text-aviva-text-muted sm:hidden">{song.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-aviva-text-muted hidden sm:table-cell">{song.artist || '-'}</td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-full bg-aviva-gold/20 text-aviva-gold text-sm font-medium">
                        {song.originalKey}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleFeatured(song.id, song.isFeatured)}
                        className={`p-2 rounded-lg transition-colors ${
                          song.isFeatured 
                            ? 'text-yellow-500 bg-yellow-500/20' 
                            : 'text-aviva-text-muted hover:bg-aviva-gray'
                        }`}
                      >
                        <Star size={18} fill={song.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/canciones/${song.id}`}
                          className="p-2 rounded-lg hover:bg-aviva-gray transition-colors text-aviva-text-muted hover:text-aviva-text"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => deleteSong(song.id, song.title)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-aviva-text-muted hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Music className="mx-auto mb-4 text-aviva-text-muted" size={48} />
          <p className="text-aviva-text-muted">
            {searchQuery ? 'No se encontraron canciones' : 'No hay canciones'}
          </p>
        </div>
      )}
    </div>
  )
}

