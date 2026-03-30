import { useInView } from '../hooks/useInView'

export function Hero() {
  const [ref, vis] = useInView(0.05)

  return (
    <section ref={ref} className="hero">
      <div style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(.16,1,.3,1) 0.1s',
      }}>
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          바이브 코딩 앱 공유 플랫폼
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
        선생님이 직접 만든 바이브 코딩 앱을 공유하고,<br />
        교육에 필요한 상품을 거래하고, 인사이트를 나누세요.
      </p>

      <div className="hero__actions" style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.8s cubic-bezier(.16,1,.3,1) 0.55s',
      }}>
        <button className="btn btn--primary" onClick={() => window.location.href = '/apps'}>
          앱 둘러보기
        </button>
        <button className="btn btn--secondary" onClick={() => window.location.href = '/apps/create'}>
          내 앱 공유하기
        </button>
      </div>
    </section>
  )
}
