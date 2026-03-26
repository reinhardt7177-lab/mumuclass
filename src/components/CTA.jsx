import { FadeIn } from './FadeIn'
import { GlowOrb } from './GlowOrb'
import './CTA.css'

export function CTA() {
  return (
    <section className="cta">
      <GlowOrb x="50%" y="50%" color="rgba(108,60,224,0.12)" size={600} />
      <FadeIn>
        <h2 className="cta__title">
          교육의 미래,
          <br />
          함께 만들어요
        </h2>
        <p className="cta__desc">
          mumuclass에서 당신의 교육 인사이트를 현실로 바꿔보세요.
        </p>
        <div className="cta__actions">
          <button className="btn btn--primary btn--lg">무료로 시작하기</button>
          <button className="btn btn--secondary btn--lg">자세히 알아보기</button>
        </div>
      </FadeIn>
    </section>
  )
}
