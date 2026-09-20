import { useEffect, useRef } from 'react'
import './TetrisBoard.css'

const COLS = 43
const HORIZONTAL_TICK_MS = 25
const ROTATE_TICK_MS = 100
const FALL_TICK_MS = 120
const LOCK_DELAY_MS = 400

// Classic simple Tetris-AI heuristic weights (aggregate height / lines cleared /
// holes / bumpiness) - the same idea StackRabbit and similar bots use to score
// candidate placements, just without its full search tree or rotation timing.
const WEIGHT_HEIGHT = -0.510066
const WEIGHT_LINES = 0.760666
const WEIGHT_HOLES = -0.35663
const WEIGHT_BUMPINESS = -0.184483

type Cell = readonly [number, number]

type ShapeDef = {
  cells: readonly Cell[]
  box: number
}

const BASE_SHAPES: Record<string, ShapeDef> = {
  I: { cells: [[1, 0], [1, 1], [1, 2], [1, 3]], box: 4 },
  O: { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], box: 2 },
  T: { cells: [[0, 1], [1, 0], [1, 1], [1, 2]], box: 3 },
  S: { cells: [[0, 1], [0, 2], [1, 0], [1, 1]], box: 3 },
  Z: { cells: [[0, 0], [0, 1], [1, 1], [1, 2]], box: 3 },
  J: { cells: [[0, 0], [1, 0], [1, 1], [1, 2]], box: 3 },
  L: { cells: [[0, 2], [1, 0], [1, 1], [1, 2]], box: 3 },
}
const SHAPE_KEYS = Object.keys(BASE_SHAPES)

function rotateCells(cells: readonly Cell[], box: number): Cell[] {
  return cells.map(([r, c]) => [c, box - 1 - r] as Cell)
}

function cellsKey(cells: readonly Cell[]) {
  return cells
    .map(([r, c]) => `${r},${c}`)
    .sort()
    .join('|')
}

function generateRotations(def: ShapeDef): Cell[][] {
  const states: Cell[][] = []
  const seen = new Set<string>()
  let current: readonly Cell[] = def.cells
  for (let i = 0; i < 4; i++) {
    const key = cellsKey(current)
    if (!seen.has(key)) {
      seen.add(key)
      states.push([...current])
    }
    current = rotateCells(current, def.box)
  }
  return states
}

// All rotation states per shape, precomputed once - independent of board size.
const ROTATIONS: Record<string, Cell[][]> = Object.fromEntries(
  SHAPE_KEYS.map((key) => [key, generateRotations(BASE_SHAPES[key])]),
)

function getBounds(cells: readonly Cell[]) {
  let minRow = Infinity
  let maxRow = -Infinity
  let minCol = Infinity
  let maxCol = -Infinity
  for (const [r, c] of cells) {
    if (r < minRow) minRow = r
    if (r > maxRow) maxRow = r
    if (c < minCol) minCol = c
    if (c > maxCol) maxCol = c
  }
  return { minRow, maxRow, minCol, maxCol }
}

type Piece = {
  shapeKey: string
  rotationIndex: number
  shape: readonly Cell[]
  row: number
  col: number
}

type Board = (string | null)[][]

export function TetrisBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Grid dimensions follow the container's actual rendered aspect ratio
    // (which can differ from any CSS aspect-ratio hint once other constraints
    // like max-height clamp it) so cells stay square instead of stretched.
    const initialRect = canvas.getBoundingClientRect()
    const rows = Math.max(1, Math.round(COLS * (initialRect.height / initialRect.width)))

    const makeEmptyBoard = (): Board =>
      Array.from({ length: rows }, () => new Array<string | null>(COLS).fill(null))

    const collidesAt = (board: Board, cells: readonly Cell[], row: number, col: number) => {
      for (const [dr, dc] of cells) {
        const r = row + dr
        const c = col + dc
        if (c < 0 || c >= COLS || r >= rows) return true
        if (r >= 0 && board[r][c]) return true
      }
      return false
    }

    const dropRowFor = (board: Board, cells: readonly Cell[], col: number) => {
      let row = 0
      while (!collidesAt(board, cells, row + 1, col)) row++
      return row
    }

    // Simulates locking a piece at (cells, col) and scores the resulting board
    // using the standard height / lines-cleared / holes / bumpiness heuristic.
    const evaluatePlacement = (board: Board, cells: readonly Cell[], col: number) => {
      if (collidesAt(board, cells, 0, col)) return null
      const row = dropRowFor(board, cells, col)

      const sim = board.map((r) => r.slice())
      for (const [dr, dc] of cells) {
        const r = row + dr
        const c = col + dc
        if (r >= 0 && r < rows) sim[r][c] = '#'
      }

      let cleared = 0
      for (let r = rows - 1; r >= 0; r--) {
        if (sim[r].every(Boolean)) {
          sim.splice(r, 1)
          sim.unshift(new Array<string | null>(COLS).fill(null))
          cleared++
          r++
        }
      }

      const heights = new Array(COLS).fill(0)
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < rows; r++) {
          if (sim[r][c]) {
            heights[c] = rows - r
            break
          }
        }
      }
      const aggregateHeight = heights.reduce((a, b) => a + b, 0)

      let holes = 0
      for (let c = 0; c < COLS; c++) {
        let blockSeen = false
        for (let r = 0; r < rows; r++) {
          if (sim[r][c]) blockSeen = true
          else if (blockSeen) holes++
        }
      }

      let bumpiness = 0
      for (let c = 0; c < COLS - 1; c++) bumpiness += Math.abs(heights[c] - heights[c + 1])

      const score =
        WEIGHT_HEIGHT * aggregateHeight +
        WEIGHT_LINES * cleared +
        WEIGHT_HOLES * holes +
        WEIGHT_BUMPINESS * bumpiness

      return { row, score, cleared }
    }

    // Tries every rotation state at every legal column and keeps the best
    // placement. Lines cleared is checked FIRST, ahead of the height/holes/
    // bumpiness score - a placement that completes even one row always beats
    // one that doesn't, no matter how much tidier the non-clearing option
    // looks by the heuristic. Only among placements tied on lines cleared
    // (almost always 0, since this board is 43 columns wide) does the usual
    // score decide.
    const chooseBestPlacement = (board: Board, shapeKey: string) => {
      let best: { rotationIndex: number; cells: readonly Cell[]; col: number; score: number; cleared: number } | null =
        null
      const states = ROTATIONS[shapeKey]
      for (let rotationIndex = 0; rotationIndex < states.length; rotationIndex++) {
        const cells = states[rotationIndex]
        const { minCol, maxCol } = getBounds(cells)
        for (let col = -minCol; col <= COLS - 1 - maxCol; col++) {
          const result = evaluatePlacement(board, cells, col)
          if (!result) continue
          // On a tie, randomly decide whether to switch - otherwise ties
          // (very common on flat/empty stretches) always kept whichever
          // column was found first, which meant always the leftmost one,
          // biasing the whole board to pile up on one side.
          const isBetter =
            !best ||
            result.cleared > best.cleared ||
            (result.cleared === best.cleared &&
              (result.score > best.score || (result.score === best.score && Math.random() < 0.5)))
          if (isBetter) {
            best = { rotationIndex, cells, col, score: result.score, cleared: result.cleared }
          }
        }
      }
      return best
    }

    // The piece always spawns in its base orientation at row 0 (so the
    // rotate-into-place animation is actually visible), but that spawn spot
    // was never checked against the board - only the AI's final target spot
    // was. On a board that's filled in unevenly, the centered spawn column
    // could already be occupied at row 0, so the new piece rendered directly
    // on top of existing blocks and then just sat there stuck, overlapping,
    // since it could never validly rotate/slide away from an illegal start.
    // Search outward from the centered column for the nearest one where the
    // base orientation is actually free.
    const findSpawnCol = (board: Board, baseCells: readonly Cell[], preferredCol: number) => {
      const { minCol, maxCol } = getBounds(baseCells)
      if (!collidesAt(board, baseCells, 0, preferredCol)) return preferredCol
      for (let offset = 1; offset <= COLS; offset++) {
        const right = preferredCol + offset
        if (right <= COLS - 1 - maxCol && !collidesAt(board, baseCells, 0, right)) return right
        const left = preferredCol - offset
        if (left >= -minCol && !collidesAt(board, baseCells, 0, left)) return left
      }
      return null
    }

    const spawnPiece = (
      board: Board,
    ): { piece: Piece; targetCol: number; targetRotationIndex: number } | null => {
      const shapeKey = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)]
      const placement = chooseBestPlacement(board, shapeKey)
      if (!placement) return null

      // Always spawn in the shape's base orientation - the rotation itself
      // plays out on screen afterward instead of appearing pre-rotated.
      const baseCells = ROTATIONS[shapeKey][0]
      const { minCol, maxCol } = getBounds(baseCells)
      const width = maxCol - minCol + 1
      const preferredCol = Math.max(
        -minCol,
        Math.min(COLS - 1 - maxCol, Math.floor((COLS - width) / 2) - minCol),
      )
      const spawnCol = findSpawnCol(board, baseCells, preferredCol)
      if (spawnCol === null) return null

      return {
        piece: {
          shapeKey,
          rotationIndex: 0,
          shape: baseCells,
          row: 0,
          col: spawnCol,
        },
        targetCol: placement.col,
        targetRotationIndex: placement.rotationIndex,
      }
    }

    const boardRef = { current: makeEmptyBoard() }
    const initialSpawn = spawnPiece(boardRef.current)!
    const pieceRef = { current: initialSpawn.piece }
    const targetColRef = { current: initialSpawn.targetCol }
    const targetRotationIndexRef = { current: initialSpawn.targetRotationIndex }

    const fg = getComputedStyle(canvas).getPropertyValue('--color-fg').trim()
    const fgMatch = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(fg)
    const gridLineColor = fgMatch
      ? `rgba(${parseInt(fgMatch[1], 16)}, ${parseInt(fgMatch[2], 16)}, ${parseInt(fgMatch[3], 16)}, 0.12)`
      : 'rgba(0, 0, 0, 0.12)'
    const blockColor = getComputedStyle(canvas).getPropertyValue('--color-accent').trim() || '#f25623'

    let rafId = 0
    let lastHorizontalTick = performance.now()
    let lastRotateTick = performance.now()
    let lastFallTick = performance.now()
    let lockDelayStart: number | null = null

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const spawnNext = () => {
      let spawned = spawnPiece(boardRef.current)
      if (!spawned) {
        // No legal placement anywhere - the stack reached the top. Start fresh.
        boardRef.current = makeEmptyBoard()
        spawned = spawnPiece(boardRef.current)
      }
      pieceRef.current = spawned!.piece
      targetColRef.current = spawned!.targetCol
      targetRotationIndexRef.current = spawned!.targetRotationIndex
    }

    const lockAndSpawn = () => {
      lockPiece(boardRef.current, pieceRef.current)
      clearLines(boardRef.current)
      spawnNext()
    }

    function lockPiece(board: Board, piece: Piece) {
      for (const [dr, dc] of piece.shape) {
        const r = piece.row + dr
        const c = piece.col + dc
        if (r >= 0 && r < rows) board[r][c] = blockColor
      }
    }

    function clearLines(board: Board) {
      for (let r = rows - 1; r >= 0; r--) {
        if (board[r].every((cell) => cell)) {
          board.splice(r, 1)
          board.unshift(new Array<string | null>(COLS).fill(null))
          r++
        }
      }
    }

    // Horizontal homing, rotation and falling all run on independent clocks -
    // exactly like a real player moving/rotating a piece while it keeps
    // falling, rather than forcing the whole slide-and-rotate to finish at
    // row 0 before gravity is allowed to act. That "finish sliding first"
    // version left the piece exposed at the very top of the board for a long
    // time on this wide (43-column) board, and the instant any column's
    // stack reached close to the ceiling, the slide got physically blocked
    // and permanently gave up on the AI's chosen column/rotation - locking
    // in whatever spot it happened to be stuck at instead. That produced a
    // cascade of increasingly bad, lopsided placements (holes, spiky
    // columns) instead of the heuristic's actual best choice. Falling
    // concurrently gets the piece off row 0 almost immediately, and no
    // longer permanently abandoning the target when transiently blocked
    // means it keeps trying (and usually succeeds) as it descends.
    const tickHorizontal = () => {
      const piece = pieceRef.current
      const board = boardRef.current
      const { minCol, maxCol } = getBounds(piece.shape)
      const target = Math.max(-minCol, Math.min(COLS - 1 - maxCol, targetColRef.current))
      if (piece.col === target) return

      const dir = target > piece.col ? 1 : -1
      const nextCol = piece.col + dir
      if (!collidesAt(board, piece.shape, piece.row, nextCol)) {
        piece.col = nextCol
      }
      // If blocked, just wait - falling further may clear the obstruction on
      // a later tick, and if not, the piece still locks safely wherever it
      // ends up once it can't fall any further.
    }

    // Rotation also plays out step by step after the piece appears, instead of
    // being applied instantly at spawn - one 90 degree turn per tick.
    const tickRotate = () => {
      const piece = pieceRef.current
      if (piece.rotationIndex === targetRotationIndexRef.current) return

      const states = ROTATIONS[piece.shapeKey]
      const nextIndex = (piece.rotationIndex + 1) % states.length
      const nextCells = states[nextIndex]
      const { minCol, maxCol } = getBounds(nextCells)
      const col = Math.max(-minCol, Math.min(COLS - 1 - maxCol, piece.col))

      if (!collidesAt(boardRef.current, nextCells, piece.row, col)) {
        piece.shape = nextCells
        piece.rotationIndex = nextIndex
        piece.col = col
      }
      // If blocked, wait - same reasoning as tickHorizontal.
    }

    const tickFall = () => {
      const piece = pieceRef.current
      const board = boardRef.current
      if (!collidesAt(board, piece.shape, piece.row + 1, piece.col)) {
        piece.row += 1
        lockDelayStart = null
        return
      }

      // Real Tetris doesn't spawn the next piece the instant one lands -
      // it briefly rests in place first. Wait out the same kind of pause here.
      const now = performance.now()
      if (lockDelayStart === null) {
        lockDelayStart = now
        return
      }
      if (now - lockDelayStart < LOCK_DELAY_MS) {
        return
      }
      lockDelayStart = null
      lockAndSpawn()
    }

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const cell = width / COLS

      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, width, height)
      ctx.clip()

      ctx.strokeStyle = gridLineColor
      ctx.lineWidth = 1
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath()
        ctx.moveTo(c * cell, 0)
        ctx.lineTo(c * cell, height)
        ctx.stroke()
      }
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath()
        ctx.moveTo(0, r * cell)
        ctx.lineTo(width, r * cell)
        ctx.stroke()
      }

      const drawCell = (r: number, c: number, color: string) => {
        const pad = Math.max(1, cell * 0.07)
        ctx.fillStyle = color
        ctx.fillRect(c * cell + pad, r * cell + pad, cell - pad * 2, cell - pad * 2)
      }

      const board = boardRef.current
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < COLS; c++) {
          const color = board[r][c]
          if (color) drawCell(r, c, color)
        }
      }

      const piece = pieceRef.current
      for (const [dr, dc] of piece.shape) {
        const r = piece.row + dr
        const c = piece.col + dc
        if (r >= 0) drawCell(r, c, blockColor)
      }

      ctx.restore()
    }

    const step = (now: number) => {
      rafId = requestAnimationFrame(step)

      // Catch up on however many ticks worth of real time have passed, capped
      // so a throttled/backgrounded tab can't spin through a huge backlog at
      // once - a single "if" here would silently slow the whole animation
      // down to the rAF rate instead of tracking wall-clock time.
      let horizontalGuard = 200
      while (now - lastHorizontalTick > HORIZONTAL_TICK_MS && horizontalGuard-- > 0) {
        lastHorizontalTick += HORIZONTAL_TICK_MS
        tickHorizontal()
      }

      let rotateGuard = 200
      while (now - lastRotateTick > ROTATE_TICK_MS && rotateGuard-- > 0) {
        lastRotateTick += ROTATE_TICK_MS
        tickRotate()
      }

      let fallGuard = 200
      while (now - lastFallTick > FALL_TICK_MS && fallGuard-- > 0) {
        lastFallTick += FALL_TICK_MS
        tickFall()
      }

      draw()
    }

    rafId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="tetris-board" aria-hidden="true" />
}
