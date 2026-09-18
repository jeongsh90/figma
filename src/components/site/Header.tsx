import { useState } from 'react'
import { useLenis } from 'lenis/react'
import './site-grid.css'
import './Header.css'
import { NavPreview } from './NavPreview'

const NAV_ITEMS = ['Work', 'About', 'Contact']

export function Header() {
  const [hidden, setHidden] = useState(false)

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
          <span className="site-header__logo">JEONG. S. H</span>
        </div>
        <div className="site-header__menu">
          <nav className="site-header__nav">
            {NAV_ITEMS.map((item) => (
              <NavPreview key={item} label={item} />
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
