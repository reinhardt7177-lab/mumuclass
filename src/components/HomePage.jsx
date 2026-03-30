import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Footer } from './Footer'

const TAGS = ['전체', '학급관리', '수학', '국어', '게임', '퍼즐', '에듀테크', '기타']

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

  const filtered = apps.filter((app) => {
    const matchSearch =
      app.title?.toLowerCase().includes(search.toLowerCase()) ||
      app.one_line_desc?.toLowerCase().includes(search.toLowerCase())
    const matchTag = activeTag === '전체' || app.category === activeTag
    return matchSearch && matchTag
  })

  return (
    <>
      <div className="home-hub">
        {/* 히어로 배너 - 컴팩트 */}
        <div className="hub-hero">
          <div className="hub-hero__content">
            <h1 className="hub-hero__title">
              <span className="hub-hero__logo">∞</span>
              <span><span style={{ color: 'var(--accent)' }}>mumu</span>class</span>
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
          {/* 좌측 사이드바 */}
          <aside className="hub-sidebar">
            <div className="hub-sidebar__section">
              <h3>카테고리</h3>
              <div className="hub-sidebar__tags">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    className={`hub-sidebar__tag ${activeTag === tag ? 'hub-sidebar__tag--active' : ''}`}
                    onClick={() => setActiveTag(tag)}
                  >
                    {tag === '전체' && '🌐 '}
                    {tag === '학급관리' && '📋 '}
                    {tag === '수학' && '🔢 '}
                    {tag === '국어' && '📖 '}
                    {tag === '게임' && '🎮 '}
                    {tag === '퍼즐' && '🧩 '}
                    {tag === '에듀테크' && '💡 '}
                    {tag === '기타' && '📦 '}
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="hub-sidebar__section">
              <h3>바로가기</h3>
              <div className="hub-sidebar__links">
                {user ? (
                  <>
                    <Link to="/apps/create" className="hub-sidebar__link hub-sidebar__link--create">
                      ➕ 앱 공유하기
                    </Link>
                    <Link to="/community" className="hub-sidebar__link">💬 교사 커뮤니티</Link>
                    <Link to="/shop" className="hub-sidebar__link">🛒 교육상품 마켓</Link>
                  </>
                ) : (
                  <Link to="/login" className="hub-sidebar__link hub-sidebar__link--create">
                    🔐 로그인 하기
                  </Link>
                )}
              </div>
            </div>

            <div className="hub-sidebar__section">
              <h3>📊 현황</h3>
              <div className="hub-sidebar__stats">
                <div className="hub-stat">
                  <span className="hub-stat__num">{apps.length}</span>
                  <span className="hub-stat__label">등록 앱</span>
                </div>
              </div>
            </div>
          </aside>

          {/* 중앙 앱 리스트 */}
          <main className="hub-feed">
            <div className="hub-feed__header">
              <h2>
                {activeTag === '전체' ? '🔥 최신 앱' : `📂 ${activeTag}`}
              </h2>
              <span className="hub-feed__count">{filtered.length}개</span>
            </div>

            {loading ? (
              <div className="board__empty">
                <div className="board__empty-icon">⏳</div>
                <p>앱을 불러오는 중...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="board__empty">
                <div className="board__empty-icon">📦</div>
                <p>{search || activeTag !== '전체' ? '검색 결과가 없습니다' : '아직 등록된 앱이 없습니다'}</p>
                {user && !search && activeTag === '전체' && (
                  <Link to="/apps/create" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    🚀 첫 번째 앱 등록하기
                  </Link>
                )}
              </div>
            ) : (
              <div className="hub-grid">
                {filtered.map((app) => (
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
