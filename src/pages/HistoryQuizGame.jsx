import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import HISTORY_QUIZ_DATA from '../data/historyQuizData'
import './HistoryQuizGame.css'

const POINTS_CORRECT = 150
const POINTS_WRONG = 0
const TRAVEL_DURATION = 3200

export default function HistoryQuizGame() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('start') // start | travel | quiz | result
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [results, setResults] = useState([]) // {locationId, correct}
  const [showScorePopup, setShowScorePopup] = useState(false)
  const [particles, setParticles] = useState([])
  const mapRef = useRef(null)

  const locations = HISTORY_QUIZ_DATA.locations
  const currentLocation = locations[currentIndex]
  const totalQuestions = locations.length

  // 맵 스크롤 자동
  useEffect(() => {
    if (mapRef.current && phase === 'quiz') {
      const node = mapRef.current.querySelector('.hq-map-dot.current')
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
  }, [currentIndex, phase])

  const startGame = () => {
    setPhase('travel')
    setCurrentIndex(0)
    setScore(0)
    setResults([])
    setTimeout(() => setPhase('quiz'), TRAVEL_DURATION)
  }

  const spawnParticles = useCallback(() => {
    const emojis = ['⭐', '✨', '🎉', '🏆', '💫', '🌟']
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100,
      top: Math.random() * 60,
      delay: Math.random() * 0.5,
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 2000)
  }, [])

  const handleAnswer = (optionId) => {
    if (answered) return
    setSelected(optionId)
    setAnswered(true)

    const isCorrect = optionId === currentLocation.quiz.answer
    const newResults = [...results, { locationId: currentLocation.id, correct: isCorrect }]
    setResults(newResults)

    if (isCorrect) {
      setScore(prev => prev + POINTS_CORRECT)
      setShowScorePopup(true)
      spawnParticles()
      setTimeout(() => setShowScorePopup(false), 1200)
    }
  }

  const handleNext = () => {
    setSelected(null)
    setAnswered(false)

    if (currentIndex + 1 >= totalQuestions) {
      setPhase('result')
      return
    }

    // 여행 애니메이션 후 다음 퀴즈
    setPhase('travel')
    setCurrentIndex(prev => prev + 1)
    setTimeout(() => setPhase('quiz'), TRAVEL_DURATION)
  }

  const getGrade = () => {
    const correctCount = results.filter(r => r.correct).length
    const rate = correctCount / totalQuestions
    if (rate >= 0.9) return { grade: 'S', text: '역사 대학자', className: 'hq-grade-s' }
    if (rate >= 0.7) return { grade: 'A', text: '조선 선비', className: 'hq-grade-a' }
    if (rate >= 0.5) return { grade: 'B', text: '역사 탐험가', className: 'hq-grade-b' }
    return { grade: 'C', text: '초보 여행자', className: 'hq-grade-c' }
  }

  // ===== 시작 화면 =====
  if (phase === 'start') {
    return (
      <div className="hq-game">
        <div className="hq-start">
          <div className="hq-start-content">
            <div className="hq-gate">🏯</div>
            <h1>조선시대 역사 퀴즈 여행</h1>
            <p>
              경복궁에서 출발하여 조선의 역사적 장소를 여행하며<br />
              퀴즈를 풀어보세요!<br />
              총 {totalQuestions}개의 장소, {totalQuestions}개의 퀴즈가 기다립니다.
            </p>
            <button className="hq-start-btn" onClick={startGame}>
              🚶 여행 시작하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== 여행 애니메이션 =====
  if (phase === 'travel') {
    const loc = locations[currentIndex]
    const sceneryEmojis = ['🌲', '🏔️', '🌳', '⛩️', '🏡', '🌾', '🦌', '🌸']
    return (
      <div className="hq-game">
        <div className="hq-travel-animation">
          <div
            className="hq-travel-bg"
            style={{
              background: `linear-gradient(180deg, ${loc.bgColor}44 0%, ${loc.bgColor} 50%, #0F0F1A 100%)`,
            }}
          />
          <div className="hq-clouds">
            <span>☁️</span>
            <span>⛅</span>
            <span>☁️</span>
          </div>
          <div className="hq-travel-content">
            <div className="hq-travel-emoji">{loc.emoji}</div>
            <div className="hq-travel-location">{loc.name}</div>
            <div className="hq-travel-subtitle">{loc.subtitle}</div>
            <div className="hq-travel-desc">{loc.description}</div>
          </div>
          <div className="hq-walker">🚶</div>
          <div className="hq-travel-scenery">
            {sceneryEmojis.map((e, i) => (
              <span key={i}>{e}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ===== 퀴즈 화면 =====
  if (phase === 'quiz') {
    const quiz = currentLocation.quiz
    const isCorrect = selected === quiz.answer

    return (
      <div className="hq-game">
        {/* 상단 바 */}
        <div className="hq-topbar">
          <div className="hq-topbar-left">
            <span className="hq-question-num">
              질문 {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className="hq-topbar-right">
            <div className="hq-score">🏆 {score}</div>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="hq-progress-bar">
          <div
            className="hq-progress-fill"
            style={{ width: `${((currentIndex + (answered ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* 여행 경로 맵 */}
        <div className="hq-travel-map" ref={mapRef}>
          <div className="hq-map-path">
            {locations.map((loc, i) => {
              const isDone = i < currentIndex || (i === currentIndex && answered)
              const isCurrent = i === currentIndex && !answered
              return (
                <div key={loc.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="hq-map-node">
                    <div
                      className={`hq-map-dot ${isDone ? 'completed' : isCurrent ? 'current' : 'locked'}`}
                    >
                      {isDone ? '✓' : loc.emoji}
                    </div>
                    <span className={`hq-map-label ${isCurrent || isDone ? 'active' : ''}`}>
                      {loc.name}
                    </span>
                  </div>
                  {i < locations.length - 1 && (
                    <div className={`hq-map-line ${isDone ? 'completed' : 'pending'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 퀴즈 내용 */}
        <div className="hq-quiz-screen">
          <div className="hq-location-banner">
            <span className="hq-location-emoji">{currentLocation.emoji}</span>
            <div className="hq-location-name">{currentLocation.name}</div>
            <div className="hq-location-sub">{currentLocation.subtitle}</div>
          </div>

          <div className="hq-quiz-card">
            <div className="hq-quiz-question">{quiz.question}</div>
            <div className="hq-quiz-options">
              {quiz.options.map((opt) => {
                let className = 'hq-option-btn'
                if (answered) {
                  if (opt.id === quiz.answer) className += ' correct'
                  else if (opt.id === selected) className += ' wrong'
                }
                return (
                  <button
                    key={opt.id}
                    className={className}
                    onClick={() => handleAnswer(opt.id)}
                    disabled={answered}
                  >
                    <span className="hq-option-id">{opt.id}</span>
                    <span className="hq-option-emoji">{opt.image}</span>
                    <span>{opt.text}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 피드백 */}
          {answered && (
            <>
              <div className={`hq-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
                <div className="hq-feedback-header">
                  {isCorrect ? '🎉 정답입니다!' : '😅 아쉽네요!'}
                </div>
                <div className="hq-feedback-text">{quiz.explanation}</div>
              </div>
              <button className="hq-next-btn" onClick={handleNext}>
                {currentIndex + 1 >= totalQuestions
                  ? '🏆 결과 보기'
                  : `🚶 다음 장소로 이동 → ${locations[currentIndex + 1]?.name}`}
              </button>
            </>
          )}
        </div>

        {/* 점수 팝업 */}
        {showScorePopup && (
          <div className="hq-score-popup">+{POINTS_CORRECT}점!</div>
        )}

        {/* 파티클 */}
        {particles.length > 0 && (
          <div className="hq-particles">
            {particles.map((p) => (
              <div
                key={p.id}
                className="hq-particle"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  animationDelay: `${p.delay}s`,
                }}
              >
                {p.emoji}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ===== 결과 화면 =====
  if (phase === 'result') {
    const correctCount = results.filter(r => r.correct).length
    const { grade, text, className } = getGrade()

    return (
      <div className="hq-game">
        <div className="hq-result">
          <div className="hq-result-crown">👑</div>
          <h2>여행 완료!</h2>
          <p className="hq-result-subtitle">조선시대 역사 여행을 마쳤습니다</p>

          <div className="hq-result-stats">
            <div className="hq-stat">
              <div className="hq-stat-value">{correctCount}</div>
              <div className="hq-stat-label">정답</div>
            </div>
            <div className="hq-stat">
              <div className="hq-stat-value">{totalQuestions - correctCount}</div>
              <div className="hq-stat-label">오답</div>
            </div>
            <div className="hq-stat">
              <div className="hq-stat-value">{score}</div>
              <div className="hq-stat-label">점수</div>
            </div>
          </div>

          <div className={`hq-result-grade ${className}`}>
            등급: {grade} — {text}
          </div>

          <div className="hq-result-places">
            <h3>🗺️ 여행 기록</h3>
            <div className="hq-place-list">
              {locations.map((loc, i) => (
                <div key={loc.id} className="hq-place-item">
                  <span className="hq-place-icon">{loc.emoji}</span>
                  <span className="hq-place-name">{loc.name}</span>
                  <span className="hq-place-result">
                    {results[i]?.correct ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="hq-result-btns">
            <button className="hq-restart-btn" onClick={startGame}>
              🔄 다시 여행하기
            </button>
            <button className="hq-home-btn" onClick={() => navigate('/')}>
              🏠 홈으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
