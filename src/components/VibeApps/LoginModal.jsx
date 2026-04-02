export default function LoginModal({ onLogin, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="login-pixel-art">🎮</div>
        <h2>바이브앱을 올리려면<br/>로그인이 필요해요!</h2>
        <p>구글 계정으로 간편하게 로그인하세요</p>
        <button className="btn-google-login" onClick={onLogin}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width="20"
          />
          Google로 로그인
        </button>
      </div>
    </div>
  )
}
