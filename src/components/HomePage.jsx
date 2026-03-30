import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Footer } from './Footer'

const TAGS = ['🔥 TOP 10', '전체', '학급관리', '수학', '국어', '게임', '퍼즐', '에듀테크', '기타']

export default function HomePage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('전체')
  const { user } = useAuth()

  useEffect(() => {
    fetchApps()
  }, [])

  const fetchApps = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setApps(data)
    setLoading(false)
  }

  // TOP 10 활성화 시 평점순 정렬 후 10개 추출
  const displayApps = (() => {
    let result = apps.filter(app => {
      const matchSearch =
        app.title?.toLowerCase().includes(search.toLowerCase()) ||
        app.one_line_desc?.toLowerCase().includes(search.toLowerCase())
      
      // TOP 10인 경우 카테고리는 무시하고 검색어만 매칭
      if (activeTag === '🔥 TOP 10') return matchSearch

      const matchTag = activeTag === '전체' || app.category === activeTag
      return matchSearch && matchTag
    })

    if (activeTag === '🔥 TOP 10') {
      result = result.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10)
    }
    
    return result
  })()

  return (
    <>
      <div className="home-hub">
        {/* 히어로 배너 - 컴팩트 */}
        <div className="hub-hero">
          <div className="hub-hero__content">
            <h1 className="hub-hero__title">
              <span className="hub-hero__logo">∞</span>
              <span><span style={{ color: 'var(--accent)' }}>무궁무진</span> 클래스</span>
            </h1>
            <p className="hub-hero__desc">
              선생님이 만든 바이브 코딩 앱을 발견하고, 공유하고, 함께 성장하세요 🚀
            </p>
            <div className="hub-hero__search">
              <span className="hub-hero__search-icon">🔍</span>
              <input
                type="text"
                placeholder="앱 이름, 설명으로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="hub-main">
          
          {/* 가로형 카테고리 네비게이션 */}
          <div className="hub-category-nav">
            {TAGS.map((tag) => (
              <button
                key={tag}
                className={`hub-category-tag ${activeTag === tag ? 'hub-category-tag--active' : ''} ${tag === '🔥 TOP 10' ? 'hub-category-tag--hot' : ''}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 중앙 앱 리스트 */}
          <main className="hub-feed">
            <div className="hub-feed__header">
              <h2>
                {activeTag === '전체' ? '새로 올라온 앱' : activeTag === '🔥 TOP 10' ? '🏆 인기 앱 TOP 10' : `📂 ${activeTag}`}
              </h2>
              <span className="hub-feed__count">{displayApps.length}개</span>
            </div>

            {loading ? (
              <div className="board__empty">
                <div className="board__empty-icon">⏳</div>
                <p>앱을 불러오는 중...</p>
              </div>
            ) : displayApps.length === 0 ? (
              <div className="board__empty">
                <div className="board__empty-icon">📦</div>
                <p>{search || (activeTag !== '전체' && activeTag !== '🔥 TOP 10') ? '검색 결과가 없습니다' : '아직 등록된 앱이 없습니다'}</p>
                {user && !search && activeTag === '전체' && (
                  <Link to="/apps/create" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    🚀 첫 번째 앱 등록하기
                  </Link>
                )}
              </div>
            ) : (
              <div className="hub-grid">
                {displayApps.map((app) => (
                  <Link to={`/apps/${app.id}`} key={app.id} className="hub-card">
                    {/* 스크린샷 */}
                    <div className="hub-card__thumb">
                      {app.screenshot_url ? (
                        <img src={app.screenshot_url} alt={app.title} />
                      ) : (
                        <div className="hub-card__placeholder">
                          <span>📱</span>
                        </div>
                      )}
                      <span className={`hub-card__badge ${app.code_access_level === '전체' ? 'hub-card__badge--new' : 'hub-card__badge--best'}`}>
                        {app.code_access_level === '전체' ? 'NEW' : 'BEST'}
                      </span>
                    </div>
                    {/* 정보 */}
                    <div className="hub-card__body">
                      <h3 className="hub-card__title">🎮 {app.title}</h3>
                      <p className="hub-card__desc">{app.one_line_desc || '설명 없음'}</p>
                      <div className="hub-card__footer">
                        <span className="hub-card__category">{app.category || '기타'}</span>
                        <div className="hub-card__meta">
                          {app.creator_name && <span>👤 {app.creator_name}</span>}
                          <span>⭐ {app.rating || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}
