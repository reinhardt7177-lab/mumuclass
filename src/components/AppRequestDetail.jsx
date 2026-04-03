import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'mumuclass@mumuclass.kr'
const CATEGORIES = ['학급관리', '수학', '국어', '게임', '에듀테크', '기타']

/* ── 수정 모달 ── */
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
          <h2 className="upload-modal__title">✏️ 글 수정</h2>
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

  /* 댓글 */
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  const isAdmin = user?.email === ADMIN_EMAIL
  const isOwner = user && post && (user.email === post.author_email || user.id === post.user_id)
  const canEdit = isAdmin || isOwner
  const canDelete = isAdmin || isOwner

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [id])

  const fetchPost = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('app_requests')
      .select('*')
      .eq('id', id)
      .single()
    if (data) {
      const newViews = (data.views || 0) + 1
      setPost({ ...data, views: newViews })
      await supabase.from('app_requests').update({ views: newViews }).eq('id', id)
    }
    setLoading(false)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('request_comments')
      .select('*')
      .eq('request_id', id)
      .order('created_at', { ascending: true })
    if (data) setComments(data)
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return
    setSubmittingComment(true)
    const { error } = await supabase.from('request_comments').insert({
      request_id: id,
      content: commentText.trim(),
      author_name: user.user_metadata?.display_name || user.email?.split('@')[0] || '익명',
      author_email: user.email,
      user_id: user.id,
    })
    if (!error) {
      setCommentText('')
      await fetchComments()
    }
    setSubmittingComment(false)
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    await supabase.from('request_comments').delete().eq('id', commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const handleLike = async () => {
    if (!post) return
    if (!user) { navigate('/login'); return }
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

  const formatCommentDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '방금 전'
    if (mins < 60) return `${mins}분 전`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}일 전`
    return `${d.getMonth() + 1}/${d.getDate()}`
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

        {/* ── 댓글 섹션 ── */}
        <div className="post-detail__card" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
            💬 댓글 <span style={{ color: '#888', fontWeight: 400 }}>({comments.length})</span>
          </h2>

          {/* 댓글 입력 */}
          {user ? (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6c5ce7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                {user.user_metadata?.display_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={2}
                style={{ flex: 1, padding: '0.6rem 0.8rem', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit' }}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || submittingComment}
                style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: commentText.trim() ? '#6c5ce7' : '#ddd', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: commentText.trim() ? 'pointer' : 'default' }}
              >
                {submittingComment ? '...' : '등록'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', marginBottom: '1rem', background: '#f9fafb', borderRadius: 8, fontSize: '0.88rem', color: '#888' }}>
              댓글을 남기려면 <Link to="/login" style={{ color: '#6c5ce7', fontWeight: 700 }}>로그인</Link>해 주세요.
            </div>
          )}

          {/* 댓글 목록 */}
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#aaa', fontSize: '0.88rem' }}>
              아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comments.map((c) => {
                const canDeleteComment = isAdmin || (user && (user.email === c.author_email || user.id === c.user_id))
                return (
                  <div key={c.id} style={{ display: 'flex', gap: '0.6rem', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5e7eb', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                      {c.author_name?.charAt(0) || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.author_name || '익명'}</span>
                        <span style={{ fontSize: '0.72rem', color: '#aaa' }}>{formatCommentDate(c.created_at)}</span>
                        {isAdmin && c.author_email !== ADMIN_EMAIL && (
                          <span style={{ fontSize: '0.65rem', color: '#aaa' }}>{c.author_email}</span>
                        )}
                        {canDeleteComment && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            style={{ fontSize: '0.7rem', color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 'auto' }}
                          >삭제</button>
                        )}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.5 }}>
                        {c.content?.split('\n').map((line, i) => (
                          <span key={i}>{line}{i < c.content.split('\n').length - 1 && <br />}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
