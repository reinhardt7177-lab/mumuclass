import { useInView } from '../hooks/useInView'
import { GlowOrb } from './GlowOrb'
import './Hero.css'

export function Hero() {
  const [ref, vis] = useInView(0.05)

  return (
    <section ref={ref} className="hero">
      <GlowOrb x="50%" y="30%" color="rgba(108,60,224,0.2)" size={700} />
      <GlowOrb x="65%" y="55%" color="rgba(93,202,165,0.08)" size={500} />

      <div className="hero__inner" style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(.16,1,.3,1) 0.1s',
      }}>
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          Di.S.Co · Edu Vibe 출시 예정
        </div>
      </div>

      <h1 className="hero__title" style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(.16,1,.3,1) 0.25s',
      }}>
        학교를<br />
        <span className="hero__gradient">무궁무진</span>하게
      </h1>

      <p className="hero__desc" style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(.16,1,.3,1) 0.4s',
      }}>
        교육자의 아이디어가 플랫폼이 되고, 펀딩을 받아 제품이 되는 곳.<br />
        에듀테크를 만들고, 나누고, 함께 성장하세요.
      </p>

      <div className="hero__actions" style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.8s cubic-bezier(.16,1,.3,1) 0.55s',
      }}>
        <button className="btn btn--primary">플랫폼 둘러보기</button>
        <button className="btn btn--secondary">프로젝트 펀딩하기</button>
      </div>
    </section>
  )
}
