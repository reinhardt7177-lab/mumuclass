import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function ChatWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef(null)
  const chatBodyRef = useRef(null)

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || '익명'

  // 메시지 불러오기
  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)
    if (data) setMessages(data)
  }, [])

  useEffect(() => {
    fetchMessages()

    // Realtime 구독
    const channel = supabase
      .channel('chat-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
        if (!open) setUnread(prev => prev + 1)
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
  }, [fetchMessages, open])

  // 스크롤 하단 고정
  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  // 채팅 열 때 안읽은 메시지 초기화
  const toggleChat = () => {
    setOpen(prev => !prev)
    if (!open) setUnread(0)
  }

  // 메시지 전송
  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !user || sending) return

    setSending(true)
    const { error } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      user_name: displayName,
      message: input.trim()
    })
    if (!error) setInput('')
    setSending(false)
  }

  // 시간 포맷
  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  // 날짜 구분
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
      {/* 채팅 버블 버튼 */}
      <button className="chat-bubble" onClick={toggleChat} aria-label="채팅 열기">
        <span className="chat-bubble__icon">
          {open ? '✕' : '💬'}
        </span>
        {unread > 0 && !open && (
          <span className="chat-bubble__badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {/* 채팅 창 */}
      {open && (
        <div className="chat-window">
          {/* 헤더 */}
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

          {/* 메시지 영역 */}
          <div className="chat-window__body" ref={chatBodyRef}>
            {messages.length === 0 && (
              <div className="chat-window__empty">
                <span>🎮</span>
                <p>첫 번째 메시지를 남겨보세요!</p>
              </div>
            )}
            {messages.map((msg, idx) => {
              const isMe = user && msg.user_id === user.id
              return (
                <div key={msg.id}>
                  {shouldShowDate(msg, idx) && (
                    <div className="chat-date-divider">
                      <span>{formatDate(msg.created_at)}</span>
                    </div>
                  )}
                  <div className={`chat-msg ${isMe ? 'chat-msg--me' : ''}`}>
                    {!isMe && (
                      <div className="chat-msg__name">{msg.user_name}</div>
                    )}
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

          {/* 입력 영역 */}
          {user ? (
            <form className="chat-window__input" onSubmit={sendMessage}>
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
          ) : (
            <div className="chat-window__login-hint">
              <a href="/login">로그인</a>하고 채팅에 참여하세요!
            </div>
          )}
        </div>
      )}
    </>
  )
}
