import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { PixelOverlay, type PixelOverlayHandle } from '../components/PixelOverlay'

type PixelTransitionContextValue = {
  navigate: (to: string) => void
}

const PixelTransitionContext = createContext<PixelTransitionContextValue | null>(null)

export function usePixelTransition() {
  const ctx = useContext(PixelTransitionContext)
  if (!ctx) {
    throw new Error('usePixelTransition must be used within a PixelTransitionProvider')
  }
  return ctx
}

// Row-biased stagger: cells near the top of the viewport animate first,
// with a little randomness thrown in so the wipe doesn't look mechanical.
const rowStagger = (_index: number, target: Element) =>
  0.03 * (Number((target as HTMLElement).dataset.row) + gsap.utils.random(0, 5))

export function PixelTransitionProvider({ children }: { children: ReactNode }) {
  const overlayRef = useRef<PixelOverlayHandle>(null)
  const routerNavigate = useNavigate()
  const isAnimating = useRef(false)

  const navigate = (to: string) => {
    if (isAnimating.current) return
    isAnimating.current = true

    overlayRef
      .current!.show({
        transformOrigin: '50% 0%',
        duration: 0.4,
        ease: 'power3.inOut',
        stagger: rowStagger,
      })
      .then(() => {
        routerNavigate(to)

        requestAnimationFrame(() => {
          overlayRef
            .current!.hide({
              transformOrigin: '50% 100%',
              duration: 0.4,
              ease: 'power2',
              stagger: rowStagger,
            })
            .then(() => {
              isAnimating.current = false
            })
        })
      })
  }

  return (
    <PixelTransitionContext.Provider value={{ navigate }}>
      {children}
      <PixelOverlay ref={overlayRef} rows={8} columns={14} />
    </PixelTransitionContext.Provider>
  )
}
