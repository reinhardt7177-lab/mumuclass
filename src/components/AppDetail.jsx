import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Footer } from './Footer'
import DEMO_APPS from '../data/demoApps'

const CATEGORIES = ['학급관리', '수학', '국어', '게임', '퍼즐', '에듀테크', '기타']

/* ── 앱 수정 모달 ── */
function EditModal({ app, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: app.title || '',
    one_line_desc: app.one_line_desc || '',
    preview_url: app.preview_url || '',
    category: app.category || '기타',
    creator_name: app.creator_name || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setMessage({ type: 'error', text: '앱 이름을 입력해 주세요.' }); return }
    setSaving(true)
    const newUrl = form.preview_url.trim()
    const { error } = await supabase.from('apps').update({
      title: form.title.trim(),
      one_line_desc: form.one_line_desc.trim(),
      preview_url: newUrl,
      screenshot_url: newUrl ? `https://image.thum.io/get/width/640/${newUrl}` : app.screenshot_url,
      category: form.category,
      creator_name: form.creator_name.trim(),
    }).eq('id', app.id)
    setSaving(false)
    if (error) { setMessage({ type: 'error', text: `수정 실패: ${error.message}` }); return }
    setMessage({ type: 'success', text: '수정됐어요! ✅' })
    setTimeout(() => { onSaved(); onClose() }, 900)
  }

  return (
    <div className="upload-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="upload-modal">
        <button className="upload-modal__close" onClick={onClose}>✕</button>
        <div className="upload-modal__header">
          <span className="upload-modal__pixel" />
          <h2 className="upload-modal__title">앱 수정</h2>
        </div>
        {message && <div className={`upload-alert upload-alert--${message.type}`}>{message.text}</div>}
        <form onSubmit={handleSave}>
          <div className="upload-field">
            <label className="upload-label">앱 이름 <span>*</span></label>
            <input className="upload-input" type="text" name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="upload-field">
            <label className="upload-label">한 줄 설명</label>
            <input className="upload-input" type="text" name="one_line_desc" value={form.one_line_desc} onChange={handleChange} placeholder="어떤 앱인지 간단히 설명해 주세요" />
          </div>
          <div className="upload-field">
            <label className="upload-label">앱 실행 URL</label>
            <input className="upload-input" type="url" name="preview_url" value={form.preview_url} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="upload-field">
            <label className="upload-label">카테고리</label>
            <select className="upload-select" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="upload-field">
            <label className="upload-label">제작자 이름</label>
            <input className="upload-input" type="text" name="creator_name" value={form.creator_name} onChange={handleChange} />
          </div>
          <button type="submit" className="upload-submit" disabled={saving}>{saving ? '저장 중...' : '✏️ 수정 저장'}</button>
        </form>
      </div>
    </div>
  )
}

function Stars({ rating, size = '0.85rem' }) {
  const r = Math.round(rating || 0)
  return (
    <span style={{ display: 'inline-flex', gap: '1px', fontSize: size }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= r ? '#F39C12' : '#555' }}>★</span>
      ))}
    </span>
  )
}

export default function AppDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  // Review state
  const [reviews, setReviews] = useState([])
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isDemo = id?.startsWith('demo-')

  useEffect(() => {
    if (isDemo) {
      const demoApp = DEMO_APPS.find(a => a.id === id)
      setApp(demoApp || null)
      setLoading(false)
    } else {
      fetchApp()
      fetchReviews()
    }
  }, [id])

  const fetchApp = async () => {
    setLoading(true)
    const { data } = await supabase.from('apps').select('*').eq('id', id).single()
    if (data) setApp(data)
    setLoading(false)
  }

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('app_reviews')
      .select('*')
      .eq('app_id', id)
      .order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  const updateAppRating = async () => {
    const { data } = await supabase
      .from('app_reviews')
      .select('rating')
      .eq('app_id', id)
    if (data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
      await supabase.from('apps').update({ rating: Math.round(avg * 10) / 10 }).eq('id', id)
      setApp(prev => prev ? { ...prev, rating: Math.round(avg * 10) / 10 } : prev)
    }
  }

  const handleSubmitReview = async () => {
    if (!user || reviewRating === 0) return
    setSubmitting(true)
    const userName = user.user_metadata?.display_name || user.email?.split('@')[0] || '익명'
    const { error } = await supabase.from('app_reviews').insert({
      app_id: id,
      user_email: user.email,
      user_name: userName,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    })
    if (error) { alert('리뷰 저장 실패: ' + error.message); setSubmitting(false); return }
    await updateAppRating()
    await fetchReviews()
    setReviewRating(0)
    setReviewComment('')
    setSubmitting(false)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return
    await supabase.from('app_reviews').delete().eq('id', reviewId)
    await updateAppRating()
    await fetchReviews()
  }

  const handleDeleteApp = async () => {
    if (!confirm('정말 이 앱을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('apps').delete().eq('id', id)
    if (!error) navigate('/')
    else alert(`삭제 실패: ${error.message}`)
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
  }

  const getStarDistribution = () => {
    const dist = [0, 0, 0, 0, 0]
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++ })
    return dist
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0

  if (loading) {
    return (
      <div className="retro-detail-loading">
        <span>⏳</span>
        <p>불러오는 중...</p>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="retro-detail-loading">
        <span>😥</span>
        <p>앱을 찾을 수 없습니다</p>
        <Link to="/" style={{ color: 'var(--accent)', marginTop: '0.5rem', display: 'inline-block' }}>
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const dist = getStarDistribution()

  return (
    <>
      <div className="retro-detail">
        {/* 뒤로가기 */}
        <Link to="/" className="retro-detail__back">← 앱 목록</Link>

        {/* 상단: 스크린샷 + 정보 2단 레이아웃 */}
        <div className="retro-detail__top">
          {/* 좌측: 큰 스크린샷 */}
          <div className="retro-detail__screenshot">
            {app.screenshot_url ? (
              <img src={app.screenshot_url} alt={app.title} />
            ) : (
              <div className="retro-detail__no-img">📱</div>
            )}
          </div>

          {/* 우측: 앱 정보 */}
          <div className="retro-detail__info">
            <h1 className="retro-detail__title">{app.title}</h1>
            <div className="retro-detail__rating-row">
              <Stars rating={app.rating} size="1.1rem" />
              <span className="retro-detail__rating-num">{(app.rating || 0).toFixed(1)}</span>
              <span className="retro-detail__review-count">({isDemo ? '데모' : `${reviews.length}개 리뷰`})</span>
            </div>
            <p className="retro-detail__desc">{app.one_line_desc}</p>

            <div className="retro-detail__meta">
              <div className="retro-detail__meta-item">
                <span className="retro-detail__meta-label">카테고리</span>
                <span className="retro-detail__meta-value">{app.category || '기타'}</span>
              </div>
              <div className="retro-detail__meta-item">
                <span className="retro-detail__meta-label">제작자</span>
                <span className="retro-detail__meta-value">{app.creator_name || '익명'}</span>
              </div>
              <div className="retro-detail__meta-item">
                <span className="retro-detail__meta-label">AI 커스텀</span>
                <span className="retro-detail__meta-value">{app.ai_customizing_possible ? '✅ 가능' : '❌ 불가'}</span>
              </div>
            </div>

            <div className="retro-detail__actions">
              {app.preview_url && (
                <a href={app.preview_url} target="_blank" rel="noopener noreferrer" className="retro-detail__play-btn">
                  ▶ 앱 실행하기
                </a>
              )}
              {!isDemo && user?.email === app.creator_email && (
                <>
                  <button onClick={() => setShowEdit(true)} className="retro-detail__play-btn" style={{ background: '#2d3748', boxShadow: 'none' }}>
                    ✏️ 수정
                  </button>
                  <button onClick={handleDeleteApp} className="retro-detail__delete-btn">
                    🗑️ 삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* iframe 실행 영역 */}
        {app.preview_url && (
          <div className="retro-detail__iframe-section">
            <h2 className="retro-detail__section-title">📺 앱 실행</h2>
            <div className="retro-detail__iframe-wrap">
              {!iframeLoaded && (
                <div className="retro-detail__iframe-loading">
                  <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.15)', borderTopColor: '#00D2A4' }}></div>
                  <span>로딩 중...</span>
                </div>
              )}
              <iframe
                src={app.preview_url}
                title={app.title}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                allow="camera;microphone"
                loading="lazy"
                onLoad={() => setIframeLoaded(true)}
                style={{ opacity: iframeLoaded ? 1 : 0 }}
              />
            </div>
          </div>
        )}

        {/* 상세 설명 */}
        {(app.description || isDemo) && (
          <div className="retro-detail__section">
            <h2 className="retro-detail__section-title">📋 상세 설명</h2>
            <div className="retro-detail__description">
              {(app.description || app.one_line_desc || '').split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* 리뷰 섹션 (실제 앱만) */}
        {!isDemo && (
          <div className="retro-detail__section">
            <h2 className="retro-detail__section-title">⭐ 리뷰 <span style={{ fontSize: '0.85rem', color: '#888' }}>({reviews.length})</span></h2>

            {reviews.length > 0 && (
              <div className="review-summary">
                <div className="review-summary__big-score">
                  <div className="review-summary__number">{avgRating.toFixed(1)}</div>
                  <div className="review-summary__stars">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} style={{ color: i <= Math.round(avgRating) ? '#F39C12' : '#555' }}>★</span>
                    ))}
                  </div>
                  <div className="review-summary__count">{reviews.length}개의 리뷰</div>
                </div>
                <div className="review-summary__bars">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="review-summary__bar-row">
                      <span>{star}</span>
                      <div className="review-summary__bar-track">
                        <div className="review-summary__bar-fill" style={{ width: `${reviews.length > 0 ? (dist[star - 1] / reviews.length) * 100 : 0}%` }} />
                      </div>
                      <span>{dist[star - 1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user ? (
              <div className="review-form">
                <div className="review-form__heading">✍️ 리뷰 남기기</div>
                <div className="review-form__stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`review-form__star ${star <= (reviewHover || reviewRating) ? 'review-form__star--active' : 'review-form__star--inactive'}`}
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      type="button"
                    >★</button>
                  ))}
                  {reviewRating > 0 && <span style={{ fontSize: '0.85rem', color: '#aaa', marginLeft: '0.5rem' }}>{reviewRating}점</span>}
                </div>
                <textarea className="review-form__input" placeholder="이 앱에 대한 소감..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                <button className="review-form__submit" onClick={handleSubmitReview} disabled={reviewRating === 0 || submitting}>
                  {submitting ? '등록 중...' : '💬 리뷰 등록'}
                </button>
              </div>
            ) : (
              <div className="review-login-prompt">리뷰를 남기려면 <Link to="/login">로그인</Link>해 주세요.</div>
            )}

            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-item__header">
                  <div className="review-item__avatar">{review.user_name?.charAt(0) || '?'}</div>
                  <span className="review-item__name">{review.user_name}</span>
                  <Stars rating={review.rating} size="0.75rem" />
                  <span className="review-item__date">{formatDate(review.created_at)}</span>
                  {user?.email === review.user_email && (
                    <button className="review-item__delete" onClick={() => handleDeleteReview(review.id)}>삭제</button>
                  )}
                </div>
                {review.comment && <p className="review-item__comment">{review.comment}</p>}
              </div>
            ))}

            {reviews.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: '0.9rem' }}>
                아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요! 🌟
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
      {showEdit && (
        <EditModal
          app={app}
          onClose={() => setShowEdit(false)}
          onSaved={fetchApp}
        />
      )}
    </>
  )
}
