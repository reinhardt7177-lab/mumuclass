import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    setLoading(true)
    const { data } = await supabase.from('posts').select('*').eq('id', id).single()
    if (data) {
      setPost(data)
      // 조회수 증가
      await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', id)
    }
    setLoading(false)
  }

  const handleLike = async () => {
    if (!post) return
    const newLikes = (post.likes || 0) + 1
    await supabase.from('posts').update({ likes: newLikes }).eq('id', id)
    setPost({ ...post, likes: newLikes })
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('posts').delete().eq('id', id)
    navigate('/community')
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
        <Link to="/community" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="post-detail">
      <Link to="/community" className="post-detail__back">← 목록으로</Link>

      <div className="post-detail__card">
        <div className="post-detail__header">
          <span className="post-item__category">{post.category || '자유'}</span>
          <h1 className="post-detail__title">{post.title}</h1>
          <div className="post-detail__info">
            <div className="post-detail__author">
              <span className="post-item__avatar">{post.author_name?.charAt(0) || '?'}</span>
              <span>{post.author_name || '익명'}</span>
            </div>
            <span className="post-detail__date">{formatDate(post.created_at)}</span>
            <span className="post-detail__stat">👁️ {post.views || 0}</span>
            <span className="post-detail__stat">❤️ {post.likes || 0}</span>
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
          {user?.email === post.author_email && (
            <button className="post-detail__delete-btn" onClick={handleDelete}>
              🗑️ 삭제
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
