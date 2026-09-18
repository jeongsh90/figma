import './site-grid.css'
import './Hero.css'
import { BgLine } from './BgLine'
import { BgMark } from './BgMark'

export function Hero() {
  return (
    <section className="site-hero">
      <div className="site-frame">
        <BgLine orientation="horizontal" position="top" />
        <BgLine orientation="horizontal" position="bottom" />
        <BgLine orientation="vertical" position="left" />
        <BgLine orientation="vertical" position="right" />
        <BgMark corner="top-left" />
        <BgMark corner="top-right" />
        <BgMark corner="bottom-left" />
        <BgMark corner="bottom-right" />
        <div className="site-hero__visual">
          <span className="placeholder-image" aria-hidden="true" />
          <span className="site-hero__visual-line site-hero__visual-line--v" aria-hidden="true" />
          <span className="site-hero__visual-line site-hero__visual-line--h" aria-hidden="true" />
        </div>
      </div>
      <div className="site-container site-hero__foot">
        <h1 className="site-hero__headline">
          DESIGN <span>X</span> PUBLISHING
        </h1>
        <div className="site-hero__meta">
          <p className="site-hero__desc">
            A short line describing what this portfolio is about, and who it&rsquo;s for.
          </p>
          <a href="#work" className="site-hero__link">
            Discover more →
          </a>
        </div>
      </div>
    </section>
  )
}
