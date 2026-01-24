'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ListPlus, 
  ChevronUp, 
  ChevronDown,
  Music,
  Eye,
  EyeOff,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'
import { ChordDiagram, ChordModal } from '@/components/ui/ChordDiagram'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { 
  transposeLyrics, 
  getAllKeys, 
  getSemitones,
  extractChords,
  formatLyricsWithChords,
  getLyricsOnly
} from '@/lib/chords'

interface Song {
  id: string
  title: string
  artist: string | null
  album: string | null
  albumCover: string | null
  originalKey: string
  tempo: number | null
  lyrics: string
  lyricsChords: string
  spotifyUrl: string | null
  youtubeUrl: string | null
  audioUrl: string | null
}

interface Playlist {
  id: string
  name: string
  _count?: { songs: number }
}

export default function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentKey, setCurrentKey] = useState('')
  const [showChords, setShowChords] = useState(true)
  const [selectedChord, setSelectedChord] = useState<string | null>(null)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [copied, setCopied] = useState(false)
  
  useEffect(() => {
    fetchSong()
    if (session?.user?.id) {
      fetchFavoriteStatus()
      fetchPlaylists()
    }
  }, [resolvedParams.id, session])
  
  async function fetchSong() {
    try {
      const res = await fetch(`/api/songs/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setSong(data)
        setCurrentKey(data.originalKey)
      } else {
        router.push('/canciones')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function fetchFavoriteStatus() {
    try {
      const res = await fetch(`/api/favorites/check/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setIsFavorite(data.isFavorite)
      }
    } catch (error) {
      console.error('Error:', error)
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
      console.error('Error:', error)
    }
  }
  
  async function toggleFavorite() {
    if (!session) {
      showToast('Inicia sesión para guardar favoritos', 'warning')
      return
    }
    
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: song?.id }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setIsFavorite(data.favorited)
        showToast(
          data.favorited ? 'Agregado a favoritos' : 'Eliminado de favoritos',
          data.favorited ? 'success' : 'info'
        )
      }
    } catch (error) {
      showToast('Error al actualizar favoritos', 'error')
    }
  }
  
  async function addToPlaylist(playlistId: string) {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          songId: song?.id,
          customKey: currentKey !== song?.originalKey ? currentKey : undefined
        }),
      })
      
      if (res.ok) {
        showToast('Canción agregada a la lista', 'success')
        setShowPlaylistModal(false)
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al agregar', 'error')
      }
    } catch (error) {
      showToast('Error al agregar canción', 'error')
    }
  }
  
  function transposeUp() {
    const keys = getAllKeys()
    const currentIndex = keys.indexOf(currentKey)
    const newIndex = (currentIndex + 1) % keys.length
    setCurrentKey(keys[newIndex])
  }
  
  function transposeDown() {
    const keys = getAllKeys()
    const currentIndex = keys.indexOf(currentKey)
    const newIndex = (currentIndex - 1 + keys.length) % keys.length
    setCurrentKey(keys[newIndex])
  }
  
  function getTransposedLyrics(): string {
    if (!song) return ''
    const semitones = getSemitones(song.originalKey, currentKey)
    return transposeLyrics(song.lyricsChords, semitones)
  }
  
  function copyLyrics() {
    if (!song) return
    
    const text = showChords 
      ? getTransposedLyrics().replace(/\[([^\]]+)\]/g, '[$1]')
      : song.lyrics
    
    navigator.clipboard.writeText(text)
    setCopied(true)
    showToast('Letra copiada al portapapeles', 'success')
    setTimeout(() => setCopied(false), 2000)
  }
  
  function shareToWhatsApp() {
    if (!song) return
    
    const text = `🎵 *${song.title}*${song.artist ? ` - ${song.artist}` : ''}\n\nTonalidad: ${currentKey}\n\n${
      showChords 
        ? getTransposedLyrics().replace(/\[([^\]]+)\]/g, '[$1]')
        : song.lyrics
    }\n\n_Enviado desde AVIVA Worship_`
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="h-8 w-32 skeleton rounded-lg mb-6" />
        <div className="h-64 skeleton rounded-2xl mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-6 skeleton rounded" style={{ width: `${Math.random() * 40 + 60}%` }} />
          ))}
        </div>
      </div>
    )
  }
  
  if (!song) return null
  
  const transposedLyrics = getTransposedLyrics()
  const formattedLyrics = formatLyricsWithChords(transposedLyrics)
  const uniqueChords = extractChords(transposedLyrics)
  
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
      
      {/* Song Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Album Cover */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-aviva-gray flex-shrink-0 mx-auto sm:mx-0">
          {song.albumCover ? (
            <img 
              src={song.albumCover} 
              alt={song.album || song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-aviva-gold/20 to-aviva-gold/5">
              <Music size={48} className="text-aviva-gold/40" />
            </div>
          )}
        </div>
        
        {/* Song Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{song.title}</h1>
          {song.artist && (
            <p className="text-lg text-aviva-text-muted mb-2">{song.artist}</p>
          )}
          {song.album && (
            <p className="text-sm text-aviva-text-muted mb-4">{song.album}</p>
          )}
          
          {/* Metadata */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-aviva-gold/20 text-aviva-gold font-medium text-sm">
              {currentKey}
            </span>
            {song.tempo && (
              <span className="px-3 py-1 rounded-full bg-aviva-gray text-aviva-text-muted text-sm">
                {song.tempo} BPM
              </span>
            )}
          </div>
          
          {/* External Links */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {song.spotifyUrl && (
              <a
                href={song.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1DB954]/20 text-[#1DB954] hover:bg-[#1DB954]/30 transition-colors text-sm font-medium"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify
              </a>
            )}
            {song.youtubeUrl && (
              <a
                href={song.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF0000]/20 text-[#FF0000] hover:bg-[#FF0000]/30 transition-colors text-sm font-medium"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
            )}
            {song.audioUrl && (
              <a
                href={song.audioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-aviva-gold/20 text-aviva-gold hover:bg-aviva-gold/30 transition-colors text-sm font-medium"
              >
                <ExternalLink size={16} />
                Audio
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={toggleFavorite}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            isFavorite 
              ? 'bg-red-500/20 text-red-500' 
              : 'bg-aviva-gray text-aviva-text hover:bg-aviva-gray-light'
          }`}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          {isFavorite ? 'Favorito' : 'Agregar'}
        </button>
        
        <button
          onClick={() => setShowPlaylistModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-aviva-gray text-aviva-text hover:bg-aviva-gray-light font-medium transition-all"
        >
          <ListPlus size={18} />
          A lista
        </button>
        
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-aviva-gray text-aviva-text hover:bg-aviva-gray-light font-medium transition-all"
        >
          <Share2 size={18} />
          Compartir
        </button>
      </div>
      
      {/* Transpose Controls */}
      <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-aviva-text-muted">Tonalidad:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={transposeDown}
                className="p-2 rounded-lg bg-aviva-gray hover:bg-aviva-gray-light transition-colors"
              >
                <ChevronDown size={20} />
              </button>
              <span className="w-12 text-center text-xl font-bold text-aviva-gold">
                {currentKey}
              </span>
              <button
                onClick={transposeUp}
                className="p-2 rounded-lg bg-aviva-gray hover:bg-aviva-gray-light transition-colors"
              >
                <ChevronUp size={20} />
              </button>
            </div>
            {currentKey !== song.originalKey && (
              <button
                onClick={() => setCurrentKey(song.originalKey)}
                className="text-sm text-aviva-gold hover:underline"
              >
                Original ({song.originalKey})
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowChords(!showChords)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-aviva-gray hover:bg-aviva-gray-light transition-colors"
          >
            {showChords ? <EyeOff size={18} /> : <Eye size={18} />}
            {showChords ? 'Ocultar acordes' : 'Mostrar acordes'}
          </button>
        </div>
      </div>
      
      {/* Chord Reference (only when showing chords) */}
      {showChords && uniqueChords.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-aviva-text-muted mb-3">
            Acordes usados (toca para ver diagrama)
          </h3>
          <div className="flex flex-wrap gap-2">
            {uniqueChords.map(chord => (
              <button
                key={chord}
                onClick={() => setSelectedChord(chord)}
                className="px-3 py-2 rounded-lg bg-aviva-gold/20 text-aviva-gold font-mono font-bold hover:bg-aviva-gold/30 transition-colors"
              >
                {chord}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Lyrics */}
      <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl p-6">
        {showChords ? (
          <div className="lyrics-line font-mono">
            {formattedLyrics.map((line, lineIdx) => (
              <div key={lineIdx} className="min-h-[1.5em]">
                {line.map((part, partIdx) => (
                  part.type === 'chord' ? (
                    <button
                      key={partIdx}
                      onClick={() => setSelectedChord(part.content)}
                      className="chord"
                    >
                      {part.content}
                    </button>
                  ) : (
                    <span key={partIdx}>{part.content}</span>
                  )
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="lyrics-only whitespace-pre-wrap text-lg">
            {song.lyrics}
          </div>
        )}
      </div>
      
      {/* Chord Modal */}
      <ChordModal 
        chord={selectedChord} 
        onClose={() => setSelectedChord(null)} 
      />
      
      {/* Playlist Modal */}
      <Modal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        title="Agregar a lista"
      >
        {playlists.length > 0 ? (
          <div className="space-y-2">
            {playlists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => addToPlaylist(playlist.id)}
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
            <button
              onClick={() => {
                setShowPlaylistModal(false)
                router.push('/listas')
              }}
              className="btn-primary"
            >
              Crear lista
            </button>
          </div>
        )}
      </Modal>
      
      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Compartir canción"
      >
        <div className="space-y-3">
          <button
            onClick={shareToWhatsApp}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#25D366]">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="font-medium">Enviar por WhatsApp</span>
          </button>
          
          <button
            onClick={copyLyrics}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-aviva-gray hover:bg-aviva-gray-light transition-colors"
          >
            {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
            <span className="font-medium">
              {copied ? '¡Copiado!' : 'Copiar letra'}
            </span>
          </button>
        </div>
      </Modal>
    </div>
  )
}

