import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import AppCard from './AppCard'
import AppModal from './AppModal'
import UploadButton from './UploadButton'
import UploadModal from './UploadModal'
import LoginModal from './LoginModal'
import CategoryManager from './CategoryManager'

export default function VibeAppsSection() {
  const { user, signInWithGoogle, signOut, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('best')
  const [apps, setApps] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // 카테고리 불러오기
  useEffect(() => {
    fetchCategories()
  }, [])

  // 앱 데이터 불러오기
  useEffect(() => {
    fetchApps()
  }, [activeTab, categories])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('app_categories')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data) {
        // 기본 'best' 카테고리는 항상 포함
        if (!data.find(c => c.id === 'best')) {
          data.unshift({ id: 'best', label: 'BEST 바이브앱' })
        }
        setCategories(data)
        // 첫 번째 탭이 없으면 'best'로 설정
        if (!activeTab || !data.find(c => c.id === activeTab)) {
          setActiveTab('best')
        }
      }
    } catch (err) {
      console.error('카테고리 불러오기 실패:', err)
    }
  }

  const fetchApps = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('vibe_apps')
        .select('*')
        .order('created_at', { ascending: false })

      if (activeTab === 'best') {
        query = query.eq('is_featured', true)
      } else {
        query = query.eq('category', activeTab)
      }

      const { data, error } = await query
      if (!error) setApps(data || [])
    } catch (err) {
      console.error('앱 불러오기 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadClick = () => {
    if (!user) {
      setShowLoginModal(true)
    } else {
      setShowUploadModal(true)
    }
  }

  const handleDelete = async (appId, appUserId) => {
    if (!user) return
    if (user.id !== appUserId && !isAdmin) return

    if (!confirm('이 앱을 삭제할까요?')) return

    try {
      const { error } = await supabase
        .from('vibe_apps')
        .delete()
        .eq('id', appId)

      if (!error) fetchApps()
    } catch (err) {
      console.error('삭제 실패:', err)
    }
  }

  return (
    <section id="vibe-apps" className="vibe-apps-section">
      <div className="vibe-apps-header">
        <h2 className="vibe-apps-title">
          <span className="title-pixel">🎮</span> 바이브앱
        </h2>
        {user && (
          <div className="user-info">
            {user.user_metadata?.avatar_url && (
              <img src={user.user_metadata.avatar_url} alt="프로필" className="user-avatar" />
            )}
            <span>{user.user_metadata?.full_name || '사용자'}</span>
            {isAdmin && <span className="admin-badge">관리자</span>}
            <button onClick={signOut} className="btn-signout">로그아웃</button>
          </div>
        )}
      </div>

      {/* 관리자 카테고리 관리 패널 */}
      <CategoryManager
        categories={categories}
        onCategoriesChange={setCategories}
        isAdmin={isAdmin}
      />

      {/* 카테고리 탭 + 업로드 버튼 */}
      <div className="category-tab-bar">
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <UploadButton onClick={handleUploadClick} />
      </div>

      {/* 앱 갤러리 */}
      <div className="apps-grid">
        {loading ? (
          <div className="loading-pixel">⏳ 로딩 중...</div>
        ) : apps.length === 0 ? (
          <div className="empty-state">
            <p>아직 앱이 없어요!</p>
            <p>첫 번째 바이브앱을 올려보세요 🚀</p>
          </div>
        ) : (
          apps.map(app => (
            <AppCard
              key={app.id}
              app={app}
              onClick={() => setSelectedApp(app)}
              onDelete={handleDelete}
              canDelete={user && (user.id === app.user_id || isAdmin)}
            />
          ))
        )}
      </div>

      {/* 모달들 */}
      {selectedApp && (
        <AppModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
      {showUploadModal && (
        <UploadModal
          user={user}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => { setShowUploadModal(false); fetchApps() }}
          categories={categories.filter(c => c.id !== 'best')}
        />
      )}
      {showLoginModal && (
        <LoginModal
          onLogin={signInWithGoogle}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </section>
  )
}
