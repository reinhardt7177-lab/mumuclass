export default function AppModal({ app, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="app-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* 앱 정보 */}
        <div className="modal-header">
          {app.thumbnail_url && (
            <img src={app.thumbnail_url} alt={app.title} className="modal-thumbnail" />
          )}
          <div className="modal-info">
            <h2>{app.title}</h2>
            <p className="modal-author">by {app.user_name || '익명'}</p>
            <p className="modal-desc">{app.description}</p>
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-open-new"
            >
              새 탭에서 열기 ↗
            </a>
          </div>
        </div>

        {/* iframe 실행 */}
        <div className="modal-runner">
          <div className="runner-label">📺 앱 실행</div>
          <div className="runner-frame">
            <iframe
              src={app.url}
              title={app.title}
              width="100%"
              height="500px"
              frameBorder="0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
          <p className="runner-notice">
            * 일부 외부 사이트는 보안 정책으로 실행이 제한될 수 있어요.
            GitHub Pages 기반 앱은 정상 실행됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
