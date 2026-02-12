'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Share2,
  Edit2,
  Plus,
  Users,
  Music,
  Trash2,
  Play,
  GripVertical
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Song {
  id: string
  slug: string
  title: string
  artist: string | null
  album: string | null
  albumCover: string | null
  originalKey: string
}

interface PlaylistSong {
  id: string
  songId: string
  customKey: string | null
  order: number
  song: Song
}

interface SharedUser {
  id: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  canEdit: boolean
}

interface Playlist {
  id: string
  name: string
  description: string | null
  shareCode: string | null
  isPublic: boolean
  userId: string
  songs: PlaylistSong[]
  user: {
    id: string
    name: string | null
    image: string | null
  }
  sharedWithUsers: SharedUser[]
  isOwner: boolean
  canEdit: boolean
}

// Sortable Song Item Component
function SortableSongItem({
  playlistSong,
  index,
  onRemove,
  playlistId,
  canEdit
}: {
  playlistSong: PlaylistSong
  index: number
  onRemove?: () => void
  playlistId: string
  canEdit: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: playlistSong.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto'
  }

  const song = playlistSong.song
  const songUrl = `/canciones/${song.slug}?lista=${playlistId}&index=${index}`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-xl hover:bg-aviva-gray/50 transition-colors group ${
        isDragging ? 'bg-aviva-gray shadow-lg' : ''
      }`}
    >
      {/* Drag Handle */}
      {canEdit && (
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-aviva-text-muted hover:text-aviva-text cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={18} />
        </button>
      )}

      {/* Song Number */}
      <span className="w-6 text-center text-aviva-text-muted text-sm font-medium">
        {index + 1}
      </span>

      {/* Song Link */}
      <Link href={songUrl} className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-aviva-gray flex-shrink-0">
          {song.albumCover ? (
            <img
              src={song.albumCover}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-aviva-gold/20 to-aviva-gold/5">
              <span className="text-sm font-bold text-aviva-gold/50">
                {song.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-aviva-text truncate group-hover:text-aviva-gold transition-colors">
            {song.title}
          </h4>
          <p className="text-sm text-aviva-text-muted truncate">{song.artist}</p>
        </div>

        <span className="text-xs px-2 py-0.5 rounded-full bg-aviva-gold/20 text-aviva-gold font-medium">
          {playlistSong.customKey || song.originalKey}
        </span>
      </Link>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-2 text-aviva-text-muted hover:text-red-500 transition-all sm:opacity-0 sm:group-hover:opacity-100"
          title="Eliminar de la lista"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  )
}

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showAddSongModal, setShowAddSongModal] = useState(false)
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [shareEmail, setShareEmail] = useState('')
  const [shareCanEdit, setShareCanEdit] = useState(true)

  // DnD sensors with touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchPlaylist()
  }, [resolvedParams.id])

  async function fetchPlaylist() {
    try {
      const res = await fetch(`/api/playlists/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setPlaylist(data)
      } else {
        router.push('/listas')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAvailableSongs() {
    try {
      const res = await fetch('/api/songs')
      if (res.ok) {
        const data = await res.json()
        // Filter out songs already in playlist
        const playlistSongIds = new Set(playlist?.songs.map(s => s.songId) || [])
        setAvailableSongs(data.songs.filter((s: Song) => !playlistSongIds.has(s.id)))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function addSongToPlaylist(songId: string) {
    try {
      const res = await fetch(`/api/playlists/${playlist?.id}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      })

      if (res.ok) {
        const newSong = await res.json()
        setPlaylist(prev => prev ? {
          ...prev,
          songs: [...prev.songs, newSong]
        } : null)
        setAvailableSongs(prev => prev.filter(s => s.id !== songId))
        showToast('Canción agregada', 'success')
      }
    } catch (error) {
      showToast('Error al agregar canción', 'error')
    }
  }

  async function removeSongFromPlaylist(songId: string) {
    try {
      const res = await fetch(`/api/playlists/${playlist?.id}/songs`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      })

      if (res.ok) {
        setPlaylist(prev => prev ? {
          ...prev,
          songs: prev.songs.filter(s => s.songId !== songId)
        } : null)
        showToast('Canción eliminada de la lista', 'info')
      }
    } catch (error) {
      showToast('Error al eliminar canción', 'error')
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id || !playlist) {
      return
    }

    const oldIndex = playlist.songs.findIndex(s => s.id === active.id)
    const newIndex = playlist.songs.findIndex(s => s.id === over.id)

    const newSongs = arrayMove(playlist.songs, oldIndex, newIndex)

    // Optimistic update
    setPlaylist(prev => prev ? { ...prev, songs: newSongs } : null)

    // Update order in the backend
    try {
      // Update each song's order
      await Promise.all(
        newSongs.map((song, index) =>
          fetch(`/api/playlists/${playlist.id}/songs`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              songId: song.songId,
              order: index
            }),
          })
        )
      )
    } catch (error) {
      // Revert on error
      showToast('Error al reordenar', 'error')
      fetchPlaylist()
    }
  }

  async function shareWithUser() {
    if (!shareEmail.trim()) {
      showToast('Ingresa un email', 'warning')
      return
    }

    try {
      const res = await fetch('/api/playlists/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistId: playlist?.id,
          email: shareEmail,
          canEdit: shareCanEdit,
        }),
      })

      if (res.ok) {
        showToast('Lista compartida exitosamente', 'success')
        setShareEmail('')
        fetchPlaylist()
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al compartir', 'error')
      }
    } catch (error) {
      showToast('Error al compartir', 'error')
    }
  }

  async function removeShare(userId: string) {
    try {
      const res = await fetch('/api/playlists/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistId: playlist?.id,
          userId,
        }),
      })

      if (res.ok) {
        setPlaylist(prev => prev ? {
          ...prev,
          sharedWithUsers: prev.sharedWithUsers.filter(s => s.user.id !== userId)
        } : null)
        showToast('Acceso eliminado', 'info')
      }
    } catch (error) {
      showToast('Error', 'error')
    }
  }

  function copyShareCode() {
    if (!playlist?.shareCode) return
    navigator.clipboard.writeText(playlist.shareCode)
    showToast('Código copiado', 'success')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="h-8 w-32 skeleton rounded-lg mb-6" />
        <div className="h-32 skeleton rounded-2xl mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!playlist) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-aviva-text-muted hover:text-aviva-text mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>

      {/* Playlist Header */}
      <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Cover Grid */}
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-aviva-gray flex-shrink-0">
            {playlist.songs.length > 0 ? (
              <div className="grid grid-cols-2 w-full h-full">
                {playlist.songs.slice(0, 4).map((ps, i) => (
                  <div key={i} className="relative">
                    {ps.song.albumCover ? (
                      <img src={ps.song.albumCover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-aviva-gray-light" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music size={32} className="text-aviva-text-muted" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-aviva-text-muted mb-2">{playlist.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-aviva-text-muted">
              <span>{playlist.songs.length} canciones</span>
              {!playlist.isOwner && (
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  Por {playlist.user.name}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {playlist.songs.length > 0 && (
              <button
                onClick={() => router.push(`/listas/${playlist.id}/tocar`)}
                className="btn-primary flex items-center justify-center gap-1.5 text-sm px-3 py-2"
              >
                <Play size={16} fill="currentColor" />
                <span>Tocar</span>
              </button>
            )}
            {playlist.isOwner && (
              <>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="btn-secondary flex items-center justify-center gap-1.5 text-sm px-3 py-2"
                >
                  <Share2 size={16} />
                  <span>Compartir</span>
                </button>
                <button
                  onClick={() => router.push(`/listas/${playlist.id}/editar`)}
                  className="btn-secondary flex items-center justify-center gap-1.5 text-sm px-3 py-2"
                >
                  <Edit2 size={16} />
                  <span>Editar</span>
                </button>
              </>
            )}
            {playlist.canEdit && (
              <button
                onClick={() => {
                  fetchAvailableSongs()
                  setShowAddSongModal(true)
                }}
                className="btn-secondary flex items-center justify-center gap-1.5 text-sm px-3 py-2"
              >
                <Plus size={16} />
                <span>Agregar</span>
              </button>
            )}
          </div>
        </div>

        {/* Shared Users */}
        {playlist.isOwner && playlist.sharedWithUsers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-aviva-gray">
            <p className="text-sm text-aviva-text-muted mb-2">Compartida con:</p>
            <div className="flex flex-wrap gap-2">
              {playlist.sharedWithUsers.map(share => (
                <div
                  key={share.user.id}
                  className="flex items-center gap-2 bg-aviva-gray rounded-full pl-1 pr-3 py-1"
                >
                  {share.user.image ? (
                    <img src={share.user.image} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-aviva-gold/20 flex items-center justify-center">
                      <span className="text-xs text-aviva-gold">{share.user.name?.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-sm">{share.user.name}</span>
                  <button
                    onClick={() => removeShare(share.user.id)}
                    className="text-aviva-text-muted hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reorder hint */}
      {playlist.canEdit && playlist.songs.length > 1 && (
        <p className="text-xs text-aviva-text-muted mb-2 flex items-center gap-1">
          <GripVertical size={14} />
          Arrastra para reordenar las canciones
        </p>
      )}

      {/* Songs List with Drag and Drop */}
      <div className="space-y-1">
        {playlist.songs.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={playlist.songs.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {playlist.songs.map((ps, index) => (
                <SortableSongItem
                  key={ps.id}
                  playlistSong={ps}
                  index={index}
                  onRemove={playlist.canEdit ? () => removeSongFromPlaylist(ps.songId) : undefined}
                  playlistId={playlist.id}
                  canEdit={playlist.canEdit}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-16">
            <Music className="mx-auto mb-4 text-aviva-text-muted" size={48} />
            <p className="text-aviva-text-muted mb-4">
              Esta lista está vacía
            </p>
            {playlist.canEdit && (
              <button
                onClick={() => {
                  fetchAvailableSongs()
                  setShowAddSongModal(true)
                }}
                className="btn-primary"
              >
                Agregar canciones
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Song Modal */}
      <Modal
        isOpen={showAddSongModal}
        onClose={() => setShowAddSongModal(false)}
        title="Agregar canción"
        size="lg"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableSongs.length > 0 ? (
            availableSongs.map(song => (
              <button
                key={song.id}
                onClick={() => addSongToPlaylist(song.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-aviva-gray transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-aviva-gray flex-shrink-0">
                  {song.albumCover ? (
                    <img src={song.albumCover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-aviva-gold/10">
                      <Music size={16} className="text-aviva-gold/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-aviva-text-muted truncate">{song.artist}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-aviva-gold/20 text-aviva-gold">
                  {song.originalKey}
                </span>
              </button>
            ))
          ) : (
            <p className="text-center text-aviva-text-muted py-8">
              No hay más canciones disponibles
            </p>
          )}
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Compartir lista"
      >
        <div className="space-y-4">
          {/* Share Code */}
          <div className="bg-aviva-gray rounded-xl p-4">
            <p className="text-sm text-aviva-text-muted mb-2">Código de invitación:</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-lg text-aviva-gold font-bold flex-1">
                {playlist.shareCode}
              </p>
              <button
                onClick={copyShareCode}
                className="btn-secondary py-2"
              >
                Copiar
              </button>
            </div>
          </div>

          {/* Share by Email */}
          <div>
            <p className="text-sm text-aviva-text-muted mb-2">O comparte por email:</p>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="input-aviva mb-2"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={shareCanEdit}
                onChange={(e) => setShareCanEdit(e.target.checked)}
                className="rounded border-aviva-gray"
              />
              Permitir editar la lista
            </label>
          </div>

          <button
            onClick={shareWithUser}
            className="btn-primary w-full"
          >
            Compartir
          </button>
        </div>
      </Modal>
    </div>
  )
}
