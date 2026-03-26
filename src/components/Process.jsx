import { FadeIn } from './FadeIn'
import './Process.css'

const steps = [
  { num: '01', title: '아이디어', desc: '교실의 문제를 발견하고 해결 아이디어를 구상합니다.', color: '#A78BFA' },
  { num: '02', title: '프로토타입', desc: '바이브 코딩으로 빠르게 MVP를 만들어 봅니다.', color: '#6C3CE0' },
  { num: '03', title: '펀딩', desc: '커뮤니티의 지지를 받아 제작비를 모읍니다.', color: '#5DCAA5' },
  { num: '04', title: '제작 & 배포', desc: '실제 제품을 만들어 전국 교실에 보급합니다.', color: '#F9CB42' },
]

export function Process() {
  return (
    <section className="process">
      <FadeIn className="process__header">
        <div className="process__label">How it works</div>
        <h2 className="process__title">아이디어에서 제품까지</h2>
      </FadeIn>

      <div className="process__grid">
        {steps.map((s, i) => (
          <FadeIn key={s.num} delay={i * 0.1}>
            <div className="process__step">
              <div className="process__num" style={{ color: s.color }}>
                {s.num}
              </div>
              <h4 className="process__step-title">{s.title}</h4>
              <p className="process__step-desc">{s.desc}</p>
              {i < 3 && <div className="process__arrow">→</div>}
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
