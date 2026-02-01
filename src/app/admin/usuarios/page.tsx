'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, User, Users, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface UserData {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  createdAt: string
  _count: {
    playlists: number
    favorites: number
  }
}

export default function AdminUsuariosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchUsers()
    }
  }, [session, status])
  
  async function fetchUsers() {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    if (userId === session?.user?.id && newRole === 'user') {
      showToast('No puedes quitarte el rol de admin', 'warning')
      return
    }

    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (res.ok) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        ))
        showToast(
          newRole === 'admin' ? 'Usuario promovido a admin' : 'Rol cambiado a usuario',
          'success'
        )
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al cambiar rol', 'error')
      }
    } catch (error) {
      showToast('Error al cambiar rol', 'error')
    }
  }

  async function deleteUser(userId: string, userName: string | null) {
    if (userId === session?.user?.id) {
      showToast('No podés eliminar tu propia cuenta', 'warning')
      return
    }

    if (!confirm(`¿Estás seguro de eliminar a ${userName || 'este usuario'}? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        showToast('Usuario eliminado', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Error al eliminar', 'error')
      }
    } catch (error) {
      showToast('Error al eliminar usuario', 'error')
    }
  }
  
  if (status === 'loading' || session?.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-aviva-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="p-2 rounded-lg hover:bg-aviva-gray transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-aviva-text-muted">{users.length} usuarios registrados</p>
        </div>
      </div>
      
      {/* Users List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-xl" />
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-aviva-gray">
                  <th className="text-left p-4 text-aviva-text-muted font-medium">Usuario</th>
                  <th className="text-left p-4 text-aviva-text-muted font-medium hidden sm:table-cell">Email</th>
                  <th className="text-center p-4 text-aviva-text-muted font-medium">Listas</th>
                  <th className="text-center p-4 text-aviva-text-muted font-medium hidden md:table-cell">Favoritos</th>
                  <th className="text-center p-4 text-aviva-text-muted font-medium">Rol</th>
                  <th className="text-center p-4 text-aviva-text-muted font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-aviva-gray/50 hover:bg-aviva-gray/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img src={user.image} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-aviva-gold/20 flex items-center justify-center">
                            <User size={18} className="text-aviva-gold" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.name || 'Sin nombre'}</p>
                          <p className="text-sm text-aviva-text-muted sm:hidden">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-aviva-text-muted hidden sm:table-cell">
                      {user.email}
                    </td>
                    <td className="p-4 text-center">
                      {user._count.playlists}
                    </td>
                    <td className="p-4 text-center hidden md:table-cell">
                      {user._count.favorites}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleRole(user.id, user.role)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          user.role === 'admin'
                            ? 'bg-aviva-gold/20 text-aviva-gold hover:bg-aviva-gold/30'
                            : 'bg-aviva-gray text-aviva-text-muted hover:bg-aviva-gray-light'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <Shield size={14} />
                            Admin
                          </>
                        ) : (
                          <>
                            <User size={14} />
                            Usuario
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => deleteUser(user.id, user.name)}
                        disabled={user.id === session?.user?.id}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={user.id === session?.user?.id ? 'No podés eliminar tu propia cuenta' : 'Eliminar usuario'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="mx-auto mb-4 text-aviva-text-muted" size={48} />
          <p className="text-aviva-text-muted">No hay usuarios registrados</p>
        </div>
      )}
    </div>
  )
}

