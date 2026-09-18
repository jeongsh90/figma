import './site-grid.css'
import './CTA.css'

export function CTA() {
  return (
    <section className="site-cta">
      <div className="site-container site-cta__inner">
        <p className="site-cta__title">
          Let&rsquo;s work
          <br />
          together
        </p>
        <a href="#" className="site-cta__button">
          Get in touch
        </a>
      </div>
    </section>
  )
}
