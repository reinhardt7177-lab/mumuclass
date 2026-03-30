export function ComingSoon({ title, icon, desc }) {
  return (
    <div className="coming-soon">
      <div className="coming-soon__icon">{icon || '🚧'}</div>
      <h1 className="coming-soon__title">{title}</h1>
      <p className="coming-soon__desc">
        {desc || '더 나은 서비스를 위해 페이지를 준비하고 있습니다.\n조금만 기다려주세요! 🚀'}
      </p>
    </div>
  )
}
