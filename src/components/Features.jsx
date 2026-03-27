import { useNavigate } from 'react-router-dom'
import { FadeIn } from './FadeIn'
import { GlowOrb } from './GlowOrb'
import './Features.css'

const features = [
  {
    icon: '⚡',
    title: 'Platform',
    subtitle: '에듀테크를 만들고 나누세요',
    desc: '직접 만든 웹앱, 학급경영 도구, 수업 자료를 발행하고 다른 교육자와 자유롭게 공유하세요. 오픈소스 정신으로 함께 발전합니다.',
    color: '#6C3CE0',
    bg: 'rgba(108,60,224,0.1)',
    items: ['웹앱 퍼블리싱', '학급경영 도구', '템플릿 마켓', 'API 공유'],
  },
  {
    icon: '◈',
    title: 'Funding',
    subtitle: '아이디어를 현실로',
    desc: '교실에 필요한 기발한 물건을 기획하고 크라우드 펀딩을 통해 제작비를 모아 실제 제품으로 만들어 보세요.',
    color: '#5DCAA5',
    bg: 'rgba(93,202,165,0.1)',
    items: ['프로젝트 제안', '크라우드 펀딩', '프로토타입 개발', '제품 배송'],
  },
  {
    icon: '◉',
    title: 'Community',
    subtitle: '교육 인사이트 허브',
    desc: '교육 현장의 생생한 인사이트를 기고하고, 함께 토론하며, 학교의 미래를 설계하는 교육자 커뮤니티입니다.',
    color: '#F9CB42',
    bg: 'rgba(249,203,66,0.1)',
    items: ['인사이트 기고', '토론 포럼', '교육자 네트워킹', '콜라보레이션'],
  },
]

export function Features() {
  const navigate = useNavigate()
  return (
    <section id="platform" className="features">
      <GlowOrb x="20%" y="30%" color="rgba(108,60,224,0.08)" size={600} />

      <FadeIn className="features__header">
        <div className="features__label">Core features</div>
        <h2 className="features__title">세 가지 핵심 축</h2>
        <p className="features__desc">
          에듀테크 공유부터 크라우드 펀딩, 교육자 커뮤니티까지.
          <br />
          학교 혁신의 전 과정을 하나의 플랫폼에서.
        </p>
      </FadeIn>

      <div className="features__grid">
        {features.map((f, i) => (
          <FadeIn key={f.title} delay={i * 0.12}>
            <div className="feature-card">
              <div
                className="feature-card__icon"
                style={{ background: f.bg, color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p
                className="feature-card__subtitle"
                style={{ color: f.color }}
              >
                {f.subtitle}
              </p>
              <p className="feature-card__desc">{f.desc}</p>
              <div className="feature-card__items">
                {f.items.map((item) => (
                  <div key={item} className="feature-card__item">
                    <div
                      className="feature-card__item-dot"
                      style={{ background: f.color }}
                    />
                    {item}
                  </div>
                ))}
              </div>
              {f.title === 'Platform' && (
                <button
                  className="feature-card__board-btn"
                  style={{ '--btn-color': f.color }}
                  onClick={() => navigate('/platform')}
                >
                  게시판 보기 →
                </button>
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
