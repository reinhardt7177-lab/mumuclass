export function Footer() {
  const columns = [
    { title: '서비스', links: ['앱 게시판', '교육상품', '커뮤니티'] },
    { title: '지원', links: ['도움말', '문의하기', '이용약관'] },
    { title: '소식', links: ['블로그', '업데이트', '채용'] },
  ]

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <div className="footer__mark">∞</div>
            <span className="footer__name">
              <span className="footer__name--accent">mumu</span>class
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
        © 2026 mumuclass. All rights reserved.
      </div>
    </footer>
  )
}
