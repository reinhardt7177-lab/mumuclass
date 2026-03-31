import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Footer } from './Footer'
import DEMO_APPS from '../data/demoApps'

const TAGS = ['BEST 바이브앱', '추천앱', '학급관리', '수학', '국어', '게임', '퍼즐', '에듀테크', '기타']

export default function HomePage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('BEST 바이브앱')
  const { user } = useAuth()

  useEffect(() => {
    fetchApps()
  }, [])

  const fetchApps = async () => {
    setLoading(true)
    // Supabase의 실제 앱 + 데모 앱 합치기
    const { data } = await supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: false })
    
    const realApps = data || []
    setApps([...DEMO_APPS, ...realApps])
    setLoading(false)
  }

  const displayApps = (() => {
    let result = apps

    if (activeTag === 'BEST 바이브앱') {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 13)
    } else if (activeTag === '추천앱') {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else {
      result = result.filter(app => app.category === activeTag)
    }

    return result
  })()

  return (
    <>
      <div className="retro-page">        {/* 상단 카테고리 탭바 — 고전게임나라 스타일 (상단 바로 통합됨) */}
        <nav className="retro-nav">
          {TAGS.map((tag) => (
            <button
              key={tag}
              className={`retro-nav__item ${activeTag === tag ? 'retro-nav__item--active' : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </nav>

        {/* 앱 그리드 — 고전게임나라 스타일 */}
        <div className="retro-content">
          {loading ? (
            <div className="retro-loading">
              <span>⏳</span>
              <p>앱을 불러오는 중...</p>
            </div>
          ) : displayApps.length === 0 ? (
            <div className="retro-loading">
              <span>📦</span>
              <p>앱이 없습니다</p>
            </div>
          ) : (
            <div className="retro-grid">
              {displayApps.map((app) => (
                <Link
                  to={app.id?.startsWith?.('demo-') ? `/apps/${app.id}` : `/apps/${app.id}`}
                  key={app.id}
                  className="retro-card"
                >
                  <div className="retro-card__img">
                    <img
                      src={app.screenshot_url}
                      alt={app.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="retro-card__name">{app.title}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
