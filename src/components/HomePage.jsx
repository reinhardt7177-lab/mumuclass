/**
 * Supabase apps 테이블에 컬럼 추가 필요 (최초 1회):
 * alter table public.apps add column if not exists view_count integer default 0;
 * alter table public.apps add column if not exists approved  boolean default false;
 * alter table public.apps add column if not exists app_number integer;
 *
 * RLS 정책 (비로그인 업로드 허용):
 * create policy "apps anon insert" on public.apps for insert with check (true);
 */
import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Footer } from './Footer'

const FALLBACK_TAGS = ['추천', '무무앱 도감', '수업 진행', '학급 운영', '퀴즈/평가', '놀이/게임', 'AI/코딩', '기타']
const UPLOAD_CATEGORIES = ['수업 진행', '학급 운영', '퀴즈/평가', '놀이/게임', 'AI/코딩', '기타']

const EMPTY_FORM = { title: '', one_line_desc: '', preview_url: '', category: '기타', creator_name: '', tags: [] }

const toThumbUrl = (url) =>
  url ? `https://image.thum.io/get/width/640/${url}` : ''

const formatMumuNumber = (num) =>
  num ? `MUMU-${String(num).padStart(3, '0')}` : null

const CAT_COLORS = {
  '수업 진행': '#6c5ce7',
  '학급 운영': '#e17055',
  '퀴즈/평가': '#00b894',
  '놀이/게임': '#e84393',
  'AI/코딩': '#00cec9',
  '기타': '#636e72',
}

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

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().replace(/,/g, '')
      if (tag && !form.tags.includes(tag)) {
        setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      }
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
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
        tags: form.tags.length > 0 ? form.tags : null,
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: form.tags.length > 0 ? '0.4rem' : 0 }}>
              {form.tags.map(tag => (
                <span key={tag} style={{ background: 'rgba(108,92,231,0.15)', color: '#a29bfe', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: '#a29bfe', cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}>×</button>
                </span>
              ))}
            </div>
            <input
              className="upload-input"
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="태그 입력 후 Enter (예: 수학, 1학년)"
            />
          </div>
          <div className="upload-field">
            <label className="upload-label">제작자 이름</label>
            <input className="upload-input" type="text" name="creator_name" value={form.creator_name} onChange={handleChange}
              placeholder={user?.user_metadata?.display_name || user?.email?.split('@')[0] || '익명'} />
          </div>

          {/* ── 썸네일 업로드 ── */}
          <div style={{ borderTop: '1px solid #333', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div className="upload-label" style={{ marginBottom: '0.75rem' }}>📸 썸네일 이미지</div>

            <ImagePicker
              label="메인 썸네일"
              required
              file={mainImg}
              preview={mainPreview}
              hint="앱 목록에 표시되는 대표 이미지"
              onChange={handleImgChange(setMainImg, setMainPreview)}
            />

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
function AppCard({ app, showMumu }) {
  const color = CAT_COLORS[app.category] || '#636e72'
  const thumbUrl = app.screenshot_url?.startsWith('http')
    ? app.screenshot_url
    : (app.preview_url ? toThumbUrl(app.preview_url) : '')
  const [imgOk, setImgOk] = useState(!!thumbUrl)
  const mumuNum = formatMumuNumber(app.app_number)

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
        {mumuNum && showMumu && (
          <span className="retro-card__mumu">{mumuNum}</span>
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

/* ── 도감 리스트 아이템 ── */
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

function DogamListItem({ app, rank }) {
  const color = CAT_COLORS[app.category] || '#636e72'
  const thumbUrl = app.screenshot_url?.startsWith('http')
    ? app.screenshot_url
    : (app.preview_url ? toThumbUrl(app.preview_url) : '')
  const [imgOk, setImgOk] = useState(!!thumbUrl)
  const mumuNum = formatMumuNumber(app.app_number)

  return (
    <Link to={`/apps/${app.id}`} className="rank-card" style={{ textDecoration: 'none' }}>
      <div className={`rank-card__num ${rank <= 3 ? 'rank-card__num--top' : ''}`}>
        {MEDALS[rank] || rank}
      </div>
      <div className="rank-card__thumb">
        {thumbUrl && imgOk ? (
          <img src={thumbUrl} alt={app.title} onError={() => setImgOk(false)} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📱</div>
        )}
      </div>
      <div className="rank-card__info">
        <div className="rank-card__title">
          {app.title}
          {mumuNum && <span className="rank-card__mumu">{mumuNum}</span>}
        </div>
        <div className="rank-card__meta">
          <span className="rank-card__cat" style={{ color }}>{app.category || '기타'}</span>
          {app.rating > 0 && <span>★ {app.rating.toFixed(1)}</span>}
          <span>👁️ {(app.view_count || 0).toLocaleString()}</span>
          {app.creator_name && <span>by {app.creator_name}</span>}
        </div>
      </div>
    </Link>
  )
}

/* ── 메인 홈 ── */
export default function HomePage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('추천')
  const [showUpload, setShowUpload] = useState(false)
  const [tags, setTags] = useState(FALLBACK_TAGS)
  const [uploadCategories, setUploadCategories] = useState(UPLOAD_CATEGORIES)
  const [search, setSearch] = useState('')
  const [purposeChips, setPurposeChips] = useState([])
  const [selectedChips, setSelectedChips] = useState([])
  const [featuredTags, setFeaturedTags] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('app_categories')
        .select('*')
        .order('sort_order', { ascending: true })
      if (data && data.length > 0) {
        const catLabels = data.map(c => c.label)
        setTags(['추천', '무무앱 도감', ...catLabels])
        setUploadCategories(catLabels)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const [{ data: usage }, { data: pinned }] = await Promise.all([
          supabase.from('tag_usage').select('tag, usage_count').limit(20),
          supabase.from('featured_tags').select('*').eq('is_pinned', true).order('sort_order', { ascending: true }),
        ])
        const pinnedNames = (pinned || []).map(p => p.tag_name)
        const usageTags = (usage || []).map(u => u.tag)
        const merged = [...pinnedNames, ...usageTags.filter(t => !pinnedNames.includes(t))]
        setPurposeChips(merged.slice(0, 15))
        setFeaturedTags(pinnedNames)
      } catch {
        // tag_usage view or featured_tags table may not exist yet
      }
    }
    fetchTags()
  }, [])

  const fetchApps = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('apps')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
    setApps(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchApps() }, [fetchApps])

  const isListView = activeTag === '무무앱 도감'

  const displayApps = (() => {
    let base
    if (activeTag === '추천') {
      base = [...apps]
        .filter(a => a.is_best)
        .sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0)
          if (ratingDiff !== 0) return ratingDiff
          return (b.view_count || 0) - (a.view_count || 0)
        })
    } else if (activeTag === '무무앱 도감') {
      base = [...apps].sort((a, b) => (a.app_number || 9999) - (b.app_number || 9999))
    } else {
      base = apps.filter(app => app.category === activeTag)
    }

    if (selectedChips.length > 0) {
      base = base.filter(app => {
        const appTags = Array.isArray(app.tags) ? app.tags : []
        return selectedChips.every(chip => appTags.includes(chip))
      })
    }

    return base
  })()

  const filteredApps = search.trim()
    ? displayApps.filter(app =>
        app.title?.toLowerCase().includes(search.toLowerCase()) ||
        app.one_line_desc?.toLowerCase().includes(search.toLowerCase()) ||
        app.creator_name?.toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(app.tags) && app.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
      )
    : displayApps

  return (
    <>
      <div className="retro-page">
        <nav className="retro-nav">
          <div className="retro-nav__tabs">
            {tags.map((tag) => (
              <button
                key={tag}
                className={`retro-nav__item ${activeTag === tag ? 'retro-nav__item--active' : ''}`}
                onClick={() => { setActiveTag(tag); setSelectedChips([]); setSearch('') }}
              >{tag}</button>
            ))}
          </div>
          <button className="retro-nav__upload" onClick={() => setShowUpload(true)}>
            ＋ 앱 올리기
          </button>
        </nav>

        {/* Purpose Chips */}
        {purposeChips.length > 0 && (
          <div className="purpose-chips">
            <div className="purpose-chips__scroll">
              {purposeChips.map(chip => (
                <button
                  key={chip}
                  className={`purpose-chip ${selectedChips.includes(chip) ? 'purpose-chip--active' : ''} ${featuredTags.includes(chip) ? 'purpose-chip--pinned' : ''}`}
                  onClick={() => {
                    setSelectedChips(prev =>
                      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
                    )
                  }}
                >
                  #{chip}
                </button>
              ))}
              {selectedChips.length > 0 && (
                <button className="purpose-chip purpose-chip--clear" onClick={() => setSelectedChips([])}>
                  초기화
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="retro-search">
          <input
            type="text"
            className="retro-search__input"
            placeholder="앱 이름, 설명, 태그로 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Dogam Header */}
        {activeTag === '무무앱 도감' && (
          <div className="dogam-header">
            <h2 className="dogam-header__title">📖 무무앱 도감</h2>
            <p className="dogam-header__count">교실에서 바로 쓰는 앱 {filteredApps.length}개</p>
          </div>
        )}

        <div className="retro-content">
          {loading ? (
            <div className="retro-loading"><span>⏳</span><p>앱을 불러오는 중...</p></div>
          ) : filteredApps.length === 0 ? (
            <div className="retro-loading"><span>📦</span><p>앱이 없습니다</p></div>
          ) : isListView ? (
            <div className="rank-list">
              {filteredApps.map((app, i) => (
                <DogamListItem key={app.id} app={app} rank={i + 1} />
              ))}
            </div>
          ) : (
            <div className="retro-grid">
              {filteredApps.map((app) => (
                <AppCard key={app.id} app={app} showMumu={activeTag !== '추천'} />
              ))}
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
