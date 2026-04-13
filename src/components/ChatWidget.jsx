import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'mumuclass@mumuclass.kr'

/* ── 시간 포맷 (YYYY-MM-DD HH:mm) ── */
const formatDateTime = (ts) => {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/* ── 닉네임 색상 ── */
const NICK_COLORS = ['#5B9BD5', '#70C1B3', '#F4A261', '#E76F51', '#7EC8E3', '#C084FC', '#38BDF8', '#4ADE80', '#FB923C', '#F472B6']
const getNickColor = (name) => NICK_COLORS[Math.abs([...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) % NICK_COLORS.length]

/* ── 간단 해시 (비밀번호 평문 저장 방지) ── */
const simpleHash = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return 'h' + Math.abs(h).toString(36)
}

export default function ChatWidget() {
  const { user } = useAuth()
  const isAdmin = user?.email === ADMIN_EMAIL

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [nickname, setNickname] = useState(() => localStorage.getItem('mumu_nick') || '')
  const [content, setContent] = useState('')
  const [password, setPassword] = useState(() => localStorage.getItem('mumu_pw') || '')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const [toast, setToast] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // 삭제 대상 메시지 id
  const [deletePw, setDeletePw] = useState('')

  const listRef = useRef(null)
  const fileRef = useRef(null)
  const openRef = useRef(open)

  useEffect(() => { openRef.current = open }, [open])

  useEffect(() => {
    if (nickname) localStorage.setItem('mumu_nick', nickname)
  }, [nickname])

  useEffect(() => {
    if (password) localStorage.setItem('mumu_pw', password)
  }, [password])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('mumu_chats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setMessages(data)
  }, [])

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel('mumu-chats-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mumu_chats'
      }, (payload) => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev
          const tempIdx = prev.findIndex(m => m._temp && m._tempKey === payload.new.content + payload.new.nickname)
          if (tempIdx !== -1) {
            const updated = [...prev]
            updated[tempIdx] = payload.new
            return updated
          }
          return [payload.new, ...prev]
        })
        if (!openRef.current) setUnread(prev => prev + 1)
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'mumu_chats'
      }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchMessages])

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = 0
  }, [open])

  const toggleChat = () => {
    setOpen(prev => !prev)
    if (!open) setUnread(0)
  }

  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { setToast('이미지 크기는 5MB 이하만 가능합니다.'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleFileChange = (e) => {
    handleImageSelect(e.target.files[0])
    e.target.value = ''
  }

  const handlePaste = (e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        handleImageSelect(item.getAsFile())
        return
      }
    }
  }

  const uploadImage = async (file) => {
    const ext = file.name?.split('.').pop() || 'png'
    const path = `mumu-chats/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('app-images').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('app-images').getPublicUrl(path)
    return data.publicUrl
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  // 등록
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nickname.trim()) { setToast('닉네임을 입력해 주세요!'); return }
    if (!content.trim() && !imageFile) { setToast('내용을 입력하거나 이미지를 첨부해 주세요!'); return }
    setSending(true)

    try {
      let image_url = null
      if (imageFile) image_url = await uploadImage(imageFile)

      const row = {
        nickname: nickname.trim(),
        content: content.trim(),
        image_url,
        password: password.trim() ? simpleHash(password.trim()) : null,
      }

      const tempMsg = {
        id: 'temp-' + Date.now(),
        _temp: true,
        _tempKey: row.content + row.nickname,
        ...row,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [tempMsg, ...prev])
      setContent('')
      setImageFile(null)
      setImagePreview(null)

      const { error } = await supabase.from('mumu_chats').insert(row)
      if (error) {
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
        setToast('등록 실패: ' + error.message)
      }
    } catch (err) {
      setToast('오류: ' + err.message)
    }
    setSending(false)
  }

  // 삭제
  const handleDelete = async (msgId) => {
    const msg = messages.find(m => m.id === msgId)
    if (!msg) return

    // 관리자는 비밀번호 없이 삭제 가능
    if (isAdmin) {
      const { error } = await supabase.from('mumu_chats').delete().eq('id', msgId)
      if (error) { setToast('삭제 실패: ' + error.message); return }
      setMessages(prev => prev.filter(m => m.id !== msgId))
      setToast('관리자 권한으로 삭제 완료')
      setDeleteTarget(null)
      return
    }

    // 일반 사용자: 비밀번호 확인
    if (!msg.password) {
      setToast('비밀번호 없이 작성된 글은 삭제할 수 없습니다.')
      setDeleteTarget(null)
      return
    }

    if (!deletePw.trim()) {
      setToast('비밀번호를 입력해 주세요.')
      return
    }

    if (simpleHash(deletePw.trim()) !== msg.password) {
      setToast('비밀번호가 일치하지 않습니다.')
      return
    }

    const { error } = await supabase.from('mumu_chats').delete().eq('id', msgId)
    if (error) { setToast('삭제 실패: ' + error.message); return }
    setMessages(prev => prev.filter(m => m.id !== msgId))
    setToast('삭제 완료!')
    setDeleteTarget(null)
    setDeletePw('')
  }

  return (
    <>
      <button className="suda-bubble" onClick={toggleChat} aria-label="수다방 열기">
        <span className="suda-bubble__icon">{open ? '✕' : '💬'}</span>
        {unread > 0 && !open && (
          <span className="suda-bubble__badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="suda-panel">
          {toast && <div className="suda-toast">{toast}</div>}

          {/* 삭제 확인 모달 */}
          {deleteTarget && !isAdmin && (
            <div className="suda-delete-modal">
              <div className="suda-delete-modal__box">
                <p className="suda-delete-modal__title">🔒 삭제 비밀번호 입력</p>
                <input
                  type="password"
                  className="suda-delete-modal__input"
                  placeholder="글 작성 시 입력한 비밀번호"
                  value={deletePw}
                  onChange={e => setDeletePw(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleDelete(deleteTarget) }}
                  autoFocus
                />
                <div className="suda-delete-modal__btns">
                  <button onClick={() => { setDeleteTarget(null); setDeletePw('') }} className="suda-delete-modal__cancel">취소</button>
                  <button onClick={() => handleDelete(deleteTarget)} className="suda-delete-modal__confirm">삭제</button>
                </div>
              </div>
            </div>
          )}

          <div className="suda-header">
            <div className="suda-header__top">
              <h2 className="suda-header__title">✨ 무무클래스 수다방</h2>
              <button className="suda-header__refresh" onClick={fetchMessages} title="새로고침">🔄</button>
            </div>
            <p className="suda-header__desc">자유롭게 주절주절. 오류나 추가 기능 요청도 환영합니다.</p>
          </div>

          <form className="suda-form" onSubmit={handleSubmit}>
            <div className="suda-form__row">
              <input
                className="suda-form__nick"
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={20}
              />
              <input
                className="suda-form__pw"
                type="password"
                placeholder="비번 (삭제용)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                maxLength={20}
              />
              <button
                type="button"
                className="suda-form__img-btn"
                onClick={() => fileRef.current?.click()}
                title="이미지 업로드"
              >📷</button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {imagePreview && (
              <div className="suda-form__preview">
                <img src={imagePreview} alt="미리보기" />
                <button type="button" className="suda-form__preview-remove" onClick={removeImage}>✕</button>
              </div>
            )}

            <textarea
              className="suda-form__content"
              placeholder="여기에 이미지 붙여넣기 가능! DB를 우회하는 수다방입니다."
              value={content}
              onChange={e => setContent(e.target.value)}
              onPaste={handlePaste}
              rows={3}
              maxLength={1000}
            />
            <button type="submit" className="suda-form__submit" disabled={sending}>
              {sending ? '등록 중...' : '등록'}
            </button>
          </form>

          <div className="suda-list" ref={listRef}>
            {messages.length === 0 && (
              <div className="suda-list__empty">
                <p>아직 글이 없어요. 첫 번째 글을 남겨보세요! ✏️</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="suda-msg">
                <div className="suda-msg__head">
                  <span className="suda-msg__nick" style={{ color: getNickColor(msg.nickname) }}>{msg.nickname}</span>
                  <span className="suda-msg__time">{formatDateTime(msg.created_at)}</span>
                  {/* 삭제 버튼: 관리자 or 비번 있는 글 */}
                  {(isAdmin || msg.password) && !msg._temp && (
                    <button
                      className="suda-msg__delete"
                      onClick={() => {
                        if (isAdmin) { handleDelete(msg.id) }
                        else { setDeleteTarget(msg.id); setDeletePw('') }
                      }}
                      title={isAdmin ? '관리자 삭제' : '비밀번호로 삭제'}
                    >✕</button>
                  )}
                </div>
                {msg.image_url && (
                  <div className="suda-msg__img">
                    <img src={msg.image_url} alt="첨부 이미지" onClick={() => window.open(msg.image_url, '_blank')} />
                  </div>
                )}
                {msg.content && <p className="suda-msg__text">{msg.content}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
