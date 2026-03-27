import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Nav.css'

const links = [
  { label: 'Platform', href: '/platform', page: true },
  { label: 'Funding', href: '#funding', page: false },
  { label: 'Community', href: '#community', page: false },
  { label: 'Products', href: '#products', page: false },
  { label: 'Blog', href: '#blog', page: false },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  function handleLink(link) {
    setMenuOpen(false)
    if (link.page) {
      navigate(link.href)
    } else if (location.pathname !== '/') {
      navigate('/' + link.href)
    } else {
      const el = document.querySelector(link.href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div
        className="nav__logo"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <div className="nav__mark">∞</div>
        <span className="nav__name">
          <span className="nav__name--accent">mumu</span>class
        </span>
      </div>

      <div className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => { e.preventDefault(); handleLink(link) }}
            className={location.pathname === link.href ? 'nav__link--active' : ''}
          >
            {link.label}
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
