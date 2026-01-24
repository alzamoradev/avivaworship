import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ isFavorite: false })
    }
    
    const { songId } = await params
    
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_songId: {
          userId: session.user.id,
          songId,
        },
      },
    })
    
    return NextResponse.json({ isFavorite: !!favorite })
  } catch (error) {
    console.error('Error checking favorite:', error)
    return NextResponse.json({ isFavorite: false })
  }
}

