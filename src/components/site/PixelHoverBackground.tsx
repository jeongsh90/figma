import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import './PixelHoverBackground.css'

const PIXEL_COLS = 14
const PIXEL_ROWS = 6
const COL_STEP_MS = 24
const JITTER_MS = 18
const OVERLAP = 0.6

type PixelPiece = {
  clipPath: string
  delay: number
}

function buildPixels(): PixelPiece[] {
  return Array.from({ length: PIXEL_COLS * PIXEL_ROWS }, (_, index) => {
    const col = index % PIXEL_COLS
    const row = Math.floor(index / PIXEL_COLS)

    const x0 = Math.max(0, (col / PIXEL_COLS) * 100 - OVERLAP)
    const x1 = Math.min(100, ((col + 1) / PIXEL_COLS) * 100 + OVERLAP)
    const y0 = Math.max(0, (row / PIXEL_ROWS) * 100 - OVERLAP)
    const y1 = Math.min(100, ((row + 1) / PIXEL_ROWS) * 100 + OVERLAP)

    const clipPath = `polygon(${x0}% ${y0}%, ${x1}% ${y0}%, ${x1}% ${y1}%, ${x0}% ${y1}%)`

    const jitter = (Math.random() - 0.5) * 2 * JITTER_MS
    const delay = Math.max(0, col * COL_STEP_MS + jitter)

    return { clipPath, delay }
  })
}

type PixelHoverBackgroundProps = {
  active: boolean
  color?: string
}

export function PixelHoverBackground({ active, color }: PixelHoverBackgroundProps) {
  const pixels = useMemo(buildPixels, [])
  const containerRef = useRef<HTMLSpanElement>(null)

  // Scheduling opacity changes ourselves (instead of CSS transition-delay) avoids the
  // browser's "reversed transition" logic getting confused when hover toggles rapidly
  // mid-delay, which was leaving pixels stuck at opacity 0 forever.
  useEffect(() => {
    const children = containerRef.current?.children
    if (!children) return

    if (active) {
      // Every fresh reveal starts from a fully-hidden baseline so an interrupted
      // previous cycle (still mid fade-out) never bleeds into the new one.
      for (let i = 0; i < children.length; i++) {
        ;(children[i] as HTMLElement).style.opacity = '0'
      }
    }

    const timers = pixels.map((piece, index) =>
      window.setTimeout(() => {
        const el = children[index] as HTMLElement | undefined
        if (el) el.style.opacity = active ? '1' : '0'
      }, piece.delay),
    )

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [active, pixels])

  return (
    <span
      className="pixel-hover-bg"
      aria-hidden="true"
      style={color ? ({ '--pixel-hover-color': color } as CSSProperties) : undefined}
    >
      <span ref={containerRef} className="pixel-hover-bg__grid">
        {pixels.map((piece, index) => (
          <span key={index} className="pixel-hover-bg__pixel" style={{ clipPath: piece.clipPath }} />
        ))}
      </span>
    </span>
  )
}
