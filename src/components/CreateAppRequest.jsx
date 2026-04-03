import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const CATEGORIES = ['학급관리', '수학', '국어', '게임', '에듀테크', '기타']

export default function CreateAppRequest() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '기타',
    author_name: user?.user_metadata?.display_name || '',
  })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: '제목을 입력해 주세요.' })
      return
    }
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.from('app_requests').insert([{
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      author_name: form.author_name.trim() ||
        user?.user_metadata?.display_name ||
        user?.email?.split('@')[0] || '익명',
      author_email: user?.email || '',
      user_id: user?.id || null,
    }])

    setLoading(false)
    if (error) {
      setMessage({ type: 'error', text: `오류: ${error.message}` })
    } else {
      setMessage({ type: 'success', text: '요청이 등록되었습니다! 🎉' })
      setTimeout(() => navigate('/ai-tech'), 1200)
    }
  }

  return (
    <div className="create-page">
      <Link to="/ai-tech" className="post-detail__back">← 목록으로</Link>
      <h1>✏️ 앱 요청 작성하기</h1>
      <p>원하는 교육 앱을 구체적으로 설명해 주세요. 선생님의 아이디어가 실제 앱이 됩니다!</p>

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
                placeholder={user?.user_metadata?.display_name || user?.email?.split('@')[0] || '익명'}
              />
            </div>
          </div>

          <div className="form-group">
            <label>요청 제목 <span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="예: 수업 시간 타이머 앱이 필요해요"
              required
            />
          </div>

          <div className="form-group">
            <label>상세 내용</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="어떤 기능이 필요한지, 어떤 상황에서 쓸 건지 자세히 적어주세요..."
              rows={10}
            />
          </div>

          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? (
              <><span className="spinner" /> 등록 중...</>
            ) : '🚀 요청 올리기'}
          </button>
        </form>
      </div>
    </div>
  )
}
