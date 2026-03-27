import { useState, useRef } from 'react'
import { usePlatform } from '../context/PlatformContext'
import './UploadModal.css'

const CATEGORIES = [
  { id: 'webapp', label: '웹앱', icon: '⚡' },
  { id: 'classroom', label: '학급경영도구', icon: '🏫' },
  { id: 'template', label: '템플릿마켓', icon: '📄' },
  { id: 'api', label: '교육 API', icon: '🔗' },
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function UploadModal({ onClose }) {
  const { addItem } = usePlatform()
  const fileRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'done'

  const [form, setForm] = useState({
    category: 'webapp',
    title: '',
    desc: '',
    tags: '',
    author: '',
    school: '',
  })
  const [file, setFile] = useState(null)
  const [fileData, setFileData] = useState(null) // base64 or null
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  function handleFile(f) {
    if (!f) return
    setFile(f)
    if (f.size <= MAX_FILE_SIZE) {
      const reader = new FileReader()
      reader.onload = (e) => setFileData(e.target.result)
      reader.readAsDataURL(f)
    } else {
      setFileData(null)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = '제목을 입력하세요'
    if (!form.desc.trim()) errs.desc = '설명을 입력하세요'
    if (!form.author.trim()) errs.author = '이름을 입력하세요'
    if (!form.school.trim()) errs.school = '학교를 입력하세요'
    if (!file) errs.file = '파일을 첨부하세요'
    return errs
  }

  function submit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      addItem({
        category: form.category,
        title: form.title.trim(),
        desc: form.desc.trim(),
        tags: tags.length > 0 ? tags : [form.category],
        author: form.author.trim() + ' 선생님',
        school: form.school.trim(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: fileData,
      })
      setSubmitting(false)
      setStep('done')
    }, 600)
  }

  if (step === 'done') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal modal--done" onClick={(e) => e.stopPropagation()}>
          <div className="modal__done-icon">✓</div>
          <h2 className="modal__done-title">공유 완료!</h2>
          <p className="modal__done-desc">
            소중한 리소스를 공유해 주셔서 감사합니다.
            <br />
            게시판에서 바로 확인하실 수 있어요.
          </p>
          <button className="modal__done-btn" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">리소스 공유하기</h2>
          <button className="modal__close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <form className="modal__form" onSubmit={submit}>
          {/* Category */}
          <div className="modal__field">
            <label className="modal__label">카테고리</label>
            <div className="modal__cats">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`modal__cat ${form.category === c.id ? 'modal__cat--active' : ''}`}
                  onClick={() => set('category', c.id)}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="modal__field">
            <label className="modal__label">
              제목 <span className="modal__req">*</span>
            </label>
            <input
              className={`modal__input ${errors.title ? 'modal__input--err' : ''}`}
              placeholder="예: 모둠편성 자동화 앱"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              maxLength={60}
            />
            {errors.title && <span className="modal__err">{errors.title}</span>}
          </div>

          {/* Desc */}
          <div className="modal__field">
            <label className="modal__label">
              설명 <span className="modal__req">*</span>
            </label>
            <textarea
              className={`modal__textarea ${errors.desc ? 'modal__input--err' : ''}`}
              placeholder="어떤 문제를 해결하는지, 어떻게 사용하는지 간략히 설명해 주세요"
              value={form.desc}
              onChange={(e) => set('desc', e.target.value)}
              rows={3}
              maxLength={200}
            />
            {errors.desc && <span className="modal__err">{errors.desc}</span>}
          </div>

          {/* Tags */}
          <div className="modal__field">
            <label className="modal__label">태그 (쉼표로 구분)</label>
            <input
              className="modal__input"
              placeholder="예: React, 출석관리, NFC"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
            />
          </div>

          {/* Author + School */}
          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label">
                이름 <span className="modal__req">*</span>
              </label>
              <input
                className={`modal__input ${errors.author ? 'modal__input--err' : ''}`}
                placeholder="홍길동"
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
              />
              {errors.author && <span className="modal__err">{errors.author}</span>}
            </div>
            <div className="modal__field">
              <label className="modal__label">
                학교 <span className="modal__req">*</span>
              </label>
              <input
                className={`modal__input ${errors.school ? 'modal__input--err' : ''}`}
                placeholder="서울 ○○초"
                value={form.school}
                onChange={(e) => set('school', e.target.value)}
              />
              {errors.school && <span className="modal__err">{errors.school}</span>}
            </div>
          </div>

          {/* File Upload */}
          <div className="modal__field">
            <label className="modal__label">
              파일 첨부 <span className="modal__req">*</span>
              <span className="modal__label-hint"> (최대 5MB)</span>
            </label>
            <div
              className={`modal__dropzone ${dragging ? 'modal__dropzone--drag' : ''} ${errors.file ? 'modal__dropzone--err' : ''}`}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              {file ? (
                <div className="modal__file-info">
                  <span className="modal__file-icon">📎</span>
                  <div className="modal__file-meta">
                    <span className="modal__file-name">{file.name}</span>
                    <span className="modal__file-size">{formatBytes(file.size)}</span>
                    {file.size > MAX_FILE_SIZE && (
                      <span className="modal__file-warn">파일이 5MB를 초과합니다</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="modal__file-remove"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setFileData(null) }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="modal__drop-hint">
                  <span className="modal__drop-icon">⬆</span>
                  <span className="modal__drop-text">
                    파일을 끌어다 놓거나 클릭해서 선택하세요
                  </span>
                  <span className="modal__drop-sub">
                    HTML, ZIP, PDF, HWP, 이미지 등
                  </span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => { handleFile(e.target.files[0]); setErrors((err) => ({ ...err, file: '' })) }}
              />
            </div>
            {errors.file && <span className="modal__err">{errors.file}</span>}
          </div>

          <button className="modal__submit" type="submit" disabled={submitting}>
            {submitting ? '업로드 중...' : '공유하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
