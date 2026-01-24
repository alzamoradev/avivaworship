import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/songs/[id] - Get a single song
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const song = await prisma.song.findUnique({
      where: { id },
    })
    
    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }
    
    return NextResponse.json(song)
  } catch (error) {
    console.error('Error fetching song:', error)
    return NextResponse.json({ error: 'Error fetching song' }, { status: 500 })
  }
}

// PUT /api/songs/[id] - Update a song (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    
    const song = await prisma.song.update({
      where: { id },
      data: {
        title: body.title,
        artist: body.artist,
        album: body.album,
        albumCover: body.albumCover,
        originalKey: body.originalKey,
        tempo: body.tempo ? parseInt(body.tempo) : null,
        lyrics: body.lyrics,
        lyricsChords: body.lyricsChords,
        spotifyUrl: body.spotifyUrl,
        youtubeUrl: body.youtubeUrl,
        audioUrl: body.audioUrl,
        isFeatured: body.isFeatured,
      },
    })
    
    return NextResponse.json(song)
  } catch (error) {
    console.error('Error updating song:', error)
    return NextResponse.json({ error: 'Error updating song' }, { status: 500 })
  }
}

// DELETE /api/songs/[id] - Delete a song (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    await prisma.song.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting song:', error)
    return NextResponse.json({ error: 'Error deleting song' }, { status: 500 })
  }
}

