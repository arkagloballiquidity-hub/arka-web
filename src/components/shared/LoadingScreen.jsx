import { useEffect, useState } from 'react'

export default function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState('in') // 'in' | 'visible' | 'out'

  useEffect(() => {
    const visibleTimer = setTimeout(() => setPhase('visible'), 50)
    const outTimer    = setTimeout(() => setPhase('out'), 1500)
    const doneTimer   = setTimeout(() => onDone(), 2100)
    return () => { clearTimeout(visibleTimer); clearTimeout(outTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]"
      style={{
        opacity: phase === 'out' ? 0 : 1,
        transition: phase === 'out' ? 'opacity 0.6s ease' : 'none',
        pointerEvents: phase === 'out' ? 'none' : 'all',
      }}
    >
      {/* Logo + texto */}
      <div
        className="flex flex-col items-center gap-5"
        style={{
          opacity: phase === 'in' ? 0 : 1,
          transform: phase === 'in' ? 'translateY(10px)' : 'translateY(0)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <img
          src="/logo_arka.png"
          alt="ARKA"
          className="w-16 h-16 object-contain"
        />
        <p
          style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.25em' }}
          className="text-white text-sm font-semibold uppercase tracking-widest"
        >
          ARKA GLOBAL INVESTMENTS
        </p>
      </div>

      {/* Barra de progreso dorada */}
      <div className="absolute bottom-0 left-0 h-[1px] bg-[#C9A352]/50"
        style={{
          width: phase === 'in' ? '0%' : phase === 'visible' ? '80%' : '100%',
          transition: phase === 'in'
            ? 'none'
            : phase === 'visible'
            ? 'width 1.4s cubic-bezier(0.4,0,0.2,1)'
            : 'width 0.4s ease',
        }}
      />
    </div>
  )
}
