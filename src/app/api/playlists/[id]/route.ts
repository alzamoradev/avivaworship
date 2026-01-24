import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/playlists/[id] - Get a single playlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        sharedWithUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })
    
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }
    
    // Check access
    const isOwner = playlist.userId === session?.user?.id
    const isShared = playlist.sharedWithUsers.some(s => s.userId === session?.user?.id)
    const isPublic = playlist.isPublic
    
    if (!isOwner && !isShared && !isPublic) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    return NextResponse.json({
      ...playlist,
      isOwner,
      canEdit: isOwner || playlist.sharedWithUsers.find(s => s.userId === session?.user?.id)?.canEdit,
    })
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return NextResponse.json({ error: 'Error fetching playlist' }, { status: 500 })
  }
}

// PUT /api/playlists/[id] - Update a playlist
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
    const body = await request.json()
    
    // Check ownership
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
    
    const updated = await prisma.playlist.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        isPublic: body.isPublic,
      },
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json({ error: 'Error updating playlist' }, { status: 500 })
  }
}

// DELETE /api/playlists/[id] - Delete a playlist
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
    
    // Check ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id },
    })
    
    if (!playlist || playlist.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    await prisma.playlist.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json({ error: 'Error deleting playlist' }, { status: 500 })
  }
}

