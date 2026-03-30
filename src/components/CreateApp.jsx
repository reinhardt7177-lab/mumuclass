import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function CreateApp() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({
    title: '',
    one_line_desc: '',
    preview_url: '',
    screenshot_url: '',
    code_access_level: '전체',
    ai_customizing_possible: false,
    rating: '',
    creator_name: '',
    category: '',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.from('apps').insert([
      {
        ...form,
        rating: parseFloat(form.rating) || 0,
        creator_email: user?.email || '',
      },
    ])

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: `오류가 발생했습니다: ${error.message}` })
    } else {
      setMessage({ type: 'success', text: '앱이 성공적으로 등록되었습니다! 🎉' })
      setTimeout(() => navigate('/apps'), 1500)
    }
  }

  return (
    <div className="create-page">
      <h1>📝 새 앱 공유하기</h1>
      <p>선생님이 만든 바이브 코딩 앱을 다른 교사들과 공유하세요.</p>

      <div className="form-card">
        {message && (
          <div className={`alert alert--${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>앱 이름 <span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="예: 출석체크 앱"
              required
            />
          </div>

          <div className="form-group">
            <label>한 줄 설명</label>
            <input
              type="text"
              name="one_line_desc"
              value={form.one_line_desc}
              onChange={handleChange}
              placeholder="예: NFC 태그로 학생 출석을 자동 기록하는 앱"
            />
          </div>

          <div className="form-group">
            <label>미리보기 링크</label>
            <input
              type="url"
              name="preview_url"
              value={form.preview_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>📸 앱 스크린샷 이미지 URL</label>
            <input
              type="url"
              name="screenshot_url"
              value={form.screenshot_url}
              onChange={handleChange}
              placeholder="앱 실행 화면 스크린샷 이미지 주소 (https://...)"
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>앱의 실행 화면 캡처 이미지 URL을 넣으면 게시판에 썸네일로 표시됩니다</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>코드 접근 권한</label>
              <select name="code_access_level" value={form.code_access_level} onChange={handleChange}>
                <option value="전체">전체 공개 (Live)</option>
                <option value="일부">일부 공개 (Beta)</option>
              </select>
            </div>
            <div className="form-group">
              <label>카테고리</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="예: 학급관리, 수학"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>제작 선생님 성함</label>
              <input
                type="text"
                name="creator_name"
                value={form.creator_name}
                onChange={handleChange}
                placeholder="예: 김지우 선생님"
              />
            </div>
            <div className="form-group">
              <label>별점 (0~5)</label>
              <input
                type="number"
                name="rating"
                value={form.rating}
                onChange={handleChange}
                placeholder="4.5"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </div>

          <label className="form-checkbox">
            <input
              type="checkbox"
              name="ai_customizing_possible"
              checked={form.ai_customizing_possible}
              onChange={handleChange}
            />
            AI 커스터마이징 허용 (다른 선생님이 AI로 변형 가능)
          </label>

          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                등록 중...
              </>
            ) : (
              '🚀 앱 공유하기'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
