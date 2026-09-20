import { useEffect, useRef } from 'react'
import './TetrisBoard.css'

// Narrowing this would make line clears happen far more often (a
// single-piece-lookahead greedy AI needs ~11 pieces to land in exactly the
// right spot with zero interference anywhere across a 43-wide row, which is
// rare), but it also makes every cell visibly bigger/chunkier - tried 18 and
// confirmed clears working, but reverted: the fine pixel-grid look here
// matters more than frequent clears for this decorative background.
const COLS = 36
const HORIZONTAL_TICK_MS = 25
const ROTATE_TICK_MS = 100
const FALL_TICK_MS = 500
const LOCK_DELAY_MS = 400

// Classic simple Tetris-AI heuristic weights (aggregate height / lines cleared /
// holes / bumpiness) - the same idea StackRabbit and similar bots use to score
// candidate placements, just without its full search tree or rotation timing.
const WEIGHT_HEIGHT = -0.510066
const WEIGHT_LINES = 0.760666
const WEIGHT_HOLES = -0.35663
const WEIGHT_BUMPINESS = -0.184483

// Not part of the classic heuristic - added to counteract bumpiness's
// tendency to keep pieces clustered on one existing mound instead of ever
// spreading across the full width, which a wide board otherwise needs to
// have any chance of completing a row. See its use in evaluatePlacement.
const WEIGHT_COVERAGE = 1.5

// Used only as a lookahead penalty (see chooseBestPlacement's nextShapeKey
// param) when a candidate placement would leave the next piece nowhere
// legal to go at all - effectively topping out the board. Far larger than
// any real hole count so it's always avoided if any alternative exists.
const LOOKAHEAD_DEADEND_HOLES = 999

type Cell = readonly [number, number]

type ShapeDef = {
  cells: readonly Cell[]
  box: number
  color: string
}

const BASE_SHAPES: Record<string, ShapeDef> = {
  I: { cells: [[1, 0], [1, 1], [1, 2], [1, 3]], box: 4, color: '#22d3ee' },
  O: { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], box: 2, color: '#facc15' },
  T: { cells: [[0, 1], [1, 0], [1, 1], [1, 2]], box: 3, color: '#c084fc' },
  S: { cells: [[0, 1], [0, 2], [1, 0], [1, 1]], box: 3, color: '#4ade80' },
  Z: { cells: [[0, 0], [0, 1], [1, 1], [1, 2]], box: 3, color: '#f87171' },
  J: { cells: [[0, 0], [1, 0], [1, 1], [1, 2]], box: 3, color: '#60a5fa' },
  L: { cells: [[0, 2], [1, 0], [1, 1], [1, 2]], box: 3, color: '#fb923c' },
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
  color: string
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

    // Whether dropping this piece here would bury an empty cell under a
    // filled one THAT WASN'T ALREADY BURIED - i.e. does the hole count in
    // this piece's own columns go up, not just "is it nonzero" (a column can
    // easily already have an old, unrelated hole in it from a past piece;
    // that's not this placement's doing). A placement can only ever change
    // the hole count within the handful of columns it actually occupies -
    // every other column is completely untouched - so this only needs to
    // scan those columns instead of the full board, and skips building a
    // scratch copy of the whole board entirely. Used for the cheap
    // next-piece lookahead check below; unlike evaluatePlacement it doesn't
    // account for a possible line clear shifting rows first, which is an
    // acceptable approximation for a heuristic existence check (and clears
    // are rare on a board this wide).
    const createsHoleInOwnColumns = (board: Board, cells: readonly Cell[], col: number) => {
      if (collidesAt(board, cells, 0, col)) return null
      const row = dropRowFor(board, cells, col)
      const { minCol, maxCol } = getBounds(cells)

      const pieceRowsByCol = new Map<number, Set<number>>()
      for (const [dr, dc] of cells) {
        const c = col + dc
        const set = pieceRowsByCol.get(c) ?? new Set<number>()
        set.add(row + dr)
        pieceRowsByCol.set(c, set)
      }

      const countHolesInColumn = (c: number, includePiece: boolean) => {
        const pieceRows = includePiece ? pieceRowsByCol.get(c) : undefined
        let blockSeen = false
        let holeCount = 0
        for (let r = 0; r < rows; r++) {
          const filled = Boolean(board[r][c]) || (pieceRows?.has(r) ?? false)
          if (filled) blockSeen = true
          else if (blockSeen) holeCount++
        }
        return holeCount
      }

      for (let c = col + minCol; c <= col + maxCol; c++) {
        if (countHolesInColumn(c, true) > countHolesInColumn(c, false)) return true
      }
      return false
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

      // How many columns have anything in them at all. Completing a row
      // needs EVERY column touched eventually, but bumpiness alone actively
      // discourages that: dropping into an isolated empty stretch creates
      // two new height steps (0 -> piece height -> 0), while extending the
      // edge of a mound that already exists usually creates just one,
      // smaller step. Left alone, that made pieces keep piling onto
      // whichever mound already existed instead of ever spreading into a
      // wide empty gap between two separate mounds - exactly the "just
      // keeps stacking, never clears" pattern reported, since two mounds
      // that never merge can never share a single completed row. Rewarding
      // width covered counteracts that bias.
      const coverage = heights.filter((h) => h > 0).length

      const score =
        WEIGHT_HEIGHT * aggregateHeight +
        WEIGHT_LINES * cleared +
        WEIGHT_HOLES * holes +
        WEIGHT_BUMPINESS * bumpiness +
        WEIGHT_COVERAGE * coverage

      return { row, score, cleared, holes, resultBoard: sim }
    }

    // Tries every rotation state at every legal column and keeps the best
    // placement, in strict priority order:
    //   1. Lines cleared - completing a row always beats not completing one.
    //   2. New holes created - a cell can only ever be filled by a piece
    //      landing on TOP of the stack, never slid into a gap underneath one,
    //      so the instant a hole is buried under a block, the row it's in can
    //      never be completed again for the rest of the game. On a board
    //      this wide (43 columns) a single stray hole anywhere permanently
    //      kills that row's chance of ever clearing, which is why lines
    //      almost never cleared before - the heuristic only nudged away from
    //      holes with a modest weight instead of avoiding them outright.
    //      Picking a zero-new-holes placement whenever one exists (there
    //      almost always is one, just maybe not the flattest-looking spot)
    //      keeps the surface actually clearable. (A tier that then also
    //      chased whichever row was closest to complete was tried and
    //      reverted - it greedily filled in one target row without regard
    //      for the terrain it left behind, which left awkward notches that
    //      forced MORE holes for the next few pieces, especially S/Z.)
    //   3. The usual weighted height/lines/holes/bumpiness score, as a
    //      tie-breaker once the two hard priorities above are equal.
    //
    // Cheap existence check (not a full search): does ANY rotation/column
    // exist where the given shape could land without creating a hole? Used
    // as one piece of lookahead - see chooseBestPlacement below - so it only
    // needs a yes/no answer, not to rank every option, and returns as soon
    // as it finds one (a hole-free spot is usually one of the first few
    // tried on anything but a pathological surface, so this is far cheaper
    // than a full nested chooseBestPlacement call).
    const hasHoleFreePlacement = (board: Board, shapeKey: string) => {
      const states = ROTATIONS[shapeKey]
      for (let rotationIndex = 0; rotationIndex < states.length; rotationIndex++) {
        const cells = states[rotationIndex]
        const { minCol, maxCol } = getBounds(cells)
        for (let col = -minCol; col <= COLS - 1 - maxCol; col++) {
          if (createsHoleInOwnColumns(board, cells, col) === false) return true
        }
      }
      return false
    }

    // When nextShapeKey is given, a candidate that would leave the piece
    // AFTER that with no hole-free spot anywhere gets a heavy holes penalty.
    // Without this, a placement can look perfectly fine for the current
    // piece alone while quietly leaving a flat stretch of terrain that the
    // very next piece - if it's an S or Z - can only fill by leaving a hole
    // (their shape makes a hole mathematically unavoidable on certain
    // terrain shapes, no matter which column or rotation is picked). That
    // was the real source of most of the holes that kept permanently
    // blocking rows from ever completing: not bad luck, but the AI simply
    // not seeing the S/Z coming in time to leave it somewhere it could land
    // cleanly. (An earlier version of this ran a full nested
    // chooseBestPlacement for the lookahead piece - correct, but roughly
    // squared the search size and measurably blocked the main thread,
    // 100-350ms per placement decision. This existence check captures the
    // same practical benefit for a small fraction of the cost.)
    type Candidate = {
      rotationIndex: number
      cells: readonly Cell[]
      col: number
      score: number
      cleared: number
      holes: number
    }

    // Collects every legal placement instead of picking a winner inline,
    // because the final pick below is a weighted RANDOM choice, not a
    // deterministic "take the single best" - a fully deterministic pick
    // made every piece visibly stack into the exact same spot (a corner)
    // first, which looked robotic rather than organic. The two hard
    // requirements still apply first, in order:
    //   1. Complete a line if at all possible.
    //   2. Avoid creating (or setting up) a hole if at all possible - a
    //      cell can only ever be filled by a piece landing on TOP of the
    //      stack, never slid into a gap underneath one, so a hole
    //      permanently blocks whichever row it's in from ever completing.
    //      Keeping the surface hole-free is what makes clears achievable at
    //      all, not just a nicety.
    // Only once both are satisfied does randomness take over, and even then
    // it's WEIGHTED toward the better-scoring (typically lower, flatter)
    // spots rather than uniform - see the pick below.
    const chooseBestPlacement = (board: Board, shapeKey: string, nextShapeKey?: string) => {
      const candidates: Candidate[] = []
      const states = ROTATIONS[shapeKey]
      for (let rotationIndex = 0; rotationIndex < states.length; rotationIndex++) {
        const cells = states[rotationIndex]
        const { minCol, maxCol } = getBounds(cells)
        for (let col = -minCol; col <= COLS - 1 - maxCol; col++) {
          const result = evaluatePlacement(board, cells, col)
          if (!result) continue

          let holes = result.holes
          if (nextShapeKey && !hasHoleFreePlacement(result.resultBoard, nextShapeKey)) {
            holes += LOOKAHEAD_DEADEND_HOLES
          }

          candidates.push({ rotationIndex, cells, col, score: result.score, cleared: result.cleared, holes })
        }
      }
      if (candidates.length === 0) return null

      const maxCleared = Math.max(...candidates.map((c) => c.cleared))
      const clearedPool = candidates.filter((c) => c.cleared === maxCleared)
      const minHoles = Math.min(...clearedPool.map((c) => c.holes))
      const pool = clearedPool.filter((c) => c.holes === minHoles)

      // Rank-weighted random pick: the best-scoring (lowest/flattest) spot
      // in the pool gets weight 1, the next 1/2, the next 1/4, halving each
      // rank down - a harmonic 1/(i+1) falloff was tried first but decayed
      // too slowly, letting mediocre-height spots compete almost evenly
      // with genuinely low ones, so pieces kept building on top of existing
      // stacks instead of dropping into clearly emptier gaps nearby.
      // Exponential falloff keeps real variety among the top few while
      // making the truly lowest spot the dominant, usual pick.
      pool.sort((a, b) => b.score - a.score)
      const weights = pool.map((_, i) => 2 ** -i)
      const totalWeight = weights.reduce((sum, w) => sum + w, 0)
      let remaining = Math.random() * totalWeight
      let chosenIndex = pool.length - 1
      for (let i = 0; i < pool.length; i++) {
        remaining -= weights[i]
        if (remaining <= 0) {
          chosenIndex = i
          break
        }
      }
      return pool[chosenIndex]
    }

    const randomShapeKey = () => SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)]

    const spawnPiece = (
      board: Board,
      shapeKey: string,
      nextShapeKey: string,
    ): { piece: Piece; targetCol: number; targetRotationIndex: number } | null => {
      const placement = chooseBestPlacement(board, shapeKey, nextShapeKey)
      if (!placement) return null

      // Always spawn in the shape's base orientation, dead center - the
      // rotate-into-place animation plays out on screen afterward instead of
      // appearing pre-rotated. Every shape's base orientation is only 2 rows
      // tall (relative rows 0-1), so starting 2 rows ABOVE the board (an
      // invisible buffer - draw() only renders cells with row >= 0) means
      // every one of its cells starts at a negative row, which collidesAt
      // always treats as free. That makes the spawn spot unconditionally
      // safe regardless of how the board is filled, so the piece never has
      // to shift off-center to dodge a collision (which it used to do by
      // searching outward for a free column - correct, but visibly spawned
      // left/right of center instead of always from the middle) and can
      // never render on top of existing blocks either (the bug that
      // "shift outward" approach was originally written to fix).
      const baseCells = ROTATIONS[shapeKey][0]
      const { minCol, maxCol } = getBounds(baseCells)
      const width = maxCol - minCol + 1
      const spawnCol = Math.max(
        -minCol,
        Math.min(COLS - 1 - maxCol, Math.floor((COLS - width) / 2) - minCol),
      )

      return {
        piece: {
          shapeKey,
          rotationIndex: 0,
          shape: baseCells,
          color: BASE_SHAPES[shapeKey].color,
          row: -2,
          col: spawnCol,
        },
        targetCol: placement.col,
        targetRotationIndex: placement.rotationIndex,
      }
    }

    const boardRef = { current: makeEmptyBoard() }
    const nextShapeKeyRef = { current: randomShapeKey() }
    const initialSpawn = spawnPiece(boardRef.current, randomShapeKey(), nextShapeKeyRef.current)!
    const pieceRef = { current: initialSpawn.piece }
    const targetColRef = { current: initialSpawn.targetCol }
    const targetRotationIndexRef = { current: initialSpawn.targetRotationIndex }

    const fg = getComputedStyle(canvas).getPropertyValue('--color-fg').trim()
    const fgMatch = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(fg)
    const gridLineColor = fgMatch
      ? `rgba(${parseInt(fgMatch[1], 16)}, ${parseInt(fgMatch[2], 16)}, ${parseInt(fgMatch[3], 16)}, 0.12)`
      : 'rgba(0, 0, 0, 0.12)'

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
      const shapeKey = nextShapeKeyRef.current
      const upcomingShapeKey = randomShapeKey()
      let spawned = spawnPiece(boardRef.current, shapeKey, upcomingShapeKey)
      if (!spawned) {
        // No legal placement anywhere - the stack reached the top. Start fresh.
        boardRef.current = makeEmptyBoard()
        spawned = spawnPiece(boardRef.current, shapeKey, upcomingShapeKey)
      }
      nextShapeKeyRef.current = upcomingShapeKey
      pieceRef.current = spawned!.piece
      targetColRef.current = spawned!.targetCol
      targetRotationIndexRef.current = spawned!.targetRotationIndex
    }

    // A single-piece-lookahead greedy AI (no hold, no deep search) can only
    // reduce how often an unavoidable hole (mainly from S/Z pieces) gets
    // created - it can't prevent every one forever. Each surviving hole
    // permanently blocks its own row from ever clearing, so left alone they
    // keep accumulating over a long enough run, and the board gradually
    // turns visibly messy (exactly what was reported: too many holes/gaps)
    // well before it ever tops out and hits the existing "no legal
    // placement" reset below. Proactively starting over once holes cross a
    // small threshold keeps the board looking clean far more of the time.
    const MAX_TOLERABLE_HOLES = 10
    const countHoles = (board: Board) => {
      let holes = 0
      for (let c = 0; c < COLS; c++) {
        let blockSeen = false
        for (let r = 0; r < rows; r++) {
          if (board[r][c]) blockSeen = true
          else if (blockSeen) holes++
        }
      }
      return holes
    }

    const lockAndSpawn = () => {
      lockPiece(boardRef.current, pieceRef.current)
      clearLines(boardRef.current)
      if (countHoles(boardRef.current) > MAX_TOLERABLE_HOLES) {
        boardRef.current = makeEmptyBoard()
      }
      spawnNext()
    }

    function lockPiece(board: Board, piece: Piece) {
      for (const [dr, dc] of piece.shape) {
        const r = piece.row + dr
        const c = piece.col + dc
        if (r >= 0 && r < rows) board[r][c] = piece.color
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
      // Still in the invisible above-the-board spawn buffer (see spawnPiece)
      // - hold off sliding until it's actually on screen, so it always
      // visibly enters dead center first.
      if (piece.row < 0) return
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
      // Same reasoning as tickHorizontal - stay in the base orientation
      // until the piece has actually appeared, so it never looks like it
      // spawned mid-rotation.
      if (piece.row < 0) return
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

      // Once the piece has actually reached its chosen column and rotation,
      // there's nothing left to decide - drop it the rest of the way
      // immediately (a real hard drop) instead of continuing to crawl down
      // one row per tick, and lock it in right away rather than waiting out
      // the lock delay too. Only once it's actually visible (row >= 0) -
      // otherwise a piece whose target happens to already match its spawn
      // column/rotation would hard-drop straight from the invisible spawn
      // buffer, popping in already placed instead of visibly falling at all.
      const { minCol, maxCol } = getBounds(piece.shape)
      const clampedTargetCol = Math.max(-minCol, Math.min(COLS - 1 - maxCol, targetColRef.current))
      if (piece.row >= 0 && piece.rotationIndex === targetRotationIndexRef.current && piece.col === clampedTargetCol) {
        while (!collidesAt(board, piece.shape, piece.row + 1, piece.col)) piece.row += 1
        lockDelayStart = null
        lockAndSpawn()
        return
      }

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
        if (r >= 0) drawCell(r, c, piece.color)
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
