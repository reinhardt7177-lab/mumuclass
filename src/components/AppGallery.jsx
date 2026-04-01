/**
 * AppGallery – 레트로 풍 앱 갤러리
 *
 * Supabase 테이블 설정 (최초 1회 대시보드에서 실행):
 * ──────────────────────────────────────────────────
 * create table public.gallery_apps (
 *   id            uuid primary key default gen_random_uuid(),
 *   title         text not null,
 *   description   text,
 *   url           text,
 *   thumbnail_url text,
 *   category      text default '기타',
 *   creator_email text,
 *   creator_name  text,
 *   created_at    timestamptz default now()
 * );
 * alter table public.gallery_apps enable row level security;
 * -- 누구나 조회 가능
 * create policy "gallery read" on public.gallery_apps for select using (true);
 * -- 로그인 사용자만 삽입
 * create policy "gallery insert" on public.gallery_apps for insert with check (auth.uid() is not null);
 * -- 본인 글만 삭제 (관리자는 코드에서 처리)
 * create policy "gallery delete" on public.gallery_apps for delete using (creator_email = auth.jwt() ->> 'email');
 * ──────────────────────────────────────────────────
 *
 * 관리자 이메일: .env 파일에 VITE_ADMIN_EMAIL=your@email.com 추가
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import './AppGallery.css'

const CATEGORIES = ['전체', '학급관리', '수학', '국어', '게임', '퍼즐', '에듀테크', '기타']
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''

const EMPTY_FORM = {
  title: '',
  description: '',
  url: '',
  thumbnail_url: '',
  category: '기타',
}

/* ── 스피너 ── */
function Spinner({ size = 24 }) {
  return (
    <div
      className="gallery-spinner"
      style={{ width: size, height: size }}
    />
  )
}

/* ── 앱 카드 ── */
function AppCard({ app, onClick }) {
  return (
    <div className="gallery-card" onClick={() => onClick(app)}>
      <div className="gallery-card__thumb">
        {app.thumbnail_url ? (
          <img src={app.thumbnail_url} alt={app.title} loading="lazy" />
        ) : (
          <span className="gallery-card__thumb-placeholder">🕹️</span>
        )}
        {app.category && (
          <span className="gallery-card__cat-badge">{app.category}</span>
        )}
      </div>
      <div className="gallery-card__body">
        <div className="gallery-card__name">{app.title}</div>
        {app.description && (
          <div className="gallery-card__desc">{app.description}</div>
        )}
        <div className="gallery-card__footer">
          {app.creator_name && (
            <span className="gallery-card__creator">by {app.creator_name}</span>
          )}
          {app.url && (
            <span className="gallery-card__play">▶ 실행</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── 앱 상세 패널 ── */
function AppDetailPanel({ app, onClose, onDelete, canDelete }) {
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [showIframe, setShowIframe] = useState(false)

  useEffect(() => {
    setIframeLoaded(false)
    setShowIframe(false)
  }, [app?.id])

  // Esc 키로 닫기
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="gallery-detail-overlay" onClick={handleOverlayClick}>
      <div className="gallery-detail">
        <button className="gallery-detail__close" onClick={onClose} title="닫기">✕</button>

        {/* 상단: 썸네일 + 정보 */}
        <div className="gallery-detail__top">
          <div className="gallery-detail__thumb">
            {app.thumbnail_url ? (
              <img src={app.thumbnail_url} alt={app.title} />
            ) : (
              <span className="gallery-detail__thumb-placeholder">🕹️</span>
            )}
          </div>
          <div className="gallery-detail__info">
            {app.category && (
              <span className="gallery-detail__cat">{app.category}</span>
            )}
            <h2 className="gallery-detail__name">{app.title}</h2>
            {app.description && (
              <p className="gallery-detail__desc">{app.description}</p>
            )}
            {app.creator_name && (
              <p className="gallery-detail__meta">제작 : {app.creator_name}</p>
            )}

            <div className="gallery-detail__actions">
              {app.url && (
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gallery-detail__play-btn"
                >
                  ▶ 새 탭으로 실행
                </a>
              )}
              {canDelete && (
                <button
                  className="gallery-detail__delete-btn"
                  onClick={() => onDelete(app.id)}
                >
                  🗑️ 삭제
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 하단: iframe 실행 */}
        <div className="gallery-detail__iframe-section">
          <div className="gallery-detail__iframe-label">▶ 직접 실행</div>
          {app.url ? (
            showIframe ? (
              <div className="gallery-detail__iframe-wrap">
                {!iframeLoaded && (
                  <div className="gallery-detail__iframe-loading">
                    <Spinner />
                    <span>앱 로딩 중...</span>
                  </div>
                )}
                <iframe
                  src={app.url}
                  title={app.title}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                  allow="camera;microphone"
                  loading="lazy"
                  onLoad={() => setIframeLoaded(true)}
                  style={{ opacity: iframeLoaded ? 1 : 0 }}
                />
              </div>
            ) : (
              <div className="gallery-detail__no-url">
                <button
                  className="gallery-detail__play-btn"
                  onClick={() => setShowIframe(true)}
                  style={{ border: 'none' }}
                >
                  ▶ 여기서 바로 실행하기
                </button>
              </div>
            )
          ) : (
            <div className="gallery-detail__no-url">
              등록된 실행 URL이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── 앱 추가 모달 ── */
function AddAppModal({ onClose, onAdded, user }) {
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
    setSubmitting(true)
    setMessage(null)

    const { error } = await supabase.from('gallery_apps').insert([{
      title: form.title.trim(),
      description: form.description.trim() || null,
      url: form.url.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      category: form.category || '기타',
      creator_email: user?.email || '',
      creator_name:
        user?.user_metadata?.display_name ||
        user?.email?.split('@')[0] ||
        '익명',
    }])

    setSubmitting(false)

    if (error) {
      setMessage({ type: 'error', text: `등록 실패: ${error.message}` })
    } else {
      setMessage({ type: 'success', text: '앱이 갤러리에 추가됐어요! 🎉' })
      setTimeout(() => {
        onAdded()
        onClose()
      }, 1200)
    }
  }

  // Esc 키로 닫기
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="gallery-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="gallery-modal">
        <button className="gallery-modal__close" onClick={onClose}>✕</button>
        <div className="gallery-modal__title">🕹️ 앱 갤러리에 추가하기</div>

        {message && (
          <div className={`gallery-alert gallery-alert--${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="gallery-form__group">
            <label className="gallery-form__label">앱 이름 <span>*</span></label>
            <input
              className="gallery-form__input"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="예: 구구단 마스터"
              required
            />
          </div>

          <div className="gallery-form__group">
            <label className="gallery-form__label">설명</label>
            <textarea
              className="gallery-form__textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="어떤 앱인지 설명해 주세요..."
            />
          </div>

          <div className="gallery-form__group">
            <label className="gallery-form__label">앱 URL 링크</label>
            <input
              className="gallery-form__input"
              type="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://..."
            />
            <span className="gallery-form__hint">iframe으로 직접 실행됩니다</span>
          </div>

          <div className="gallery-form__group">
            <label className="gallery-form__label">썸네일 이미지 URL</label>
            <input
              className="gallery-form__input"
              type="url"
              name="thumbnail_url"
              value={form.thumbnail_url}
              onChange={handleChange}
              placeholder="https://... (스크린샷 이미지 주소)"
            />
            <span className="gallery-form__hint">카드에 표시될 미리보기 이미지</span>
          </div>

          <div className="gallery-form__group">
            <label className="gallery-form__label">카테고리</label>
            <select
              className="gallery-form__select"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.filter((c) => c !== '전체').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="gallery-form__submit"
            disabled={submitting}
          >
            {submitting ? '추가 중...' : '🚀 갤러리에 추가하기'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── 메인 갤러리 페이지 ── */
export default function AppGallery() {
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('전체')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchApps = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('gallery_apps')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setApps(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchApps() }, [fetchApps])

  const filtered = apps.filter((app) => {
    const matchCat = activeCategory === '전체' || app.category === activeCategory
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      app.title?.toLowerCase().includes(q) ||
      app.description?.toLowerCase().includes(q) ||
      app.creator_name?.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const canDelete = (app) =>
    user &&
    (user.email === app.creator_email || user.email === ADMIN_EMAIL)

  const handleDelete = async (appId) => {
    if (!confirm('이 앱을 갤러리에서 삭제하시겠습니까?')) return
    const { error } = await supabase
      .from('gallery_apps')
      .delete()
      .eq('id', appId)
    if (error) {
      alert(`삭제 실패: ${error.message}`)
    } else {
      setSelectedApp(null)
      fetchApps()
    }
  }

  return (
    <div className="gallery-page">
      {/* ── 헤더 ── */}
      <div className="gallery-header">
        <div className="gallery-header__top">
          <div>
            <h1 className="gallery-title">
              <span className="gallery-title__pixel" />
              앱 갤러리
            </h1>
            <p className="gallery-subtitle">
              선생님들이 만든 앱을 탐색하고 바로 실행해 보세요
            </p>
          </div>
          {user && (
            <button
              className="gallery-add-btn"
              onClick={() => setShowAddModal(true)}
            >
              + 앱 추가하기
            </button>
          )}
        </div>
        {apps.length > 0 && (
          <span className="gallery-count">{apps.length}개 앱</span>
        )}
      </div>

      {/* ── 검색 + 카테고리 ── */}
      <div className="gallery-controls">
        <div className="gallery-search">
          <span className="gallery-search__icon">🔍</span>
          <input
            className="gallery-search__input"
            type="text"
            placeholder="앱 이름, 설명, 제작자로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="gallery-cats">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`gallery-cat ${activeCategory === cat ? 'gallery-cat--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── 그리드 ── */}
      {loading ? (
        <div className="gallery-empty">
          <Spinner size={36} />
          <p className="gallery-empty__text" style={{ marginTop: '1rem' }}>
            앱 목록 불러오는 중...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="gallery-empty">
          <span className="gallery-empty__icon">📭</span>
          <p className="gallery-empty__text">
            {search || activeCategory !== '전체'
              ? '검색 결과가 없습니다'
              : '아직 등록된 앱이 없어요. 첫 번째 앱을 추가해 보세요!'}
          </p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} onClick={setSelectedApp} />
          ))}
        </div>
      )}

      {/* ── 앱 상세 패널 ── */}
      {selectedApp && (
        <AppDetailPanel
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onDelete={handleDelete}
          canDelete={canDelete(selectedApp)}
        />
      )}

      {/* ── 앱 추가 모달 ── */}
      {showAddModal && (
        <AddAppModal
          user={user}
          onClose={() => setShowAddModal(false)}
          onAdded={fetchApps}
        />
      )}
    </div>
  )
}
