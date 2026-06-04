import { useEffect, useState } from 'react'

export default function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState('in') // 'in' | 'hold' | 'out'

  useEffect(() => {
    // fade in → hold → fade out
    const holdTimer = setTimeout(() => setPhase('out'), 1400)
    const doneTimer = setTimeout(() => onDone(), 2000)
    return () => { clearTimeout(holdTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]"
      style={{
        opacity: phase === 'out' ? 0 : 1,
        transition: phase === 'out' ? 'opacity 0.6s ease' : 'opacity 0.4s ease',
      }}
    >
      {/* Logo */}
      <div
        style={{
          opacity: phase === 'in' ? 0 : 1,
          transform: phase === 'in' ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s',
        }}
        className="flex flex-col items-center gap-3"
      >
        <img
          src="/logo_arka.png"
          alt="ARKA"
          className="w-14 h-14 object-contain"
        />
        <div className="text-center">
          <p className="text-white text-sm font-semibold tracking-[0.35em] uppercase">ARKA</p>
          <p className="text-[#94A3B8] text-[9px] tracking-[0.4em] uppercase mt-0.5">Global Investments</p>
        </div>
      </div>

      {/* Thin progress line */}
      <div className="absolute bottom-0 left-0 h-[1px] bg-[#C9A352]/40"
        style={{
          width: phase === 'in' ? '0%' : phase === 'hold' ? '75%' : '100%',
          transition: phase === 'in'
            ? 'width 0.5s ease'
            : phase === 'hold'
            ? 'width 0.9s ease'
            : 'width 0.5s ease',
        }}
      />
    </div>
  )
}
