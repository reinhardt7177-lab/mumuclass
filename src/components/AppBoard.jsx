import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AppBoard() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('전체')

  const TAGS = ['전체', '수업 진행', '학급 운영', '퀴즈/평가', '놀이/게임', 'AI/코딩', '기타']

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
    <div className="board">
      <div className="board__header">
        <div className="board__title-group">
          <h1>🚀 바이브 앱 게시판</h1>
          <p>선생님이 만든 에듀테크 앱을 발견하고 공유하세요</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="board__count">{apps.length}개 앱</span>
          <Link to="/apps/create" className="board__create-btn">+ 앱 공유하기</Link>
        </div>
      </div>

      {/* 카테고리 필터 탭 */}
      <div className="board__tags">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={`board__tag ${activeTag === tag ? 'board__tag--active' : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="board__search">
        <span className="board__search-icon">🔍</span>
        <input
          className="board__search-input"
          type="text"
          placeholder="앱 이름, 설명으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="board__empty">
          <div className="board__empty-icon">⏳</div>
          <p>앱 목록을 불러오는 중...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="board__empty">
          <div className="board__empty-icon">📦</div>
          <p>{search || activeTag !== '전체' ? '검색 결과가 없습니다' : '아직 등록된 앱이 없습니다'}</p>
          {!search && activeTag === '전체' && (
            <Link to="/apps/create" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              첫 번째 앱 등록하기
            </Link>
          )}
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((app) => (
            <Link to={`/apps/${app.id}`} key={app.id} className="card-grid__item">
              {/* 썸네일 영역 */}
              <div className="card-grid__thumb">
                {app.screenshot_url ? (
                  <img src={app.screenshot_url} alt={app.title} />
                ) : (
                  <div className="card-grid__placeholder">
                    <span>📱</span>
                    <small>미리보기 없음</small>
                  </div>
                )}
                {/* 뱃지 */}
                <span className={`card-grid__badge ${app.code_access_level === '전체' ? 'card-grid__badge--new' : 'card-grid__badge--best'}`}>
                  {app.code_access_level === '전체' ? 'NEW' : 'BEST'}
                </span>
              </div>

              {/* 정보 영역 */}
              <div className="card-grid__info">
                <h3 className="card-grid__name">🎮 {app.title}</h3>
                <div className="card-grid__meta">
                  <span className="card-grid__category">{app.category || '기타'}</span>
                  <span className="card-grid__rating">⭐ {app.rating || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
