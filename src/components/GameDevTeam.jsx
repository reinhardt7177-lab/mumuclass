import { useState } from 'react'
import { Footer } from './Footer'
import {
  TEAM_ROLES,
  PROJECT_PHASES,
  SAMPLE_TEAMS,
  GAME_GENRES,
} from '../data/gameDevTeam'

export default function GameDevTeam() {
  const [activeRole, setActiveRole] = useState(null)
  const [activePhase, setActivePhase] = useState(null)

  return (
    <div className="gdt">
      {/* Hero */}
      <section className="gdt-hero">
        <div className="gdt-hero__inner">
          <span className="gdt-hero__badge">🎮 수업용 게임 개발</span>
          <h1 className="gdt-hero__title">
            게임 앱 개발팀<br />
            <span className="gdt-hero__gradient">구성 가이드</span>
          </h1>
          <p className="gdt-hero__desc">
            학생들이 직접 팀을 이루어 교육용 게임을 기획하고, AI 바이브 코딩으로 만들어보는
            프로젝트 수업을 위한 팀 구성 가이드입니다.
          </p>
          <div className="gdt-hero__stats">
            <div className="gdt-hero__stat">
              <span className="gdt-hero__stat-num">5</span>
              <span className="gdt-hero__stat-label">팀 역할</span>
            </div>
            <div className="gdt-hero__stat">
              <span className="gdt-hero__stat-num">7</span>
              <span className="gdt-hero__stat-label">차시 구성</span>
            </div>
            <div className="gdt-hero__stat">
              <span className="gdt-hero__stat-num">4~6</span>
              <span className="gdt-hero__stat-label">명/팀</span>
            </div>
            <div className="gdt-hero__stat">
              <span className="gdt-hero__stat-num">6</span>
              <span className="gdt-hero__stat-label">게임 장르</span>
            </div>
          </div>
        </div>
      </section>

      {/* Team Roles */}
      <section className="gdt-section">
        <div className="gdt-section__inner">
          <h2 className="gdt-section__title">
            <span className="gdt-section__icon">👥</span>
            팀 역할 구성
          </h2>
          <p className="gdt-section__desc">
            각 팀은 4~6명으로 구성되며, 아래 역할을 나누어 맡습니다.
            한 사람이 여러 역할을 겸할 수도 있습니다.
          </p>

          <div className="gdt-roles">
            {TEAM_ROLES.map((role) => (
              <div
                key={role.id}
                className={`gdt-role ${activeRole === role.id ? 'gdt-role--active' : ''}`}
                onClick={() => setActiveRole(activeRole === role.id ? null : role.id)}
                style={{ '--role-color': role.color }}
              >
                <div className="gdt-role__header">
                  <span className="gdt-role__icon">{role.icon}</span>
                  <div>
                    <h3 className="gdt-role__title">{role.title}</h3>
                    <span className="gdt-role__rec">권장 {role.recommended}</span>
                  </div>
                </div>
                <p className="gdt-role__desc">{role.description}</p>

                {activeRole === role.id && (
                  <div className="gdt-role__detail">
                    <div className="gdt-role__list">
                      <h4>담당 업무</h4>
                      <ul>
                        {role.responsibilities.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="gdt-role__list">
                      <h4>필요 역량</h4>
                      <div className="gdt-role__skills">
                        {role.skills.map((s, i) => (
                          <span key={i} className="gdt-role__skill">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Phases */}
      <section className="gdt-section gdt-section--alt">
        <div className="gdt-section__inner">
          <h2 className="gdt-section__title">
            <span className="gdt-section__icon">📅</span>
            프로젝트 진행 단계
          </h2>
          <p className="gdt-section__desc">
            총 7차시로 구성된 프로젝트 수업 일정입니다. 각 단계를 클릭하면 상세 내용을 확인할 수 있습니다.
          </p>

          <div className="gdt-phases">
            {PROJECT_PHASES.map((phase) => (
              <div
                key={phase.phase}
                className={`gdt-phase ${activePhase === phase.phase ? 'gdt-phase--active' : ''}`}
                onClick={() => setActivePhase(activePhase === phase.phase ? null : phase.phase)}
              >
                <div className="gdt-phase__header">
                  <div className="gdt-phase__num">{phase.phase}</div>
                  <div className="gdt-phase__info">
                    <h3 className="gdt-phase__title">
                      {phase.icon} {phase.title}
                    </h3>
                    <span className="gdt-phase__duration">{phase.duration}</span>
                  </div>
                </div>

                {activePhase === phase.phase && (
                  <div className="gdt-phase__detail">
                    <div className="gdt-phase__tasks">
                      <h4>활동 내용</h4>
                      <ul>
                        {phase.tasks.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="gdt-phase__deliverable">
                      <strong>산출물:</strong> {phase.deliverable}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Genres */}
      <section className="gdt-section">
        <div className="gdt-section__inner">
          <h2 className="gdt-section__title">
            <span className="gdt-section__icon">🎮</span>
            추천 게임 장르
          </h2>
          <p className="gdt-section__desc">
            수업에서 만들기 좋은 게임 장르를 소개합니다. 교과와 연계하여 선택해보세요.
          </p>

          <div className="gdt-genres">
            {GAME_GENRES.map((genre, i) => (
              <div key={i} className="gdt-genre">
                <span className="gdt-genre__icon">{genre.icon}</span>
                <h3 className="gdt-genre__name">{genre.name}</h3>
                <p className="gdt-genre__desc">{genre.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Teams */}
      <section className="gdt-section gdt-section--alt">
        <div className="gdt-section__inner">
          <h2 className="gdt-section__title">
            <span className="gdt-section__icon">🏆</span>
            예시 팀 현황
          </h2>
          <p className="gdt-section__desc">
            이렇게 팀을 구성하고 프로젝트를 진행할 수 있습니다.
          </p>

          <div className="gdt-teams">
            {SAMPLE_TEAMS.map((team, i) => (
              <div key={i} className="gdt-team">
                <div className="gdt-team__header">
                  <h3 className="gdt-team__name">{team.name}</h3>
                  <span className={`gdt-team__status gdt-team__status--${team.status}`}>
                    {team.status === 'active' ? '개발 중' : '기획 중'}
                  </span>
                </div>
                <p className="gdt-team__project">{team.project}</p>
                <div className="gdt-team__meta">
                  <span>🎮 {team.genre}</span>
                  <span>👤 {team.members}명</span>
                </div>
                <div className="gdt-team__progress">
                  <div className="gdt-team__progress-bar">
                    <div
                      className="gdt-team__progress-fill"
                      style={{ width: `${team.progress}%` }}
                    />
                  </div>
                  <span className="gdt-team__progress-text">{team.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="gdt-section">
        <div className="gdt-section__inner">
          <h2 className="gdt-section__title">
            <span className="gdt-section__icon">💡</span>
            선생님을 위한 운영 팁
          </h2>
          <div className="gdt-tips">
            <div className="gdt-tip">
              <span className="gdt-tip__icon">🎯</span>
              <h3>역할 로테이션</h3>
              <p>프로젝트마다 역할을 바꿔보면 학생들이 다양한 경험을 할 수 있습니다.</p>
            </div>
            <div className="gdt-tip">
              <span className="gdt-tip__icon">🤖</span>
              <h3>AI 바이브 코딩 활용</h3>
              <p>코딩 경험이 없어도 AI에게 설명하며 게임을 만들 수 있습니다. Claude, ChatGPT 등을 활용하세요.</p>
            </div>
            <div className="gdt-tip">
              <span className="gdt-tip__icon">📊</span>
              <h3>중간 점검 필수</h3>
              <p>3차시 이후 중간 발표를 통해 진행 상황을 공유하고 피드백을 주고받으세요.</p>
            </div>
            <div className="gdt-tip">
              <span className="gdt-tip__icon">🏅</span>
              <h3>동료 평가 도입</h3>
              <p>최종 발표 시 다른 팀의 게임을 직접 플레이하고 평가하면 동기부여가 됩니다.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
