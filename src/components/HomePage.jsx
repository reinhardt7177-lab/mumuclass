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

const FALLBACK_TAGS = ['BEST 바이브앱', '학급관리', '수학', '국어', '게임', '퍼즐', '에듀테크', '기타']

const EMPTY_FORM = { title: '', one_line_desc: '', preview_url: '', category: '기타', creator_name: '' }

const toThumbUrl = (url) =>
  url ? `https://image.thum.io/get/width/640/${url}` : ''

/* ── 이미지 피커 ── */
function ImagePicker({ label, required, file, preview, onChange, hint }) {
  const ref = useState(null)[0]
  return (
    <div className="upload-field">
      <label className="upload-label">{label}{required && <span> *</span>}</label>
      {hint && <span className="upload-hint" style={{ marginBottom: '0.4rem', display: 'block' }}>{hint}</span>}
      <label className="upload-img-picker" style={{ borderColor: preview ? '#f39c12' : undefined }}>
        {preview ? (
          <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3 }} />
        ) : (
          <div className="upload-img-picker__placeholder">
            <span style={{ fontSize: '1.8rem' }}>🖼️</span>
            <span style={{ fontSize: '0.72rem', color: '#666', marginTop: '0.3rem' }}>클릭해서 이미지 선택</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={ref}
          onChange={onChange}
        />
      </label>
    </div>
  )
}

/* ── 업로드 모달 ── */
function UploadModal({ user, onClose, onUploaded, uploadCategories }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [mainImg, setMainImg] = useState(null)
  const [mainPreview, setMainPreview] = useState(null)
  const [sub1Img, setSub1Img] = useState(null)
  const [sub1Preview, setSub1Preview] = useState(null)
  const [sub2Img, setSub2Img] = useState(null)
  const [sub2Preview, setSub2Preview] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [tags, setFormTags] = useState([])

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
    const { data } = supabase.storage.from('app-images').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setMessage({ type: 'error', text: '앱 이름을 입력해 주세요.' }); return }
    if (!form.preview_url.trim()) { setMessage({ type: 'error', text: '앱 실행 URL을 입력해 주세요.' }); return }
    if (!mainImg) { setMessage({ type: 'error', text: '메인 썸네일 이미지를 선택해 주세요.' }); return }
    setSubmitting(true)
    setMessage({ type: 'success', text: '이미지 업로드 중...' })

    try {
      const url = form.preview_url.trim()
      const mainUrl = await uploadImg(mainImg, 'main')
      const sub1Url = sub1Img ? await uploadImg(sub1Img, 'sub') : null
      const sub2Url = sub2Img ? await uploadImg(sub2Img, 'sub') : null

      const { error } = await supabase.from('apps').insert([{
        title: form.title.trim(),
        one_line_desc: form.description?.trim() || form.title.trim(),
        preview_url: url,
        screenshot_url: mainUrl,
        sub_image_1: sub1Url,
        sub_image_2: sub2Url,
        category: form.category,
        tags: tags.length > 0 ? tags : [],
        creator_name: form.creator_name.trim() ||
          user?.user_metadata?.display_name ||
          user?.email?.split('@')[0] || '익명',
        creator_email: user?.email || '',
        code_access_level: '전체',
        ai_customizing_possible: false,
        rating: 0,
        approved: false,
      }])

      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: '신청 완료! 관리자 승인 후 게시됩니다 ✅' })
      setTimeout(() => { onUploaded(); onClose() }, 1200)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
      setSubmitting(false)
    }
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
          </div>
          <div className="upload-field">
            <label className="upload-label">카테고리 <span>*</span></label>
            <select className="upload-select" name="category" value={form.category} onChange={handleChange}>
              {uploadCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="upload-field">
            <label className="upload-label">태그</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              {tags.map((t, i) => (
                <span key={i} style={{ background: 'rgba(108,92,231,0.1)', color: '#6c5ce7', padding: '2px 8px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  #{t}
                  <button type="button" onClick={() => setFormTags(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '0.75rem', padding: 0 }}>✕</button>
                </span>
              ))}
            </div>
            <input className="upload-input" type="text" value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                  e.preventDefault()
                  if (!tags.includes(tagInput.trim())) setFormTags(prev => [...prev, tagInput.trim()])
                  setTagInput('')
                }
              }}
              placeholder="태그 입력 후 Enter (예: 체육, 1학년, PAPS)" />
            <span className="upload-hint" style={{ fontSize: '0.7rem', color: '#aaa' }}>Enter 또는 쉼표로 태그 추가</span>
          </div>
          <div className="upload-field">
            <label className="upload-label">제작자 이름</label>
            <input className="upload-input" type="text" name="creator_name" value={form.creator_name} onChange={handleChange}
              placeholder={user?.user_metadata?.display_name || user?.email?.split('@')[0] || '익명'} />
          </div>

          {/* ── 썸네일 업로드 ── */}
          <div style={{ borderTop: '1px solid #333', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div className="upload-label" style={{ marginBottom: '0.75rem' }}>📸 썸네일 이미지</div>

            {/* 메인 썸네일 */}
            <ImagePicker
              label="메인 썸네일"
              required
              file={mainImg}
              preview={mainPreview}
              hint="앱 목록에 표시되는 대표 이미지"
              onChange={handleImgChange(setMainImg, setMainPreview)}
            />

            {/* 서브 썸네일 2개 */}
            <div className="upload-label" style={{ marginBottom: '0.5rem', marginTop: '0.25rem' }}>서브 이미지 (선택, 상세 페이지에 표시)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <ImagePicker
                label="서브 1"
                file={sub1Img}
                preview={sub1Preview}
                onChange={handleImgChange(setSub1Img, setSub1Preview)}
              />
              <ImagePicker
                label="서브 2"
                file={sub2Img}
                preview={sub2Preview}
                onChange={handleImgChange(setSub2Img, setSub2Preview)}
              />
            </div>
          </div>

          <button type="submit" className="upload-submit" disabled={submitting}>
            {submitting ? '업로드 중...' : '🚀 앱 올리기'}
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
  const [tags, setTags] = useState(FALLBACK_TAGS)
  const [uploadCategories, setUploadCategories] = useState(FALLBACK_TAGS.filter(t => t !== 'BEST 바이브앱'))
  const [catTree, setCatTree] = useState([]) // 계층 카테고리 트리
  const [subOpen, setSubOpen] = useState(false) // 교과 드롭다운 열림
  const { user } = useAuth()

  // DB에서 카테고리 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('app_categories')
        .select('*')
        .order('sort_order', { ascending: true })
      if (data && data.length > 0) {
        // 부모 카테고리(parent_id null)와 하위 카테고리 분리
        const parents = data.filter(c => !c.parent_id)
        const children = data.filter(c => c.parent_id)
        const tree = parents.map(p => ({
          ...p,
          children: children.filter(c => c.parent_id === p.id),
        }))
        setCatTree(tree)
        // 모든 카테고리 라벨 (업로드용)
        const allLabels = data.map(c => c.label)
        setUploadCategories(allLabels)
        // 탭용: 부모만 + BEST
        setTags(['BEST 바이브앱', ...parents.map(p => p.label)])
      }
    }
    fetchCategories()
  }, [])

  const fetchApps = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('apps')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
    const realApps = data || []
    setApps(realApps)
    setLoading(false)
  }, [])

  useEffect(() => { fetchApps() }, [fetchApps])

  // 현재 탭의 하위 카테고리 찾기
  const activeParent = catTree.find(p => p.label === activeTag)
  const hasChildren = activeParent && activeParent.children.length > 0

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
    // 하위 카테고리가 있으면 모든 하위의 앱도 포함
    if (hasChildren) {
      const childLabels = activeParent.children.map(c => c.label)
      return apps.filter((app) => app.category === activeTag || childLabels.includes(app.category))
    }
    return apps.filter((app) => app.category === activeTag)
  })()

  return (
    <>
      <div className="retro-page">
        <nav className="retro-nav">
          <div className="retro-nav__tabs">
            {tags.map((tag) => {
              const parent = catTree.find(p => p.label === tag)
              const hasSub = parent && parent.children.length > 0
              const childLabels = hasSub ? parent.children.map(c => c.label) : []
              const isActive = activeTag === tag || childLabels.includes(activeTag)

              if (hasSub) {
                return (
                  <div key={tag} className="retro-nav__dropdown"
                    onMouseEnter={() => setSubOpen(tag)}
                    onMouseLeave={() => setSubOpen(false)}
                  >
                    <button
                      className={`retro-nav__item ${isActive ? 'retro-nav__item--active' : ''}`}
                      onClick={() => { setActiveTag(tag); setSubOpen(false) }}
                    >{tag} ▾</button>
                    {subOpen === tag && (
                      <div className="retro-nav__sub">
                        <button
                          className={`retro-nav__sub-item ${activeTag === tag ? 'retro-nav__sub-item--active' : ''}`}
                          onClick={() => { setActiveTag(tag); setSubOpen(false) }}
                        >전체</button>
                        {parent.children.map(child => (
                          <button
                            key={child.id}
                            className={`retro-nav__sub-item ${activeTag === child.label ? 'retro-nav__sub-item--active' : ''}`}
                            onClick={() => { setActiveTag(child.label); setSubOpen(false) }}
                          >{child.emoji || ''} {child.label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <button
                  key={tag}
                  className={`retro-nav__item ${activeTag === tag ? 'retro-nav__item--active' : ''}`}
                  onClick={() => setActiveTag(tag)}
                >{tag}</button>
              )
            })}
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
        <UploadModal user={user} onClose={() => setShowUpload(false)} onUploaded={fetchApps} uploadCategories={uploadCategories} />
      )}
    </>
  )
}
