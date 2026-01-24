import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// GET /api/playlists - Get user's playlists
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get own playlists and shared playlists
    const [ownPlaylists, sharedPlaylists] = await Promise.all([
      prisma.playlist.findMany({
        where: { userId: session.user.id },
        include: {
          songs: {
            include: {
              song: {
                select: {
                  albumCover: true,
                },
              },
            },
            take: 4,
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { songs: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.sharedPlaylist.findMany({
        where: { userId: session.user.id },
        include: {
          playlist: {
            include: {
              songs: {
                include: {
                  song: {
                    select: {
                      albumCover: true,
                    },
                  },
                },
                take: 4,
                orderBy: { order: 'asc' },
              },
              _count: {
                select: { songs: true },
              },
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ])
    
    return NextResponse.json({
      playlists: ownPlaylists,
      sharedPlaylists: sharedPlaylists.map(sp => ({
        ...sp.playlist,
        isShared: true,
        canEdit: sp.canEdit,
      })),
    })
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json({ error: 'Error fetching playlists' }, { status: 500 })
  }
}

// POST /api/playlists - Create a new playlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { name, description } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        userId: session.user.id,
        shareCode: uuidv4().slice(0, 8),
      },
    })
    
    return NextResponse.json(playlist, { status: 201 })
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json({ error: 'Error creating playlist' }, { status: 500 })
  }
}

