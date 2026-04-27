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
    if (!confirm('⚠️ 정말 삭제합니다. 이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?')) return
    const { data, error } = await supabase.from('apps').delete().eq('id', id).select()
    if (error) {
      setMsg({ type: 'error', text: `삭제 실패: ${error.message}` })
      setTimeout(() => setMsg(null), 4000)
      return
    }
    if (!data || data.length === 0) {
      setMsg({ type: 'error', text: '삭제되지 않았습니다. Supabase RLS DELETE 정책이 없는 것 같습니다 (콘솔 확인).' })
      setTimeout(() => setMsg(null), 5000)
      return
    }
    setPending(prev => prev.filter(a => a.id !== id))
    setMsg({ type: 'success', text: '삭제 완료' })
    setTimeout(() => setMsg(null), 2000)
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
    if (!confirm(`⚠️ 정말 삭제합니다. 이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?`)) return
    await supabase.from('app_reviews').delete().eq('app_id', id)
    const { data, error } = await supabase.from('apps').delete().eq('id', id).select()
    if (error) {
      setMsg({ type: 'error', text: `삭제 실패: ${error.message}` })
      setTimeout(() => setMsg(null), 4000)
      return
    }
    if (!data || data.length === 0) {
      setMsg({ type: 'error', text: '삭제되지 않았습니다. Supabase RLS DELETE 정책이 없는 것 같습니다 (콘솔 확인).' })
      setTimeout(() => setMsg(null), 5000)
      return
    }
    setApps(prev => prev.filter(a => a.id !== id))
    setMsg({ type: 'success', text: `"${title}" 삭제 완료` })
    setTimeout(() => setMsg(null), 2000)
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

/* ── 카테고리 관리 탭 (계층 지원) ── */
function CategoriesTab({ msg, setMsg }) {
  const [allCats, setAllCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [newId, setNewId] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('')
  const [newParent, setNewParent] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedParent, setExpandedParent] = useState(null)

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('app_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) { setAllCats([]); setLoading(false); return }

    if (!data || data.length === 0) {
      const { data: inserted } = await supabase.from('app_categories').insert(DEFAULT_CATEGORIES).select()
      setAllCats(inserted || DEFAULT_CATEGORIES)
    } else {
      setAllCats(data)
    }
    setLoading(false)
  }

  const parents = allCats.filter(c => !c.parent_id)
  const getChildren = (parentId) => allCats.filter(c => c.parent_id === parentId)

  const handleAdd = async () => {
    if (!newId.trim() || !newLabel.trim()) {
      setMsg({ type: 'error', text: 'ID와 이름을 모두 입력해주세요.' })
      setTimeout(() => setMsg(null), 3000)
      return
    }
    if (allCats.find(c => c.id === newId.trim())) {
      setMsg({ type: 'error', text: '이미 존재하는 카테고리 ID입니다.' })
      setTimeout(() => setMsg(null), 3000)
      return
    }
    setSaving(true)
    const payload = {
      id: newId.trim(),
      label: newLabel.trim(),
      emoji: newEmoji.trim() || '📁',
      sort_order: allCats.length,
      parent_id: newParent || null,
    }
    const { error } = await supabase.from('app_categories').insert(payload)
    if (error) {
      setMsg({ type: 'error', text: '추가 실패: ' + error.message })
    } else {
      setMsg({ type: 'success', text: `"${newLabel.trim()}" 추가 완료!` })
      setNewId(''); setNewLabel(''); setNewEmoji(''); setNewParent('')
      fetchCategories()
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 2000)
  }

  const handleDelete = async (catId, catLabel) => {
    const children = getChildren(catId)
    const confirmMsg = children.length > 0
      ? `"${catLabel}"과 하위 ${children.length}개도 함께 삭제됩니다. 계속하시겠습니까?`
      : `"${catLabel}" 카테고리를 삭제하시겠습니까?`
    if (!confirm(confirmMsg)) return

    // 하위 카테고리도 삭제
    if (children.length > 0) {
      await supabase.from('app_categories').delete().eq('parent_id', catId)
    }
    const { error } = await supabase.from('app_categories').delete().eq('id', catId)
    if (error) {
      setMsg({ type: 'error', text: '삭제 실패: ' + error.message })
    } else {
      setMsg({ type: 'success', text: `"${catLabel}" 삭제 완료` })
      fetchCategories()
    }
    setTimeout(() => setMsg(null), 2000)
  }

  const handleReassign = async (childId, newParentId) => {
    const { error } = await supabase.from('app_categories').update({ parent_id: newParentId || null }).eq('id', childId)
    if (error) {
      setMsg({ type: 'error', text: '재배정 실패: ' + error.message })
    } else {
      setMsg({ type: 'success', text: '재배정 완료!' })
      fetchCategories()
    }
    setTimeout(() => setMsg(null), 2000)
  }

  if (loading) return <p style={{ color: '#888', padding: '2rem' }}>불러오는 중...</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 추가 폼 */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.2rem', background: '#fafafa' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>➕ 새 카테고리 추가</p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="text" placeholder="ID (영문)" value={newId} onChange={e => setNewId(e.target.value)}
            style={{ flex: 1, minWidth: 100, padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem' }} />
          <input type="text" placeholder="이름" value={newLabel} onChange={e => setNewLabel(e.target.value)}
            style={{ flex: 1, minWidth: 80, padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem' }} />
          <input type="text" placeholder="이모지" value={newEmoji} onChange={e => setNewEmoji(e.target.value)}
            style={{ width: 60, padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem', textAlign: 'center' }} />
          <select value={newParent} onChange={e => setNewParent(e.target.value)}
            style={{ padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem' }}>
            <option value="">최상위 카테고리</option>
            {parents.map(p => <option key={p.id} value={p.id}>↳ {p.label} 하위</option>)}
          </select>
          <button onClick={handleAdd} disabled={saving} style={S.btn('#00b894', '#fff')}>
            {saving ? '추가 중...' : '✅ 추가'}
          </button>
        </div>
      </div>

      {/* 카테고리 트리 목록 */}
      <p style={{ fontSize: '0.85rem', color: '#888' }}>전체 카테고리 {allCats.length}개 (상위 {parents.length}개)</p>
      {parents.map((cat) => {
        const children = getChildren(cat.id)
        const isOpen = expandedParent === cat.id
        return (
          <div key={cat.id}>
            <div style={{ ...S.card, alignItems: 'center' }}>
              {children.length > 0 && (
                <button onClick={() => setExpandedParent(isOpen ? null : cat.id)}
                  style={{ ...S.btn('rgba(108,92,231,0.08)', '#6c5ce7', '1px solid rgba(108,92,231,0.2)'), padding: '4px 8px', fontSize: '0.75rem' }}>
                  {isOpen ? '▼' : '▶'} {children.length}
                </button>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 3 }}>
                  <span style={{ fontSize: '1.1rem' }}>{cat.emoji || '📁'}</span>
                  {cat.label}
                  {children.length > 0 && <span style={{ fontSize: '0.7rem', color: '#6c5ce7', background: 'rgba(108,92,231,0.1)', padding: '1px 6px', borderRadius: 4 }}>하위 {children.length}개</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                  ID: <code style={{ background: 'rgba(108,92,231,0.08)', color: '#6c5ce7', padding: '1px 5px', borderRadius: 3 }}>{cat.id}</code>
                </div>
              </div>
              <button onClick={() => handleDelete(cat.id, cat.label)} style={S.btn('rgba(231,76,60,0.1)', '#e74c3c', '1px solid rgba(231,76,60,0.3)')}>🗑️</button>
            </div>
            {/* 하위 카테고리 */}
            {isOpen && children.map(child => (
              <div key={child.id} style={{ ...S.card, alignItems: 'center', marginLeft: '2rem', marginTop: '0.3rem', borderLeft: '3px solid #6c5ce7' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{child.emoji || '📁'}</span> {child.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#aaa' }}>ID: {child.id}</div>
                </div>
                <select
                  value={child.parent_id || ''}
                  onChange={e => handleReassign(child.id, e.target.value)}
                  style={{ padding: '0.3rem 0.5rem', border: '1px solid #d1d5db', borderRadius: 5, fontSize: '0.75rem' }}
                >
                  <option value="">최상위로 이동</option>
                  {parents.filter(p => p.id !== child.id).map(p => <option key={p.id} value={p.id}>{p.label} 하위</option>)}
                </select>
                <button onClick={() => handleDelete(child.id, child.label)} style={S.btn('rgba(231,76,60,0.1)', '#e74c3c', '1px solid rgba(231,76,60,0.3)')}>🗑️</button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ── 방문자 관리 탭 ── */
function VisitorsTab({ msg, setMsg }) {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState({})

  useEffect(() => { fetchVisits() }, [])

  const fetchVisits = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('site_visits')
      .select('*')
      .order('visit_date', { ascending: false })
      .limit(30)
    setVisits(data || [])
    const init = {}
    ;(data || []).forEach(v => { init[v.visit_date] = v.count })
    setEditing(init)
    setLoading(false)
  }

  const totalCount = visits.reduce((sum, v) => sum + (v.count || 0), 0)

  const handleSave = async (visitDate) => {
    const newCount = Math.max(0, parseInt(editing[visitDate]) || 0)
    const { error } = await supabase
      .from('site_visits')
      .update({ count: newCount })
      .eq('visit_date', visitDate)
    if (error) { setMsg({ type: 'error', text: `저장 실패: ${error.message}` }); return }
    setMsg({ type: 'success', text: `${visitDate} 방문자 수 저장 완료` })
    setVisits(prev => prev.map(v => v.visit_date === visitDate ? { ...v, count: newCount } : v))
    setTimeout(() => setMsg(null), 2000)
  }

  const handleDelete = async (visitDate) => {
    if (!confirm(`${visitDate} 기록을 삭제하시겠습니까?`)) return
    const { error } = await supabase.from('site_visits').delete().eq('visit_date', visitDate)
    if (error) { setMsg({ type: 'error', text: `삭제 실패: ${error.message}` }); return }
    setVisits(prev => prev.filter(v => v.visit_date !== visitDate))
    setMsg({ type: 'success', text: `${visitDate} 기록 삭제 완료` })
    setTimeout(() => setMsg(null), 2000)
  }

  if (loading) return <p style={{ color: '#888', padding: '2rem' }}>불러오는 중...</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 요약 */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140, border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.2rem', background: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: 4 }}>오늘 방문자</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6c5ce7' }}>
            {(visits[0]?.visit_date === new Date().toISOString().slice(0, 10) ? visits[0]?.count : 0).toLocaleString()}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 140, border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.2rem', background: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: 4 }}>총 방문자 (최근 30일)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f39c12' }}>{totalCount.toLocaleString()}</div>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#888' }}>최근 30일 기록</p>
      {visits.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>방문 기록이 없습니다.</p>}
      {visits.map((v) => (
        <div key={v.visit_date} style={{ ...S.card, alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.visit_date}</div>
              <div style={{ fontSize: '0.72rem', color: '#aaa' }}>
                {new Date(v.visit_date + 'T00:00:00').toLocaleDateString('ko-KR', { weekday: 'long' })}
              </div>
            </div>
            <div>
              <label style={S.label}>방문자 수</label>
              <input
                style={{ ...S.input, width: 100 }}
                type="number"
                min="0"
                value={editing[v.visit_date] ?? v.count}
                onChange={(e) => setEditing(prev => ({ ...prev, [v.visit_date]: e.target.value }))}
              />
            </div>
            <button onClick={() => handleSave(v.visit_date)} style={S.btn('#6c5ce7', '#fff')}>💾 저장</button>
          </div>
          <button onClick={() => handleDelete(v.visit_date)} style={S.btn('rgba(231,76,60,0.1)', '#e74c3c', '1px solid rgba(231,76,60,0.3)')}>🗑️</button>
        </div>
      ))}
    </div>
  )
}

/* ── 회원 관리 탭 ── */
function MembersTab({ msg, setMsg }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})

  useEffect(() => { fetchMembers() }, [])

  const fetchMembers = async () => {
    setLoading(true)

    // user_profiles 뷰에서 회원 목록 가져오기
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // 뷰가 없으면 앱/리뷰 테이블에서 유저 정보 집계
      const [{ data: appData }, { data: reviewData }] = await Promise.all([
        supabase.from('apps').select('creator_email, creator_name, created_at'),
        supabase.from('app_reviews').select('user_email, user_name, created_at'),
      ])

      const userMap = {}
      ;(appData || []).forEach(a => {
        if (a.creator_email) {
          if (!userMap[a.creator_email]) userMap[a.creator_email] = { email: a.creator_email, name: a.creator_name || '익명', apps: 0, reviews: 0, chats: 0, first_seen: a.created_at }
          userMap[a.creator_email].apps++
          if (a.created_at < userMap[a.creator_email].first_seen) userMap[a.creator_email].first_seen = a.created_at
        }
      })
      ;(reviewData || []).forEach(r => {
        if (r.user_email) {
          if (!userMap[r.user_email]) userMap[r.user_email] = { email: r.user_email, name: r.user_name || '익명', apps: 0, reviews: 0, chats: 0, first_seen: r.created_at }
          userMap[r.user_email].reviews++
        }
      })

      setMembers(Object.values(userMap).sort((a, b) => new Date(b.first_seen) - new Date(a.first_seen)))
      setStats({ total: Object.keys(userMap).length, method: 'fallback' })
      setLoading(false)
      return
    }

    // 유저별 활동 통계
    const [{ data: appData }, { data: reviewData }] = await Promise.all([
      supabase.from('apps').select('creator_email'),
      supabase.from('app_reviews').select('user_email'),
    ])

    const appCount = {}
    ;(appData || []).forEach(a => { if (a.creator_email) appCount[a.creator_email] = (appCount[a.creator_email] || 0) + 1 })
    const reviewCount = {}
    ;(reviewData || []).forEach(r => { if (r.user_email) reviewCount[r.user_email] = (reviewCount[r.user_email] || 0) + 1 })

    const enriched = (users || []).map(u => ({
      ...u,
      name: u.display_name || u.email?.split('@')[0] || '익명',
      apps: appCount[u.email] || 0,
      reviews: reviewCount[u.email] || 0,
    }))

    setMembers(enriched)
    setStats({ total: enriched.length, method: 'view' })
    setLoading(false)
  }

  if (loading) return <p style={{ color: '#888', padding: '2rem' }}>불러오는 중...</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 요약 */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140, border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.2rem', background: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: 4 }}>총 회원 수</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6c5ce7' }}>{stats.total?.toLocaleString()}</div>
        </div>
        <div style={{ flex: 1, minWidth: 140, border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.2rem', background: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: 4 }}>앱 등록 회원</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00b894' }}>{members.filter(m => m.apps > 0).length}</div>
        </div>
      </div>

      {stats.method === 'fallback' && (
        <div style={{ padding: '0.6rem 1rem', borderRadius: 6, fontSize: '0.78rem', background: 'rgba(243,156,18,0.1)', border: '1px solid rgba(243,156,18,0.3)', color: '#f39c12' }}>
          ⚠️ user_profiles 뷰가 없어 활동 데이터에서 회원 정보를 집계했습니다. Supabase에서 SQL을 실행하면 전체 회원 목록을 볼 수 있습니다.
        </div>
      )}

      <p style={{ fontSize: '0.85rem', color: '#888' }}>전체 회원 {members.length}명</p>

      {members.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>가입한 회원이 없습니다.</p>}

      {/* 회원 목록 */}
      {members.map((m, idx) => (
        <div key={m.id || m.email || idx} style={{ ...S.card, alignItems: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: `hsl(${(m.name || '').charCodeAt(0) * 37 % 360}, 60%, 65%)`,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1rem',
          }}>
            {(m.name || '?').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>
              {m.name || '익명'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#aaa', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span>{m.email || '-'}</span>
              {m.created_at && (
                <span>가입: {new Date(m.created_at).toLocaleDateString('ko-KR')}</span>
              )}
              {m.last_sign_in_at && (
                <span>최근접속: {new Date(m.last_sign_in_at).toLocaleDateString('ko-KR')}</span>
              )}
              {!m.created_at && m.first_seen && (
                <span>첫 활동: {new Date(m.first_seen).toLocaleDateString('ko-KR')}</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            {m.apps > 0 && (
              <span style={{ background: 'rgba(108,92,231,0.1)', color: '#6c5ce7', padding: '3px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                📱 앱 {m.apps}
              </span>
            )}
            {m.reviews > 0 && (
              <span style={{ background: 'rgba(0,184,148,0.1)', color: '#00b894', padding: '3px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                ⭐ 리뷰 {m.reviews}
              </span>
            )}
          </div>
        </div>
      ))}
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
        {[['pending', '⏳ 승인 대기'], ['approved', '📋 앱 관리'], ['reviews', '💬 리뷰 관리'], ['categories', '🏷️ 카테고리'], ['members', '👤 회원'], ['visitors', '👥 방문자']].map(([key, label]) => (
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
      {tab === 'members' && <MembersTab msg={msg} setMsg={setMsg} />}
      {tab === 'visitors' && <VisitorsTab msg={msg} setMsg={setMsg} />}
    </div>
  )
}
