import { Link } from 'react-router-dom'
import { FadeIn } from './FadeIn'

const sections = [
  {
    icon: '🚀',
    iconClass: 'preview-card__icon--purple',
    title: '바이브 앱 게시판',
    desc: '선생님이 직접 만든 에듀테크 앱을 GitHub처럼 카드 형태로 공유하세요. 미리보기, 별점, 태그 기능을 지원합니다.',
    link: '/apps',
    linkText: '앱 둘러보기 →',
  },
  {
    icon: '🛒',
    iconClass: 'preview-card__icon--green',
    title: '교육상품 마켓',
    desc: '학교에 필요한 선생님의 교구, 학습자료, 굿즈를 자유롭게 사고팔 수 있는 교사 전용 마켓입니다.',
    link: '/shop',
    linkText: '마켓 둘러보기 →',
  },
  {
    icon: '💬',
    iconClass: 'preview-card__icon--orange',
    title: '교사 커뮤니티',
    desc: '수업 노하우, 학급 경영 팁, 에듀테크 인사이트를 교사들끼리 자유롭게 공유하는 소통 공간입니다.',
    link: '/community',
    linkText: '커뮤니티 가기 →',
  },
]

export function HomePreview() {
  return (
    <div className="home-sections">
      {sections.map((s, i) => (
        <FadeIn key={s.title} delay={i * 0.1}>
          <Link to={s.link} style={{ textDecoration: 'none' }}>
            <div className="preview-card">
              <div className={`preview-card__icon ${s.iconClass}`}>{s.icon}</div>
              <h3 className="preview-card__title">{s.title}</h3>
              <p className="preview-card__desc">{s.desc}</p>
              <span className="preview-card__link">{s.linkText}</span>
            </div>
          </Link>
        </FadeIn>
      ))}
    </div>
  )
}
