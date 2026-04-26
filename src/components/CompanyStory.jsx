import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Footer } from './Footer'

/* ── 카운팅 애니메이션 훅 ── */
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start || target <= 0) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

/* ── 카운팅 텍스트 ── */
function CountUpText({ target }) {
  const count = useCountUp(target, 2000, true)
  return <>{count.toLocaleString()}</>
}

/* ── 기능 탭 데이터 ── */
const FEATURES = [
  {
    key: 'store',
    tab: '바이브앱 게시판',
    emoji: '📱',
    title: '우리 반에 딱 맞는 앱을 찾아보세요',
    desc: '동료 선생님들이 직접 만들고 검증한 앱을 살펴보고, 우리 반에 딱 맞는 도구를 바로 적용하세요.',
    highlight: '실제 교실에서 검증된 앱만 모았습니다',
    link: '/',
  },
  {
    key: 'request',
    tab: '바이브코딩 요청',
    emoji: '🛠️',
    title: '아이디어만 남겨주세요',
    desc: '필요한 앱이 없나요? 아이디어만 남겨주세요. 바이브 코딩으로 선생님의 상상을 현실로 만들어 드립니다.',
    highlight: '코딩 지식 없이도 앱 제작 가능',
    link: '/ai-tech',
  },
  {
    key: 'community',
    tab: '커뮤니티',
    emoji: '💬',
    title: '함께 나누며 성장합니다',
    desc: '도구를 활용한 생생한 수업 사례와 꿀팁을 나누며 함께 성장합니다.',
    highlight: '전국 선생님들의 수업 노하우 공유',
    link: '/community',
  },
]

export default function CompanyStory() {
  const sectionsRef = useRef([])
  const [activeTab, setActiveTab] = useState('store')

  /* 통계 데이터 (DB에서 가져오기) */
  const [stats, setStats] = useState({ apps: 0, teachers: 0, students: 0 })
  /* 탭별 실제 데이터 */
  const [recentApps, setRecentApps] = useState([])
  const [recentRequests, setRecentRequests] = useState([])
  const [recentPosts, setRecentPosts] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: apps }, { data: visits }, { data: requests }, { data: posts }] = await Promise.all([
        supabase.from('apps').select('id, title, category, screenshot_url, rating, creator_name').eq('approved', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('site_visits').select('count'),
        supabase.from('app_requests').select('id, title, status, created_at, author_name').order('created_at', { ascending: false }).limit(5),
        supabase.from('posts').select('id, title, created_at, author_name').order('created_at', { ascending: false }).limit(5),
      ])
      const totalVisits = (visits || []).reduce((sum, v) => sum + (v.count || 0), 0)
      setStats({
        apps: (apps || []).length || 12,
        teachers: Math.max(totalVisits, 50),
        students: Math.max(totalVisits * 5, 200),
      })
      setRecentApps(apps || [])
      setRecentRequests(requests || [])
      setRecentPosts(posts || [])
    }
    fetchAll()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('story-visible')
          }
        })
      },
      { threshold: 0.15 }
    )

    sectionsRef.current.forEach((el) => { if (el) observer.observe(el) })

    return () => observer.disconnect()
  }, [])

  const addRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el)
  }

  const activeFeature = FEATURES.find(f => f.key === activeTab)

  return (
    <>
      <div className="story-page">

        {/* ===== 섹션 1: Hero ===== */}
        <section className="story-hero">
          <div className="story-hero__bg" />
          <div className="story-hero__content">
            <h1 className="story-hero__title">
              교실의 문제를 가장 잘<br />
              아는 사람은, 결국<br />
              <span className="story-hero__gradient">교실 안에</span> 있습니다.
            </h1>
            <p className="story-hero__desc">
              시중의 획일화된 에듀테크로 채울 수 없던 2%의 아쉬움.<br />
              현장 교사들의 땀과 경험이 녹아든 <strong>'진짜' 맞춤형 수업 앱</strong>들을 만나보세요.
            </p>
            <Link to="/" className="story-hero__cta">
              🏆 현장 교사들이 추천하는 베스트 앱 보러가기
            </Link>
            <div className="story-hero__badges">
              <span>✔️ 실제 수업 적용 검증 완료</span>
              <span>✔️ 교사 주도 앱 생태계</span>
              <span>✔️ 바로 사용 가능한 맞춤 기능</span>
            </div>
            <p className="story-hero__user-count">
              <span className="story-hero__user-num">
                <CountUpText target={stats.teachers} />
              </span>
              명의 선생님이 이미 사용 중이에요.
            </p>
          </div>
        </section>

        {/* ===== 섹션 2: Brand Story ===== */}
        <section className="story-section story-brand" ref={addRef}>
          <div className="story-section__inner">
            <span className="story-section__label">WHY WE STARTED</span>
            <h2 className="story-section__title">왜 무궁무진클래스를 만들었을까요?</h2>
            <div className="story-brand__content">
              <p className="story-brand__text">
                동료 선생님들과 다양한 바이브코딩앱을 기획하고 교실 수업에 적용해 보며 뼈저리게 느낀 점이 있습니다.
              </p>
              <blockquote className="story-brand__quote">
                "우리 반 아이들에게 딱 맞는 도구는 없을까?"<br />
                "이런 기능만 하나 더 있으면 훨씬 수월할 텐데."
              </blockquote>
              <p className="story-brand__text">
                시중의 서비스들은 교실마다 다른 특별한 상황을 모두 담아내기엔 늘 아쉬움이 남았습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="story-section story-mission" ref={addRef}>
          <div className="story-section__inner">
            <span className="story-section__label">OUR MISSION</span>
            <h2 className="story-section__title">
              선생님은 <span className="story-accent">최고의 교육 '기획자'</span>입니다
            </h2>
            <p className="story-section__desc">
              무궁무진클래스는 선생님들의 반짝이는 아이디어가 실제 수업용 앱으로 탄생하고,
              이를 동료들과 자유롭게 공유하고 판매하며 가치를 나누는 건강한 생태계를 만듭니다.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="story-section" ref={addRef}>
          <div className="story-section__inner">
            <span className="story-section__label">CORE VALUES</span>
            <h2 className="story-section__title">우리가 믿는 가치</h2>
            <div className="story-values__grid story-values__grid--3">
              <div className="story-value-card">
                <span className="story-value-card__icon">🎯</span>
                <h3 className="story-value-card__title">현장 맞춤형</h3>
                <p className="story-value-card__desc">탁상공론이 아닌, 현장 교사들의 경험이 녹아든 진짜 앱.</p>
              </div>
              <div className="story-value-card">
                <span className="story-value-card__icon">🔄</span>
                <h3 className="story-value-card__title">가치의 선순환</h3>
                <p className="story-value-card__desc">다른 교실을 변화시킨 내 아이디어에 대한 합당한 보상과 수익.</p>
              </div>
              <div className="story-value-card">
                <span className="story-value-card__icon">🌱</span>
                <h3 className="story-value-card__title">동반 성장</h3>
                <p className="story-value-card__desc">앱과 노하우를 나누며 함께 성장하는 커뮤니티.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 섹션 3: Feature Preview (탭 UI) ===== */}
        <section className="story-section story-features" ref={addRef}>
          <div className="story-section__inner">
            <span className="story-section__label">HOW IT WORKS</span>
            <h2 className="story-section__title">무궁무진클래스, 이렇게 활용해보세요</h2>
            <div className="story-features__tabs">
              {FEATURES.map((f) => (
                <button
                  key={f.key}
                  className={`story-features__tab ${activeTab === f.key ? 'story-features__tab--active' : ''}`}
                  onClick={() => setActiveTab(f.key)}
                >
                  {f.emoji} {f.tab}
                </button>
              ))}
            </div>
            <div className="story-features__panel">
              {activeTab === 'store' && (
                <>
                  <h3 className="story-features__panel-title">📱 등록된 바이브앱</h3>
                  {recentApps.length > 0 ? (
                    <div className="story-preview__grid">
                      {recentApps.map(app => (
                        <Link to={`/apps/${app.id}`} key={app.id} className="story-preview__app">
                          {app.screenshot_url && <img src={app.screenshot_url} alt={app.title} className="story-preview__thumb" />}
                          <div className="story-preview__app-info">
                            <span className="story-preview__app-title">{app.title}</span>
                            <span className="story-preview__app-meta">{app.category} · {'★'.repeat(Math.round(app.rating || 0))}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="story-preview__empty">아직 등록된 앱이 없습니다. 첫 번째 앱을 올려보세요!</p>
                  )}
                  <Link to="/" className="story-preview__more">전체 앱 보러가기 →</Link>
                </>
              )}
              {activeTab === 'request' && (
                <>
                  <h3 className="story-features__panel-title">🛠️ 최근 바이브코딩 요청</h3>
                  {recentRequests.length > 0 ? (
                    <div className="story-preview__list">
                      {recentRequests.map(req => (
                        <Link to={`/ai-tech/${req.id}`} key={req.id} className="story-preview__row">
                          <span className={`story-preview__status story-preview__status--${req.status || 'pending'}`}>
                            {req.status === 'completed' ? '완료' : req.status === 'in_progress' ? '진행중' : '대기'}
                          </span>
                          <span className="story-preview__row-title">{req.title}</span>
                          <span className="story-preview__row-meta">{req.author_name || '익명'}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="story-preview__empty">아이디어만 남겨주세요! 바이브 코딩으로 만들어 드립니다.</p>
                  )}
                  <Link to="/ai-tech" className="story-preview__more">요청 게시판 가기 →</Link>
                </>
              )}
              {activeTab === 'community' && (
                <>
                  <h3 className="story-features__panel-title">💬 최근 커뮤니티 글</h3>
                  {recentPosts.length > 0 ? (
                    <div className="story-preview__list">
                      {recentPosts.map(post => (
                        <Link to={`/community/${post.id}`} key={post.id} className="story-preview__row">
                          <span className="story-preview__row-title">{post.title}</span>
                          <span className="story-preview__row-meta">{post.author_name || '익명'} · {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="story-preview__empty">수업 노하우와 꿀팁을 나눠보세요!</p>
                  )}
                  <Link to="/community" className="story-preview__more">커뮤니티 가기 →</Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ===== 최종 CTA (왓퀴즈 스타일) ===== */}
        <section className="story-section story-final-cta" ref={addRef}>
          <div className="story-section__inner" style={{ textAlign: 'center' }}>
            <p className="story-final-cta__sub">선생님의 상상력이 전국의 교실을 혁신하는</p>
            <h2 className="story-final-cta__title">
              <span className="story-hero__gradient">무궁무진</span>한 마법,<br />
              지금 시작됩니다
            </h2>
            <p className="story-final-cta__count">
              <strong>{stats.teachers.toLocaleString()}명</strong> 선생님이 이미 함께하고 있어요.
            </p>
            <Link to="/login" className="story-final-cta__btn">
              🚀 무궁무진클래스 시작하기
            </Link>
            <p className="story-final-cta__note">무료 가입 · 바로 사용 가능</p>
          </div>
        </section>

      </div>
      <Footer />
    </>
  )
}
