import './site-grid.css'
import './Process.css'

const STEPS = [
  { num: '01', title: 'Step one', desc: 'Placeholder description for the first step of the process.' },
  { num: '02', title: 'Step two', desc: 'Placeholder description for the second step of the process.' },
  { num: '03', title: 'Step three', desc: 'Placeholder description for the third step of the process.' },
  { num: '04', title: 'Step four', desc: 'Placeholder description for the fourth step of the process.' },
]

export function Process() {
  return (
    <section className="site-process">
      <div className="site-container site-process__grid">
        <div className="site-process__sticky">
          <span className="placeholder-image site-process__visual" aria-hidden="true" />
        </div>
        <ol className="site-process__steps">
          {STEPS.map((step) => (
            <li key={step.num} className="site-process__step">
              <span className="site-process__num">{step.num}</span>
              <div>
                <p className="site-process__title">{step.title}</p>
                <p className="site-process__desc">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
