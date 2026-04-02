export default function AppCard({ app, onClick, onDelete, canDelete }) {
  return (
    <div className="app-card" onClick={onClick}>
      <div className="app-thumbnail">
        {app.thumbnail_url ? (
          <img src={app.thumbnail_url} alt={app.title} />
        ) : (
          <div className="thumbnail-placeholder">🎮</div>
        )}
      </div>
      <div className="app-info">
        <h3 className="app-title">{app.title}</h3>
        <p className="app-author">by {app.user_name || '익명'}</p>
      </div>
      {canDelete && (
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(app.id, app.user_id)
          }}
        >
          🗑️
        </button>
      )}
    </div>
  )
}
