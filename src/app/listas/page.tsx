'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, ListMusic, Link2 } from 'lucide-react'
import { PlaylistCard } from '@/components/ui/PlaylistCard'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

interface Playlist {
  id: string
  name: string
  description?: string | null
  shareCode?: string | null
  isPublic: boolean
  _count?: { songs: number }
  songs?: { song: { albumCover?: string | null } }[]
}

export default function ListasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [sharedPlaylists, setSharedPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/listas')
    } else if (session?.user?.id) {
      fetchPlaylists()
    }
  }, [session, status])
  
  async function fetchPlaylists() {
    try {
      const res = await fetch('/api/playlists')
      if (res.ok) {
        const data = await res.json()
        setPlaylists(data.playlists || [])
        setSharedPlaylists(data.sharedPlaylists || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function createPlaylist() {
    if (!newPlaylistName.trim()) {
      showToast('Ingresa un nombre para la lista', 'warning')
      return
    }
    
    setCreating(true)
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlaylistName,
          description: newPlaylistDesc || null,
        }),
      })
      
      if (res.ok) {
        const playlist = await res.json()
        setPlaylists(prev => [playlist, ...prev])
        setShowCreateModal(false)
        setNewPlaylistName('')
        setNewPlaylistDesc('')
        showToast('Lista creada exitosamente', 'success')
      } else {
        showToast('Error al crear la lista', 'error')
      }
    } catch (error) {
      showToast('Error al crear la lista', 'error')
    } finally {
      setCreating(false)
    }
  }
  
  async function deletePlaylist(playlistId: string) {
    if (!confirm('¿Estás seguro de eliminar esta lista?')) return
    
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        setPlaylists(prev => prev.filter(p => p.id !== playlistId))
        showToast('Lista eliminada', 'success')
      }
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }
  
  async function joinPlaylist() {
    if (!joinCode.trim()) {
      showToast('Ingresa un código de invitación', 'warning')
      return
    }
    
    try {
      const res = await fetch(`/api/playlists/join/${joinCode}`, {
        method: 'POST',
      })
      
      const data = await res.json()
      
      if (res.ok) {
        showToast(`Te uniste a "${data.playlistName}"`, 'success')
        setShowJoinModal(false)
        setJoinCode('')
        fetchPlaylists()
      } else {
        showToast(data.error || 'Código inválido', 'error')
      }
    } catch (error) {
      showToast('Error al unirse', 'error')
    }
  }
  
  function handleShare(playlist: Playlist) {
    setSelectedPlaylist(playlist)
    setShowShareModal(true)
  }
  
  function copyShareCode() {
    if (!selectedPlaylist?.shareCode) return
    const text = `🎶 Te invito a colaborar en mi lista "${selectedPlaylist.name}"\n\nCódigo: ${selectedPlaylist.shareCode}`
    navigator.clipboard.writeText(text)
    showToast('Invitación copiada', 'success')
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="h-8 w-32 skeleton rounded-lg mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Mis listas</h1>
          <p className="text-aviva-text-muted">
            {playlists.length + sharedPlaylists.length} listas
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Link2 size={18} />
            <span className="hidden sm:inline">Unirse</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nueva lista</span>
          </button>
        </div>
      </div>
      
      {/* Own Playlists */}
      {playlists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Mis listas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {playlists.map(playlist => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onShare={handleShare}
                onEdit={(id) => router.push(`/listas/${id}/editar`)}
                onDelete={deletePlaylist}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Shared Playlists */}
      {sharedPlaylists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Compartidas conmigo</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sharedPlaylists.map(playlist => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                isShared
                onShare={handleShare}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Empty State */}
      {playlists.length === 0 && sharedPlaylists.length === 0 && (
        <div className="text-center py-16">
          <ListMusic className="mx-auto mb-4 text-aviva-text-muted" size={64} />
          <h2 className="text-xl font-semibold mb-2">No tienes listas</h2>
          <p className="text-aviva-text-muted mb-6">
            Crea una lista para organizar tus canciones favoritas
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Crear primera lista
          </button>
        </div>
      )}
      
      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva lista"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Ej: Domingo de adoración"
              className="input-aviva"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Descripción (opcional)</label>
            <textarea
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
              placeholder="Describe tu lista..."
              className="input-aviva resize-none"
              rows={3}
            />
          </div>
          
          <button
            onClick={createPlaylist}
            disabled={creating}
            className="btn-primary w-full"
          >
            {creating ? 'Creando...' : 'Crear lista'}
          </button>
        </div>
      </Modal>
      
      {/* Join Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Unirse a una lista"
      >
        <div className="space-y-4">
          <p className="text-aviva-text-muted">
            Ingresa el código de invitación para unirte a una lista compartida.
          </p>
          
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Código de invitación"
            className="input-aviva"
            autoFocus
          />
          
          <button
            onClick={joinPlaylist}
            className="btn-primary w-full"
          >
            Unirse
          </button>
        </div>
      </Modal>
      
      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Compartir lista"
      >
        {selectedPlaylist && (
          <div className="space-y-4">
            <p className="text-aviva-text-muted">
              Comparte este enlace con otros músicos para que puedan ver tu lista.
            </p>
            
            <div className="bg-aviva-gray rounded-xl p-4">
              <p className="text-sm text-aviva-text-muted mb-2">Código de invitación:</p>
              <p className="font-mono text-lg text-aviva-gold font-bold">
                {selectedPlaylist.shareCode}
              </p>
            </div>
            
            <button
              onClick={copyShareCode}
              className="btn-primary w-full"
            >
              Copiar enlace
            </button>
            
            <button
              onClick={() => {
                const link = `${window.location.origin}/listas/join/${selectedPlaylist.shareCode}`
                const text = `¡Únete a mi lista "${selectedPlaylist.name}" en AVIVA Worship!\n\n${link}`
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
              }}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Compartir por WhatsApp
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

