'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Music, Users, Plus, Settings, BarChart } from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({ songs: 0, users: 0, playlists: 0 })
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchStats()
    }
  }, [session, status])
  
  async function fetchStats() {
    try {
      const [songsRes, usersRes] = await Promise.all([
        fetch('/api/songs?limit=1'),
        fetch('/api/users'),
      ])
      
      if (songsRes.ok) {
        const data = await songsRes.json()
        setStats(prev => ({ ...prev, songs: data.total || 0 }))
      }
      
      if (usersRes.ok) {
        const data = await usersRes.json()
        setStats(prev => ({ ...prev, users: data.users?.length || 0 }))
      }
    } catch (error) {
      console.error('Error:', error)
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
      <h1 className="text-2xl font-bold mb-6">Panel de administración</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-aviva-gold/20">
              <Music className="text-aviva-gold" size={20} />
            </div>
            <span className="text-aviva-text-muted">Canciones</span>
          </div>
          <p className="text-3xl font-bold">{stats.songs}</p>
        </div>
        
        <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-aviva-gold/20">
              <Users className="text-aviva-gold" size={20} />
            </div>
            <span className="text-aviva-text-muted">Usuarios</span>
          </div>
          <p className="text-3xl font-bold">{stats.users}</p>
        </div>
        
        <div className="bg-aviva-dark-lighter border border-aviva-gray rounded-2xl p-6 col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-aviva-gold/20">
              <BarChart className="text-aviva-gold" size={20} />
            </div>
            <span className="text-aviva-text-muted">Panel</span>
          </div>
          <p className="text-sm text-aviva-text-muted">AVIVA Worship v1.0</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">Acciones rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/canciones"
          className="card-aviva flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-aviva-gold/20">
            <Music className="text-aviva-gold" size={24} />
          </div>
          <div>
            <h3 className="font-semibold">Gestionar canciones</h3>
            <p className="text-sm text-aviva-text-muted">Ver, editar y eliminar</p>
          </div>
        </Link>
        
        <Link
          href="/admin/canciones/nueva"
          className="card-aviva flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-green-500/20">
            <Plus className="text-green-500" size={24} />
          </div>
          <div>
            <h3 className="font-semibold">Nueva canción</h3>
            <p className="text-sm text-aviva-text-muted">Agregar al cancionero</p>
          </div>
        </Link>
        
        <Link
          href="/admin/usuarios"
          className="card-aviva flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-blue-500/20">
            <Users className="text-blue-500" size={24} />
          </div>
          <div>
            <h3 className="font-semibold">Usuarios</h3>
            <p className="text-sm text-aviva-text-muted">Gestionar roles</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

