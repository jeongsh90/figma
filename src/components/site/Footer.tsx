import './site-grid.css'
import './Footer.css'

const FOOTER_LINKS = ['Work', 'About', 'Contact']
const SOCIAL_LINKS = ['GitHub', 'Instagram', 'LinkedIn']

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container site-footer__inner">
        <div className="site-footer__col">
          <p className="site-footer__logo">JEONG. S. H</p>
          <p className="site-footer__copyright">© 2026 All rights reserved.</p>
        </div>
        <nav className="site-footer__col">
          {FOOTER_LINKS.map((item) => (
            <a key={item} href="#" className="site-footer__link">
              {item}
            </a>
          ))}
        </nav>
        <nav className="site-footer__col">
          {SOCIAL_LINKS.map((item) => (
            <a key={item} href="#" className="site-footer__link">
              {item}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
