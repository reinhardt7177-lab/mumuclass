import { useState, useEffect } from 'react'
import './Nav.css'

const links = ['Platform', 'Funding', 'Community', 'Products', 'Blog']

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__logo">
        <div className="nav__mark">∞</div>
        <span className="nav__name">
          <span className="nav__name--accent">mumu</span>class
        </span>
      </div>

      <div className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`}>
        {links.map((t) => (
          <a key={t} href={`#${t.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
            {t}
          </a>
        ))}
        <button className="nav__cta">Get started</button>
      </div>

      <button
        className={`nav__hamburger ${menuOpen ? 'nav__hamburger--open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="메뉴"
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  )
}
