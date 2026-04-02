import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''

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
  const [editing, setEditing] = useState({}) // { [id]: { rating, view_count } }

  useEffect(() => { fetchApproved() }, [])

  const fetchApproved = async () => {
    setLoading(true)
    const { data } = await supabase.from('apps').select('*').eq('approved', true).order('created_at', { ascending: false })
    setApps(data || [])
    // editing 초기값 세팅
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

            {/* 앱 정보 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 3 }}>{app.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: 8, display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span>{app.category || '기타'}</span>
                <span>by {app.creator_name || '익명'}</span>
                {app.preview_url && <a href={app.preview_url} target="_blank" rel="noopener noreferrer" style={{ color: '#6c5ce7' }}>↗ 확인</a>}
              </div>

              {/* 별점 / 조회수 편집 */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <label style={S.label}>⭐ 별점 (0–5)</label>
                  <input
                    style={S.input}
                    type="number" min="0" max="5" step="0.1"
                    value={vals.rating}
                    onChange={(e) => handleFieldChange(app.id, 'rating', e.target.value)}
                  />
                </div>
                <div>
                  <label style={S.label}>👁️ 조회수</label>
                  <input
                    style={S.input}
                    type="number" min="0" step="1"
                    value={vals.view_count}
                    onChange={(e) => handleFieldChange(app.id, 'view_count', e.target.value)}
                  />
                </div>
                <button onClick={() => handleSave(app)} style={S.btn('#6c5ce7', '#fff')}>💾 저장</button>
              </div>
            </div>

            {/* 우측 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
              <button
                onClick={() => handleToggleBest(app)}
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
  const [appMap, setAppMap] = useState({}) // { app_id: title }

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

/* ── 메인 ── */
export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState('pending') // 'pending' | 'approved' | 'reviews'
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
        {[['pending', '⏳ 승인 대기'], ['approved', '📋 앱 관리'], ['reviews', '💬 리뷰 관리']].map(([key, label]) => (
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
    </div>
  )
}
