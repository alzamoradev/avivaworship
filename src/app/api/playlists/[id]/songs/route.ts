import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/playlists/[id]/songs - Add song to playlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const { songId, customKey } = await request.json()
    
    // Check access
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        sharedWithUsers: true,
        _count: { select: { songs: true } },
      },
    })
    
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }
    
    const isOwner = playlist.userId === session.user.id
    const canEdit = playlist.sharedWithUsers.find(s => s.userId === session.user.id)?.canEdit
    
    if (!isOwner && !canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Check if song already in playlist
    const existing = await prisma.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId: id,
          songId,
        },
      },
    })
    
    if (existing) {
      return NextResponse.json({ error: 'Song already in playlist' }, { status: 400 })
    }
    
    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId: id,
        songId,
        customKey,
        order: playlist._count.songs,
      },
      include: {
        song: true,
      },
    })
    
    return NextResponse.json(playlistSong, { status: 201 })
  } catch (error) {
    console.error('Error adding song to playlist:', error)
    return NextResponse.json({ error: 'Error adding song to playlist' }, { status: 500 })
  }
}

// DELETE /api/playlists/[id]/songs - Remove song from playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const { songId } = await request.json()
    
    // Check access
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        sharedWithUsers: true,
      },
    })
    
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }
    
    const isOwner = playlist.userId === session.user.id
    const canEdit = playlist.sharedWithUsers.find(s => s.userId === session.user.id)?.canEdit
    
    if (!isOwner && !canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId: id,
          songId,
        },
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing song from playlist:', error)
    return NextResponse.json({ error: 'Error removing song from playlist' }, { status: 500 })
  }
}

// PUT /api/playlists/[id]/songs - Update song order or key
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const { songId, customKey, order } = await request.json()
    
    // Check access
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        sharedWithUsers: true,
      },
    })
    
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }
    
    const isOwner = playlist.userId === session.user.id
    const canEdit = playlist.sharedWithUsers.find(s => s.userId === session.user.id)?.canEdit
    
    if (!isOwner && !canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    const updated = await prisma.playlistSong.update({
      where: {
        playlistId_songId: {
          playlistId: id,
          songId,
        },
      },
      data: {
        customKey,
        order,
      },
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating playlist song:', error)
    return NextResponse.json({ error: 'Error updating playlist song' }, { status: 500 })
  }
}

