import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
  })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (isSignUp) {
      const { error } = await signUp(form.email, form.password, form.name)
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: '회원가입 완료! 이메일을 확인해주세요. 📧' })
      }
    } else {
      const { error } = await signIn(form.email, form.password)
      if (error) {
        setMessage({ type: 'error', text: '이메일 또는 비밀번호가 올바르지 않습니다.' })
      } else {
        navigate('/')
      }
    }

    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="nav__mark">∞</div>
            <span className="nav__name">
              <span className="nav__name--accent">mumu</span>class
            </span>
          </div>
          <h1>{isSignUp ? '회원가입' : '로그인'}</h1>
          <p>{isSignUp ? '무무클래스에 가입하고 에듀테크를 공유하세요' : '무무클래스에 오신 것을 환영합니다'}</p>
        </div>

        {message && (
          <div className={`alert alert--${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label>이름 (닉네임)</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="예: 김선생"
                required={isSignUp}
              />
            </div>
          )}

          <div className="form-group">
            <label>이메일 <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="teacher@school.kr"
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호 <span className="required">*</span></label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="6자 이상"
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? (
              <><span className="spinner" /> 처리 중...</>
            ) : isSignUp ? '🚀 가입하기' : '로그인'}
          </button>
        </form>

        <div className="login-toggle">
          {isSignUp ? (
            <p>이미 계정이 있으신가요? <button onClick={() => { setIsSignUp(false); setMessage(null) }}>로그인</button></p>
          ) : (
            <p>계정이 없으신가요? <button onClick={() => { setIsSignUp(true); setMessage(null) }}>회원가입</button></p>
          )}
        </div>
      </div>
    </div>
  )
}
