import { forwardRef, useImperativeHandle, useMemo, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import './PixelOverlay.css'

type CellAnimationConfig = {
  transformOrigin?: string
  duration?: number
  ease?: string
  stagger?: gsap.TweenVars['stagger']
}

export type PixelOverlayHandle = {
  show: (config?: CellAnimationConfig) => Promise<void>
  hide: (config?: CellAnimationConfig) => Promise<void>
}

type PixelOverlayProps = {
  rows?: number
  columns?: number
}

export const PixelOverlay = forwardRef<PixelOverlayHandle, PixelOverlayProps>(
  function PixelOverlay({ rows = 8, columns = 14 }, ref) {
    const gridRef = useRef<HTMLDivElement>(null)

    const cells = useMemo(
      () =>
        Array.from({ length: rows * columns }, (_, index) => ({
          row: Math.floor(index / columns),
        })),
      [rows, columns],
    )

    useImperativeHandle(
      ref,
      () => ({
        show: (customConfig = {}) =>
          new Promise((resolve) => {
            const cellEls = gridRef.current!.children
            const config: Required<CellAnimationConfig> = {
              transformOrigin: '50% 50%',
              duration: 0.5,
              ease: 'none',
              stagger: { grid: [rows, columns], from: 0, each: 0.05, ease: 'none' },
              ...customConfig,
            }

            gsap.set(gridRef.current, { opacity: 1 })
            gsap.fromTo(
              cellEls,
              { scale: 0, opacity: 0, transformOrigin: config.transformOrigin },
              {
                duration: config.duration,
                ease: config.ease,
                scale: 1.01,
                opacity: 1,
                stagger: config.stagger,
                onComplete: () => resolve(),
              },
            )
          }),
        hide: (customConfig = {}) =>
          new Promise((resolve) => {
            const cellEls = gridRef.current!.children
            const config: Required<CellAnimationConfig> = {
              transformOrigin: '50% 50%',
              duration: 0.5,
              ease: 'none',
              stagger: { grid: [rows, columns], from: 0, each: 0.05, ease: 'none' },
              ...customConfig,
            }

            gsap.fromTo(
              cellEls,
              { transformOrigin: config.transformOrigin },
              {
                duration: config.duration,
                ease: config.ease,
                scale: 0,
                opacity: 0,
                stagger: config.stagger,
                onComplete: () => {
                  gsap.set(gridRef.current, { opacity: 0 })
                  resolve()
                },
              },
            )
          }),
      }),
      [rows, columns],
    )

    return (
      <div
        ref={gridRef}
        className="pixel-overlay"
        aria-hidden="true"
        style={{ '--pixel-overlay-columns': columns } as CSSProperties}
      >
        {cells.map((cell, index) => (
          <div key={index} className="pixel-overlay__cell" data-row={cell.row} />
        ))}
      </div>
    )
  },
)
