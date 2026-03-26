import { FadeIn } from './FadeIn'
import { GlowOrb } from './GlowOrb'
import './Products.css'

const products = [
  {
    name: 'Di.S.Co',
    desc: 'NFC 기반 학급경영 시스템. 데이터 드리븐 교실 경제를 실현합니다.',
    status: 'Live',
    color: '#5DCAA5',
    tags: ['NFC', 'Learning Analytics', '학급경영'],
  },
  {
    name: '글로벌 CEO 우주 프로젝트',
    desc: '4학년 큰 수 단원을 게이미피케이션으로 학습하는 경매 웹 게임.',
    status: 'Beta',
    color: '#A78BFA',
    tags: ['게이미피케이션', '수학', 'React'],
  },
  {
    name: 'Edu Vibe',
    desc: '비전공 교사를 위한 바이브 코딩 교육 & 템플릿 공유 플랫폼.',
    status: 'Coming soon',
    color: '#F9CB42',
    tags: ['바이브코딩', '교사교육', 'SaaS'],
  },
]

export function Products() {
  return (
    <section id="products" className="products">
      <GlowOrb x="80%" y="40%" color="rgba(93,202,165,0.06)" size={500} />

      <FadeIn className="products__header">
        <div className="products__label">Flagship products</div>
        <h2 className="products__title">만들고 있는 것들</h2>
        <p className="products__desc">
          교실의 문제를 직접 풀기 위해 만든 프로덕트들
        </p>
      </FadeIn>

      <div className="products__list">
        {products.map((p, i) => (
          <FadeIn key={p.name} delay={i * 0.1}>
            <div className="product-card">
              <div className="product-card__content">
                <div className="product-card__top">
                  <h3 className="product-card__name">{p.name}</h3>
                  <span
                    className="product-card__status"
                    style={{
                      background: `${p.color}18`,
                      color: p.color,
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="product-card__desc">{p.desc}</p>
                <div className="product-card__tags">
                  {p.tags.map((t) => (
                    <span key={t} className="product-card__tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="product-card__arrow" style={{ color: p.color }}>
                →
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
