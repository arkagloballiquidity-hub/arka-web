import { useState, useRef, useEffect } from 'react'
import { useLang } from '@/context/LanguageContext'

const WELCOME = {
  en: "Hello, I'm ARKA Assistant. I can help you understand our investment strategies, walk you through the Simulator or Profiler, and answer questions about the access process. How can I help?",
  es: "Hola, soy el Asistente ARKA. Puedo ayudarte a entender nuestras estrategias de inversión, guiarte por el Simulador o el Perfilador, y responder preguntas sobre el proceso de acceso. ¿En qué puedo ayudarte?",
}

export default function ChatWidget() {
  const { lang } = useLang()
  const [isOpen, setIsOpen]   = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME[lang] || WELCOME.en }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120)
  }, [isOpen])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const next    = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'es'
          ? 'Lo siento, hubo un error de conexión. Intenta de nuevo.'
          : 'Sorry, there was a connection error. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* ── Chat window ── */}
      {isOpen && (
        <div className="fixed bottom-[4.5rem] right-4 sm:right-6 z-[200] w-[340px] sm:w-[370px] flex flex-col rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-2xl shadow-black/70 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-[#090909]">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full border border-[#C9A352]/40 flex items-center justify-center shrink-0">
                <span className="text-[#C9A352] text-xs font-semibold">A</span>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-[1.5px] border-[#090909]" />
              </div>
              <div>
                <p className="text-white/90 text-[13px] font-light tracking-wide">ARKA Assistant</p>
                <p className="text-white/30 text-[9px] tracking-[0.2em] uppercase">
                  {lang === 'es' ? 'En línea' : 'Online'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/25 hover:text-white/60 transition-colors text-xl leading-none pb-0.5"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="overflow-y-auto p-4 space-y-3 h-[340px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] px-4 py-2.5 text-[13px] leading-relaxed rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[#C9A352]/12 text-white/85 rounded-br-sm border border-[#C9A352]/15'
                    : 'bg-white/[0.045] text-white/75 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.045] px-4 py-3.5 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <div key={i}
                      className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                      style={{ animationDelay: `${i * 0.18}s`, animationDuration: '1s' }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/[0.06] p-3 bg-[#090909]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                disabled={loading}
                placeholder={lang === 'es' ? 'Escribe tu pregunta...' : 'Ask a question...'}
                className="flex-1 bg-white/[0.04] border border-white/8 rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder-white/22 outline-none focus:border-white/18 transition-colors disabled:opacity-40"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-9 h-9 shrink-0 rounded-lg bg-[#C9A352]/15 hover:bg-[#C9A352]/25 border border-[#C9A352]/25 text-[#C9A352] flex items-center justify-center transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M12 6.5L1 1l2.5 5.5L1 12l11-5.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="text-white/15 text-[9px] text-center mt-2 tracking-wide">
              {lang === 'es'
                ? 'Orientativo — no constituye asesoría financiera'
                : 'Informational — not financial advice'}
            </p>
          </div>
        </div>
      )}

      {/* ── Floating button ── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label="ARKA Assistant"
        className="fixed bottom-4 right-4 sm:right-6 z-[200] w-12 h-12 rounded-full border border-[#C9A352]/25 bg-[#0c0c0c] hover:border-[#C9A352]/55 hover:bg-[#C9A352]/6 transition-all duration-300 flex items-center justify-center shadow-lg shadow-black/50 group"
      >
        {isOpen ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 3L3 13M3 3l10 10" stroke="#C9A352" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <>
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
              <path d="M17 9c0 4.142-3.358 7.5-7.5 7.5a7.473 7.473 0 01-3.969-1.133L2 16.5l1.133-3.531A7.473 7.473 0 011.5 9C1.5 4.858 4.858 1.5 9.5 1.5S17 4.858 17 9z"
                stroke="#C9A352" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-[1.5px] border-[#050505]" />
          </>
        )}
      </button>
    </>
  )
}
