import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/favorites - Get user's favorites
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
            album: true,
            albumCover: true,
            originalKey: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Error fetching favorites' }, { status: 500 })
  }
}

// POST /api/favorites - Toggle favorite
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { songId } = await request.json()
    
    if (!songId) {
      return NextResponse.json({ error: 'Song ID required' }, { status: 400 })
    }
    
    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_songId: {
          userId: session.user.id,
          songId,
        },
      },
    })
    
    if (existing) {
      // Remove favorite
      await prisma.favorite.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({ favorited: false })
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          songId,
        },
      })
      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json({ error: 'Error toggling favorite' }, { status: 500 })
  }
}

// GET /api/favorites/check/[songId] - Check if a song is favorited
export async function OPTIONS() {
  return NextResponse.json({})
}

