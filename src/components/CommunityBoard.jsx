import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const CATEGORIES = ['전체', '자유', '수업 노하우', '학급 경영', '에듀테크', 'Q&A']

export default function CommunityBoard() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('전체')
  const { user } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPosts(data)
    setLoading(false)
  }

  const filtered = activeCategory === '전체'
    ? posts
    : posts.filter((p) => p.category === activeCategory)

  const formatDate = (dateStr) => {
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
    return `${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  return (
    <div className="community">
      <div className="community__header">
        <div>
          <h1>💬 교사 커뮤니티</h1>
          <p>수업 노하우, 학급 경영 팁, 에듀테크 인사이트를 자유롭게 나누세요</p>
        </div>
        <Link to="/community/write" className="board__create-btn">✏️ 글쓰기</Link>
      </div>

      {/* 카테고리 필터 탭 */}
      <div className="community__tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`community__tab ${activeCategory === cat ? 'community__tab--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
            {cat !== '전체' && (
              <span className="community__tab-count">
                {posts.filter((p) => p.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 게시글 리스트 */}
      {loading ? (
        <div className="board__empty">
          <div className="board__empty-icon">⏳</div>
          <p>게시글을 불러오는 중...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="board__empty">
          <div className="board__empty-icon">📝</div>
          <p>아직 게시글이 없습니다</p>
          <Link to="/community/write" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            첫 번째 글 작성하기
          </Link>
        </div>
      ) : (
        <div className="post-list">
          {filtered.map((post) => (
            <Link to={`/community/${post.id}`} key={post.id} className="post-item">
              <div className="post-item__left">
                <span className="post-item__category">{post.category || '자유'}</span>
                <h3 className="post-item__title">{post.title}</h3>
                <p className="post-item__preview">
                  {post.content?.length > 80 ? post.content.slice(0, 80) + '...' : post.content}
                </p>
              </div>
              <div className="post-item__right">
                <div className="post-item__meta">
                  <span className="post-item__author">
                    <span className="post-item__avatar">
                      {post.author_name?.charAt(0) || '?'}
                    </span>
                    {post.author_name || '익명'}
                  </span>
                  <span className="post-item__time">{formatDate(post.created_at)}</span>
                </div>
                <div className="post-item__stats">
                  <span>👁️ {post.views || 0}</span>
                  <span>❤️ {post.likes || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
