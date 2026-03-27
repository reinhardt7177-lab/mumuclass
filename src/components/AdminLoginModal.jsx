import { useState } from 'react'
import { usePlatform } from '../context/PlatformContext'
import './AdminLoginModal.css'

export function AdminLoginModal({ onClose }) {
  const { adminLogin } = usePlatform()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function submit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const ok = adminLogin(id, pw)
      if (ok) {
        onClose()
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다')
        setLoading(false)
      }
    }, 400)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__icon">🔐</div>
        <h2 className="admin-modal__title">관리자 로그인</h2>
        <p className="admin-modal__sub">mumuclass 플랫폼 관리자 전용</p>

        <form className="admin-modal__form" onSubmit={submit}>
          <div className="admin-modal__field">
            <label className="admin-modal__label">아이디</label>
            <input
              className="admin-modal__input"
              type="text"
              placeholder="admin@mumuclass.kr"
              value={id}
              onChange={(e) => { setId(e.target.value); setError('') }}
              autoComplete="username"
            />
          </div>

          <div className="admin-modal__field">
            <label className="admin-modal__label">비밀번호</label>
            <div className="admin-modal__pw-wrap">
              <input
                className="admin-modal__input"
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError('') }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-modal__eye"
                onClick={() => setShowPw((s) => !s)}
                tabIndex={-1}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && <p className="admin-modal__err">{error}</p>}

          <button
            className="admin-modal__submit"
            type="submit"
            disabled={loading || !id || !pw}
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>

        <button className="admin-modal__cancel" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  )
}
