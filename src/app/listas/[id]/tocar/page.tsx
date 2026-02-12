'use client'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  List,
  X
} from 'lucide-react'
import { ChordModal } from '@/components/ui/ChordDiagram'
import {
  transposeLyrics,
  getAllKeys,
  getSemitones,
  formatLyricsForWrapping
} from '@/lib/chords'

interface Song {
  id: string
  slug: string
  title: string
  artist: string | null
  originalKey: string
  lyricsChords: string
}

interface PlaylistSong {
  id: string
  songId: string
  customKey: string | null
  order: number
  song: Song
}

interface Playlist {
  id: string
  name: string
  songs: PlaylistSong[]
}

export default function PlaylistPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentKey, setCurrentKey] = useState('')
  const [selectedChord, setSelectedChord] = useState<string | null>(null)
  const [showSongList, setShowSongList] = useState(false)

  // Touch handling for swipe
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    fetchPlaylist()
  }, [resolvedParams.id])

  async function fetchPlaylist() {
    try {
      const res = await fetch(`/api/playlists/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setPlaylist(data)
        if (data.songs.length > 0) {
          const firstSong = data.songs[0]
          setCurrentKey(firstSong.customKey || firstSong.song.originalKey)
        }
      } else {
        router.push('/listas')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentSong = playlist?.songs[currentIndex]

  // Update key when changing song
  useEffect(() => {
    if (currentSong) {
      setCurrentKey(currentSong.customKey || currentSong.song.originalKey)
    }
  }, [currentIndex, currentSong])

  function goToPrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  function goToNext() {
    if (playlist && currentIndex < playlist.songs.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  function goToSong(index: number) {
    setCurrentIndex(index)
    setShowSongList(false)
  }

  function transposeUp() {
    const keys = getAllKeys()
    const currentIdx = keys.indexOf(currentKey)
    const newIndex = (currentIdx + 1) % keys.length
    setCurrentKey(keys[newIndex])
  }

  function transposeDown() {
    const keys = getAllKeys()
    const currentIdx = keys.indexOf(currentKey)
    const newIndex = (currentIdx - 1 + keys.length) % keys.length
    setCurrentKey(keys[newIndex])
  }

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      } else if (e.key === 'ArrowUp') {
        transposeUp()
      } else if (e.key === 'ArrowDown') {
        transposeDown()
      } else if (e.key === 'Escape') {
        setShowSongList(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, currentKey, playlist])

  // Handle touch swipe
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX
  }

  function handleTouchEnd() {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50 // minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left -> next song
        goToNext()
      } else {
        // Swipe right -> previous song
        goToPrevious()
      }
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-aviva-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-aviva-gold" />
      </div>
    )
  }

  if (!playlist || playlist.songs.length === 0) {
    return (
      <div className="fixed inset-0 bg-aviva-black flex flex-col items-center justify-center p-4">
        <p className="text-aviva-text-muted mb-4">No hay canciones en esta lista</p>
        <button onClick={() => router.back()} className="btn-primary">
          Volver
        </button>
      </div>
    )
  }

  const song = currentSong!.song
  const semitones = getSemitones(song.originalKey, currentKey)
  const transposedLyrics = transposeLyrics(song.lyricsChords, semitones)
  const formattedLyrics = formatLyricsForWrapping(transposedLyrics)

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-aviva-black flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Compact Header */}
      <div className="flex-shrink-0 bg-aviva-dark-lighter/90 backdrop-blur-sm border-b border-aviva-gray px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1.5 text-aviva-text-muted hover:text-aviva-text transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm truncate">{song.title}</h1>
            <p className="text-xs text-aviva-text-muted truncate">
              {currentIndex + 1}/{playlist.songs.length} · {playlist.name}
            </p>
          </div>

          {/* Transpose Controls - Compact */}
          <div className="flex items-center gap-1">
            <button
              onClick={transposeDown}
              className="p-1.5 rounded-lg bg-aviva-gray hover:bg-aviva-gray-light transition-colors"
            >
              <ChevronDown size={16} />
            </button>
            <span className="w-8 text-center text-sm font-bold text-aviva-gold">
              {currentKey}
            </span>
            <button
              onClick={transposeUp}
              className="p-1.5 rounded-lg bg-aviva-gray hover:bg-aviva-gray-light transition-colors"
            >
              <ChevronUp size={16} />
            </button>
          </div>

          <button
            onClick={() => setShowSongList(true)}
            className="p-1.5 text-aviva-text-muted hover:text-aviva-text transition-colors"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Lyrics Content - Full height */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="font-mono text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
          {formattedLyrics.map((line, lineIdx) => (
            <div key={lineIdx} className={`flex flex-wrap ${line.isEmptyLine ? 'h-4' : 'mb-1'}`}>
              {line.chunks.map((chunk, chunkIdx) => (
                <span key={chunkIdx} className="inline-flex flex-col">
                  {chunk.chord ? (
                    <button
                      onClick={() => setSelectedChord(chunk.chord!)}
                      className="text-aviva-gold font-bold hover:text-aviva-gold-light transition-colors text-left h-5 sm:h-6"
                    >
                      {chunk.chord}
                    </button>
                  ) : line.hasChords ? (
                    <span className="h-5 sm:h-6">{'\u00A0'}</span>
                  ) : null}
                  <span className="whitespace-pre-wrap break-words">
                    {chunk.text || '\u00A0'}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Swipe hint at bottom */}
        <div className="text-center text-xs text-aviva-text-muted/50 mt-8 pb-4">
          ← Desliza para cambiar canción →
        </div>
      </div>

      {/* Song List Overlay */}
      {showSongList && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-aviva-dark-lighter w-full sm:w-96 max-h-[80vh] rounded-t-2xl sm:rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-aviva-gray">
              <h2 className="font-bold">Lista de canciones</h2>
              <button
                onClick={() => setShowSongList(false)}
                className="p-2 text-aviva-text-muted hover:text-aviva-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {playlist.songs.map((ps, idx) => (
                <button
                  key={ps.id}
                  onClick={() => goToSong(idx)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                    idx === currentIndex
                      ? 'bg-aviva-gold/20'
                      : 'hover:bg-aviva-gray/50'
                  }`}
                >
                  <span className={`w-6 text-center text-sm font-medium ${
                    idx === currentIndex ? 'text-aviva-gold' : 'text-aviva-text-muted'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      idx === currentIndex ? 'text-aviva-gold' : ''
                    }`}>
                      {ps.song.title}
                    </p>
                    <p className="text-sm text-aviva-text-muted truncate">
                      {ps.song.artist}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-aviva-gold/20 text-aviva-gold">
                    {ps.customKey || ps.song.originalKey}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chord Modal */}
      <ChordModal
        chord={selectedChord}
        onClose={() => setSelectedChord(null)}
      />
    </div>
  )
}
