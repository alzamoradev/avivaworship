'use client'

import Link from 'next/link'
import { ListMusic, Share2, MoreVertical, Trash2, Edit2, Users } from 'lucide-react'
import { useState } from 'react'

interface Playlist {
  id: string
  name: string
  description?: string | null
  shareCode?: string | null
  isPublic: boolean
  _count?: {
    songs: number
  }
  songs?: {
    song: {
      albumCover?: string | null
    }
  }[]
}

interface PlaylistCardProps {
  playlist: Playlist
  onEdit?: (playlistId: string) => void
  onDelete?: (playlistId: string) => void
  onShare?: (playlist: Playlist) => void
  isShared?: boolean
}

export function PlaylistCard({ 
  playlist, 
  onEdit, 
  onDelete, 
  onShare,
  isShared = false 
}: PlaylistCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  
  // Get first 4 album covers for grid
  const covers = playlist.songs?.slice(0, 4).map(ps => ps.song.albumCover) || []
  const songCount = playlist._count?.songs || playlist.songs?.length || 0
  
  return (
    <div className="card-aviva group relative">
      <Link href={`/listas/${playlist.id}`} className="block">
        {/* Cover Grid */}
        <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-aviva-gray">
          {covers.length > 0 ? (
            <div className="grid grid-cols-2 w-full h-full">
              {covers.map((cover, i) => (
                <div key={i} className="relative">
                  {cover ? (
                    <img 
                      src={cover} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-aviva-gray-light" />
                  )}
                </div>
              ))}
              {covers.length < 4 && (
                Array.from({ length: 4 - covers.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-aviva-gray-light" />
                ))
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-aviva-gold/20 to-aviva-gold/5">
              <ListMusic size={48} className="text-aviva-gold/40" />
            </div>
          )}
          
          {/* Shared indicator */}
          {isShared && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-aviva-gold/90 text-aviva-black text-xs font-medium flex items-center gap-1">
              <Users size={12} />
              Compartida
            </div>
          )}
        </div>
        
        {/* Info */}
        <h3 className="font-semibold text-aviva-text truncate group-hover:text-aviva-gold transition-colors">
          {playlist.name}
        </h3>
        <p className="text-sm text-aviva-text-muted">
          {songCount} {songCount === 1 ? 'canción' : 'canciones'}
        </p>
        {playlist.description && (
          <p className="text-sm text-aviva-text-muted truncate mt-1">
            {playlist.description}
          </p>
        )}
      </Link>
      
      {/* Actions Menu */}
      {(onEdit || onDelete || onShare) && (
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              setMenuOpen(!menuOpen)
            }}
            className="p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
          >
            <MoreVertical size={18} />
          </button>
          
          {menuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setMenuOpen(false)} 
              />
              <div className="absolute right-0 top-full mt-1 w-48 py-2 bg-aviva-dark border border-aviva-gray rounded-xl shadow-xl z-50 animate-slide-down">
                {onShare && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      onShare(playlist)
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-aviva-gray transition-colors"
                  >
                    <Share2 size={16} />
                    <span>Compartir</span>
                  </button>
                )}
                {onEdit && !isShared && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      onEdit(playlist.id)
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-aviva-gray transition-colors"
                  >
                    <Edit2 size={16} />
                    <span>Editar</span>
                  </button>
                )}
                {onDelete && !isShared && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      onDelete(playlist.id)
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-aviva-gray transition-colors text-red-400"
                  >
                    <Trash2 size={16} />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

