import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function UploadModal({ user, onClose, onSuccess, categories }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    url: '',
    category: categories.length > 0 ? categories[0].id : 'etc',
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // 카테고리가 변경되면 form 업데이트
  useEffect(() => {
    if (categories.length > 0 && !categories.find(c => c.id === form.category)) {
      setForm({ ...form, category: categories[0].id })
    }
  }, [categories])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleThumbnail = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.url) {
      setError('앱 이름, 설명, URL은 필수입니다.')
      return
    }

    setUploading(true)
    setError('')

    try {
      let thumbnailUrl = null

      // 1. 썸네일 이미지 업로드
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(fileName, thumbnailFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(fileName)

        thumbnailUrl = publicUrl
      }

      // 2. DB에 앱 정보 저장
      const { error: insertError } = await supabase
        .from('vibe_apps')
        .insert({
          title: form.title,
          description: form.description,
          url: form.url,
          category: form.category,
          thumbnail_url: thumbnailUrl,
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || '익명',
        })

      if (insertError) throw insertError

      onSuccess()
    } catch (err) {
      setError('업로드 중 오류가 발생했어요: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="upload-title">🚀 바이브앱 등록</h2>

        <div className="upload-form">
          <label>앱 이름 *</label>
          <input
            type="text"
            name="title"
            placeholder="예: 수학 퀴즈왕"
            value={form.title}
            onChange={handleChange}
          />

          <label>앱 설명 *</label>
          <textarea
            name="description"
            placeholder="어떤 앱인지 간단히 설명해 주세요"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />

          <label>앱 URL *</label>
          <input
            type="url"
            name="url"
            placeholder="https://..."
            value={form.url}
            onChange={handleChange}
          />

          <label>카테고리</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          <label>썸네일 이미지</label>
          <input type="file" accept="image/*" onChange={handleThumbnail} />
          {thumbnailPreview && (
            <img src={thumbnailPreview} alt="미리보기" className="thumbnail-preview" />
          )}

          {error && <p className="upload-error">⚠️ {error}</p>}

          <button
            className="btn-submit retro-btn"
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? '⏳ 업로드 중...' : '📤 앱 등록하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
