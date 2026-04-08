import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabaseClient'

/* ── 시간 포맷 (YYYY-MM-DD HH:mm) ── */
const formatDateTime = (ts) => {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/* ── 닉네임 색상 (닉네임 기반 고정 색상) ── */
const NICK_COLORS = ['#5B9BD5', '#70C1B3', '#F4A261', '#E76F51', '#7EC8E3', '#C084FC', '#38BDF8', '#4ADE80', '#FB923C', '#F472B6']
const getNickColor = (name) => NICK_COLORS[Math.abs([...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) % NICK_COLORS.length]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [nickname, setNickname] = useState(() => localStorage.getItem('mumu_nick') || '')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const [toast, setToast] = useState(null)

  const listRef = useRef(null)
  const fileRef = useRef(null)
  const textareaRef = useRef(null)
  const openRef = useRef(open)

  useEffect(() => { openRef.current = open }, [open])

  // 닉네임 localStorage 저장
  useEffect(() => {
    if (nickname) localStorage.setItem('mumu_nick', nickname)
  }, [nickname])

  // 토스트 자동 닫기
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  // 메시지 불러오기
  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('mumu_chats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setMessages(data)
  }, [])

  // 최초 로드 + Realtime
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
          // 낙관적 메시지 교체
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
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchMessages])

  // 채팅 열 때 스크롤 탑으로
  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = 0
  }, [open])

  const toggleChat = () => {
    setOpen(prev => !prev)
    if (!open) setUnread(0)
  }

  // 이미지 선택
  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      setToast('이미지 크기는 5MB 이하만 가능합니다.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // 파일 탐색기에서 선택
  const handleFileChange = (e) => {
    handleImageSelect(e.target.files[0])
    e.target.value = ''
  }

  // 붙여넣기로 이미지 첨부
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

  // 이미지 업로드
  const uploadImage = async (file) => {
    const ext = file.name?.split('.').pop() || 'png'
    const path = `mumu-chats/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('app-images').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('app-images').getPublicUrl(path)
    return data.publicUrl
  }

  // 이미지 미리보기 제거
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
      }

      // 낙관적 업데이트
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

  return (
    <>
      {/* 플로팅 버블 */}
      <button className="suda-bubble" onClick={toggleChat} aria-label="수다방 열기">
        <span className="suda-bubble__icon">{open ? '✕' : '💬'}</span>
        {unread > 0 && !open && (
          <span className="suda-bubble__badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {/* 수다방 패널 */}
      {open && (
        <div className="suda-panel">
          {/* 토스트 */}
          {toast && <div className="suda-toast">{toast}</div>}

          {/* 헤더 */}
          <div className="suda-header">
            <div className="suda-header__top">
              <h2 className="suda-header__title">✨ 무무클래스 수다방</h2>
              <button className="suda-header__refresh" onClick={fetchMessages} title="새로고침">🔄</button>
            </div>
            <p className="suda-header__desc">자유롭게 주절주절. 오류나 추가 기능 요청도 환영합니다.</p>
          </div>

          {/* 입력 폼 */}
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

            {/* 이미지 미리보기 */}
            {imagePreview && (
              <div className="suda-form__preview">
                <img src={imagePreview} alt="미리보기" />
                <button type="button" className="suda-form__preview-remove" onClick={removeImage}>✕</button>
              </div>
            )}

            <textarea
              ref={textareaRef}
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

          {/* 메시지 리스트 */}
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
