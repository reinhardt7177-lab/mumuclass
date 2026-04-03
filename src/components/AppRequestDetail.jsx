import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'mumuclass@mumuclass.kr'
const CATEGORIES = ['학급관리', '수학', '국어', '게임', '에듀테크', '기타']

/* ── 관리자 수정 모달 ── */
function EditModal({ post, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: post.title || '',
    content: post.content || '',
    category: post.category || '기타',
    author_name: post.author_name || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('제목을 입력해 주세요.'); return }
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('app_requests')
      .update({
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        author_name: form.author_name.trim(),
      })
      .eq('id', post.id)
    if (err) {
      setError(`저장 실패: ${err.message}`)
      setSaving(false)
    } else {
      onSaved()
      onClose()
    }
  }

  return (
    <div className="upload-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="upload-modal">
        <button className="upload-modal__close" onClick={onClose}>✕</button>
        <div className="upload-modal__header">
          <span className="upload-modal__pixel" />
          <h2 className="upload-modal__title">🛡️ 관리자 수정</h2>
        </div>

        {error && <div className="upload-alert upload-alert--error">{error}</div>}

        <form onSubmit={handleSave}>
          <div className="upload-field">
            <label className="upload-label">카테고리</label>
            <select className="upload-select" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="upload-field">
            <label className="upload-label">작성자 이름</label>
            <input className="upload-input" type="text" name="author_name" value={form.author_name} onChange={handleChange} />
          </div>
          <div className="upload-field">
            <label className="upload-label">제목 <span>*</span></label>
            <input className="upload-input" type="text" name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="upload-field">
            <label className="upload-label">내용</label>
            <textarea
              className="upload-input"
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={8}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
          <button type="submit" className="upload-submit" disabled={saving}>
            {saving ? '저장 중...' : '✏️ 수정 저장'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function AppRequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  const isAdmin = user?.email === ADMIN_EMAIL
  const isOwner = user && post && (user.email === post.author_email || user.id === post.user_id)
  const canEdit = isAdmin || isOwner
  const canDelete = isAdmin || isOwner

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('app_requests')
      .select('*')
      .eq('id', id)
      .single()
    if (data) {
      setPost(data)
      supabase.from('app_requests').update({ views: (data.views || 0) + 1 }).eq('id', id)
    }
    setLoading(false)
  }

  const handleLike = async () => {
    if (!post) return
    const newLikes = (post.likes || 0) + 1
    await supabase.from('app_requests').update({ likes: newLikes }).eq('id', id)
    setPost({ ...post, likes: newLikes })
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('app_requests').delete().eq('id', id)
    navigate('/ai-tech')
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="board__empty" style={{ paddingTop: '8rem' }}>
        <div className="board__empty-icon">⏳</div>
        <p>게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="board__empty" style={{ paddingTop: '8rem' }}>
        <div className="board__empty-icon">😥</div>
        <p>게시글을 찾을 수 없습니다</p>
        <Link to="/ai-tech" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="post-detail">
        <Link to="/ai-tech" className="post-detail__back">← 나만의앱 요청게시판</Link>

        <div className="post-detail__card">
          <div className="post-detail__header">
            <span className="post-item__category">{post.category || '기타'}</span>
            <h1 className="post-detail__title">{post.title}</h1>
            <div className="post-detail__info">
              <div className="post-detail__author">
                <span className="post-item__avatar">{post.author_name?.charAt(0) || '?'}</span>
                <span>{post.author_name || '익명'}</span>
              </div>
              <span className="post-detail__date">{formatDate(post.created_at)}</span>
              <span className="post-detail__stat">👁️ {post.views || 0}</span>
              <span className="post-detail__stat">❤️ {post.likes || 0}</span>
              {isAdmin && (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f39c12', background: 'rgba(243,156,18,0.12)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(243,156,18,0.3)' }}>
                  🛡️ 관리자 모드
                </span>
              )}
            </div>
          </div>

          <div className="post-detail__content">
            {post.content?.split('\n').map((line, i) => (
              <p key={i}>{line || <br />}</p>
            ))}
          </div>

          <div className="post-detail__actions">
            <button className="post-detail__like-btn" onClick={handleLike}>
              ❤️ 좋아요 {post.likes || 0}
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {canEdit && (
                <button className="post-detail__delete-btn"
                  style={{ background: 'rgba(108,92,231,0.12)', color: '#6c5ce7', border: '1px solid rgba(108,92,231,0.3)' }}
                  onClick={() => setShowEdit(true)}
                >
                  ✏️ 수정
                </button>
              )}
              {canDelete && (
                <button className="post-detail__delete-btn" onClick={handleDelete}>
                  🗑️ 삭제
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditModal
          post={post}
          onClose={() => setShowEdit(false)}
          onSaved={fetchPost}
        />
      )}
    </>
  )
}
