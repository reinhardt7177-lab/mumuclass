import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CompanyStory() {
  const containerRef = useRef(null)
  const scene1Ref = useRef(null)
  const scene2Ref = useRef(null)
  const scene3Ref = useRef(null)
  const scene4Ref = useRef(null)
  const scene5Ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── Scene 1: Characters fly in from sides and collide ── */
      const s1 = scene1Ref.current
      if (s1) {
        gsap.from(s1.querySelector('.char-left'), {
          x: -400, opacity: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: s1, start: 'top 80%', end: 'top 30%', scrub: 1 }
        })
        gsap.from(s1.querySelector('.char-right'), {
          x: 400, opacity: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: s1, start: 'top 80%', end: 'top 30%', scrub: 1 }
        })
        gsap.from(s1.querySelector('.clash-fx'), {
          scale: 0, opacity: 0, duration: 0.5,
          scrollTrigger: { trigger: s1, start: 'top 40%', toggleActions: 'play none none reverse' }
        })
        gsap.to(s1, {
          keyframes: [
            { x: -3, duration: 0.05 }, { x: 3, duration: 0.05 },
            { x: -2, duration: 0.05 }, { x: 0, duration: 0.05 }
          ],
          scrollTrigger: { trigger: s1, start: 'top 35%', toggleActions: 'play none none none' }
        })
      }

      /* ── Scene 2: Zoom-out from handshake ── */
      const s2 = scene2Ref.current
      if (s2) {
        gsap.from(s2.querySelector('.handshake-zoom'), {
          scale: 2.5, opacity: 0,
          scrollTrigger: { trigger: s2, start: 'top 80%', end: 'top 20%', scrub: 1 }
        })
        gsap.from(s2.querySelector('.scene2-aura'), {
          opacity: 0, scale: 0.3,
          scrollTrigger: { trigger: s2, start: 'top 60%', end: 'top 10%', scrub: 1 }
        })
        gsap.from(s2.querySelectorAll('.speech-bubble'), {
          y: 60, opacity: 0, stagger: 0.2,
          scrollTrigger: { trigger: s2, start: 'top 50%', toggleActions: 'play none none reverse' }
        })
      }

      /* ── Scene 3: Marquee hashtags ── */
      const s3 = scene3Ref.current
      if (s3) {
        const tags = s3.querySelectorAll('.hash-tag')
        tags.forEach((tag, i) => {
          gsap.fromTo(tag,
            { x: i % 2 === 0 ? -200 : 200, opacity: 0 },
            {
              x: 0, opacity: 1,
              scrollTrigger: { trigger: s3, start: 'top 70%', end: 'top 20%', scrub: 1 }
            }
          )
        })
        gsap.from(s3.querySelector('.debate-visual'), {
          opacity: 0, y: 80,
          scrollTrigger: { trigger: s3, start: 'top 60%', toggleActions: 'play none none reverse' }
        })
      }

      /* ── Scene 4: Seed to full expansion ── */
      const s4 = scene4Ref.current
      if (s4) {
        gsap.from(s4.querySelector('.disco-sphere'), {
          scale: 0.05, opacity: 0,
          scrollTrigger: { trigger: s4, start: 'top 80%', end: 'top 10%', scrub: 1 }
        })
        gsap.to(s4, {
          '--scene4-bg': 1,
          scrollTrigger: { trigger: s4, start: 'top 60%', end: 'top 10%', scrub: 1 }
        })
      }

      /* ── Scene 5: Matrix code rain + hero rise ── */
      const s5 = scene5Ref.current
      if (s5) {
        gsap.from(s5.querySelector('.hero-pose'), {
          y: 200, opacity: 0,
          scrollTrigger: { trigger: s5, start: 'top 70%', end: 'top 30%', scrub: 1 }
        })
        gsap.from(s5.querySelector('.mumu-logo-final'), {
          scale: 0.2, opacity: 0,
          ease: 'bounce.out',
          scrollTrigger: { trigger: s5, start: 'top 40%', toggleActions: 'play none none reverse' }
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  /* ── Matrix rain canvas ── */
  const matrixCanvasRef = useRef(null)
  useEffect(() => {
    const canvas = matrixCanvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    let animId
    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth
      canvas.height = canvas.parentElement.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const cols = Math.floor(canvas.width / 18)
    const drops = Array.from({ length: cols }, () => Math.random() * -100)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZconst{}()=>import<div/>useState;0123456789'

    const draw = () => {
      c.fillStyle = 'rgba(10,5,20,0.08)'
      c.fillRect(0, 0, canvas.width, canvas.height)
      c.font = '14px monospace'
      c.fillStyle = '#00ff88'
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)]
        c.fillText(ch, i * 18, drops[i] * 18)
        if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="sb-page" ref={containerRef}>

      {/* ════════════════ SCENE 1 ════════════════ */}
      <section className="sb-scene sb-scene1" ref={scene1Ref}>
        <div className="sb-panel">
          <div className="sb-scene1__arena">
            {/* Left character: 준용 */}
            <div className="char-left sb-char-card">
              <div className="sb-char-card__portrait sb-char-card__portrait--junyong">
                <span className="sb-char-emoji">🔥</span>
              </div>
              <div className="sb-char-card__info">
                <h3>준용</h3>
                <span className="sb-char-card__role">열혈 현장 교사</span>
                <div className="sb-char-card__abilities">
                  <span className="sb-ability">[현장 레이더]</span>
                  <span className="sb-ability">[무한 실행력]</span>
                </div>
              </div>
            </div>

            {/* Clash effect */}
            <div className="clash-fx">
              <span className="clash-fx__bolt">⚡</span>
              <span className="clash-fx__text">VS</span>
              <span className="clash-fx__bolt">⚡</span>
            </div>

            {/* Right character: 용샘 */}
            <div className="char-right sb-char-card">
              <div className="sb-char-card__portrait sb-char-card__portrait--yongsam">
                <span className="sb-char-emoji">💻</span>
              </div>
              <div className="sb-char-card__info">
                <h3>용샘 (고회장)</h3>
                <span className="sb-char-card__role">압도적 마스터</span>
                <div className="sb-char-card__abilities">
                  <span className="sb-ability">[인사이트 크래시]</span>
                  <span className="sb-ability">[바이브 코딩]</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sb-copy">
            <h2 className="sb-copy__main">교실은 전쟁터다.<br/>하지만, 영웅은 난세에 등장하는 법.</h2>
            <p className="sb-copy__sub">현장의 열혈 교사 '준용'과 압도적 통찰의 달인 '고회장'의 운명적 조우.</p>
          </div>

          <div className="sb-scene-tag">SCENE 01</div>
          <div className="sb-scene-title-tag">우연한 만남, 영웅들의 격돌</div>
        </div>
      </section>

      {/* ════════════════ SCENE 2 ════════════════ */}
      <section className="sb-scene sb-scene2" ref={scene2Ref}>
        <div className="sb-panel">
          <div className="scene2-aura"></div>
          <div className="handshake-zoom">
            <div className="sb-handshake">
              <span className="sb-handshake__emoji">🤝</span>
              <div className="sb-handshake__shockwave"></div>
              <div className="sb-handshake__shockwave sb-handshake__shockwave--2"></div>
            </div>
          </div>

          <div className="sb-speech-row">
            <div className="speech-bubble speech-bubble--left">
              <span className="speech-bubble__name">준용</span>
              "제가 현장의 문제를 다 가져오겠습니다!"
            </div>
            <div className="speech-bubble speech-bubble--right">
              <span className="speech-bubble__name">고회장</span>
              "좋아, 내가 그 모든 걸 해결할 판을 짜지."
            </div>
          </div>

          <div className="sb-copy">
            <h2 className="sb-copy__main">"우리, 교실을 구원할 세계를 만들자!"</h2>
            <p className="sb-copy__sub">노을이 지는 옥상 위, 대한민국 교육 현장을 바꾸겠다는 비장한 결의.</p>
          </div>

          <div className="sb-scene-tag">SCENE 02</div>
          <div className="sb-scene-title-tag">도원결의, 전설의 시작</div>
        </div>
      </section>

      {/* ════════════════ SCENE 3 ════════════════ */}
      <section className="sb-scene sb-scene3" ref={scene3Ref}>
        <div className="sb-panel">
          <div className="sb-marquee-zone">
            <span className="hash-tag hash-tag--1">#효율성!</span>
            <span className="hash-tag hash-tag--2">#학생참여!</span>
            <span className="hash-tag hash-tag--3">#학급경영!</span>
            <span className="hash-tag hash-tag--4">#업무경감!</span>
            <span className="hash-tag hash-tag--5">#AI교육!</span>
            <span className="hash-tag hash-tag--6">#바이브코딩!</span>
          </div>

          <div className="debate-visual">
            <div className="sb-debate-scene">
              <div className="sb-debater sb-debater--left">
                <span>🔥</span>
                <div className="sb-debate-sparks">💥</div>
              </div>
              <div className="sb-debate-notes">
                <span>📋</span><span>💡</span><span>📝</span><span>⚡</span><span>🗂️</span>
              </div>
              <div className="sb-debater sb-debater--right">
                <span>💻</span>
                <div className="sb-debate-sparks">💥</div>
              </div>
            </div>
          </div>

          <div className="sb-copy">
            <h2 className="sb-copy__main">밤을 잊은 열띤 토론,<br/>타협 없는 아이디어의 격돌!</h2>
            <p className="sb-copy__sub">어두운 방, 모니터 불빛만 빛나는 그곳. 치열한 격투기를 방불케 하는 토론의 장.</p>
          </div>

          <div className="sb-scene-tag">SCENE 03</div>
          <div className="sb-scene-title-tag">불꽃 튀는 협의 (The Crucible)</div>
        </div>
      </section>

      {/* ════════════════ SCENE 4 ════════════════ */}
      <section className="sb-scene sb-scene4" ref={scene4Ref}>
        <div className="sb-panel">
          <div className="disco-sphere">
            <div className="disco-sphere__core">
              <div className="disco-sphere__hologram">
                <span>📚</span>
                <span>👨‍🏫</span>
                <span>🎓</span>
                <span>✨</span>
                <span>📊</span>
                <span>🏫</span>
              </div>
            </div>
            <div className="disco-sphere__ring"></div>
            <div className="disco-sphere__ring disco-sphere__ring--2"></div>
          </div>

          <div className="sb-copy">
            <h2 className="sb-copy__main">"마침내 열린 새로운 차원,<br/>[디스코 월드]의 탄생!"</h2>
            <p className="sb-copy__sub">교사의 모든 상상이 현실이 되는 학급 경영의 유토피아.</p>
          </div>

          <div className="sb-scene-tag">SCENE 04</div>
          <div className="sb-scene-title-tag">'디스코(DISCO) 월드'의 탄생</div>
        </div>
      </section>

      {/* ════════════════ SCENE 5 ════════════════ */}
      <section className="sb-scene sb-scene5" ref={scene5Ref}>
        <div className="sb-panel">
          <canvas ref={matrixCanvasRef} className="sb-matrix-canvas" />

          <div className="hero-pose">
            <div className="sb-hero-duo">
              <div className="sb-hero-figure sb-hero-figure--junyong">
                <span className="sb-hero-figure__emoji">🔥</span>
                <div className="sb-hero-figure__apps">
                  <span>📱</span><span>📊</span><span>🎮</span><span>📝</span><span>🔬</span>
                </div>
              </div>
              <div className="sb-hero-figure sb-hero-figure--yongsam">
                <span className="sb-hero-figure__emoji">💻</span>
                <div className="sb-hero-figure__code-stream">
                  {'{ }  < / >  =>  ( )'}
                </div>
              </div>
            </div>
          </div>

          <div className="mumu-logo-final">
            <h1 className="mumu-logo-final__text">무무클래스</h1>
            <p className="mumu-logo-final__tagline">MUMUCLASS</p>
          </div>

          <div className="sb-copy sb-copy--final">
            <h2 className="sb-copy__main">"우리의 바이브가 코드가 되어<br/>현장을 바꾼다!"</h2>
          </div>

          <a href="/" className="sb-cta-btn">
            무무클래스와 함께 교실 구출하기
            <span className="sb-cta-btn__arrow">→</span>
          </a>

          <div className="sb-scene-tag">SCENE 05</div>
          <div className="sb-scene-title-tag">바이브 코딩, 그리고 '무무클래스'의 강림</div>
        </div>
      </section>
    </div>
  )
}
