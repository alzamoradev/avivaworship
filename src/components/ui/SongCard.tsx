'use client'

import Link from 'next/link'
import { ListPlus, Play, Trash2 } from 'lucide-react'

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
  onAddToPlaylist?: (songId: string) => void
  showOptions?: boolean
}

export function SongCard({
  song,
  onAddToPlaylist,
  showOptions = true
}: SongCardProps) {
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

      {/* Add to Playlist Button */}
      {showOptions && onAddToPlaylist && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToPlaylist(song.id)
            }}
            className="p-2 rounded-full text-aviva-text-muted hover:text-aviva-gold hover:bg-aviva-gold/10 transition-all"
            title="Agregar a lista"
          >
            <ListPlus size={22} />
          </button>
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
  customKey,
  playlistId
}: {
  song: Song
  index?: number
  onRemove?: () => void
  customKey?: string
  playlistId?: string
}) {
  // Build URL with playlist context if available
  const songUrl = playlistId && index !== undefined
    ? `/canciones/${song.slug}?lista=${playlistId}&index=${index}`
    : `/canciones/${song.slug}`

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-aviva-gray/50 transition-colors group">
      {index !== undefined && (
        <span className="w-6 text-center text-aviva-text-muted text-sm font-medium">
          {index + 1}
        </span>
      )}

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
          {customKey || song.originalKey}
        </span>
      </Link>

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
