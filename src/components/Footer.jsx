import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

/* ── 방문자 수 기록 & 가져오기 ── */
function useVisitorCount() {
  const [todayCount, setTodayCount] = useState(null)
  const [totalCount, setTotalCount] = useState(null)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const visited = sessionStorage.getItem('visited_date')

    const track = async () => {
      if (visited !== today) {
        await supabase.rpc('increment_visit', { p_date: today })
        sessionStorage.setItem('visited_date', today)
      }

      const { data } = await supabase
        .from('site_visits')
        .select('count')
        .eq('visit_date', today)
        .single()
      setTodayCount(data?.count ?? 0)

      const { data: totalData } = await supabase
        .from('site_visits')
        .select('count')
      const sum = (totalData || []).reduce((acc, r) => acc + (r.count || 0), 0)
      setTotalCount(sum)
    }

    track()
  }, [])

  return { todayCount, totalCount }
}

export function Footer() {
  const { todayCount, totalCount } = useVisitorCount()

  const columns = [
    { title: '서비스', links: ['앱 게시판', '교육상품', '커뮤니티'] },
    { title: '지원', links: ['도움말', '문의하기', '이용약관'] },
    { title: '소식', links: ['블로그', '업데이트'] },
  ]

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <div className="footer__mark">∞</div>
            <span className="footer__name">
              <span className="footer__name--accent">무궁무진</span> 클래스
            </span>
          </div>
          <p className="footer__tagline">
            교육자를 위한, 교육자에 의한 플랫폼.<br />
            학교를 무궁무진하게 발전시키는 에듀테크 허브.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="footer__col">
            <h4 className="footer__col-title">{col.title}</h4>
            <div className="footer__col-links">
              {col.links.map((l) => (
                <a key={l} href="#">{l}</a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="footer__bottom">
        <span>© 2026 무궁무진 클래스. All rights reserved.</span>
        {todayCount !== null && (
          <span className="visitor-counter">
            <span className="visitor-counter__item">
              <span className="visitor-counter__label">TODAY</span>
              <span className="visitor-counter__num">{todayCount.toLocaleString()}</span>
            </span>
            <span className="visitor-counter__divider">|</span>
            <span className="visitor-counter__item">
              <span className="visitor-counter__label">TOTAL</span>
              <span className="visitor-counter__num">{(totalCount ?? 0).toLocaleString()}</span>
            </span>
          </span>
        )}
      </div>
    </footer>
  )
}
