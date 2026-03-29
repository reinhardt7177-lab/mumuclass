import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './PostModal.css'

const CATEGORIES = [
  { id: 'webapp', label: '웹앱', icon: '⚡' },
  { id: 'classroom', label: '학급경영도구', icon: '🏫' },
  { id: 'template', label: '템플릿마켓', icon: '📄' },
  { id: 'api', label: '교육 API', icon: '🔗' },
]

const STATUS_OPTIONS = ['Live', 'Beta', 'Dev', 'Funding']

const EMPTY_FORM = {
  title: '',
  description: '',
  author: '',
  school: '',
  category: 'webapp',
  tags: '',
  status: 'Beta',
}

export function PostModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.title.trim() || !form.description.trim() || !form.author.trim() || !form.school.trim()) {
      setError('필수 항목을 모두 입력해 주세요.')
      return
    }

    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    setLoading(true)
    const { error: sbError } = await supabase.from('platform_posts').insert({
      title: form.title.trim(),
      description: form.description.trim(),
      author: form.author.trim(),
      school: form.school.trim(),
      category: form.category,
      tags: tagsArray,
      status: form.status,
    })
    setLoading(false)

    if (sbError) {
      setError('게시 중 오류가 발생했습니다: ' + sbError.message)
      return
    }

    onSuccess?.()
    onClose()
  }

  return (
    <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm">
        <div className="pm__header">
          <h2 className="pm__title">플랫폼 공유하기</h2>
          <button className="pm__close" onClick={onClose}>✕</button>
        </div>

        <form className="pm__form" onSubmit={handleSubmit}>
          <div className="pm__field">
            <label className="pm__label">제목 *</label>
            <input
              className="pm__input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="앱/도구/템플릿 이름"
              maxLength={60}
            />
          </div>

          <div className="pm__field">
            <label className="pm__label">설명 *</label>
            <textarea
              className="pm__textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="어떤 기능을 하는지 간략하게 설명해 주세요"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="pm__row">
            <div className="pm__field">
              <label className="pm__label">작성자 *</label>
              <input
                className="pm__input"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="홍길동 선생님"
              />
            </div>
            <div className="pm__field">
              <label className="pm__label">학교/소속 *</label>
              <input
                className="pm__input"
                name="school"
                value={form.school}
                onChange={handleChange}
                placeholder="서울 한강초"
              />
            </div>
          </div>

          <div className="pm__row">
            <div className="pm__field">
              <label className="pm__label">카테고리</label>
              <select className="pm__select" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div className="pm__field">
              <label className="pm__label">상태</label>
              <select className="pm__select" name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pm__field">
            <label className="pm__label">태그 (쉼표로 구분)</label>
            <input
              className="pm__input"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="React, NFC, 출석관리"
            />
          </div>

          {error && <p className="pm__error">{error}</p>}

          <div className="pm__actions">
            <button type="button" className="pm__cancel" onClick={onClose}>취소</button>
            <button type="submit" className="pm__submit" disabled={loading}>
              {loading ? '게시 중...' : '공유하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
