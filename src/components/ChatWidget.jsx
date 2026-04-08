import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

/* 임시 닉네임 생성 (비로그인용) */
function getAnonName() {
  const saved = sessionStorage.getItem('chat_anon_name')
  if (saved) return saved
  const adjectives = ['용감한', '신나는', '똑똑한', '귀여운', '멋진', '빠른', '따뜻한', '씩씩한', '활발한', '즐거운']
  const nouns = ['코알라', '판다', '여우', '토끼', '사자', '호랑이', '독수리', '돌고래', '펭귄', '고양이']
  const num = Math.floor(Math.random() * 100)
  const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${num}`
  sessionStorage.setItem('chat_anon_name', name)
  return name
}

export default function ChatWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef(null)
  const openRef = useRef(open)

  // 로그인 유저면 display_name, 아니면 임시 닉네임
  const displayName = user
    ? (user.user_metadata?.display_name || user.email?.split('@')[0] || '익명')
    : getAnonName()

  // open 상태를 ref로 추적 (Realtime 콜백에서 최신값 참조)
  useEffect(() => { openRef.current = open }, [open])

  // 메시지 불러오기
  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)
    if (data) setMessages(data)
  }, [])

  // 최초 로드 + Realtime 구독 (한 번만)
  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel('chat-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        setMessages(prev => {
          // 낙관적 업데이트로 이미 추가한 메시지면 교체 (temp id → real id)
          const tempIdx = prev.findIndex(m => m._temp && m._tempKey === payload.new.message + payload.new.user_name)
          if (tempIdx !== -1) {
            const updated = [...prev]
            updated[tempIdx] = payload.new
            return updated
          }
          // 이미 존재하면 무시
          if (prev.some(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
        if (!openRef.current) setUnread(prev => prev + 1)
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchMessages])

  // 스크롤 하단 고정
  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const toggleChat = () => {
    setOpen(prev => !prev)
    if (!open) setUnread(0)
  }

  // 메시지 전송 (로그인 유저 + 익명 모두 가능)
  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    const msgText = input.trim()
    setSending(true)
    setInput('')

    // 낙관적 업데이트: 즉시 화면에 표시
    const tempMsg = {
      id: 'temp-' + Date.now(),
      _temp: true,
      _tempKey: msgText + displayName,
      user_id: user?.id || 'anon',
      user_name: displayName,
      message: msgText,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])

    if (user) {
      // 로그인 유저: Supabase에 저장
      const { error } = await supabase.from('chat_messages').insert({
        user_id: user.id,
        user_name: displayName,
        message: msgText
      })
      if (error) {
        // 실패 시 낙관적 메시지 제거
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
      }
    } else {
      // 비로그인: RLS가 막으므로 로컬에서만 표시 (다른 사람에겐 안 보임)
      // anon insert를 허용하려면 별도 RLS 정책 필요
      // 여기서는 로컬 전용으로 유지
    }
    setSending(false)
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  }

  const shouldShowDate = (msg, idx) => {
    if (idx === 0) return true
    const prev = new Date(messages[idx - 1].created_at).toDateString()
    const curr = new Date(msg.created_at).toDateString()
    return prev !== curr
  }

  return (
    <>
      <button className="chat-bubble" onClick={toggleChat} aria-label="채팅 열기">
        <span className="chat-bubble__icon">
          {open ? '✕' : '💬'}
        </span>
        {unread > 0 && !open && (
          <span className="chat-bubble__badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-window__header">
            <div className="chat-window__title">
              <span className="chat-window__pixel">▶</span>
              실시간 교무실 채팅
            </div>
            <div className="chat-window__online">
              <span className="chat-window__dot" />
              LIVE
            </div>
          </div>

          <div className="chat-window__body">
            {messages.length === 0 && (
              <div className="chat-window__empty">
                <span>🎮</span>
                <p>첫 번째 메시지를 남겨보세요!</p>
              </div>
            )}
            {messages.map((msg, idx) => {
              const isMe = (user && msg.user_id === user.id) || (!user && msg.user_id === 'anon')
              return (
                <div key={msg.id}>
                  {shouldShowDate(msg, idx) && (
                    <div className="chat-date-divider">
                      <span>{formatDate(msg.created_at)}</span>
                    </div>
                  )}
                  <div className={`chat-msg ${isMe ? 'chat-msg--me' : ''}`}>
                    <div className="chat-msg__name">{msg.user_name}</div>
                    <div className="chat-msg__row">
                      <div className="chat-msg__bubble">
                        {msg.message}
                      </div>
                      <span className="chat-msg__time">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* 누구나 입력 가능 (로그인 시 DB 저장, 비로그인 시 로컬) */}
          <form className="chat-window__input" onSubmit={sendMessage}>
            <div className="chat-window__input-name">
              {displayName}
            </div>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="메시지를 입력하세요..."
              maxLength={300}
              autoFocus
            />
            <button type="submit" disabled={sending || !input.trim()}>
              {sending ? '...' : '전송'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
