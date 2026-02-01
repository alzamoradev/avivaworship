import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Helper to find song by slug or id
async function findSong(identifier: string) {
  // First try by slug
  let song = await prisma.song.findUnique({
    where: { slug: identifier },
  })

  // If not found, try by id (for backwards compatibility)
  if (!song) {
    song = await prisma.song.findUnique({
      where: { id: identifier },
    })
  }

  return song
}

// GET /api/songs/[id] - Get a single song by slug or id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const song = await findSong(id)

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

    // Find the song first to get its actual id
    const existingSong = await findSong(id)
    if (!existingSong) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    const song = await prisma.song.update({
      where: { id: existingSong.id },
      data: {
        title: body.title,
        artist: body.artist,
        album: body.album,
        albumCover: body.albumCover,
        originalKey: body.originalKey,
        tempo: body.tempo ? parseInt(body.tempo) : null,
        lyrics: body.lyrics,
        lyricsChords: body.lyricsChords,
        chordProgression: body.chordProgression,
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

    // Find the song first to get its actual id
    const existingSong = await findSong(id)
    if (!existingSong) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    await prisma.song.delete({
      where: { id: existingSong.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting song:', error)
    return NextResponse.json({ error: 'Error deleting song' }, { status: 500 })
  }
}

