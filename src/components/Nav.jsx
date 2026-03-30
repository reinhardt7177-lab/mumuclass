import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const links = [
  { path: '/community', label: '커뮤니티' },
  { path: '/shop', label: '교육상품' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <Link to="/" onClick={() => setMenuOpen(false)}>
        <div className="nav__logo">
          <div className="nav__mark">∞</div>
          <span className="nav__name">
            <span className="nav__name--accent">무궁무진</span> 클래스
          </span>
        </div>
      </Link>

      <div className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`}>
        {links.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav__link ${location.pathname.startsWith(item.path) ? 'nav__link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}

        {user ? (
          <div className="nav__user">
            <div className="nav__user-avatar">
              {user.user_metadata?.display_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span className="nav__user-name">
              {user.user_metadata?.display_name || user.email?.split('@')[0]}
            </span>
            <button className="nav__logout" onClick={handleLogout}>로그아웃</button>
          </div>
        ) : (
          <Link to="/login" className="nav__cta" onClick={() => setMenuOpen(false)}>
            로그인
          </Link>
        )}
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
