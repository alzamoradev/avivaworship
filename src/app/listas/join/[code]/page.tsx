'use client'

import { useEffect, useState, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ListMusic, CheckCircle, XCircle } from 'lucide-react'

export default function JoinPlaylistPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; playlistId?: string } | null>(null)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/listas/join/${resolvedParams.code}`)
    } else if (status === 'authenticated' && !joining && !result) {
      joinPlaylist()
    }
  }, [status, resolvedParams.code])
  
  async function joinPlaylist() {
    setJoining(true)
    try {
      const res = await fetch(`/api/playlists/join/${resolvedParams.code}`, {
        method: 'POST',
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setResult({
          success: true,
          message: data.playlistName ? `Te uniste a "${data.playlistName}"` : 'Te uniste a la lista',
          playlistId: data.playlistId,
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Error al unirse a la lista',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error de conexión',
      })
    }
  }
  
  if (status === 'loading' || joining) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-aviva-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-aviva-text-muted">Uniéndote a la lista...</p>
        </div>
      </div>
    )
  }
  
  if (result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {result.success ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">¡Listo!</h1>
              <p className="text-aviva-text-muted mb-6">{result.message}</p>
              <button
                onClick={() => router.push(`/listas/${result.playlistId}`)}
                className="btn-primary"
              >
                Ver lista
              </button>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Error</h1>
              <p className="text-aviva-text-muted mb-6">{result.message}</p>
              <button
                onClick={() => router.push('/listas')}
                className="btn-primary"
              >
                Ir a mis listas
              </button>
            </>
          )}
        </div>
      </div>
    )
  }
  
  return null
}

