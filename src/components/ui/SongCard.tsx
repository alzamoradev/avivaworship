'use client'

import Link from 'next/link'
import { Heart, Play, MoreVertical } from 'lucide-react'
import { useState } from 'react'

interface Song {
  id: string
  slug: string
  title: string
  artist?: string | null
  album?: string | null
  albumCover?: string | null
  originalKey: string
}

interface SongCardProps {
  song: Song
  isFavorite?: boolean
  onToggleFavorite?: (songId: string) => void
  onAddToPlaylist?: (songId: string) => void
  showOptions?: boolean
}

export function SongCard({ 
  song, 
  isFavorite = false, 
  onToggleFavorite, 
  onAddToPlaylist,
  showOptions = true 
}: SongCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  
  return (
    <div className="card-aviva group relative">
      <Link href={`/canciones/${song.slug}`} className="flex items-center gap-4">
        {/* Album Cover */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-aviva-gray flex-shrink-0">
          {song.albumCover ? (
            <img 
              src={song.albumCover} 
              alt={song.album || song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-aviva-gold/20 to-aviva-gold/5">
              <span className="text-2xl font-bold text-aviva-gold/50">
                {song.title.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play size={24} className="text-white" fill="white" />
          </div>
        </div>
        
        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-aviva-text truncate group-hover:text-aviva-gold transition-colors">
            {song.title}
          </h3>
          {song.artist && (
            <p className="text-sm text-aviva-text-muted truncate">{song.artist}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-aviva-gold/20 text-aviva-gold font-medium">
              {song.originalKey}
            </span>
            {song.album && (
              <span className="text-xs text-aviva-text-muted truncate">
                {song.album}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      {/* Actions */}
      {showOptions && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onToggleFavorite(song.id)
              }}
              className={`p-2 rounded-full transition-all ${
                isFavorite 
                  ? 'text-red-500 hover:bg-red-500/10' 
                  : 'text-aviva-text-muted hover:text-red-500 hover:bg-aviva-gray'
              }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
          
          {onAddToPlaylist && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setMenuOpen(!menuOpen)
                }}
                className="p-2 rounded-full text-aviva-text-muted hover:text-aviva-text hover:bg-aviva-gray transition-all"
              >
                <MoreVertical size={20} />
              </button>
              
              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 py-2 bg-aviva-dark border border-aviva-gray rounded-xl shadow-xl z-50 animate-slide-down">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        onAddToPlaylist(song.id)
                        setMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-aviva-gray transition-colors"
                    >
                      Agregar a lista
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for playlists
export function SongCardCompact({ 
  song, 
  index,
  onRemove,
  customKey
}: { 
  song: Song
  index?: number
  onRemove?: () => void
  customKey?: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-aviva-gray/50 transition-colors group">
      {index !== undefined && (
        <span className="w-6 text-center text-aviva-text-muted text-sm font-medium">
          {index + 1}
        </span>
      )}
      
      <Link href={`/canciones/${song.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
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
          {customKey || song.originalKey}
        </span>
      </Link>
      
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-2 text-aviva-text-muted hover:text-red-500 transition-all"
        >
          ×
        </button>
      )}
    </div>
  )
}

