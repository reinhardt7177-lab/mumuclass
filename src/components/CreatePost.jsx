import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const CATEGORIES = ['자유', '수업 노하우', '학급 경영', '에듀테크', 'Q&A']

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '자유',
    author_name: user?.user_metadata?.display_name || '',
  })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.from('posts').insert([{
      ...form,
      author_email: user?.email || '',
    }])

    setLoading(false)
    if (error) {
      setMessage({ type: 'error', text: `오류: ${error.message}` })
    } else {
      setMessage({ type: 'success', text: '게시글이 등록되었습니다! 🎉' })
      setTimeout(() => navigate('/community'), 1200)
    }
  }

  return (
    <div className="create-page">
      <h1>✏️ 새 글 작성하기</h1>
      <p>교사 커뮤니티에서 생각과 경험을 나눠보세요.</p>

      <div className="form-card">
        {message && (
          <div className={`alert alert--${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>카테고리</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>작성자 이름</label>
              <input
                type="text"
                name="author_name"
                value={form.author_name}
                onChange={handleChange}
                placeholder="예: 김선생님"
              />
            </div>
          </div>

          <div className="form-group">
            <label>제목 <span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="게시글 제목을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>내용</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="자유롭게 작성해주세요..."
              rows={10}
            />
          </div>

          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? (
              <><span className="spinner" /> 등록 중...</>
            ) : '📝 게시글 올리기'}
          </button>
        </form>
      </div>
    </div>
  )
}
