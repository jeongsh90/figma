import './site-grid.css'
import './Services.css'

const SERVICE_ITEMS = [
  { title: 'Service one', desc: 'Placeholder description for this service or capability.' },
  { title: 'Service two', desc: 'Placeholder description for this service or capability.' },
  { title: 'Service three', desc: 'Placeholder description for this service or capability.' },
  { title: 'Service four', desc: 'Placeholder description for this service or capability.' },
]

export function Services() {
  return (
    <section className="site-services">
      <div className="site-container site-grid-12 site-services__grid">
        {SERVICE_ITEMS.map((item) => (
          <div key={item.title} className="site-services__card">
            <span className="placeholder-fill site-services__icon" aria-hidden="true" />
            <p className="site-services__title">{item.title}</p>
            <p className="site-services__desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
