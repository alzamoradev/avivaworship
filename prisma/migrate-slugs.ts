// Migration script to generate slugs for existing songs
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.song.findFirst({
      where: { slug },
    })
    if (!existing) break
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

async function migrateSlugs() {
  console.log('Starting slug migration...')

  // Get all songs without slugs (or with empty slugs)
  const songs = await prisma.song.findMany({
    where: {
      OR: [
        { slug: null as any },
        { slug: '' },
      ],
    },
  })

  console.log(`Found ${songs.length} songs without slugs`)

  for (const song of songs) {
    const slug = await generateUniqueSlug(song.title)

    await prisma.song.update({
      where: { id: song.id },
      data: { slug },
    })

    console.log(`  Updated: "${song.title}" -> ${slug}`)
  }

  console.log('Slug migration completed!')
}

migrateSlugs()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
