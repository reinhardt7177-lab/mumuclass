import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { ComingSoon } from './components/ComingSoon'
import HomePage from './components/HomePage'
import AppDetail from './components/AppDetail'
import CreateApp from './components/CreateApp'
import CommunityBoard from './components/CommunityBoard'
import CreatePost from './components/CreatePost'
import PostDetail from './components/PostDetail'
import Login from './components/Login'
import CompanyStory from './components/CompanyStory'
import AppGallery from './components/AppGallery'
import AdminPanel from './components/AdminPanel'
import AppLabBoard from './components/AppLabBoard'
import CreateAppRequest from './components/CreateAppRequest'
import AppRequestDetail from './components/AppRequestDetail'
import MealkitPage from './components/MealkitPage'
import ChatWidget from './components/ChatWidget'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ 
          width: 32, height: 32, 
          borderColor: 'var(--border)', 
          borderTopColor: 'var(--accent)' 
        }} />
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Nav />
        <Routes>
          {/* 메인 홈 = 앱 게시판 (누구나 구경 가능) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          
          {/* 회사 스토리 */}
          <Route path="/story" element={<CompanyStory />} />

          {/* 앱제작연구소 — 나만의앱 요청게시판 (읽기: 누구나 / 쓰기: 로그인 필요) */}
          <Route path="/ai-tech" element={<AppLabBoard />} />
          <Route path="/ai-tech/write" element={
            <ProtectedRoute><CreateAppRequest /></ProtectedRoute>
          } />
          <Route path="/ai-tech/:id" element={<AppRequestDetail />} />
          
          {/* 앱 상세/등록은 로그인 필요 */}
          <Route path="/apps/create" element={
            <ProtectedRoute><CreateApp /></ProtectedRoute>
          } />
          <Route path="/apps/:id" element={<AppDetail />} />
          
          <Route path="/shop" element={
            <ProtectedRoute>
              <ComingSoon title="교육상품 마켓" icon="🛒" desc="선생님의 교구, 학습자료, 굿즈를 사고팔 수 있는 마켓을 준비하고 있습니다." />
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute><CommunityBoard /></ProtectedRoute>
          } />
          <Route path="/community/write" element={
            <ProtectedRoute><CreatePost /></ProtectedRoute>
          } />
          <Route path="/community/:id" element={
            <ProtectedRoute><PostDetail /></ProtectedRoute>
          } />
          <Route path="/mealkit" element={<MealkitPage />} />
          <Route path="/gallery" element={
            <ProtectedRoute><AppGallery /></ProtectedRoute>
          } />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        <ChatWidget />
      </AuthProvider>
    </BrowserRouter>
  )
}
