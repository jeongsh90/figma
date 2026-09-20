import { useState } from 'react'
import { useLenis } from 'lenis/react'
import { Menu, X } from 'lucide-react'
import './site-grid.css'
import './Header.css'
import { NavPreview } from './NavPreview'
import { LogoMark } from './LogoMark'

const NAV_ITEMS = ['Work', 'About', 'Contact']

export function Header() {
  const [hidden, setHidden] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useLenis((lenis) => {
    const threshold = window.innerHeight * 0.25

    if (lenis.scroll < threshold) {
      setHidden(false)
      return
    }

    if (lenis.direction === 1) {
      setHidden(true)
    } else if (lenis.direction === -1) {
      setHidden(false)
    }
  })

  return (
    <header className={`site-header${hidden ? ' site-header--hidden' : ''}`}>
      <div className="site-container site-header__inner">
        <div className="site-header__brand">
          <LogoMark className="site-header__brand-symbol" />
          <span className="site-header__logo">JEONG. S. H</span>
        </div>
        <div className="site-header__menu">
          <nav className="site-header__nav">
            {NAV_ITEMS.map((item) => (
              <NavPreview key={item} label={item} />
            ))}
          </nav>
          <button
            type="button"
            className="site-header__mobile-toggle"
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <nav className="site-header__mobile-nav">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href="#"
              className="site-header__mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
