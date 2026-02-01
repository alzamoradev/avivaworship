'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'

interface Playlist {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  userId: string
}

export default function EditPlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchPlaylist()
  }, [resolvedParams.id])

  async function fetchPlaylist() {
    try {
      const res = await fetch(`/api/playlists/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.userId !== session?.user?.id && !data.canEdit) {
          showToast('No tenés permiso para editar esta lista', 'error')
          router.push(`/listas/${resolvedParams.id}`)
          return
        }
        setPlaylist(data)
        setName(data.name)
        setDescription(data.description || '')
        setIsPublic(data.isPublic)
      } else {
        router.push('/listas')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/listas')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      showToast('El nombre es requerido', 'error')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/playlists/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, isPublic }),
      })

      if (res.ok) {
        showToast('Lista actualizada', 'success')
        router.push(`/listas/${resolvedParams.id}`)
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al guardar', 'error')
      }
    } catch (error) {
      showToast('Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/playlists/${resolvedParams.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        showToast('Lista eliminada', 'success')
        router.push('/listas')
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al eliminar', 'error')
      }
    } catch (error) {
      showToast('Error al eliminar', 'error')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="h-8 w-32 skeleton rounded-lg mb-6" />
        <div className="space-y-4">
          <div className="h-12 skeleton rounded-xl" />
          <div className="h-24 skeleton rounded-xl" />
        </div>
      </div>
    )
  }

  if (!playlist) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-aviva-text-muted hover:text-aviva-text transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">EDITAR LISTA</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-aviva-text-muted mb-2">
            Nombre de la lista
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi lista de adoración"
            className="input-aviva"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-aviva-text-muted mb-2">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Canciones para el domingo..."
            rows={3}
            className="input-aviva resize-none"
          />
        </div>

        {/* Public toggle */}
        <div className="flex items-center justify-between p-4 bg-aviva-dark-lighter rounded-xl border border-aviva-gray">
          <div>
            <p className="font-medium">Lista pública</p>
            <p className="text-sm text-aviva-text-muted">
              Cualquiera con el link puede ver esta lista
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`w-12 h-6 rounded-full transition-colors ${
              isPublic ? 'bg-aviva-gold' : 'bg-aviva-gray'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-aviva-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                Guardar cambios
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn-secondary flex items-center justify-center gap-2 text-red-500 border-red-500/30 hover:border-red-500 hover:text-red-400"
          >
            <Trash2 size={18} />
            Eliminar lista
          </button>
        </div>
      </form>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar lista"
      >
        <div className="space-y-4">
          <p className="text-aviva-text-muted">
            ¿Estás seguro de que querés eliminar <strong className="text-aviva-text">{playlist.name}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
            >
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
