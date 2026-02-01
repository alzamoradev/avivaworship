'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, HelpCircle } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { getAllKeys } from '@/lib/chords'

export default function EditarCancionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    albumCover: '',
    originalKey: 'C',
    tempo: '',
    lyrics: '',
    lyricsChords: '',
    chordProgression: '',
    spotifyUrl: '',
    youtubeUrl: '',
    audioUrl: '',
    isFeatured: false,
  })
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchSong()
    }
  }, [session, status, resolvedParams.id])
  
  async function fetchSong() {
    try {
      const res = await fetch(`/api/songs/${resolvedParams.id}`)
      if (res.ok) {
        const song = await res.json()
        setFormData({
          title: song.title || '',
          artist: song.artist || '',
          album: song.album || '',
          albumCover: song.albumCover || '',
          originalKey: song.originalKey || 'C',
          tempo: song.tempo?.toString() || '',
          lyrics: song.lyrics || '',
          lyricsChords: song.lyricsChords || '',
          chordProgression: song.chordProgression || '',
          spotifyUrl: song.spotifyUrl || '',
          youtubeUrl: song.youtubeUrl || '',
          audioUrl: song.audioUrl || '',
          isFeatured: song.isFeatured || false,
        })
      } else {
        router.push('/admin/canciones')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.title || !formData.lyrics || !formData.lyricsChords) {
      showToast('Completa los campos requeridos', 'warning')
      return
    }
    
    setSaving(true)
    
    try {
      const res = await fetch(`/api/songs/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        showToast('Canción actualizada', 'success')
        router.push('/admin/canciones')
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al actualizar', 'error')
      }
    } catch (error) {
      showToast('Error al actualizar', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  async function handleDelete() {
    if (!confirm('¿Estás seguro de eliminar esta canción?')) return
    
    try {
      const res = await fetch(`/api/songs/${resolvedParams.id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        showToast('Canción eliminada', 'success')
        router.push('/admin/canciones')
      } else {
        showToast('Error al eliminar', 'error')
      }
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-aviva-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  if (session?.user?.role !== 'admin') {
    return null
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/canciones"
            className="p-2 rounded-lg hover:bg-aviva-gray transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Editar canción</h1>
        </div>
        
        <button
          onClick={handleDelete}
          className="btn-secondary flex items-center gap-2 text-red-500 border-red-500/50 hover:bg-red-500/10"
        >
          <Trash2 size={18} />
          Eliminar
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Información básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-aviva"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Artista</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="input-aviva"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Álbum</label>
              <input
                type="text"
                value={formData.album}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                className="input-aviva"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">URL de portada</label>
              <input
                type="url"
                value={formData.albumCover}
                onChange={(e) => setFormData({ ...formData, albumCover: e.target.value })}
                className="input-aviva"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Tonalidad</label>
                <select
                  value={formData.originalKey}
                  onChange={(e) => setFormData({ ...formData, originalKey: e.target.value })}
                  className="input-aviva"
                >
                  {getAllKeys().map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">BPM</label>
                <input
                  type="number"
                  value={formData.tempo}
                  onChange={(e) => setFormData({ ...formData, tempo: e.target.value })}
                  className="input-aviva"
                  min="40"
                  max="240"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Lyrics */}
        <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Letra con acordes</h2>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 text-sm text-aviva-gold"
            >
              <HelpCircle size={16} />
              Cómo agregar acordes
            </button>
          </div>
          
          {showHelp && (
            <div className="bg-aviva-gold/10 border border-aviva-gold/30 rounded-xl p-4 mb-4">
              <p className="text-sm mb-2">
                <strong>Formato:</strong> Escribe los acordes entre corchetes [acorde]
              </p>
              <p className="text-sm font-mono bg-aviva-dark rounded-lg p-3">
                [G]Así es tu a[Em]mor<br />
                [C]Tan grande y [D]fiel
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Letra con acordes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.lyricsChords}
              onChange={(e) => {
                const value = e.target.value
                setFormData({ 
                  ...formData, 
                  lyricsChords: value,
                  lyrics: value.replace(/\[[^\]]*\]/g, '')
                })
              }}
              className="input-aviva font-mono text-sm"
              rows={15}
              required
            />
          </div>
        </div>

        {/* Chord Progression */}
        <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Progresión de acordes</h2>
          <p className="text-sm text-aviva-text-muted mb-4">
            Ingresa la progresión de acordes con etiquetas de sección. Formato: [INTRO] C Am F G [VERSO] Am F C G [CORO] F G Am
          </p>

          <div>
            <label className="block text-sm font-medium mb-2">
              Progresión
            </label>
            <textarea
              value={formData.chordProgression}
              onChange={(e) => setFormData({ ...formData, chordProgression: e.target.value })}
              className="input-aviva font-mono text-sm"
              rows={4}
              placeholder="[INTRO] C Am F G [VERSO] Am F C G [CORO] F G Am"
            />
          </div>
        </div>

        {/* Media Links */}
        <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Enlaces de audio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Spotify</label>
              <input
                type="url"
                value={formData.spotifyUrl}
                onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
                className="input-aviva"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">YouTube</label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="input-aviva"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Audio (otro)</label>
              <input
                type="url"
                value={formData.audioUrl}
                onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                className="input-aviva"
              />
            </div>
          </div>
        </div>
        
        {/* Options */}
        <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-5 h-5 rounded border-aviva-gray text-aviva-gold focus:ring-aviva-gold"
            />
            <div>
              <p className="font-medium">Destacar canción</p>
              <p className="text-sm text-aviva-text-muted">
                Se mostrará en la sección destacada de la página principal
              </p>
            </div>
          </label>
        </div>
        
        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/canciones" className="btn-secondary">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

