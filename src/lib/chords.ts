// Sistema de acordes y transposición para AVIVA Worship

// Notas musicales en orden cromático
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

// Mapeo de notas alternativas
const NOTE_MAP: { [key: string]: number } = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'Fb': 4, 'E#': 5,
  'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0
}

// Función para transponer un acorde
export function transposeChord(chord: string, semitones: number, useFlats: boolean = false): string {
  const notes = useFlats ? NOTES_FLAT : NOTES
  
  // Regex para separar la nota raíz del resto del acorde
  const match = chord.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return chord
  
  const [, root, suffix] = match
  const rootIndex = NOTE_MAP[root]
  
  if (rootIndex === undefined) return chord
  
  const newIndex = (rootIndex + semitones + 12) % 12
  return notes[newIndex] + suffix
}

// Función para transponer toda una letra con acordes
export function transposeLyrics(lyrics: string, semitones: number, useFlats: boolean = false): string {
  // Los acordes están entre corchetes: [Am] [G] [C]
  return lyrics.replace(/\[([A-G][#b]?[^[\]]*)\]/g, (match, chord) => {
    return `[${transposeChord(chord, semitones, useFlats)}]`
  })
}

// Calcular semitonos entre dos tonalidades
export function getSemitones(fromKey: string, toKey: string): number {
  const fromIndex = NOTE_MAP[fromKey]
  const toIndex = NOTE_MAP[toKey]
  
  if (fromIndex === undefined || toIndex === undefined) return 0
  
  return (toIndex - fromIndex + 12) % 12
}

// Obtener todas las tonalidades disponibles
export function getAllKeys(): string[] {
  return [...NOTES]
}

// Diagramas de acordes para guitarra
export interface ChordDiagram {
  name: string
  frets: (number | 'x')[]  // 6 cuerdas, -1 para no tocar
  fingers: number[]
  barres?: { fret: number; fromString: number; toString: number }[]
  baseFret: number
}

export const CHORD_DIAGRAMS: { [key: string]: ChordDiagram } = {
  // Acordes mayores
  'C': { name: 'C', frets: ['x', 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1 },
  'D': { name: 'D', frets: ['x', 'x', 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], baseFret: 1 },
  'E': { name: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], baseFret: 1 },
  'F': { name: 'F', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }], baseFret: 1 },
  'G': { name: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], baseFret: 1 },
  'A': { name: 'A', frets: ['x', 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1 },
  'B': { name: 'B', frets: ['x', 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 2, fromString: 5, toString: 1 }], baseFret: 1 },
  
  // Acordes menores
  'Cm': { name: 'Cm', frets: ['x', 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 3, fromString: 5, toString: 1 }], baseFret: 1 },
  'Dm': { name: 'Dm', frets: ['x', 'x', 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], baseFret: 1 },
  'Em': { name: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], baseFret: 1 },
  'Fm': { name: 'Fm', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }], baseFret: 1 },
  'Gm': { name: 'Gm', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 3, fromString: 6, toString: 1 }], baseFret: 1 },
  'Am': { name: 'Am', frets: ['x', 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], baseFret: 1 },
  'Bm': { name: 'Bm', frets: ['x', 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 2, fromString: 5, toString: 1 }], baseFret: 1 },
  
  // Acordes con sostenidos mayores
  'C#': { name: 'C#', frets: ['x', 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 4, fromString: 5, toString: 1 }], baseFret: 1 },
  'D#': { name: 'D#', frets: ['x', 'x', 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3], baseFret: 1 },
  'F#': { name: 'F#', frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 2, fromString: 6, toString: 1 }], baseFret: 1 },
  'G#': { name: 'G#', frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 4, fromString: 6, toString: 1 }], baseFret: 1 },
  'A#': { name: 'A#', frets: ['x', 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 1, fromString: 5, toString: 1 }], baseFret: 1 },
  
  // Acordes con sostenidos menores
  'C#m': { name: 'C#m', frets: ['x', 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 4, fromString: 5, toString: 1 }], baseFret: 1 },
  'D#m': { name: 'D#m', frets: ['x', 'x', 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2], baseFret: 1 },
  'F#m': { name: 'F#m', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 2, fromString: 6, toString: 1 }], baseFret: 1 },
  'G#m': { name: 'G#m', frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 4, fromString: 6, toString: 1 }], baseFret: 1 },
  'A#m': { name: 'A#m', frets: ['x', 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 1, fromString: 5, toString: 1 }], baseFret: 1 },
  
  // Acordes con bemoles (equivalentes)
  'Db': { name: 'Db', frets: ['x', 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 4, fromString: 5, toString: 1 }], baseFret: 1 },
  'Eb': { name: 'Eb', frets: ['x', 'x', 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3], baseFret: 1 },
  'Gb': { name: 'Gb', frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 2, fromString: 6, toString: 1 }], baseFret: 1 },
  'Ab': { name: 'Ab', frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 4, fromString: 6, toString: 1 }], baseFret: 1 },
  'Bb': { name: 'Bb', frets: ['x', 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 1, fromString: 5, toString: 1 }], baseFret: 1 },
  
  'Dbm': { name: 'Dbm', frets: ['x', 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 4, fromString: 5, toString: 1 }], baseFret: 1 },
  'Ebm': { name: 'Ebm', frets: ['x', 'x', 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2], baseFret: 1 },
  'Gbm': { name: 'Gbm', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 2, fromString: 6, toString: 1 }], baseFret: 1 },
  'Abm': { name: 'Abm', frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 4, fromString: 6, toString: 1 }], baseFret: 1 },
  'Bbm': { name: 'Bbm', frets: ['x', 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 1, fromString: 5, toString: 1 }], baseFret: 1 },
  
  // Acordes séptima
  'C7': { name: 'C7', frets: ['x', 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], baseFret: 1 },
  'D7': { name: 'D7', frets: ['x', 'x', 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], baseFret: 1 },
  'E7': { name: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], baseFret: 1 },
  'F7': { name: 'F7', frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }], baseFret: 1 },
  'G7': { name: 'G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], baseFret: 1 },
  'A7': { name: 'A7', frets: ['x', 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0], baseFret: 1 },
  'B7': { name: 'B7', frets: ['x', 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], baseFret: 1 },
  
  // Acordes sus2
  'Csus2': { name: 'Csus2', frets: ['x', 3, 0, 0, 1, 0], fingers: [0, 3, 0, 0, 1, 0], baseFret: 1 },
  'Dsus2': { name: 'Dsus2', frets: ['x', 'x', 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0], baseFret: 1 },
  'Esus2': { name: 'Esus2', frets: [0, 2, 4, 4, 0, 0], fingers: [0, 1, 3, 4, 0, 0], baseFret: 1 },
  'Gsus2': { name: 'Gsus2', frets: [3, 0, 0, 0, 3, 3], fingers: [1, 0, 0, 0, 3, 4], baseFret: 1 },
  'Asus2': { name: 'Asus2', frets: ['x', 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], baseFret: 1 },
  
  // Acordes sus4
  'Csus4': { name: 'Csus4', frets: ['x', 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1], baseFret: 1 },
  'Dsus4': { name: 'Dsus4', frets: ['x', 'x', 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3], baseFret: 1 },
  'Esus4': { name: 'Esus4', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0], baseFret: 1 },
  'Gsus4': { name: 'Gsus4', frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4], baseFret: 1 },
  'Asus4': { name: 'Asus4', frets: ['x', 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1 },
  
  // Acordes add9
  'Cadd9': { name: 'Cadd9', frets: ['x', 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0], baseFret: 1 },
  'Dadd9': { name: 'Dadd9', frets: ['x', 'x', 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0], baseFret: 1 },
  'Eadd9': { name: 'Eadd9', frets: [0, 2, 2, 1, 0, 2], fingers: [0, 2, 3, 1, 0, 4], baseFret: 1 },
  'Gadd9': { name: 'Gadd9', frets: [3, 0, 0, 2, 0, 3], fingers: [2, 0, 0, 1, 0, 3], baseFret: 1 },
  
  // Acordes maj7
  'Cmaj7': { name: 'Cmaj7', frets: ['x', 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], baseFret: 1 },
  'Dmaj7': { name: 'Dmaj7', frets: ['x', 'x', 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3], baseFret: 1 },
  'Emaj7': { name: 'Emaj7', frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], baseFret: 1 },
  'Fmaj7': { name: 'Fmaj7', frets: [1, 'x', 2, 2, 1, 0], fingers: [1, 0, 3, 4, 2, 0], baseFret: 1 },
  'Gmaj7': { name: 'Gmaj7', frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 0, 0, 0, 3], baseFret: 1 },
  'Amaj7': { name: 'Amaj7', frets: ['x', 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], baseFret: 1 },
  'Bmaj7': { name: 'Bmaj7', frets: ['x', 2, 4, 3, 4, 2], fingers: [0, 1, 3, 2, 4, 1], barres: [{ fret: 2, fromString: 5, toString: 1 }], baseFret: 1 },
  
  // Acordes menores 7
  'Cm7': { name: 'Cm7', frets: ['x', 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 3, fromString: 5, toString: 1 }], baseFret: 1 },
  'Dm7': { name: 'Dm7', frets: ['x', 'x', 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], baseFret: 1 },
  'Em7': { name: 'Em7', frets: [0, 2, 0, 0, 0, 0], fingers: [0, 1, 0, 0, 0, 0], baseFret: 1 },
  'Fm7': { name: 'Fm7', frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }], baseFret: 1 },
  'Gm7': { name: 'Gm7', frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 3, fromString: 6, toString: 1 }], baseFret: 1 },
  'Am7': { name: 'Am7', frets: ['x', 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], baseFret: 1 },
  'Bm7': { name: 'Bm7', frets: ['x', 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 2, fromString: 5, toString: 1 }], baseFret: 1 },
}

// Obtener diagrama de un acorde
export function getChordDiagram(chord: string): ChordDiagram | null {
  // Normalizar el nombre del acorde
  const normalizedChord = chord.replace(/\s+/g, '')
  return CHORD_DIAGRAMS[normalizedChord] || null
}

// Extraer todos los acordes únicos de una letra
export function extractChords(lyrics: string): string[] {
  const chordRegex = /\[([A-G][#b]?[^[\]]*)\]/g
  const chords = new Set<string>()
  let match
  
  while ((match = chordRegex.exec(lyrics)) !== null) {
    chords.add(match[1])
  }
  
  return Array.from(chords)
}

// Formatear letra con acordes para visualización
export function formatLyricsWithChords(lyrics: string): { type: 'chord' | 'text', content: string }[][] {
  const lines = lyrics.split('\n')
  return lines.map(line => {
    const parts: { type: 'chord' | 'text', content: string }[] = []
    let lastIndex = 0
    const chordRegex = /\[([A-G][#b]?[^[\]]*)\]/g
    let match
    
    while ((match = chordRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: line.slice(lastIndex, match.index) })
      }
      parts.push({ type: 'chord', content: match[1] })
      lastIndex = match.index + match[0].length
    }
    
    if (lastIndex < line.length) {
      parts.push({ type: 'text', content: line.slice(lastIndex) })
    }
    
    if (parts.length === 0) {
      parts.push({ type: 'text', content: '' })
    }
    
    return parts
  })
}

// Obtener solo la letra sin acordes
export function getLyricsOnly(lyrics: string): string {
  return lyrics.replace(/\[[^\]]*\]/g, '')
}

