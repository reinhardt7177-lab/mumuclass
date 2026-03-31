import { useEffect, useRef } from 'react'
import { Footer } from './Footer'

const TIMELINE = [
  {
    year: '2024',
    quarter: 'Q4',
    title: '아이디어의 시작',
    desc: '교사 출신 대표가 "선생님도 코딩 없이 교육 앱을 만들 수 있다면?" 이라는 질문에서 출발. 바이브 코딩과 에듀테크의 결합 개념을 정립했습니다.',
    icon: '💡',
  },
  {
    year: '2025',
    quarter: 'Q1',
    title: '무궁무진 팀 결성',
    desc: '현직 교사, 개발자, 디자이너가 모여 "교사가 만드는 에듀테크" 비전을 공유하고 팀을 구성했습니다.',
    icon: '👥',
  },
  {
    year: '2025',
    quarter: 'Q2',
    title: '바이브 코딩 워크숍 런칭',
    desc: '전국 초·중·고 교사 대상 바이브 코딩 워크숍을 시작. AI와 노코드 도구를 활용해 교육 앱을 직접 만드는 실습 과정을 운영합니다.',
    icon: '🎓',
  },
  {
    year: '2025',
    quarter: 'Q3',
    title: '무궁무진 클래스 플랫폼 오픈',
    desc: '선생님이 만든 앱을 공유하고, 평가하고, 다운로드할 수 있는 "무궁무진 클래스" 플랫폼을 정식 런칭합니다.',
    icon: '🚀',
  },
  {
    year: '2026',
    quarter: 'Q1',
    title: '교육청 MOU & 확장',
    desc: '전국 시·도 교육청과 MOU를 체결하고, 학교 현장에 바이브 코딩 기반 에듀테크 솔루션을 보급합니다.',
    icon: '🏫',
  },
]

const STATS = [
  { number: '500+', label: '등록된 교육 앱', icon: '📱' },
  { number: '2,000+', label: '참여 교사', icon: '👩‍🏫' },
  { number: '50,000+', label: '학생 사용자', icon: '🧑‍🎓' },
  { number: '17개', label: '시·도 교육청 협력', icon: '🏛️' },
]

const VALUES = [
  {
    icon: '🎨',
    title: '바이브 코딩',
    desc: '코딩을 몰라도 AI와 대화하며 나만의 교육 앱을 만들 수 있습니다. 아이디어가 곧 제품이 됩니다.',
  },
  {
    icon: '🤝',
    title: '공유와 협력',
    desc: '만든 앱을 동료 교사와 공유하세요. 평가와 피드백을 통해 함께 더 나은 교육 도구를 만들어갑니다.',
  },
  {
    icon: '🌱',
    title: '성장하는 생태계',
    desc: '교사의 아이디어가 플랫폼이 되고, 펀딩을 받아 제품이 됩니다. 교육자가 곧 크리에이터입니다.',
  },
  {
    icon: '🔒',
    title: '안전한 교육 환경',
    desc: '교사와 학교를 위해 설계된 보안 기준을 충족합니다. 학생 데이터를 안전하게 보호합니다.',
  },
]

const TEAM = [
  { name: '이준용', role: 'CEO / 대표', desc: '현직 교사 출신, 교육과 테크의 접점에서 혁신을 이끕니다.', emoji: '👨‍💼' },
  { name: '김지현', role: 'CTO / 기술', desc: 'AI·클라우드 인프라 전문가. 바이브 코딩 엔진을 개발합니다.', emoji: '👩‍💻' },
  { name: '박민수', role: 'CDO / 디자인', desc: '사용자 경험 중심의 교육 플랫폼 UI/UX를 설계합니다.', emoji: '🎨' },
  { name: '최서연', role: 'COO / 운영', desc: '교육청·학교 협력 및 워크숍 운영을 총괄합니다.', emoji: '📋' },
]

export default function CompanyStory() {
  const sectionsRef = useRef([])

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

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const addRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el)
    }
  }

  return (
    <>
      <div className="story-page">
        {/* ===== Hero ===== */}
        <section className="story-hero">
          <div className="story-hero__bg" />
          <div className="story-hero__content">
            <span className="story-hero__badge">
              <span className="story-hero__badge-dot" />
              교육의 미래를 만드는 곳
            </span>
            <h1 className="story-hero__title">
              학교를<br />
              <span className="story-hero__gradient">무궁무진</span>하게
            </h1>
            <p className="story-hero__desc">
              에듀테크를 만들고, 나누고, 펀딩받아 제작하는<br />
              교육자 플랫폼 — <strong>무궁무진 클래스</strong>
            </p>
            <div className="story-hero__scroll-hint">
              <span>↓</span>
              <span>스크롤하여 우리의 이야기를 만나보세요</span>
            </div>
          </div>
        </section>

        {/* ===== Mission ===== */}
        <section className="story-section story-mission" ref={addRef}>
          <div className="story-section__inner">
            <span className="story-section__label">OUR MISSION</span>
            <h2 className="story-section__title">
              선생님의 아이디어가<br />
              <span className="story-accent">교육의 혁신</span>이 됩니다
            </h2>
            <p className="story-section__desc">
              무궁무진 클래스는 교사가 직접 교육 앱을 만들고, 동료들과 공유하며, 
              학생들에게 가장 적합한 학습 경험을 설계할 수 있도록 돕는 플랫폼입니다. 
              교사가 곧 크리에이터이고, 교실이 곧 실험실입니다.
            </p>
          </div>
        </section>

        {/* ===== Stats ===== */}
        <section className="story-section story-stats" ref={addRef}>
          <div className="story-section__inner">
            <div className="story-stats__grid">
              {STATS.map((stat) => (
                <div key={stat.label} className="story-stat-card">
                  <span className="story-stat-card__icon">{stat.icon}</span>
                  <span className="story-stat-card__number">{stat.number}</span>
                  <span className="story-stat-card__label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Values ===== */}
        <section className="story-section" ref={addRef}>
          <div className="story-section__inner">
            <span className="story-section__label">CORE VALUES</span>
            <h2 className="story-section__title">우리가 믿는 가치</h2>
            <div className="story-values__grid">
              {VALUES.map((v) => (
                <div key={v.title} className="story-value-card">
                  <span className="story-value-card__icon">{v.icon}</span>
                  <h3 className="story-value-card__title">{v.title}</h3>
                  <p className="story-value-card__desc">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Timeline ===== */}
        <section className="story-section story-timeline-section" ref={addRef}>
          <div className="story-section__inner">
            <span className="story-section__label">OUR JOURNEY</span>
            <h2 className="story-section__title">지금까지의 여정</h2>
            <div className="story-timeline">
              {TIMELINE.map((item, idx) => (
                <div key={idx} className={`story-timeline__item ${idx % 2 === 0 ? 'story-timeline__item--left' : 'story-timeline__item--right'}`}>
                  <div className="story-timeline__dot">{item.icon}</div>
                  <div className="story-timeline__card">
                    <span className="story-timeline__year">{item.year} {item.quarter}</span>
                    <h3 className="story-timeline__title">{item.title}</h3>
                    <p className="story-timeline__desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Team ===== */}
        <section className="story-section" ref={addRef}>
          <div className="story-section__inner">
            <span className="story-section__label">OUR TEAM</span>
            <h2 className="story-section__title">함께 만드는 사람들</h2>
            <div className="story-team__grid">
              {TEAM.map((member) => (
                <div key={member.name} className="story-team-card">
                  <span className="story-team-card__emoji">{member.emoji}</span>
                  <h3 className="story-team-card__name">{member.name}</h3>
                  <span className="story-team-card__role">{member.role}</span>
                  <p className="story-team-card__desc">{member.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="story-section story-cta" ref={addRef}>
          <div className="story-section__inner" style={{ textAlign: 'center' }}>
            <h2 className="story-cta__title">
              선생님도 함께 시작해보세요
            </h2>
            <p className="story-cta__desc">
              바이브 코딩으로 나만의 교육 앱을 만들고,<br />
              무궁무진 클래스에서 동료 교사들과 공유하세요.
            </p>
            <div className="story-cta__buttons">
              <a href="/" className="btn btn--primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2rem' }}>
                🚀 앱 둘러보기
              </a>
              <a href="/ai-tech" className="btn btn--secondary" style={{ fontSize: '1.05rem', padding: '0.9rem 2rem' }}>
                🤖 AI 테크 소식
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
