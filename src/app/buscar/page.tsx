'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Music, X } from 'lucide-react'
import Link from 'next/link'

interface Song {
  id: string
  slug: string
  title: string
  artist: string | null
  album: string | null
  albumCover: string | null
  originalKey: string
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function BuscarPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const debouncedQuery = useDebounce(query, 300)

  // Fetch suggestions when query changes
  useEffect(() => {
    async function fetchSuggestions() {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/songs?q=${encodeURIComponent(debouncedQuery)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.songs || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setShowSuggestions(true)
  }

  function clearSearch() {
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  function handleSongClick(slug: string) {
    setShowSuggestions(false)
    router.push(`/canciones/${slug}`)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('.search-container')) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search Form */}
      <div className="search-container relative mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-aviva-text-muted" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Buscar por titulo, artista o album..."
            className="input-aviva pl-12 pr-12 py-4 text-lg"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-aviva-text-muted hover:text-aviva-text transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-aviva-dark-lighter border border-aviva-gray rounded-2xl shadow-xl z-50 overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 skeleton rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton rounded w-3/4" />
                      <div className="h-3 skeleton rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {suggestions.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => handleSongClick(song.slug)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-aviva-gray/50 transition-colors text-left"
                  >
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
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-sm text-aviva-text-muted truncate">{song.artist}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-aviva-gold/20 text-aviva-gold">
                      {song.originalKey}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Music className="mx-auto mb-2 text-aviva-text-muted" size={32} />
                <p className="text-aviva-text-muted">
                  No se encontraron resultados
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      {!query && (
        <div className="text-center py-16">
          <Search className="mx-auto mb-4 text-aviva-text-muted" size={48} />
          <p className="text-aviva-text-muted">
            Escribe para buscar canciones
          </p>
          <p className="text-sm text-aviva-text-muted mt-2">
            Puedes buscar por titulo, artista o album
          </p>
        </div>
      )}
    </div>
  )
}
