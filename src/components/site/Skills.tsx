import './site-grid.css'
import './Skills.css'

const SKILL_ITEMS = [
  { label: 'Design', desc: 'Placeholder description for this skill area.' },
  { label: 'Frontend', desc: 'Placeholder description for this skill area.' },
  { label: 'Motion', desc: 'Placeholder description for this skill area.' },
]

export function Skills() {
  return (
    <section className="site-skills">
      <div className="site-container site-skills__inner">
        <h2 className="site-skills__title">What I work with</h2>
        <ul className="site-skills__list">
          {SKILL_ITEMS.map((item) => (
            <li key={item.label} className="site-skills__item">
              <span className="placeholder-fill site-skills__icon" aria-hidden="true" />
              <div>
                <p className="site-skills__label">{item.label}</p>
                <p className="site-skills__desc">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
