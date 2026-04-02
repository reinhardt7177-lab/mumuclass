export default function UploadButton({ onClick }) {
  return (
    <button className="retro-upload-btn" onClick={onClick}>
      <span className="pixel-icon">📤</span>
      <span className="btn-text">앱 업로드</span>
    </button>
  )
}
