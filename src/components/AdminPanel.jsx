import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth()
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (isAdmin) fetchPending()
  }, [isAdmin])

  const fetchPending = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('apps')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false })
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

  if (authLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
      <p style={{ fontSize: '2rem' }}>🚫</p>
      <p>관리자만 접근할 수 있습니다.</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem', paddingTop: '80px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.5rem' }}>🛡️ 관리자 패널</h1>
      <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        승인 대기 중인 앱 {pending.length}개
      </p>

      {msg && (
        <div style={{
          padding: '0.6rem 1rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.85rem',
          background: msg.type === 'success' ? 'rgba(0,184,148,0.1)' : 'rgba(231,76,60,0.1)',
          border: `1px solid ${msg.type === 'success' ? '#00b894' : '#e74c3c'}`,
          color: msg.type === 'success' ? '#00b894' : '#e74c3c',
        }}>{msg.text}</div>
      )}

      {loading ? (
        <p style={{ color: '#888' }}>불러오는 중...</p>
      ) : pending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888', border: '1px dashed #ddd', borderRadius: 8 }}>
          <p style={{ fontSize: '2rem' }}>✅</p>
          <p>승인 대기 중인 앱이 없습니다.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pending.map((app) => (
            <div key={app.id} style={{
              border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.2rem',
              background: '#fff', display: 'flex', gap: '1rem', alignItems: 'flex-start',
            }}>
              {/* 썸네일 */}
              {app.screenshot_url && (
                <img src={app.screenshot_url} alt={app.title}
                  style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid #eee' }} />
              )}

              {/* 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{app.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: '0.25rem' }}>{app.one_line_desc}</div>
                <div style={{ fontSize: '0.75rem', color: '#aaa', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span>카테고리: {app.category || '기타'}</span>
                  <span>제작자: {app.creator_name || '익명'}</span>
                  <span>이메일: {app.creator_email || '-'}</span>
                  {app.preview_url && (
                    <a href={app.preview_url} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#6c5ce7' }}>↗ 앱 확인</a>
                  )}
                </div>
              </div>

              {/* 버튼 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={() => handleApprove(app.id)}
                  style={{
                    background: '#00b894', color: '#fff', border: 'none',
                    padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700,
                    fontSize: '0.82rem', cursor: 'pointer',
                  }}
                >✅ 승인</button>
                <button
                  onClick={() => handleDelete(app.id)}
                  style={{
                    background: 'rgba(231,76,60,0.1)', color: '#e74c3c',
                    border: '1px solid rgba(231,76,60,0.3)',
                    padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700,
                    fontSize: '0.82rem', cursor: 'pointer',
                  }}
                >🗑️ 삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
