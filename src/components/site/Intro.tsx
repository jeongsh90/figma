import './site-grid.css'
import './Intro.css'

export function Intro() {
  return (
    <section className="site-intro">
      <div className="site-container site-grid-12 site-intro__grid">
        <div className="site-intro__text">
          <p className="site-intro__eyebrow">Intro</p>
          <p className="site-intro__body">
            A couple of sentences introducing who you are, what you do, and the kind of work you focus on.
            Replace this with your own short bio copy later.
          </p>
        </div>
        <div className="site-intro__visual">
          <span className="placeholder-image" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
