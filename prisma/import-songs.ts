// Import songs from cancionero file
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as fs from 'fs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Chord detection regex - matches common chord patterns
const CHORD_REGEX = /^[A-G][#b]?(m|maj|min|dim|aug|sus|add|5|6|7|9|11|13)*(\/[A-G][#b]?)?$/

function isChordLine(line: string): boolean {
  if (!line.trim()) return false

  // Split by whitespace and check if most tokens are chords
  const tokens = line.trim().split(/\s+/)
  if (tokens.length === 0) return false

  let chordCount = 0
  for (const token of tokens) {
    // Clean token of common notation like (D# D), x4, etc.
    const cleanToken = token.replace(/[()x\d,-]/g, '').trim()
    if (!cleanToken) continue

    // Check each part separated by common delimiters
    const parts = cleanToken.split(/[-\/]/)
    for (const part of parts) {
      if (part && CHORD_REGEX.test(part)) {
        chordCount++
      }
    }
  }

  // If more than half of the non-empty tokens look like chords, it's a chord line
  const nonEmptyTokens = tokens.filter(t => t.trim()).length
  return chordCount > 0 && chordCount >= nonEmptyTokens * 0.5
}

function isSectionLabel(line: string): boolean {
  const sectionLabels = [
    'INTRO', 'ESTROFA', 'VERSO', 'PRE CORO', 'PRECORO', 'PRE-CORO',
    'CORO', 'PUENTE', 'BRIDGE', 'OUTRO', 'FINAL', 'INSTRUMENTAL',
    'INTERLUDIO', 'TAG', 'PASAJE', '2DA ESTROFA', 'ESTROFA FINAL',
    'VERSO 1', 'VERSO 2', 'VERSO 3', 'CORO 1', 'CORO 2'
  ]
  const upperLine = line.trim().toUpperCase()
  return sectionLabels.some(label =>
    upperLine === label ||
    upperLine.startsWith(label + ' ') ||
    upperLine.match(new RegExp(`^${label}\\s*\\(.*\\)$`))
  )
}

function mergeChordAndTextLines(chordLine: string, textLine: string): string {
  if (!chordLine.trim()) return textLine

  // Find positions of chords in the chord line
  const chordPositions: { chord: string; position: number }[] = []
  let currentPos = 0

  // Iterate through chord line to find chord positions
  const chordLineChars = chordLine.split('')
  let i = 0
  while (i < chordLineChars.length) {
    // Skip whitespace
    if (chordLineChars[i] === ' ') {
      currentPos++
      i++
      continue
    }

    // Found start of a chord - collect the full chord
    let chord = ''
    const startPos = currentPos
    while (i < chordLineChars.length && chordLineChars[i] !== ' ') {
      chord += chordLineChars[i]
      i++
    }

    if (chord) {
      chordPositions.push({ chord, position: startPos })
    }
    currentPos = startPos + chord.length
  }

  // Now insert chords into the text line at appropriate positions
  // Work backwards to avoid position shifting
  let result = textLine
  for (let j = chordPositions.length - 1; j >= 0; j--) {
    const { chord, position } = chordPositions[j]
    const insertPos = Math.min(position, result.length)
    result = result.slice(0, insertPos) + `[${chord}]` + result.slice(insertPos)
  }

  return result
}

function parseContent(content: string): string {
  const lines = content.split('\n')
  const resultLines: string[] = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Check if this is a section label
    if (isSectionLabel(line)) {
      resultLines.push('')  // Empty line before section
      resultLines.push(line.trim())
      i++
      continue
    }

    // Check if this is a chord line
    if (isChordLine(line) && i + 1 < lines.length) {
      const nextLine = lines[i + 1]

      // If next line is also a chord line or section, treat current as standalone
      if (isChordLine(nextLine) || isSectionLabel(nextLine) || !nextLine.trim()) {
        // This might be an intro/instrumental chord progression, keep as is
        resultLines.push(line)
        i++
        continue
      }

      // Merge chord line with text line below
      const merged = mergeChordAndTextLines(line, nextLine)
      resultLines.push(merged)
      i += 2  // Skip both lines
      continue
    }

    // Regular line (text only or empty)
    resultLines.push(line)
    i++
  }

  return resultLines.join('\n').trim()
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.song.findFirst({ where: { slug } })
    if (!existing) break
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

function extractLyricsOnly(lyricsChords: string): string {
  return lyricsChords.replace(/\[[^\]]*\]/g, '')
}

interface ParsedSong {
  title: string
  artist: string | null
  originalKey: string
  content: string
}

function parseSongsFromFile(filePath: string): ParsedSong[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const songBlocks = fileContent.split('===').filter(block => block.trim())

  const songs: ParsedSong[] = []

  for (const block of songBlocks) {
    const lines = block.trim().split('\n')

    let title = ''
    let artist: string | null = 'AVIVA Worship'
    let originalKey = 'C'
    let contentStartIndex = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.startsWith('TITULO:')) {
        title = line.replace('TITULO:', '').trim()
        contentStartIndex = i + 1
      } else if (line.startsWith('ARTISTA:')) {
        artist = line.replace('ARTISTA:', '').trim()
        contentStartIndex = i + 1
      } else if (line.startsWith('TONALIDAD:')) {
        originalKey = line.replace('TONALIDAD:', '').trim()
        contentStartIndex = i + 1
      } else if (title && !line.startsWith('TITULO:') && !line.startsWith('ARTISTA:') && !line.startsWith('TONALIDAD:')) {
        // Found first content line
        break
      }
    }

    if (!title) continue

    const content = lines.slice(contentStartIndex).join('\n').trim()

    // Skip songs with "(Sin letra disponible en el cancionero)"
    if (content.includes('(Sin letra disponible')) {
      console.log(`  Skipping "${title}" - no lyrics available`)
      continue
    }

    songs.push({ title, artist, originalKey, content })
  }

  return songs
}

async function importSongs() {
  console.log('Starting song import...\n')

  const filePath = '/Users/agustinalzamora/Downloads/cancionero_aviva_2023.txt'
  const songs = parseSongsFromFile(filePath)

  console.log(`Found ${songs.length} songs to import\n`)

  let imported = 0
  let updated = 0
  let failed = 0

  for (const song of songs) {
    try {
      const slug = await generateUniqueSlug(song.title)
      const lyricsChords = parseContent(song.content)
      const lyrics = extractLyricsOnly(lyricsChords)

      // Check if song already exists by title
      const existing = await prisma.song.findFirst({
        where: { title: song.title }
      })

      if (existing) {
        // Update existing song
        await prisma.song.update({
          where: { id: existing.id },
          data: {
            artist: song.artist,
            originalKey: song.originalKey,
            lyrics,
            lyricsChords,
          }
        })
        console.log(`  Updated: "${song.title}"`)
        updated++
      } else {
        // Create new song
        await prisma.song.create({
          data: {
            slug,
            title: song.title,
            artist: song.artist,
            originalKey: song.originalKey,
            lyrics,
            lyricsChords,
          }
        })
        console.log(`  Imported: "${song.title}" -> /${slug}`)
        imported++
      }
    } catch (error) {
      console.error(`  Failed: "${song.title}" - ${error}`)
      failed++
    }
  }

  console.log(`\n========================================`)
  console.log(`Import completed!`)
  console.log(`  Imported: ${imported}`)
  console.log(`  Updated: ${updated}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Total: ${songs.length}`)
}

importSongs()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
