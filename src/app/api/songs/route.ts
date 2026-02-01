import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/songs - Get all songs with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const featured = searchParams.get('featured') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const where: any = {}
    
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { artist: { contains: query, mode: 'insensitive' } },
        { album: { contains: query, mode: 'insensitive' } },
      ]
    }
    
    if (featured) {
      where.isFeatured = true
    }
    
    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          artist: true,
          album: true,
          albumCover: true,
          originalKey: true,
          tempo: true,
          isFeatured: true,
          createdAt: true,
        },
      }),
      prisma.song.count({ where }),
    ])
    
    return NextResponse.json({ songs, total })
  } catch (error) {
    console.error('Error fetching songs:', error)
    return NextResponse.json({ error: 'Error fetching songs' }, { status: 500 })
  }
}

// POST /api/songs - Create a new song (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const {
      title,
      artist,
      album,
      albumCover,
      originalKey,
      tempo,
      lyrics,
      lyricsChords,
      chordProgression,
      spotifyUrl,
      youtubeUrl,
      audioUrl,
      isFeatured,
    } = body
    
    if (!title || !lyrics || !lyricsChords) {
      return NextResponse.json(
        { error: 'Title, lyrics, and lyricsChords are required' },
        { status: 400 }
      )
    }
    
    const song = await prisma.song.create({
      data: {
        title,
        artist,
        album,
        albumCover,
        originalKey: originalKey || 'C',
        tempo: tempo ? parseInt(tempo) : null,
        lyrics,
        lyricsChords,
        chordProgression,
        spotifyUrl,
        youtubeUrl,
        audioUrl,
        isFeatured: isFeatured || false,
      },
    })
    
    return NextResponse.json(song, { status: 201 })
  } catch (error) {
    console.error('Error creating song:', error)
    return NextResponse.json({ error: 'Error creating song' }, { status: 500 })
  }
}

