import './site-grid.css'
import './Projects.css'

const PROJECT_ITEMS = [
  { title: 'Project one', tag: 'Category' },
  { title: 'Project two', tag: 'Category' },
]

export function Projects() {
  return (
    <section className="site-projects">
      <div className="site-container">
        <h2 className="site-projects__title">Selected work</h2>
        <div className="site-grid-12 site-projects__grid">
          {PROJECT_ITEMS.map((item) => (
            <a key={item.title} href="#" className="site-projects__card">
              <span className="placeholder-image site-projects__thumb" aria-hidden="true" />
              <div className="site-projects__meta">
                <p className="site-projects__name">{item.title}</p>
                <p className="site-projects__tag">{item.tag}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
