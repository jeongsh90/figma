import './GridIntro.css'

const COLUMNS = 6
const ROWS = 6
const CELL_COUNT = COLUMNS * ROWS

export function GridIntro() {
  return (
    <section className="grid-intro">
      <div className="grid-intro__menu">
        <span className="grid-intro__menu-label">MENU</span>
        <button type="button" className="grid-intro__menu-btn" aria-label="메뉴 열기">
          <span className="grid-intro__menu-dot" />
          <span className="grid-intro__menu-dot" />
          <span className="grid-intro__menu-dot" />
        </button>
      </div>

      <div className="grid-intro__stage">
        <div className="grid-intro__hero">
          <img src="/intro.png" className="grid-intro__hero-image" alt="Portfolio 2026 — Jeong. S. H" />
        </div>

        <ScrollDownBadge />

        <div
          className="grid-intro__grid"
          style={{ '--cols': COLUMNS, '--rows': ROWS } as React.CSSProperties}
        >
          {Array.from({ length: CELL_COUNT }, (_, index) => (
            <div className="grid-cell" key={index}>
              <div className="grid-cell__face grid-cell__face--front" />
              <div className="grid-cell__face grid-cell__face--back" />
            </div>
          ))}
        </div>
      </div>

      <p className="grid-intro__copyright">Copyright © 2026 JEONG. S. H. All Rights Reserved.</p>
    </section>
  )
}

function ScrollDownBadge() {
  return (
    <div className="grid-intro__scroll">
      <svg viewBox="0 0 120 120" className="grid-intro__scroll-svg">
        <defs>
          <path id="scroll-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text className="grid-intro__scroll-text">
          <textPath href="#scroll-circle" startOffset="0%">
            SCROLL DOWN · SCROLL DOWN ·
          </textPath>
        </text>
      </svg>
    </div>
  )
}
