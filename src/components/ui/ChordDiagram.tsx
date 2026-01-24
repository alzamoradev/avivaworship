'use client'

import { ChordDiagram as ChordDiagramType, getChordDiagram } from '@/lib/chords'

interface ChordDiagramProps {
  chord: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

export function ChordDiagram({ chord, size = 'md', showName = true }: ChordDiagramProps) {
  const diagram = getChordDiagram(chord)
  
  const sizes = {
    sm: { width: 60, height: 80, fretHeight: 12, stringSpacing: 8, dotSize: 5, fontSize: 10 },
    md: { width: 100, height: 130, fretHeight: 20, stringSpacing: 14, dotSize: 8, fontSize: 14 },
    lg: { width: 140, height: 180, fretHeight: 28, stringSpacing: 20, dotSize: 11, fontSize: 18 },
  }
  
  const s = sizes[size]
  const numFrets = 5
  const numStrings = 6
  const topPadding = 20
  const leftPadding = 15
  
  if (!diagram) {
    return (
      <div className="flex flex-col items-center">
        {showName && (
          <span className="text-aviva-gold font-bold mb-1" style={{ fontSize: s.fontSize }}>
            {chord}
          </span>
        )}
        <div 
          className="bg-aviva-dark-lighter rounded-lg flex items-center justify-center border border-aviva-gray"
          style={{ width: s.width, height: s.height }}
        >
          <span className="text-aviva-text-muted text-xs">No disponible</span>
        </div>
      </div>
    )
  }
  
  const gridWidth = (numStrings - 1) * s.stringSpacing
  const gridHeight = numFrets * s.fretHeight
  
  return (
    <div className="flex flex-col items-center">
      {showName && (
        <span className="text-aviva-gold font-bold mb-1" style={{ fontSize: s.fontSize }}>
          {diagram.name}
        </span>
      )}
      <svg 
        width={s.width} 
        height={s.height} 
        viewBox={`0 0 ${s.width} ${s.height}`}
        className="chord-diagram"
      >
        {/* Fondo */}
        <rect 
          x="0" 
          y="0" 
          width={s.width} 
          height={s.height} 
          fill="#1a1a1a" 
          rx="8"
        />
        
        {/* Cejilla (nut) si está en el primer traste */}
        {diagram.baseFret === 1 && (
          <rect 
            x={leftPadding - 2} 
            y={topPadding - 3} 
            width={gridWidth + 4} 
            height={4} 
            fill="#F2BC15"
            rx="1"
          />
        )}
        
        {/* Número de traste base si no es el primero */}
        {diagram.baseFret > 1 && (
          <text 
            x={leftPadding - 10} 
            y={topPadding + s.fretHeight / 2 + 4}
            fill="#888"
            fontSize={s.fontSize * 0.7}
            textAnchor="middle"
          >
            {diagram.baseFret}
          </text>
        )}
        
        {/* Líneas horizontales (trastes) */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={leftPadding}
            y1={topPadding + i * s.fretHeight}
            x2={leftPadding + gridWidth}
            y2={topPadding + i * s.fretHeight}
            stroke="#3a3a3a"
            strokeWidth={i === 0 && diagram.baseFret === 1 ? 0 : 1}
          />
        ))}
        
        {/* Líneas verticales (cuerdas) */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={leftPadding + i * s.stringSpacing}
            y1={topPadding}
            x2={leftPadding + i * s.stringSpacing}
            y2={topPadding + gridHeight}
            stroke="#888"
            strokeWidth={1 + (numStrings - 1 - i) * 0.15}
          />
        ))}
        
        {/* Barré */}
        {diagram.barres?.map((barre, idx) => {
          const startX = leftPadding + (numStrings - barre.fromString) * s.stringSpacing
          const endX = leftPadding + (numStrings - barre.toString) * s.stringSpacing
          const y = topPadding + (barre.fret - diagram.baseFret + 0.5) * s.fretHeight
          return (
            <rect
              key={`barre-${idx}`}
              x={Math.min(startX, endX)}
              y={y - s.dotSize / 2}
              width={Math.abs(endX - startX)}
              height={s.dotSize}
              fill="#f2f0f0"
              rx={s.dotSize / 2}
            />
          )
        })}
        
        {/* Puntos de los dedos y X/O */}
        {diagram.frets.map((fret, stringIdx) => {
          const x = leftPadding + stringIdx * s.stringSpacing
          
          if (fret === 'x') {
            // X para cuerda que no se toca
            return (
              <text
                key={`marker-${stringIdx}`}
                x={x}
                y={topPadding - 8}
                fill="#888"
                fontSize={s.fontSize * 0.8}
                textAnchor="middle"
              >
                ×
              </text>
            )
          }
          
          if (fret === 0) {
            // O para cuerda al aire
            return (
              <circle
                key={`marker-${stringIdx}`}
                cx={x}
                cy={topPadding - 8}
                r={s.dotSize / 2.5}
                fill="none"
                stroke="#888"
                strokeWidth={1.5}
              />
            )
          }
          
          // Punto del dedo
          const y = topPadding + (fret - diagram.baseFret + 0.5) * s.fretHeight
          return (
            <circle
              key={`dot-${stringIdx}`}
              cx={x}
              cy={y}
              r={s.dotSize / 2}
              fill="#f2f0f0"
            />
          )
        })}
      </svg>
    </div>
  )
}

// Modal para mostrar el diagrama del acorde
interface ChordModalProps {
  chord: string | null
  onClose: () => void
}

export function ChordModal({ chord, onClose }: ChordModalProps) {
  if (!chord) return null
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-aviva-dark border border-aviva-gray rounded-2xl p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <ChordDiagram chord={chord} size="lg" />
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 px-4 bg-aviva-gray hover:bg-aviva-gray-light rounded-lg text-aviva-text transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

