import { useState, useEffect } from 'react'
import { Footer } from './Footer'

const MILKIT_PASSWORD = import.meta.env.VITE_MILKIT_PASSWORD || 'mumuclass2026'

const RESOURCES = [
  { id: 1, title: '바이브코딩 완벽 가이드', desc: '프롬프트 작성부터 배포까지 A to Z', icon: '📘', tag: '가이드' },
  { id: 2, title: '교실용 앱 템플릿 모음', desc: '출석체크, 자리배치, 퀴즈 등 바로 쓸 수 있는 템플릿', icon: '🧩', tag: '템플릿' },
  { id: 3, title: 'AI 프롬프트 치트시트', desc: 'Claude, GPT에서 바로 복붙 가능한 교육용 프롬프트', icon: '🤖', tag: '프롬프트' },
  { id: 4, title: '학급경영 디지털 도구 모음', desc: '무료 에듀테크 도구 100선 + 활용 팁', icon: '🛠️', tag: '도구' },
  { id: 5, title: '수업자료 디자인 팩', desc: '캔바/피그마용 수업자료 템플릿 + 아이콘 세트', icon: '🎨', tag: '디자인' },
  { id: 6, title: '코딩 수업 커리큘럼', desc: '초등~중등 단계별 코딩 수업 지도안', icon: '💻', tag: '커리큘럼' },
]

export default function MilkitPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('milkit_auth')
    if (saved === 'true') setAuthenticated(true)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === MILKIT_PASSWORD) {
      setAuthenticated(true)
      sessionStorage.setItem('milkit_auth', 'true')
      setError('')
    } else {
      setError('비밀번호가 올바르지 않습니다')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  if (!authenticated) {
    return (
      <>
        <div className="milkit-gate">
          <div className={`milkit-gate__card ${shake ? 'milkit-gate__card--shake' : ''}`}>
            <div className="milkit-gate__icon">🔐</div>
            <h1 className="milkit-gate__title">VIP 밀키트</h1>
            <p className="milkit-gate__desc">이 자료실은 VIP 전용입니다.<br />비밀번호를 입력해 주세요.</p>
            <form onSubmit={handleSubmit} className="milkit-gate__form">
              <input
                type="password"
                className="milkit-gate__input"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                autoFocus
              />
              <button type="submit" className="milkit-gate__btn">입장하기</button>
            </form>
            {error && <p className="milkit-gate__error">{error}</p>}
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <div className="milkit-page">
        <div className="milkit-header">
          <span className="milkit-header__badge">VIP ONLY</span>
          <h1 className="milkit-header__title">밀키트 자료실</h1>
          <p className="milkit-header__desc">VIP 전용 교육 자료와 템플릿을 만나보세요</p>
        </div>

        <div className="milkit-grid">
          {RESOURCES.map((res) => (
            <div key={res.id} className="milkit-card">
              <div className="milkit-card__icon">{res.icon}</div>
              <div className="milkit-card__body">
                <span className="milkit-card__tag">{res.tag}</span>
                <h3 className="milkit-card__title">{res.title}</h3>
                <p className="milkit-card__desc">{res.desc}</p>
              </div>
              <button className="milkit-card__btn">준비중</button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}
