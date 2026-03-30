import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function AppDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApp()
  }, [id])

  const fetchApp = async () => {
    setLoading(true)
    const { data } = await supabase.from('apps').select('*').eq('id', id).single()
    if (data) setApp(data)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 앱을 삭제하시겠습니까?')) return

    const { error } = await supabase.from('apps').delete().eq('id', id)
    
    if (error) {
      alert(`삭제 실패: ${error.message}`)
      console.error('Delete error:', error)
      return
    }
    
    navigate('/apps')
  }

  if (loading) {
    return (
      <div className="board__empty" style={{ paddingTop: '8rem' }}>
        <div className="board__empty-icon">⏳</div>
        <p>불러오는 중...</p>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="board__empty" style={{ paddingTop: '8rem' }}>
        <div className="board__empty-icon">😥</div>
        <p>앱을 찾을 수 없습니다</p>
        <Link to="/apps" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="app-detail">
      <Link to="/apps" className="app-detail__back">← 앱 목록으로</Link>

      <div className="app-detail__layout">
        {/* 좌측: 스크린샷 */}
        <div className="app-detail__screenshot">
          {app.screenshot_url ? (
            <img src={app.screenshot_url} alt={app.title} />
          ) : (
            <div className="app-detail__no-image">
              <span>📱</span>
              <p>스크린샷 없음</p>
            </div>
          )}
        </div>

        {/* 우측: 정보 */}
        <div className="app-detail__info">
          <div className="app-detail__header">
            <span className={`card-grid__badge card-grid__badge--static ${app.code_access_level === '전체' ? 'card-grid__badge--new' : 'card-grid__badge--best'}`}>
              {app.code_access_level === '전체' ? 'Live' : 'Beta'}
            </span>
            <h1 className="app-detail__title">{app.title}</h1>
          </div>

          <p className="app-detail__desc">
            {app.one_line_desc || '설명이 아직 없습니다.'}
          </p>

          <div className="app-detail__tags">
            {app.category && <span className="app-card__tag">{app.category}</span>}
            {app.ai_customizing_possible && <span className="app-card__tag app-card__tag--ai">🤖 AI 커스텀 가능</span>}
          </div>

          <div className="app-detail__stats-row">
            <div className="app-detail__stat">
              <span className="app-detail__stat-label">별점</span>
              <span className="app-detail__stat-value">⭐ {app.rating || 0}</span>
            </div>
            <div className="app-detail__stat">
              <span className="app-detail__stat-label">접근 권한</span>
              <span className="app-detail__stat-value">{app.code_access_level || '전체'}</span>
            </div>
            <div className="app-detail__stat">
              <span className="app-detail__stat-label">AI 커스텀</span>
              <span className="app-detail__stat-value">{app.ai_customizing_possible ? '✅ 가능' : '❌ 불가'}</span>
            </div>
          </div>

          <div className="app-detail__author-box">
            <div className="app-card__avatar">
              {app.creator_name?.charAt(0) || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.creator_name || '익명 선생님'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>제작자</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            {app.preview_url ? (
              <a href={app.preview_url} target="_blank" rel="noopener noreferrer" className="app-detail__play-btn">
                🚀 앱 실행하기
              </a>
            ) : (
              <div style={{ flex: 1 }}></div> /* 간격 맞추기용 */
            )}
            
            {user?.email === app.creator_email && (
              <button 
                onClick={handleDelete}
                style={{ 
                  padding: '0.85rem 1.5rem', 
                  borderRadius: '10px', 
                  background: 'rgba(225, 112, 85, 0.1)', 
                  color: 'var(--red)', 
                  fontWeight: '600', 
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🗑️ 삭제
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
