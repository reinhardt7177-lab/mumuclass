import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Footer } from './Footer'

const FALLBACK_CATEGORIES = ['전체', '학급관리', '수학', '국어', '게임', '에듀테크', '기타']

export default function AppLabBoard() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('전체')
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('app_categories')
      .select('label')
      .order('sort_order', { ascending: true })
    if (data && data.length > 0) {
      setCategories(['전체', ...data.map((c) => c.label)])
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('app_requests')
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

  const handleWriteClick = () => {
    if (!user) {
      navigate('/login')
    } else {
      navigate('/ai-tech/write')
    }
  }

  return (
    <>
      <div className="community">
        <div className="community__header">
          <div>
            <h1>🛠️ 나만의앱 요청게시판</h1>
            <p>원하는 교육 앱을 요청하세요 — 선생님의 아이디어가 실제 앱이 됩니다</p>
          </div>
          <button className="board__create-btn" onClick={handleWriteClick}>
            ✏️ 요청 글쓰기
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="community__tabs">
          {categories.map((cat) => (
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
            <p>아직 요청글이 없습니다</p>
            <button
              className="btn btn--primary"
              style={{ marginTop: '1rem' }}
              onClick={handleWriteClick}
            >
              첫 번째 요청 작성하기
            </button>
          </div>
        ) : (
          <div className="post-list">
            {filtered.map((post) => (
              <Link to={`/ai-tech/${post.id}`} key={post.id} className="post-item">
                <div className="post-item__left">
                  <span className="post-item__category">{post.category || '기타'}</span>
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
      <Footer />
    </>
  )
}
