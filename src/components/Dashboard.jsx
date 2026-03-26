import { useState } from 'react'
import { FadeIn } from './FadeIn'
import './Dashboard.css'

const tabs = [
  { name: 'Dashboard', icon: '◆' },
  { name: 'My Platforms', icon: '◇' },
  { name: 'Funding', icon: '◇' },
  { name: 'Community', icon: '◇' },
  { name: 'Products', icon: '◇' },
  { name: 'Settings', icon: '◇' },
]

const projects = [
  { name: 'Di.S.Co 학급경영 시스템', status: 'Live', color: '#5DCAA5' },
  { name: '글로벌 CEO 우주 프로젝트 경매', status: 'Beta', color: '#A78BFA' },
  { name: 'NFC 출석체크 키오스크', status: 'Funding', color: '#F9CB42' },
  { name: 'Edu Vibe 코딩교육 플랫폼', status: 'Dev', color: '#E8593C' },
]

const stats = [
  { label: 'Published', value: '12', color: '#A78BFA' },
  { label: 'Total funded', value: '₩2.4M', color: '#5DCAA5' },
  { label: 'Community', value: '847', color: '#F9CB42' },
]

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard')

  return (
    <FadeIn style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
      <div className="dash">
        <div className="dash__bar">
          <div className="dash__dot dash__dot--red" />
          <div className="dash__dot dash__dot--yellow" />
          <div className="dash__dot dash__dot--green" />
          <span className="dash__url">mumuclass.com/dashboard</span>
        </div>

        <div className="dash__body">
          <div className="dash__sidebar">
            {tabs.map((t) => (
              <div
                key={t.name}
                className={`dash__tab ${activeTab === t.name ? 'dash__tab--active' : ''}`}
                onClick={() => setActiveTab(t.name)}
              >
                <span className="dash__tab-icon">{t.icon}</span>
                {t.name}
              </div>
            ))}
          </div>

          <div className="dash__main">
            <div className="dash__header">
              <span className="dash__title">Dashboard</span>
              <span className="dash__date">2026.03.26</span>
            </div>

            <div className="dash__stats">
              {stats.map((s) => (
                <div key={s.label} className="dash__stat">
                  <div className="dash__stat-label">{s.label}</div>
                  <div className="dash__stat-value" style={{ color: s.color }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="dash__projects">
              <span className="dash__projects-label">Recent projects</span>
              {projects.map((p) => (
                <div key={p.name} className="dash__project">
                  <div
                    className="dash__project-dot"
                    style={{ background: p.color }}
                  />
                  <span className="dash__project-name">{p.name}</span>
                  <span
                    className="dash__project-tag"
                    style={{
                      background: `${p.color}18`,
                      color: p.color,
                    }}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}
