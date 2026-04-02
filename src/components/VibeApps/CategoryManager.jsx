import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function CategoryManager({ categories, onCategoriesChange, isAdmin }) {
  const [showManager, setShowManager] = useState(false)
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isAdmin) return null

  const handleAddCategory = async () => {
    if (!newCategoryId.trim() || !newCategoryLabel.trim()) {
      setError('ID와 라벨을 입력해주세요')
      return
    }

    if (categories.find(c => c.id === newCategoryId)) {
      setError('이미 존재하는 카테고리 ID입니다')
      return
    }

    setLoading(true)
    try {
      const { error: insertError } = await supabase
        .from('app_categories')
        .insert({
          id: newCategoryId,
          label: newCategoryLabel,
        })

      if (insertError) throw insertError

      // 로컬 상태 업데이트
      onCategoriesChange([...categories, { id: newCategoryId, label: newCategoryLabel }])
      setNewCategoryId('')
      setNewCategoryLabel('')
      setError('')
    } catch (err) {
      setError('카테고리 추가 실패: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (catId) => {
    if (!confirm(`"${catId}" 카테고리를 삭제하시겠어요?`)) return

    setLoading(true)
    try {
      const { error: deleteError } = await supabase
        .from('app_categories')
        .delete()
        .eq('id', catId)

      if (deleteError) throw deleteError

      onCategoriesChange(categories.filter(c => c.id !== catId))
    } catch (err) {
      setError('카테고리 삭제 실패: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="category-manager-container">
      <button
        className="admin-panel-toggle"
        onClick={() => setShowManager(!showManager)}
        title="관리자 패널"
      >
        ⚙️ 카테고리 관리
      </button>

      {showManager && (
        <div className="category-manager-panel">
          <h3>📋 카테고리 관리</h3>

          {/* 기존 카테고리 목록 */}
          <div className="category-list">
            <h4>등록된 카테고리</h4>
            {categories.map(cat => (
              <div key={cat.id} className="category-item">
                <span className="category-badge">{cat.label}</span>
                <button
                  className="btn-delete-category"
                  onClick={() => handleDeleteCategory(cat.id)}
                  disabled={loading}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>

          {/* 카테고리 추가 폼 */}
          <div className="add-category-form">
            <h4>새 카테고리 추가</h4>
            <input
              type="text"
              placeholder="카테고리 ID (영문, 예: math)"
              value={newCategoryId}
              onChange={(e) => setNewCategoryId(e.target.value)}
            />
            <input
              type="text"
              placeholder="카테고리 라벨 (예: 수학)"
              value={newCategoryLabel}
              onChange={(e) => setNewCategoryLabel(e.target.value)}
            />
            <button
              className="btn-add-category"
              onClick={handleAddCategory}
              disabled={loading}
            >
              {loading ? '추가 중...' : '+ 추가'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
