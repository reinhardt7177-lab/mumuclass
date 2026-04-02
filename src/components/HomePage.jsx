/**
 * Supabase apps 테이블에 컬럼 추가 필요 (최초 1회):
 * alter table public.apps add column if not exists view_count integer default 0;
 * alter table public.apps add column if not exists approved  boolean default false;
 *
 * RLS 정책 (비로그인 업로드 허용):
 * create policy "apps anon insert" on public.apps for insert with check (true);
 */
import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Footer } from './Footer'
import DEMO_APPS from '../data/demoApps'

const TAGS = ['BEST 바이브앱', '학급관리', '수학', '국어', '게임', '퍼즐', '에듀테크', '기타']
const UPLOAD_CATEGORIES = ['학급관리', '수학', '국어', '게임', '퍼즐', '에듀테크', '기타']

const EMPTY_FORM = { title: '', one_line_desc: '', preview_url: '', category: '기타', creator_name: '' }

const toThumbUrl = (url) =>
  url ? `https://image.thum.io/get/width/640/${url}` : ''

/* ── 업로드 모달 ── */
function UploadModal({ user, onClose, onUploaded }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setMessage({ type: 'error', text: '앱 이름을 입력해 주세요.' }); return }
    if (!form.preview_url.trim()) { setMessage({ type: 'error', text: '앱 실행 URL을 입력해 주세요.' }); return }
    setSubmitting(true)
    setMessage(null)

    const url = form.preview_url.trim()
    const { data: inserted, error } = await supabase.from('apps').insert([{
      title: form.title.trim(),
      one_line_desc: form.description?.trim() || form.title.trim(),
      preview_url: url,
      screenshot_url: null,
      category: form.category,
      creator_name: form.creator_name.trim() ||
        user?.user_metadata?.display_name ||
        user?.email?.split('@')[0] || '익명',
      creator_email: user?.email || '',
      code_access_level: '전체',
      ai_customizing_possible: false,
      rating: 0,
      approved: false,
    }]).select('id').single()

    setSubmitting(false)

    if (error) { setMessage({ type: 'error', text: `업로드 실패: ${error.message}` }); return }

    setMessage({ type: 'success', text: '신청 완료! 관리자 승인 후 게시됩니다. 썸네일 생성 중...' })
    let remaining = 20
    setCountdown(remaining)
    const timer = setInterval(() => {
      remaining -= 1
      setCountdown(remaining)
      if (remaining <= 0) {
        clearInterval(timer)
        supabase.from('apps').update({ screenshot_url: toThumbUrl(url) }).eq('id', inserted.id)
          .then(() => { onUploaded(); onClose() })
      }
    }, 1000)
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="upload-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="upload-modal">
        <button className="upload-modal__close" onClick={onClose}>✕</button>
        <div className="upload-modal__header">
          <span className="upload-modal__pixel" />
          <h2 className="upload-modal__title">앱 업로드</h2>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '1rem' }}>
          누구나 신청 가능 · 관리자 승인 후 게시됩니다
        </p>

        {message && <div className={`upload-alert upload-alert--${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="upload-field">
            <label className="upload-label">앱 이름 <span>*</span></label>
            <input className="upload-input" type="text" name="title" value={form.title} onChange={handleChange} placeholder="예: 출석체크 앱" required />
          </div>
          <div className="upload-field">
            <label className="upload-label">한 줄 설명</label>
            <input className="upload-input" type="text" name="description" value={form.description} onChange={handleChange} placeholder="어떤 앱인지 간단히 설명해 주세요" />
          </div>
          <div className="upload-field">
            <label className="upload-label">앱 실행 URL <span>*</span></label>
            <input className="upload-input" type="url" name="preview_url" value={form.preview_url} onChange={handleChange} placeholder="https://..." required />
            <span className="upload-hint">입력 시 첫 화면이 썸네일로 자동 설정됩니다</span>
            {form.preview_url && (
              <div className="upload-thumb-preview">
                <img src={toThumbUrl(form.preview_url)} alt="미리보기" onError={(e) => { e.target.style.display = 'none' }} />
                <span>썸네일 자동 생성 중...</span>
              </div>
            )}
          </div>
          <div className="upload-field">
            <label className="upload-label">카테고리 <span>*</span></label>
            <select className="upload-select" name="category" value={form.category} onChange={handleChange}>
              {UPLOAD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="upload-field">
            <label className="upload-label">제작자 이름</label>
            <input className="upload-input" type="text" name="creator_name" value={form.creator_name} onChange={handleChange}
              placeholder={user?.user_metadata?.display_name || user?.email?.split('@')[0] || '익명'} />
          </div>
          <button type="submit" className="upload-submit" disabled={submitting || countdown !== null}>
            {submitting ? '업로드 중...' : countdown !== null ? `🖼️ 썸네일 생성 중... ${countdown}초` : '🚀 앱 올리기'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── 홈페이지 카드 ── */
function AppCard({ app }) {
  const colors = { '학급관리': '#e17055', '수학': '#6c5ce7', '국어': '#00b894', '게임': '#e84393', '퍼즐': '#f39c12', '에듀테크': '#00cec9', '기타': '#636e72' }
  const color = colors[app.category] || '#636e72'
  // screenshot_url이 http로 시작하면 사용, 아니면 preview_url로 썸네일 생성
  const thumbUrl = app.screenshot_url?.startsWith('http')
    ? app.screenshot_url
    : (app.preview_url ? toThumbUrl(app.preview_url) : '')
  const [imgOk, setImgOk] = useState(!!thumbUrl)

  return (
    <Link to={`/apps/${app.id}`} className="retro-card">
      <div className="retro-card__img" style={{ borderColor: color, position: 'relative', overflow: 'hidden' }}>
        {thumbUrl && imgOk ? (
          <img
            src={thumbUrl}
            alt={app.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setImgOk(false)}
          />
        ) : (
          <>
            <span className="retro-card__img-cat" style={{ color }}>{app.category || '기타'}</span>
            <span className="retro-card__img-title">{app.title}</span>
          </>
        )}
        {app.rating > 0 && (
          <span className="retro-card__img-rating" style={{ position: 'absolute', bottom: 6, right: 6, zIndex: 2, background: 'rgba(0,0,0,0.55)', padding: '1px 5px', borderRadius: 3 }}>★ {(app.rating).toFixed(1)}</span>
        )}
        {app.is_best && (
          <span style={{ position: 'absolute', top: 6, left: 6, background: '#f39c12', color: '#000', fontSize: '0.65rem', fontWeight: 900, padding: '2px 6px', borderRadius: 3, zIndex: 2 }}>BEST</span>
        )}
      </div>
      <div className="retro-card__name">{app.title}</div>
    </Link>
  )
}

/* ── 메인 홈 ── */
export default function HomePage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('BEST 바이브앱')
  const [showUpload, setShowUpload] = useState(false)
  const { user } = useAuth()

  const fetchApps = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('apps')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
    const realApps = data || []
    setApps([...DEMO_APPS, ...realApps])
    setLoading(false)
  }, [])

  useEffect(() => { fetchApps() }, [fetchApps])

  const displayApps = (() => {
    if (activeTag === 'BEST 바이브앱') {
      return [...apps]
        .filter((a) => a.is_best)
        .sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0)
          if (ratingDiff !== 0) return ratingDiff
          return (b.view_count || 0) - (a.view_count || 0)
        })
    }
    return apps.filter((app) => app.category === activeTag)
  })()

  return (
    <>
      <div className="retro-page">
        <nav className="retro-nav">
          <div className="retro-nav__tabs">
            {TAGS.map((tag) => (
              <button
                key={tag}
                className={`retro-nav__item ${activeTag === tag ? 'retro-nav__item--active' : ''}`}
                onClick={() => setActiveTag(tag)}
              >{tag}</button>
            ))}
          </div>
          <button className="retro-nav__upload" onClick={() => setShowUpload(true)}>
            ＋ 앱 올리기
          </button>
        </nav>

        <div className="retro-content">
          {loading ? (
            <div className="retro-loading"><span>⏳</span><p>앱을 불러오는 중...</p></div>
          ) : displayApps.length === 0 ? (
            <div className="retro-loading"><span>📦</span><p>앱이 없습니다</p></div>
          ) : (
            <div className="retro-grid">
              {displayApps.map((app) => <AppCard key={app.id} app={app} />)}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {showUpload && (
        <UploadModal user={user} onClose={() => setShowUpload(false)} onUploaded={fetchApps} />
      )}
    </>
  )
}
