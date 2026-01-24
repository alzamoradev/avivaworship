import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/playlists/join/[code] - Join a playlist by share code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { code } = await params
    
    // Find playlist by share code
    const playlist = await prisma.playlist.findUnique({
      where: { shareCode: code },
    })
    
    if (!playlist) {
      return NextResponse.json({ error: 'Invalid share code' }, { status: 404 })
    }
    
    if (playlist.userId === session.user.id) {
      return NextResponse.json({ error: 'This is your own playlist' }, { status: 400 })
    }
    
    // Check if already shared
    const existing = await prisma.sharedPlaylist.findUnique({
      where: {
        playlistId_userId: {
          playlistId: playlist.id,
          userId: session.user.id,
        },
      },
    })
    
    if (existing) {
      return NextResponse.json({ 
        message: 'Already joined',
        playlistId: playlist.id 
      })
    }
    
    // Create share (read-only by default)
    await prisma.sharedPlaylist.create({
      data: {
        playlistId: playlist.id,
        userId: session.user.id,
        canEdit: false,
      },
    })
    
    return NextResponse.json({ 
      success: true,
      playlistId: playlist.id,
      playlistName: playlist.name
    }, { status: 201 })
  } catch (error) {
    console.error('Error joining playlist:', error)
    return NextResponse.json({ error: 'Error joining playlist' }, { status: 500 })
  }
}

