import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Footer } from './Footer'

const FALLBACK_CATEGORIES = ['학급관리', '수학', '국어', '게임', '퍼즐', '에듀테크', '기타']
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'mumuclass@mumuclass.kr'

/* ── 별점 ── */
function Stars({ rating, size = '0.9rem' }) {
  const r = Math.round(rating || 0)
  return (
    <span style={{ display: 'inline-flex', gap: '1px', fontSize: size }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= r ? '#F39C12' : '#555' }}>★</span>
      ))}
    </span>
  )
}

/* ── 앱 수정 모달 ── */
/* ── 이미지 피커 (수정 모달용) ── */
function ImgPicker({ label, currentUrl, file, preview, onChange, hint }) {
  const displaySrc = preview || currentUrl
  return (
    <div className="upload-field">
      <label className="upload-label">{label}</label>
      {hint && <span className="upload-hint" style={{ display: 'block', marginBottom: '0.4rem' }}>{hint}</span>}
      <label className="upload-img-picker" style={{ borderColor: displaySrc ? '#f39c12' : undefined }}>
        {displaySrc ? (
          <img src={displaySrc} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3 }} />
        ) : (
          <div className="upload-img-picker__placeholder">
            <span style={{ fontSize: '1.8rem' }}>🖼️</span>
            <span style={{ fontSize: '0.72rem', color: '#666', marginTop: '0.3rem' }}>클릭해서 변경</span>
          </div>
        )}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
      </label>
    </div>
  )
}

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
  const [mainImg, setMainImg] = useState(null)
  const [mainPreview, setMainPreview] = useState(null)
  const [sub1Img, setSub1Img] = useState(null)
  const [sub1Preview, setSub1Preview] = useState(null)
  const [sub2Img, setSub2Img] = useState(null)
  const [sub2Preview, setSub2Preview] = useState(null)
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [tagInput, setTagInput] = useState('')
  const [appTags, setAppTags] = useState(app.tags || [])

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from('app_categories').select('label').order('sort_order', { ascending: true })
      if (data && data.length > 0) setCategories(data.map(c => c.label))
    }
    fetchCats()
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImgChange = (setter, previewSetter) => (e) => {
    const file = e.target.files[0]
    if (!file) return
    setter(file)
    previewSetter(URL.createObjectURL(file))
  }

  const uploadImg = async (file, folder) => {
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('app-images').upload(path, file, { upsert: true })
    if (error) throw new Error(`이미지 업로드 실패: ${error.message}`)
    return supabase.storage.from('app-images').getPublicUrl(path).data.publicUrl
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setMessage({ type: 'error', text: '앱 이름을 입력해 주세요.' }); return }
    setSaving(true)
    setMessage({ type: 'success', text: '저장 중...' })

    try {
      const updates = {
        title: form.title.trim(),
        one_line_desc: form.one_line_desc.trim(),
        preview_url: form.preview_url.trim(),
        category: form.category,
        creator_name: form.creator_name.trim(),
        tags: appTags,
      }
      if (mainImg) updates.screenshot_url = await uploadImg(mainImg, 'main')
      if (sub1Img) updates.sub_image_1 = await uploadImg(sub1Img, 'sub')
      if (sub2Img) updates.sub_image_2 = await uploadImg(sub2Img, 'sub')

      const { error } = await supabase.from('apps').update(updates).eq('id', app.id)
      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: '수정됐어요! ✅' })
      setTimeout(() => { onSaved(); onClose() }, 900)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
      setSaving(false)
    }
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
            <input className="upload-input" type="text" name="one_line_desc" value={form.one_line_desc} onChange={handleChange} />
          </div>
          <div className="upload-field">
            <label className="upload-label">앱 실행 URL</label>
            <input className="upload-input" type="url" name="preview_url" value={form.preview_url} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="upload-field">
            <label className="upload-label">카테고리</label>
            <select className="upload-select" name="category" value={form.category} onChange={handleChange}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="upload-field">
            <label className="upload-label">태그</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              {appTags.map((t, i) => (
                <span key={i} style={{ background: 'rgba(108,92,231,0.15)', color: '#a29bfe', padding: '2px 8px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  #{t}
                  <button type="button" onClick={() => setAppTags(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '0.75rem', padding: 0 }}>✕</button>
                </span>
              ))}
            </div>
            <input className="upload-input" type="text" value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                  e.preventDefault()
                  if (!appTags.includes(tagInput.trim())) setAppTags(prev => [...prev, tagInput.trim()])
                  setTagInput('')
                }
              }}
              placeholder="태그 입력 후 Enter (예: 체육, 1학년)" />
          </div>
          <div className="upload-field">
            <label className="upload-label">제작자 이름</label>
            <input className="upload-input" type="text" name="creator_name" value={form.creator_name} onChange={handleChange} />
          </div>

          {/* ── 썸네일 변경 ── */}
          <div style={{ borderTop: '1px solid #333', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div className="upload-label" style={{ marginBottom: '0.75rem' }}>📸 썸네일 변경 (선택)</div>
            <ImgPicker
              label="메인 썸네일"
              currentUrl={app.screenshot_url}
              preview={mainPreview}
              hint="앱 목록에 표시되는 대표 이미지"
              onChange={handleImgChange(setMainImg, setMainPreview)}
            />
            <div className="upload-label" style={{ marginBottom: '0.5rem', marginTop: '0.25rem' }}>서브 이미지</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <ImgPicker
                label="서브 1"
                currentUrl={app.sub_image_1}
                preview={sub1Preview}
                onChange={handleImgChange(setSub1Img, setSub1Preview)}
              />
              <ImgPicker
                label="서브 2"
                currentUrl={app.sub_image_2}
                preview={sub2Preview}
                onChange={handleImgChange(setSub2Img, setSub2Preview)}
              />
            </div>
          </div>

          <button type="submit" className="upload-submit" disabled={saving}>{saving ? '저장 중...' : '✏️ 수정 저장'}</button>
        </form>
      </div>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function AppDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const wrapRef = useRef(null)

  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const [reviews, setReviews] = useState([])
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isOwner = user && app && (user.email === app.creator_email || user.email === ADMIN_EMAIL)

  useEffect(() => {
    fetchApp()
    fetchReviews()
  }, [id])

  /* 전체화면 이벤트 감지 */
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const fetchApp = async () => {
    setLoading(true)
    const { data } = await supabase.from('apps').select('*').eq('id', id).single()
    if (data) {
      const newCount = (data.view_count || 0) + 1
      setApp({ ...data, view_count: newCount })
      await supabase.from('apps').update({ view_count: newCount }).eq('id', id)
    }
    setLoading(false)
  }

  const fetchReviews = async () => {
    const { data } = await supabase.from('app_reviews').select('*').eq('app_id', id).order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  const updateAppRating = async () => {
    const { data } = await supabase.from('app_reviews').select('rating').eq('app_id', id)
    if (data && data.length > 0) {
      const avg = data.reduce((s, r) => s + r.rating, 0) / data.length
      const rounded = Math.round(avg * 10) / 10
      await supabase.from('apps').update({ rating: rounded }).eq('id', id)
      setApp(prev => prev ? { ...prev, rating: rounded } : prev)
    }
  }

  const handleSubmitReview = async () => {
    if (!user || reviewRating === 0) return
    setSubmitting(true)
    const userName = user.user_metadata?.display_name || user.email?.split('@')[0] || '익명'
    const { error } = await supabase.from('app_reviews').insert({
      app_id: id, user_email: user.email, user_name: userName, rating: reviewRating, comment: reviewComment.trim() || null,
    })
    if (error) { alert('리뷰 저장 실패: ' + error.message); setSubmitting(false); return }
    await updateAppRating()
    await fetchReviews()
    setReviewRating(0); setReviewComment(''); setSubmitting(false)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return
    await supabase.from('app_reviews').delete().eq('id', reviewId)
    await updateAppRating(); await fetchReviews()
  }

  const handleDeleteApp = async () => {
    if (!confirm('정말 이 앱을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('apps').delete().eq('id', id)
    if (!error) navigate('/')
    else alert(`삭제 실패: ${error.message}`)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const formatDate = (d) => { const t = new Date(d); return `${t.getFullYear()}.${t.getMonth()+1}.${t.getDate()}` }

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  if (loading) return <div className="retro-detail-loading"><span>⏳</span><p>불러오는 중...</p></div>
  if (!app) return (
    <div className="retro-detail-loading">
      <span>😥</span><p>앱을 찾을 수 없습니다</p>
      <Link to="/" style={{ color: 'var(--accent)', marginTop: '0.5rem', display: 'inline-block' }}>목록으로 돌아가기</Link>
    </div>
  )

  return (
    <>
      <div className="retro-detail">
        <Link to="/" className="retro-detail__back">← 앱 목록</Link>

        {/* ── 헤더: 제목 + 통계 ── */}
        <div className="retro-detail__header">
          <div className="retro-detail__header-left">
            <h1 className="retro-detail__title">{app.title}</h1>
            <p className="retro-detail__desc">{app.one_line_desc}</p>
            <div className="retro-detail__stats">
              <span className="retro-detail__stat">
                <Stars rating={app.rating} /> <b>{(app.rating || 0).toFixed(1)}</b>
                <span style={{ color: '#888', fontSize: '0.8rem' }}> ({reviews.length}개 리뷰)</span>
              </span>
              <span className="retro-detail__stat">👁️ <b>{(app.view_count || 0).toLocaleString()}</b> 조회</span>
              {app.category && <span className="retro-detail__stat retro-detail__stat--cat">{app.category}</span>}
              {app.creator_name && <span className="retro-detail__stat">by {app.creator_name}</span>}
            </div>
            {app.tags && app.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {app.tags.map((t, i) => (
                  <span key={i} style={{ background: 'rgba(108,92,231,0.1)', color: '#6c5ce7', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600 }}>#{t}</span>
                ))}
              </div>
            )}
          </div>
          {isOwner && (
            <div className="retro-detail__header-actions">
              <button onClick={() => setShowEdit(true)} className="retro-detail__btn retro-detail__btn--edit">✏️ 수정</button>
              <button onClick={handleDeleteApp} className="retro-detail__btn retro-detail__btn--del">🗑️ 삭제</button>
            </div>
          )}
        </div>

        {/* ── iframe 실행 ── */}
        {app.preview_url ? (
          <div className="retro-detail__iframe-section">
            <div className="retro-detail__iframe-bar">
              <span style={{ fontSize: '0.82rem', color: '#888' }}>▶ 직접 실행</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="retro-detail__iframe-btn" onClick={toggleFullscreen}>
                  {isFullscreen ? '⊠ 전체화면 닫기' : '⛶ 전체화면'}
                </button>
                <a className="retro-detail__iframe-btn" href={app.preview_url} target="_blank" rel="noopener noreferrer">↗ 새 탭</a>
              </div>
            </div>
            <div ref={wrapRef} className="retro-detail__iframe-wrap">
              {!iframeLoaded && (
                <div className="retro-detail__iframe-loading">
                  <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.15)', borderTopColor: '#00D2A4' }} />
                  <span>로딩 중...</span>
                </div>
              )}
              <iframe
                src={app.preview_url}
                title={app.title}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                allow="camera;microphone;fullscreen"
                allowFullScreen
                loading="lazy"
                onLoad={() => setIframeLoaded(true)}
                style={{ opacity: iframeLoaded ? 1 : 0 }}
              />
            </div>
          </div>
        ) : (
          <div className="retro-detail__no-url">실행 URL이 등록되지 않은 앱입니다.</div>
        )}

        {/* ── 서브 썸네일 ── */}
        {(app.sub_image_1 || app.sub_image_2) && (
          <div className="retro-detail__section">
            <h2 className="retro-detail__section-title">🖼️ 스크린샷</h2>
            <div style={{ display: 'grid', gridTemplateColumns: app.sub_image_1 && app.sub_image_2 ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
              {app.sub_image_1 && (
                <img src={app.sub_image_1} alt="스크린샷 1"
                  style={{ width: '100%', borderRadius: 6, border: '1px solid #333', objectFit: 'cover', maxHeight: 280 }} />
              )}
              {app.sub_image_2 && (
                <img src={app.sub_image_2} alt="스크린샷 2"
                  style={{ width: '100%', borderRadius: 6, border: '1px solid #333', objectFit: 'cover', maxHeight: 280 }} />
              )}
            </div>
          </div>
        )}

        {/* ── 설명 ── */}
        <div className="retro-detail__section">
          <h2 className="retro-detail__section-title">📋 설명</h2>
          <div className="retro-detail__description">
            {(app.description || app.one_line_desc || '설명이 없습니다.').split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        {/* ── 리뷰 ── */}
        <div className="retro-detail__section">
            <h2 className="retro-detail__section-title">
              ⭐ 리뷰 <span style={{ fontSize: '0.85rem', color: '#888' }}>({reviews.length})</span>
              {reviews.length > 0 && (
                <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', color: '#F39C12' }}>
                  평균 {avgRating.toFixed(1)}점
                </span>
              )}
            </h2>

            {user ? (
              <div className="review-form">
                <div className="review-form__heading">✍️ 리뷰 남기기</div>
                <div className="review-form__stars">
                  {[1,2,3,4,5].map(star => (
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
      </div>

      <Footer />

      {showEdit && <EditModal app={app} onClose={() => setShowEdit(false)} onSaved={fetchApp} />}
    </>
  )
}
