import { useEffect, useMemo, useState } from "react"

import { cn } from "@/lib/utils"

type Grid = {
  rows: number
  cols: number
}

const DEFAULT_GRIDS: Record<string, Grid> = {
  "6x4": { rows: 4, cols: 6 },
  "8x8": { rows: 8, cols: 8 },
  "8x3": { rows: 3, cols: 8 },
  "4x6": { rows: 6, cols: 4 },
  "3x8": { rows: 8, cols: 3 },
}

type PredefinedGridKey = keyof typeof DEFAULT_GRIDS

interface PixelImageProps {
  src: string
  grid?: PredefinedGridKey
  customGrid?: Grid
  grayscaleAnimation?: boolean
  pixelFadeInDuration?: number // in ms
  maxAnimationDelay?: number // in ms
  colorRevealDelay?: number // in ms
  /** When provided, the reveal is externally controlled (e.g. by hover) instead of auto-playing once on mount. */
  active?: boolean
  className?: string
}

export const PixelImage = ({
  src,
  grid = "6x4",
  grayscaleAnimation = true,
  pixelFadeInDuration = 1000,
  maxAnimationDelay = 1200,
  colorRevealDelay = 1300,
  customGrid,
  active,
  className,
}: PixelImageProps) => {
  const controlled = active !== undefined
  const [isVisible, setIsVisible] = useState(controlled ? active! : false)
  const [showColor, setShowColor] = useState(controlled ? active! : false)

  const MIN_GRID = 1
  const MAX_GRID = 16

  const { rows, cols } = useMemo(() => {
    const isValidGrid = (grid?: Grid) => {
      if (!grid) return false
      const { rows, cols } = grid
      return (
        Number.isInteger(rows) &&
        Number.isInteger(cols) &&
        rows >= MIN_GRID &&
        cols >= MIN_GRID &&
        rows <= MAX_GRID &&
        cols <= MAX_GRID
      )
    }

    return isValidGrid(customGrid) ? customGrid! : DEFAULT_GRIDS[grid]
  }, [customGrid, grid])

  useEffect(() => {
    if (controlled) {
      setIsVisible(active!)
      if (!active) {
        setShowColor(false)
        return
      }
      const colorTimeout = setTimeout(() => setShowColor(true), colorRevealDelay)
      return () => clearTimeout(colorTimeout)
    }

    setIsVisible(true)
    const colorTimeout = setTimeout(() => {
      setShowColor(true)
    }, colorRevealDelay)
    return () => clearTimeout(colorTimeout)
  }, [controlled, active, colorRevealDelay])

  const pieces = useMemo(() => {
    const total = rows * cols
    return Array.from({ length: total }, (_, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols

      const overlap = 0.05
      const x0 = Math.max(0, col * (100 / cols) - overlap)
      const x1 = Math.min(100, (col + 1) * (100 / cols) + overlap)
      const y0 = Math.max(0, row * (100 / rows) - overlap)
      const y1 = Math.min(100, (row + 1) * (100 / rows) + overlap)

      const clipPath = `polygon(
        ${x0}% ${y0}%,
        ${x1}% ${y0}%,
        ${x1}% ${y1}%,
        ${x0}% ${y1}%
      )`

      const columnStep = maxAnimationDelay / Math.max(cols - 1, 1)
      const jitter = (Math.random() - 0.5) * columnStep
      const delay = Math.max(0, col * columnStep + jitter)
      return {
        clipPath,
        delay,
      }
    })
  }, [rows, cols, maxAnimationDelay])

  return (
    <div
      className={cn(
        "relative h-72 w-72 select-none md:h-96 md:w-96",
        className
      )}
    >
      {pieces.map((piece, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-all ease-[cubic-bezier(1,0,0,1)]",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          style={{
            clipPath: piece.clipPath,
            transitionDelay: `${piece.delay}ms`,
            transitionDuration: `${pixelFadeInDuration}ms`,
          }}
        >
          <img
            src={src}
            alt={`Pixel image piece ${index + 1}`}
            className={cn(
              "z-1 rounded-[2.5rem] object-cover",
              grayscaleAnimation && (showColor ? "grayscale-0" : "grayscale")
            )}
            style={{
              transition: grayscaleAnimation
                ? `filter ${pixelFadeInDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : "none",
            }}
            draggable={false}
          />
        </div>
      ))}
    </div>
  )
}
