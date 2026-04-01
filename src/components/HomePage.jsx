import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Footer } from './Footer'
import DEMO_APPS from '../data/demoApps'

const TAGS = ['BEST 바이브앱', '추천앱', '학급관리', '수학', '국어', '게임', '퍼즐', '에듀테크', '기타']
const UPLOAD_CATEGORIES = ['학급관리', '수학', '국어', '게임', '퍼즐', '에듀테크', '기타']

const EMPTY_FORM = {
  title: '',
  one_line_desc: '',
  preview_url: '',
  screenshot_url: '',
  category: '기타',
  creator_name: '',
}

/* ── 앱 업로드 모달 ── */
function UploadModal({ user, onClose, onUploaded }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: '앱 이름을 입력해 주세요.' })
      return
    }
    if (!form.preview_url.trim()) {
      setMessage({ type: 'error', text: '앱 실행 URL을 입력해 주세요.' })
      return
    }
    setSubmitting(true)
    setMessage(null)

    const { error } = await supabase.from('apps').insert([{
      title: form.title.trim(),
      one_line_desc: form.description?.trim() || form.title.trim(),
      preview_url: form.preview_url.trim(),
      screenshot_url: form.screenshot_url.trim() || null,
      category: form.category,
      creator_name: form.creator_name.trim() ||
        user?.user_metadata?.display_name ||
        user?.email?.split('@')[0] || '익명',
      creator_email: user?.email || '',
      code_access_level: '전체',
      ai_customizing_possible: false,
      rating: 0,
    }])

    setSubmitting(false)

    if (error) {
      setMessage({ type: 'error', text: `업로드 실패: ${error.message}` })
    } else {
      setMessage({ type: 'success', text: '앱이 업로드됐어요! 🎉' })
      setTimeout(() => {
        onUploaded()
        onClose()
      }, 1000)
    }
  }

  // Esc 키로 닫기
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="upload-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="upload-modal">
        <button className="upload-modal__close" onClick={onClose} title="닫기">✕</button>

        <div className="upload-modal__header">
          <span className="upload-modal__pixel" />
          <h2 className="upload-modal__title">앱 업로드</h2>
        </div>

        {message && (
          <div className={`upload-alert upload-alert--${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 앱 이름 */}
          <div className="upload-field">
            <label className="upload-label">앱 이름 <span>*</span></label>
            <input
              className="upload-input"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="예: 출석체크 앱"
              required
            />
          </div>

          {/* 한 줄 설명 */}
          <div className="upload-field">
            <label className="upload-label">한 줄 설명</label>
            <input
              className="upload-input"
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="어떤 앱인지 간단히 설명해 주세요"
            />
          </div>

          {/* 앱 URL */}
          <div className="upload-field">
            <label className="upload-label">앱 실행 URL <span>*</span></label>
            <input
              className="upload-input"
              type="url"
              name="preview_url"
              value={form.preview_url}
              onChange={handleChange}
              placeholder="https://... (클릭 시 실행될 주소)"
              required
            />
            <span className="upload-hint">앱 상세 페이지에서 iframe으로 직접 실행됩니다</span>
          </div>

          {/* 썸네일 */}
          <div className="upload-field">
            <label className="upload-label">썸네일 이미지 URL</label>
            <input
              className="upload-input"
              type="url"
              name="screenshot_url"
              value={form.screenshot_url}
              onChange={handleChange}
              placeholder="https://... (카드에 표시될 스크린샷)"
            />
          </div>

          {/* 카테고리 */}
          <div className="upload-field">
            <label className="upload-label">카테고리 <span>*</span></label>
            <select
              className="upload-select"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {UPLOAD_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 제작자 이름 */}
          <div className="upload-field">
            <label className="upload-label">제작자 이름</label>
            <input
              className="upload-input"
              type="text"
              name="creator_name"
              value={form.creator_name}
              onChange={handleChange}
              placeholder={user?.user_metadata?.display_name || user?.email?.split('@')[0] || '익명'}
            />
          </div>

          <button
            type="submit"
            className="upload-submit"
            disabled={submitting}
          >
            {submitting ? '업로드 중...' : '🚀 앱 올리기'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── 메인 홈 ── */
export default function HomePage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('BEST 바이브앱')
  const [showUpload, setShowUpload] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchApps = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: false })
    const realApps = data || []
    setApps([...DEMO_APPS, ...realApps])
    setLoading(false)
  }, [])

  useEffect(() => { fetchApps() }, [fetchApps])

  const handleUploadClick = () => {
    if (!user) { navigate('/login'); return }
    setShowUpload(true)
  }

  const displayApps = (() => {
    let result = apps
    if (activeTag === 'BEST 바이브앱') {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 13)
    } else if (activeTag === '추천앱') {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else {
      result = result.filter((app) => app.category === activeTag)
    }
    return result
  })()

  return (
    <>
      <div className="retro-page">
        {/* 카테고리 탭바 + 업로드 버튼 */}
        <nav className="retro-nav">
          <div className="retro-nav__tabs">
            {TAGS.map((tag) => (
              <button
                key={tag}
                className={`retro-nav__item ${activeTag === tag ? 'retro-nav__item--active' : ''}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 맨 오른쪽 업로드 버튼 */}
          <button
            className="retro-nav__upload"
            onClick={handleUploadClick}
            title={user ? '앱 업로드하기' : '로그인 후 업로드 가능'}
          >
            ＋ 앱 올리기
          </button>
        </nav>

        {/* 앱 그리드 */}
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
                  to={`/apps/${app.id}`}
                  key={app.id}
                  className="retro-card"
                >
                  <div className="retro-card__img">
                    <img src={app.screenshot_url} alt={app.title} loading="lazy" />
                  </div>
                  <div className="retro-card__name">{app.title}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* 업로드 모달 */}
      {showUpload && (
        <UploadModal
          user={user}
          onClose={() => setShowUpload(false)}
          onUploaded={fetchApps}
        />
      )}
    </>
  )
}
