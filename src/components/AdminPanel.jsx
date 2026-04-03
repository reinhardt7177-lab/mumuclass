import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'mumuclass@mumuclass.kr'

/* ── 공통 스타일 ── */
const S = {
  card: { border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.2rem', background: '#fff', display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  btn: (bg, color, border) => ({ background: bg, color, border: border || 'none', padding: '0.45rem 0.9rem', borderRadius: 6, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }),
  input: { width: 72, padding: '0.3rem 0.5rem', border: '1px solid #d1d5db', borderRadius: 5, fontSize: '0.85rem', textAlign: 'center' },
  label: { fontSize: '0.7rem', color: '#9ca3af', display: 'block', marginBottom: 2 },
}

/* ── 승인 대기 탭 ── */
function PendingTab({ msg, setMsg }) {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPending() }, [])

  const fetchPending = async () => {
    setLoading(true)
    const { data } = await supabase.from('apps').select('*').eq('approved', false).order('created_at', { ascending: false })
    setPending(data || [])
    setLoading(false)
  }

  const handleApprove = async (id) => {
    const { error } = await supabase.from('apps').update({ approved: true }).eq('id', id)
    if (error) { setMsg({ type: 'error', text: `승인 실패: ${error.message}` }); return }
    setMsg({ type: 'success', text: '승인 완료!' })
    setPending(prev => prev.filter(a => a.id !== id))
    setTimeout(() => setMsg(null), 2000)
  }

  const handleDelete = async (id) => {
    if (!confirm('이 앱을 삭제하시겠습니까?')) return
    await supabase.from('apps').delete().eq('id', id)
    setPending(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return <p style={{ color: '#888', padding: '2rem' }}>불러오는 중...</p>

  if (pending.length === 0) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#888', border: '1px dashed #ddd', borderRadius: 8 }}>
      <p style={{ fontSize: '2rem' }}>✅</p>
      <p>승인 대기 중인 앱이 없습니다.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ fontSize: '0.85rem', color: '#888' }}>대기 중 {pending.length}개</p>
      {pending.map((app) => (
        <div key={app.id} style={S.card}>
          {app.screenshot_url && (
            <img src={app.screenshot_url} alt={app.title}
              style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid #eee' }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 3 }}>{app.title}</div>
            <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: 4 }}>{app.one_line_desc}</div>
            <div style={{ fontSize: '0.75rem', color: '#aaa', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span>{app.category || '기타'}</span>
              <span>by {app.creator_name || '익명'}</span>
              <span>{app.creator_email || '-'}</span>
              {app.preview_url && <a href={app.preview_url} target="_blank" rel="noopener noreferrer" style={{ color: '#6c5ce7' }}>↗ 확인</a>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
            <button onClick={() => handleApprove(app.id)} style={S.btn('#00b894', '#fff')}>✅ 승인</button>
            <button onClick={() => handleDelete(app.id)} style={S.btn('rgba(231,76,60,0.1)', '#e74c3c', '1px solid rgba(231,76,60,0.3)')}>🗑️ 삭제</button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── 게시 중 앱 관리 탭 ── */
function ApprovedTab({ msg, setMsg }) {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState({})

  useEffect(() => { fetchApproved() }, [])

  const fetchApproved = async () => {
    setLoading(true)
    const { data } = await supabase.from('apps').select('*').eq('approved', true).order('created_at', { ascending: false })
    setApps(data || [])
    const init = {}
    ;(data || []).forEach(a => { init[a.id] = { rating: a.rating ?? 0, view_count: a.view_count ?? 0 } })
    setEditing(init)
    setLoading(false)
  }

  const handleFieldChange = (id, field, value) => {
    setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const handleSave = async (app) => {
    const vals = editing[app.id]
    const rating = Math.min(5, Math.max(0, parseFloat(vals.rating) || 0))
    const view_count = Math.max(0, parseInt(vals.view_count) || 0)
    const { error } = await supabase.from('apps').update({ rating, view_count }).eq('id', app.id)
    if (error) { setMsg({ type: 'error', text: `저장 실패: ${error.message}` }); return }
    setMsg({ type: 'success', text: `"${app.title}" 저장 완료` })
    setApps(prev => prev.map(a => a.id === app.id ? { ...a, rating, view_count } : a))
    setTimeout(() => setMsg(null), 2000)
  }

  const handleToggleBest = async (app) => {
    const newVal = !app.is_best
    const { error } = await supabase.from('apps').update({ is_best: newVal }).eq('id', app.id)
    if (error) { setMsg({ type: 'error', text: `BEST 변경 실패: ${error.message}` }); return }
    setApps(prev => prev.map(a => a.id === app.id ? { ...a, is_best: newVal } : a))
    setMsg({ type: 'success', text: newVal ? `"${app.title}" BEST 등록!` : `"${app.title}" BEST 해제` })
    setTimeout(() => setMsg(null), 2000)
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`"${title}"을(를) 삭제하시겠습니까?`)) return
    await supabase.from('apps').delete().eq('id', id)
    setApps(prev => prev.filter(a => a.id !== id))
  }

  const handleUnapprove = async (id) => {
    await supabase.from('apps').update({ approved: false }).eq('id', id)
    setApps(prev => prev.filter(a => a.id !== id))
    setMsg({ type: 'success', text: '게시 취소됐습니다.' })
    setTimeout(() => setMsg(null), 2000)
  }

  if (loading) return <p style={{ color: '#888', padding: '2rem' }}>불러오는 중...</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ fontSize: '0.85rem', color: '#888' }}>게시 중 {apps.length}개</p>
      {apps.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>게시 중인 앱이 없습니다.</p>}
      {apps.map((app) => {
        const vals = editing[app.id] || { rating: app.rating ?? 0, view_count: app.view_count ?? 0 }
        return (
          <div key={app.id} style={S.card}>
            {app.screenshot_url && (
              <img src={app.screenshot_url} alt={app.title}
                style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid #eee' }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 3 }}>{app.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: 8, display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span>{app.category || '기타'}</span>
                <span>by {app.creator_name || '익명'}</span>
                {app.preview_url && <a href={app.preview_url} target="_blank" rel="noopener noreferrer" style={{ color: '#6c5ce7' }}>↗ 확인</a>}
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <label style={S.label}>⭐ 별점 (0–5)</label>
                  <input style={S.input} type="number" min="0" max="5" step="0.1" value={vals.rating}
                    onChange={(e) => handleFieldChange(app.id, 'rating', e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>👁️ 조회수</label>
                  <input style={S.input} type="number" min="0" step="1" value={vals.view_count}
                    onChange={(e) => handleFieldChange(app.id, 'view_count', e.target.value)} />
                </div>
                <button onClick={() => handleSave(app)} style={S.btn('#6c5ce7', '#fff')}>💾 저장</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
              <button onClick={() => handleToggleBest(app)}
                style={S.btn(app.is_best ? '#f39c12' : 'rgba(243,156,18,0.1)', app.is_best ? '#fff' : '#f39c12', app.is_best ? 'none' : '1px solid rgba(243,156,18,0.4)')}
              >{app.is_best ? '★ BEST 해제' : '☆ BEST 등록'}</button>
              <button onClick={() => handleUnapprove(app.id)} style={S.btn('rgba(99,110,114,0.1)', '#636e72', '1px solid rgba(99,110,114,0.3)')}>⏸ 게시취소</button>
              <button onClick={() => handleDelete(app.id, app.title)} style={S.btn('rgba(231,76,60,0.1)', '#e74c3c', '1px solid rgba(231,76,60,0.3)')}>🗑️ 삭제</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── 리뷰 관리 탭 ── */
function ReviewsTab({ msg, setMsg }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [appMap, setAppMap] = useState({})

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: revData }, { data: appData }] = await Promise.all([
      supabase.from('app_reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('apps').select('id, title').eq('approved', true),
    ])
    const map = {}
    ;(appData || []).forEach(a => { map[a.id] = a.title })
    setAppMap(map)
    setReviews(revData || [])
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('이 리뷰를 삭제하시겠습니까?')) return
    const { error } = await supabase.from('app_reviews').delete().eq('id', id)
    if (error) { setMsg({ type: 'error', text: `삭제 실패: ${error.message}` }); return }
    setReviews(prev => prev.filter(r => r.id !== id))
    setMsg({ type: 'success', text: '리뷰 삭제 완료' })
    setTimeout(() => setMsg(null), 2000)
  }

  if (loading) return <p style={{ color: '#888', padding: '2rem' }}>불러오는 중...</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontSize: '0.85rem', color: '#888' }}>전체 리뷰 {reviews.length}개</p>
      {reviews.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>리뷰가 없습니다.</p>}
      {reviews.map((rev) => (
        <div key={rev.id} style={{ ...S.card, alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: 4 }}>
              <b style={{ color: '#6c5ce7' }}>{appMap[rev.app_id] || rev.app_id}</b>
              {' · '}{rev.user_name || rev.user_email}
              {' · '}{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
              {' · '}{new Date(rev.created_at).toLocaleDateString('ko-KR')}
            </div>
            {rev.comment && <p style={{ fontSize: '0.88rem', margin: 0, color: '#374151' }}>{rev.comment}</p>}
          </div>
          <button onClick={() => handleDelete(rev.id)} style={S.btn('rgba(231,76,60,0.1)', '#e74c3c', '1px solid rgba(231,76,60,0.3)')}>🗑️ 삭제</button>
        </div>
      ))}
    </div>
  )
}

/* ── 기본 카테고리 (BEST 제외) ── */
const DEFAULT_CATEGORIES = [
  { id: '학급관리', label: '학급관리', emoji: '🏫', sort_order: 0 },
  { id: '수학', label: '수학', emoji: '🔢', sort_order: 1 },
  { id: '국어', label: '국어', emoji: '📖', sort_order: 2 },
  { id: '게임', label: '게임', emoji: '🎮', sort_order: 3 },
  { id: '퍼즐', label: '퍼즐', emoji: '🧩', sort_order: 4 },
  { id: '에듀테크', label: '에듀테크', emoji: '💡', sort_order: 5 },
  { id: '기타', label: '기타', emoji: '📁', sort_order: 6 },
]

/* ── 카테고리 관리 탭 ── */
function CategoriesTab({ msg, setMsg }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newId, setNewId] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('')
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [orderChanged, setOrderChanged] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('app_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      // 테이블이 없을 수 있음 - 기본 카테고리를 로컬로 표시
      setCategories([])
      setLoading(false)
      return
    }

    // DB에 카테고리가 하나도 없으면 기본값 자동 삽입
    if (!data || data.length === 0) {
      const { data: inserted, error: seedErr } = await supabase
        .from('app_categories')
        .insert(DEFAULT_CATEGORIES)
        .select()
      if (!seedErr && inserted) {
        setCategories(inserted)
      } else {
        // insert 실패 시 로컬 폴백
        setCategories(DEFAULT_CATEGORIES)
      }
    } else {
      setCategories(data)
    }
    setLoading(false)
  }

  const handleSeedDefaults = async () => {
    if (!confirm('기본 카테고리 7개를 추가하시겠습니까?\n(이미 있는 ID는 건너뜁니다)')) return
    setSeeding(true)
    const existingIds = new Set(categories.map(c => c.id))
    const toInsert = DEFAULT_CATEGORIES.filter(c => !existingIds.has(c.id))
    if (toInsert.length === 0) {
      setMsg({ type: 'success', text: '이미 모든 기본 카테고리가 등록되어 있습니다.' })
    } else {
      const { error } = await supabase.from('app_categories').insert(toInsert)
      if (error) {
        setMsg({ type: 'error', text: '추가 실패: ' + error.message })
      } else {
        setMsg({ type: 'success', text: `기본 카테고리 ${toInsert.length}개 추가 완료!` })
        fetchCategories()
      }
    }
    setSeeding(false)
    setTimeout(() => setMsg(null), 3000)
  }

  const handleAdd = async () => {
    if (!newId.trim() || !newLabel.trim()) {
      setMsg({ type: 'error', text: 'ID와 이름을 모두 입력해주세요.' })
      setTimeout(() => setMsg(null), 3000)
      return
    }
    if (categories.find(c => c.id === newId.trim())) {
      setMsg({ type: 'error', text: '이미 존재하는 카테고리 ID입니다.' })
      setTimeout(() => setMsg(null), 3000)
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('app_categories')
      .insert({
        id: newId.trim(),
        label: newLabel.trim(),
        emoji: newEmoji.trim() || '📁',
        sort_order: categories.length,
      })

    if (error) {
      setMsg({ type: 'error', text: '추가 실패: ' + error.message })
    } else {
      setMsg({ type: 'success', text: `"${newLabel.trim()}" 카테고리 추가 완료!` })
      setNewId('')
      setNewLabel('')
      setNewEmoji('')
      fetchCategories()
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 2000)
  }

  const moveCategory = (index, direction) => {
    const next = index + direction
    if (next < 0 || next >= categories.length) return
    const updated = [...categories]
    ;[updated[index], updated[next]] = [updated[next], updated[index]]
    setCategories(updated)
    setOrderChanged(true)
  }

  const handleSaveOrder = async () => {
    setSavingOrder(true)
    const updates = categories.map((cat, i) =>
      supabase.from('app_categories').update({ sort_order: i }).eq('id', cat.id)
    )
    await Promise.all(updates)
    setSavingOrder(false)
    setOrderChanged(false)
    setMsg({ type: 'success', text: '카테고리 순서가 저장되었습니다!' })
    setTimeout(() => setMsg(null), 2000)
  }

  const handleDelete = async (catId, catLabel) => {
    if (!confirm(`"${catLabel}" 카테고리를 삭제하시겠습니까?\n해당 카테고리의 앱은 삭제되지 않습니다.`)) return

    const { error } = await supabase.from('app_categories').delete().eq('id', catId)
    if (error) {
      setMsg({ type: 'error', text: '삭제 실패: ' + error.message })
    } else {
      setCategories(prev => prev.filter(c => c.id !== catId))
      setMsg({ type: 'success', text: `"${catLabel}" 카테고리 삭제 완료` })
    }
    setTimeout(() => setMsg(null), 2000)
  }

  if (loading) return <p style={{ color: '#888', padding: '2rem' }}>불러오는 중...</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 기본 카테고리 초기화 */}
      {categories.length === 0 && (
        <div style={{ border: '2px dashed #6c5ce7', borderRadius: 10, padding: '1.5rem', background: 'rgba(108,92,231,0.04)', textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏷️</p>
          <p style={{ fontWeight: 700, marginBottom: '0.75rem' }}>카테고리가 없습니다</p>
          <button onClick={handleSeedDefaults} disabled={seeding} style={S.btn('#6c5ce7', '#fff')}>
            {seeding ? '추가 중...' : '📋 기본 카테고리 7개 한번에 추가'}
          </button>
        </div>
      )}
      {categories.length > 0 && categories.length < DEFAULT_CATEGORIES.length && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSeedDefaults} disabled={seeding} style={S.btn('rgba(108,92,231,0.1)', '#6c5ce7', '1px solid rgba(108,92,231,0.3)')}>
            {seeding ? '추가 중...' : '📋 빠진 기본 카테고리 추가'}
          </button>
        </div>
      )}

      {/* 추가 폼 */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.2rem', background: '#fafafa' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>➕ 새 카테고리 추가</p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="ID (영문, 예: science)"
            value={newId}
            onChange={e => setNewId(e.target.value)}
            style={{ flex: 1, minWidth: 120, padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem' }}
          />
          <input
            type="text"
            placeholder="이름 (예: 과학)"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            style={{ flex: 1, minWidth: 100, padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem' }}
          />
          <input
            type="text"
            placeholder="이모지 (예: 🔬)"
            value={newEmoji}
            onChange={e => setNewEmoji(e.target.value)}
            style={{ width: 70, padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem', textAlign: 'center' }}
          />
          <button onClick={handleAdd} disabled={saving} style={S.btn('#00b894', '#fff')}>
            {saving ? '추가 중...' : '✅ 추가'}
          </button>
        </div>
      </div>

      {/* 카테고리 목록 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>등록된 카테고리 {categories.length}개</p>
        {orderChanged && (
          <button onClick={handleSaveOrder} disabled={savingOrder} style={S.btn('#6c5ce7', '#fff')}>
            {savingOrder ? '저장 중...' : '💾 순서 저장'}
          </button>
        )}
      </div>
      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888', border: '1px dashed #ddd', borderRadius: 8 }}>
          <p style={{ fontSize: '2rem' }}>🏷️</p>
          <p>등록된 카테고리가 없습니다.</p>
        </div>
      ) : (
        categories.map((cat, index) => (
          <div key={cat.id} style={{ ...S.card, alignItems: 'center' }}>
            {/* 순서 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
              <button
                onClick={() => moveCategory(index, -1)}
                disabled={index === 0}
                style={{ ...S.btn('rgba(108,92,231,0.08)', '#6c5ce7', '1px solid rgba(108,92,231,0.2)'), padding: '2px 7px', opacity: index === 0 ? 0.3 : 1 }}
              >▲</button>
              <button
                onClick={() => moveCategory(index, 1)}
                disabled={index === categories.length - 1}
                style={{ ...S.btn('rgba(108,92,231,0.08)', '#6c5ce7', '1px solid rgba(108,92,231,0.2)'), padding: '2px 7px', opacity: index === categories.length - 1 ? 0.3 : 1 }}
              >▼</button>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 3 }}>
                <span style={{ fontSize: '1.1rem' }}>{cat.emoji || '📁'}</span>
                {cat.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                ID: <code style={{ background: 'rgba(108,92,231,0.08)', color: '#6c5ce7', padding: '1px 5px', borderRadius: 3, fontSize: '0.75rem' }}>{cat.id}</code>
                {` · 순서 ${index + 1}번`}
              </div>
            </div>
            <button onClick={() => handleDelete(cat.id, cat.label)} style={S.btn('rgba(231,76,60,0.1)', '#e74c3c', '1px solid rgba(231,76,60,0.3)')}>🗑️ 삭제</button>
          </div>
        ))
      )}
    </div>
  )
}

/* ── 메인 ── */
export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState('pending')
  const [msg, setMsg] = useState(null)

  const isAdmin = user?.email === ADMIN_EMAIL

  if (authLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#888' }}>
      <p style={{ fontSize: '2rem' }}>🚫</p>
      <p>관리자만 접근할 수 있습니다.</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem', paddingTop: '80px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '1.25rem' }}>🛡️ 관리자 패널</h1>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
        {[['pending', '⏳ 승인 대기'], ['approved', '📋 앱 관리'], ['reviews', '💬 리뷰 관리'], ['categories', '🏷️ 카테고리 관리']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '0.6rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.88rem',
            color: tab === key ? '#6c5ce7' : '#888',
            borderBottom: tab === key ? '2px solid #6c5ce7' : '2px solid transparent',
            marginBottom: -2,
          }}>{label}</button>
        ))}
      </div>

      {/* 메시지 */}
      {msg && (
        <div style={{
          padding: '0.6rem 1rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.85rem',
          background: msg.type === 'success' ? 'rgba(0,184,148,0.1)' : 'rgba(231,76,60,0.1)',
          border: `1px solid ${msg.type === 'success' ? '#00b894' : '#e74c3c'}`,
          color: msg.type === 'success' ? '#00b894' : '#e74c3c',
        }}>{msg.text}</div>
      )}

      {tab === 'pending' && <PendingTab msg={msg} setMsg={setMsg} />}
      {tab === 'approved' && <ApprovedTab msg={msg} setMsg={setMsg} />}
      {tab === 'reviews' && <ReviewsTab msg={msg} setMsg={setMsg} />}
      {tab === 'categories' && <CategoriesTab msg={msg} setMsg={setMsg} />}
    </div>
  )
}
