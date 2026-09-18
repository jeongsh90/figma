import { useEffect, useRef } from 'react'
import './MouseTrail.css'

type Point = { x: number; y: number; t: number }

const TRAIL_MS = 250
const DOT_SIZE = 8

export function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<Point[]>([])
  const lastPointRef = useRef<Point | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMove = (e: MouseEvent) => {
      const point = { x: e.clientX, y: e.clientY, t: performance.now() }
      pointsRef.current.push(point)
      lastPointRef.current = point
    }
    window.addEventListener('mousemove', handleMove)

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#d3ff02'

    let raf = 0
    const draw = () => {
      const now = performance.now()
      pointsRef.current = pointsRef.current.filter((p) => now - p.t < TRAIL_MS)
      const pts = pointsRef.current

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1]
        const p1 = pts[i]
        const age = (now - p1.t) / TRAIL_MS
        ctx.strokeStyle = accent
        ctx.globalAlpha = Math.max(0, 1 - age)
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.stroke()
      }

      if (lastPointRef.current) {
        const head = lastPointRef.current
        ctx.globalAlpha = 1
        ctx.fillStyle = accent
        ctx.fillRect(head.x - DOT_SIZE / 2, head.y - DOT_SIZE / 2, DOT_SIZE, DOT_SIZE)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} className="mouse-trail" aria-hidden="true" />
}
