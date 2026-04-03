import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'mumuclass@mumuclass.kr'

const links = [
  { path: '/story', label: '회사소개' },
  { path: '/ai-tech', label: '앱제작연구소' },
  { path: '/community', label: '커뮤니티' },
  { path: '/shop', label: '교육상품' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const isAdmin = user?.email === ADMIN_EMAIL

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
    <nav className={`retro-topbar ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="retro-topbar__inner">
        <Link to="/" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/favicon.svg" alt="Mumuclass Logo" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
              <span className="retro-topbar__brand">무궁무진 클래스</span>
            </span>
            <span className="retro-topbar__sub">BEST 바이브 코딩 앱</span>
          </div>
        </Link>
      </div>

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
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f39c12', background: 'rgba(243,156,18,0.12)', padding: '3px 10px', borderRadius: 4, border: '1px solid rgba(243,156,18,0.3)', textDecoration: 'none' }}
              >🛡️ 관리자</Link>
            )}
            <div className="nav__user-avatar" style={{ background: '#555', color: '#fff' }}>
              {user.user_metadata?.display_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span className="nav__user-name" style={{ color: '#ccc' }}>
              {user.user_metadata?.display_name || user.email?.split('@')[0]}
            </span>
            <button className="nav__logout" onClick={handleLogout} style={{ color: '#e74c3c' }}>로그아웃</button>
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

