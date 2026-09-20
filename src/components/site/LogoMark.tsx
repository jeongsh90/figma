import type { ReactNode } from 'react'
import './LogoMark.css'

const GRID = 3
const CELL = 10
const SIZE = GRID * CELL

// Descending staircase fill: row 0 all filled, each row after loses one cell
// from the right - reproduces the reference 3x3 mark exactly.
function isFilled(row: number, col: number) {
  return col <= GRID - 1 - row
}

type LogoMarkProps = {
  className?: string
}

export function LogoMark({ className }: LogoMarkProps) {
  const cells: ReactNode[] = []
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const x = col * CELL
      const y = row * CELL
      cells.push(
        <rect
          key={`${row}-${col}`}
          x={x + 0.75}
          y={y + 0.75}
          width={CELL - 1.5}
          height={CELL - 1.5}
          className={`logo-mark__cell${isFilled(row, col) ? ' logo-mark__cell--filled' : ''}`}
        />,
      )
    }
  }

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={`logo-mark${className ? ` ${className}` : ''}`}
      role="img"
      aria-label="Logo mark"
    >
      {cells}
    </svg>
  )
}
