import { FadeIn } from './FadeIn'
import './Stats.css'

const stats = [
  { value: '∞', label: '무궁무진한 가능성' },
  { value: '1→N', label: '아이디어에서 제품으로' },
  { value: 'K-12', label: '초중고 교육 전반' },
  { value: '24/7', label: '언제나 열린 플랫폼' },
]

export function Stats() {
  return (
    <FadeIn className="stats-section">
      <div className="stats__grid">
        {stats.map((s) => (
          <div key={s.label} className="stats__item">
            <div className="stats__value">{s.value}</div>
            <div className="stats__label">{s.label}</div>
          </div>
        ))}
      </div>
    </FadeIn>
  )
}
