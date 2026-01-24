import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/playlists/share - Share playlist with user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { playlistId, email, canEdit = false } = await request.json()
    
    // Check ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })
    
    if (!playlist || playlist.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Find user to share with
    const userToShare = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!userToShare) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (userToShare.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 })
    }
    
    // Check if already shared
    const existing = await prisma.sharedPlaylist.findUnique({
      where: {
        playlistId_userId: {
          playlistId,
          userId: userToShare.id,
        },
      },
    })
    
    if (existing) {
      // Update permissions
      const updated = await prisma.sharedPlaylist.update({
        where: { id: existing.id },
        data: { canEdit },
      })
      return NextResponse.json(updated)
    }
    
    // Create share
    const shared = await prisma.sharedPlaylist.create({
      data: {
        playlistId,
        userId: userToShare.id,
        canEdit,
      },
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
    })
    
    return NextResponse.json(shared, { status: 201 })
  } catch (error) {
    console.error('Error sharing playlist:', error)
    return NextResponse.json({ error: 'Error sharing playlist' }, { status: 500 })
  }
}

// DELETE /api/playlists/share - Remove share
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { playlistId, userId } = await request.json()
    
    // Check ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })
    
    if (!playlist || playlist.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    await prisma.sharedPlaylist.delete({
      where: {
        playlistId_userId: {
          playlistId,
          userId,
        },
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing share:', error)
    return NextResponse.json({ error: 'Error removing share' }, { status: 500 })
  }
}

