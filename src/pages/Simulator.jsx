import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '@/context/LanguageContext'

// ── Rates & presets ──────────────────────────────────────────────────────────
const RATES = { foundation: 0.18, growth: 0.24, alpha: 0.36 }
const BENCH = { sp500: 0.108, cetes: 0.097, bank: 0.045 }

// Presets mirror the 5 Profiler risk profiles (same id + allocation), so the
// recommended profile highlights automatically when arriving from the Profiler.
const PRESETS = [
  { id: 'conservative', en: 'Conservative', es: 'Conservador', f: 80, g: 20, a: 0   },
  { id: 'moderate',     en: 'Moderate',     es: 'Moderado',    f: 50, g: 50, a: 0   },
  { id: 'balanced',     en: 'Balanced',     es: 'Equilibrado', f: 30, g: 45, a: 25  },
  { id: 'dynamic',      en: 'Dynamic',      es: 'Dinámico',    f: 10, g: 35, a: 55  },
  { id: 'aggressive',   en: 'Aggressive',   es: 'Agresivo',    f: 0,  g: 0,  a: 100 },
]

function blended(f, g, a) {
  return (f * RATES.foundation + g * RATES.growth + a * RATES.alpha) / 100
}

// Risk-tier colors (shared with the Profiler) — derived from the blended rate,
// so the accent always reflects the current allocation's risk level.
const RISK_COLORS = ['#5E97C2', '#46B58F', '#C9A352', '#E0705A', '#9B6FD4']
function riskColor(f, g, a) {
  const rate = blended(f, g, a) * 100
  if (rate <= 20)   return RISK_COLORS[0]
  if (rate <= 23)   return RISK_COLORS[1]
  if (rate <= 27.5) return RISK_COLORS[2]
  if (rate <= 33)   return RISK_COLORS[3]
  return RISK_COLORS[4]
}

// Days per month (standard, no leap year adjustment for simulation purposes)
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function calcProjection({ initial, monthly, years, f, g, a, compound }) {
  const annual      = blended(f, g, a)
  const daily       = Math.pow(1 + annual,      1 / 365) - 1
  const dailySP     = Math.pow(1 + BENCH.sp500, 1 / 365) - 1
  const dailyCetes  = Math.pow(1 + BENCH.cetes, 1 / 365) - 1
  const dailyBank   = Math.pow(1 + BENCH.bank,  1 / 365) - 1

  let arka = initial, sp500 = initial, cetes = initial, bank = initial
  const rows = [{ year: 0, arka: initial, sp500: initial, cetes: initial, bank: initial, contributed: initial, months: [] }]
  let totalContrib = initial

  for (let y = 1; y <= years; y++) {
    const yearMonths = []
    for (let m = 0; m < 12; m++) {
      const days = MONTH_DAYS[m]
      let mArka, mSP, mCetes, mBank

      if (compound) {
        // Day-accurate: each month compounds exactly by its real number of days
        mArka  = Math.pow(1 + daily,      days) - 1
        mSP    = Math.pow(1 + dailySP,    days) - 1
        mCetes = Math.pow(1 + dailyCetes, days) - 1
        mBank  = Math.pow(1 + dailyBank,  days) - 1
        arka  = arka  * (1 + mArka)  + monthly
        sp500 = sp500 * (1 + mSP)    + monthly
        cetes = cetes * (1 + mCetes) + monthly
        bank  = bank  * (1 + mBank)  + monthly
      } else {
        // Simple: fixed 1/12 of annual rate, on initial capital only
        mArka  = annual      / 12
        mSP    = BENCH.sp500 / 12
        mCetes = BENCH.cetes / 12
        mBank  = BENCH.bank  / 12
        arka  += initial * mArka  + monthly
        sp500 += initial * mSP   + monthly
        cetes += initial * mCetes + monthly
        bank  += initial * mBank  + monthly
      }
      totalContrib += monthly
      yearMonths.push({
        month:    m + 1,
        days,
        mRetPct:  mArka * 100,   // actual monthly return % for this month
        arka:     Math.round(arka),
        sp500:    Math.round(sp500),
        cetes:    Math.round(cetes),
        bank:     Math.round(bank),
        contributed: Math.round(totalContrib),
      })
    }
    rows.push({
      year: y,
      arka:  Math.round(arka),
      sp500: Math.round(sp500),
      cetes: Math.round(cetes),
      bank:  Math.round(bank),
      contributed: Math.round(totalContrib),
      months: yearMonths,
    })
  }
  const mRate = compound ? Math.pow(1 + daily, 365 / 12) - 1 : annual / 12
  return { rows, annual, mRate }
}

// ── Formatting ───────────────────────────────────────────────────────────────
function fmtUSD(n, short = false) {
  if (short) {
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
    return `$${n}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function pct(v) { return `${(v * 100).toFixed(2)}%` }

// ── Institutional palette ─────────────────────────────────────────────────────
// ARKA gold, silver grays for benchmarks — no neon colors
const PALETTE = {
  arka:  '#C9A352',
  sp500: '#94A3B8',
  cetes: '#64748B',
  bank:  '#475569',
}

// ── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ rows, accent = PALETTE.arka }) {
  const W = 800, H = 290
  const PAD = { top: 24, right: 20, bottom: 52, left: 76 }
  const iW  = W - PAD.left - PAD.right
  const iH  = H - PAD.top  - PAD.bottom

  const maxVal = Math.max(...rows.map(r => r.arka))
  const n = rows.length - 1

  const sx = y => PAD.left + (y / n) * iW
  const sy = v => PAD.top + iH - (v / maxVal) * iH

  const toPath = key =>
    rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${sx(r.year).toFixed(1)},${sy(r[key]).toFixed(1)}`).join(' ')

  const LINES = [
    { key: 'arka',  color: accent,        w: 2.5, label: 'ARKA' },
    { key: 'sp500', color: PALETTE.sp500, w: 1.6, label: 'S&P 500' },
    { key: 'cetes', color: PALETTE.cetes, w: 1.4, label: 'CETES' },
    { key: 'bank',  color: PALETTE.bank,  w: 1.2, label: 'Banking' },
  ]

  const gridSteps = [0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridSteps.map(p => {
        const y = PAD.top + iH * (1 - p)
        return (
          <g key={p}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              stroke="white" strokeOpacity={0.05} strokeWidth={1} strokeDasharray="3,5" />
            <text x={PAD.left - 10} y={y + 4} textAnchor="end"
              fontSize="10" fill="rgba(255,255,255,0.45)" fontFamily="monospace">
              {fmtUSD(maxVal * p, true)}
            </text>
          </g>
        )
      })}

      {/* X axis ticks */}
      {rows.filter((_, i) => i % Math.max(1, Math.ceil(n / 7)) === 0 || i === n).map(r => (
        <text key={r.year} x={sx(r.year)} y={H - 30} textAnchor="middle"
          fontSize="10" fill="rgba(255,255,255,0.45)" fontFamily="monospace">
          {r.year === 0 ? 'Hoy' : `Yr ${r.year}`}
        </text>
      ))}

      {/* ARKA area fill */}
      <path
        d={`${toPath('arka')} L${sx(n)},${PAD.top + iH} L${PAD.left},${PAD.top + iH} Z`}
        fill="url(#areaGrad)" />

      {/* Lines */}
      {LINES.map(({ key, color, w }) => (
        <path key={key} d={toPath(key)} fill="none" stroke={color} strokeWidth={w}
          strokeLinecap="round" strokeLinejoin="round"
          opacity={key === 'arka' ? 1 : 0.6} />
      ))}

      {/* Legend */}
      {LINES.map(({ key, color, label }, i) => (
        <g key={key} transform={`translate(${PAD.left + i * 145},${H - 14})`}>
          <line x1={0} y1={-3} x2={20} y2={-3} stroke={color} strokeWidth={key === 'arka' ? 2.5 : 1.5}
            opacity={key === 'arka' ? 1 : 0.7} />
          <text x={24} y={0} fontSize="10" fill={key === 'arka' ? color : 'rgba(255,255,255,0.6)'}
            fontFamily="system-ui">{label}</text>
        </g>
      ))}
    </svg>
  )
}

// ── Slider (with typeable value) ─────────────────────────────────────────────
function Slider({ label, value, min, max, step, onChange, fmt }) {
  const sliderId = `slider-${label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
  const [editing, setEditing] = useState(false)
  const [raw, setRaw]         = useState('')

  const commit = (str) => {
    const n = parseFloat(String(str).replace(/[^0-9.]/g, ''))
    if (!isNaN(n)) {
      const clamped = Math.min(max, Math.max(min, Math.round(n / step) * step))
      onChange(clamped)
    }
    setEditing(false)
  }

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-baseline gap-3">
        <label htmlFor={sliderId} className="text-[10px] tracking-[0.28em] uppercase text-white/55 shrink-0">{label}</label>
        {editing ? (
          <input
            type="text"
            autoFocus
            value={raw}
            onChange={e => setRaw(e.target.value)}
            onBlur={() => commit(raw)}
            onKeyDown={e => { if (e.key === 'Enter') commit(raw); if (e.key === 'Escape') setEditing(false) }}
            className="text-white text-base font-light tabular-nums bg-transparent border-b border-[#C9A352]/70 outline-none text-right w-28"
          />
        ) : (
          <button
            type="button"
            onClick={() => { setRaw(String(value)); setEditing(true) }}
            title={fmt ? 'Click to type a value' : undefined}
            className="text-white text-base font-light tabular-nums hover:text-[#C9A352] transition-colors duration-150 cursor-text text-right"
          >
            {fmt ? fmt(value) : value}
          </button>
        )}
      </div>
      <input
        id={sliderId} name={sliderId}
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-px bg-white/12 appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[#C9A352] [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(201,163,82,0.4)]
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#C9A352]
          [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  )
}

// ── Allocation bar ───────────────────────────────────────────────────────────
function AllocBar({ f, g, a }) {
  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-px">
      <div style={{ width: `${f}%` }} className="bg-white/50 transition-all duration-300" />
      <div style={{ width: `${g}%` }} className="bg-[#C9A352] transition-all duration-300" />
      <div style={{ width: `${a}%` }} className="bg-white/25 transition-all duration-300" />
    </div>
  )
}

// ── Gradient text helper ─────────────────────────────────────────────────────
function GradientValue({ children, className = '' }) {
  return (
    <span className={`bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

function GoldValue({ children, className = '' }) {
  return (
    <span className={`bg-gradient-to-r from-[#C9A352] to-[#E8C87A] bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Simulator() {
  const { lang } = useLang()

  const [initial,  setInitial]  = useState(50000)
  const [monthly,  setMonthly]  = useState(1000)
  const [years,    setYears]    = useState(10)
  const [compound, setCompound] = useState(true)
  const [preset,   setPreset]   = useState('balanced')
  const [f, setF] = useState(30)
  const [g, setG] = useState(45)
  const [a, setA] = useState(25)
  const [showTable,    setShowTable]    = useState(false)
  const [expandedYear, setExpandedYear] = useState(null)

  // Email send
  const [senderName,  setSenderName]  = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [sendStatus,  setSendStatus]  = useState('idle') // idle | sending | sent | error

  // Load profiler allocation if coming from Profiler page
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('arka_profiler_alloc')
      if (saved) {
        const { f: pf, g: pg, a: pa } = JSON.parse(saved)
        setF(pf); setG(pg); setA(pa)
        // Only highlight a preset when the recommended mix matches it exactly;
        // otherwise show it as custom so the bar reflects the real allocation.
        const match = PRESETS.find(x => x.f === pf && x.g === pg && x.a === pa)
        setPreset(match ? match.id : 'custom')
        sessionStorage.removeItem('arka_profiler_alloc')
      }
    } catch {}
  }, [])

  const applyPreset = (p) => {
    const found = PRESETS.find(x => x.id === p)
    if (found) { setF(found.f); setG(found.g); setA(found.a); setPreset(p) }
  }

  const handleF = v => { const rem = 100 - v; const ratio = g + a > 0 ? g / (g + a) : 0.5; setF(v); setG(Math.round(rem * ratio)); setA(100 - v - Math.round(rem * ratio)); setPreset('custom') }
  const handleG = v => { const rem = 100 - v; const ratio = f + a > 0 ? f / (f + a) : 0.5; setG(v); setF(Math.round(rem * ratio)); setA(100 - v - Math.round(rem * ratio)); setPreset('custom') }
  const handleA = v => { const rem = 100 - v; const ratio = f + g > 0 ? f / (f + g) : 0.5; setA(v); setF(Math.round(rem * ratio)); setG(100 - v - Math.round(rem * ratio)); setPreset('custom') }

  // Accent color — always reflects the current allocation's risk tier,
  // so it updates live when presets or sliders change.
  const accent = riskColor(f, g, a)

  const { rows, annual } = useMemo(
    () => calcProjection({ initial, monthly, years, f, g, a, compound }),
    [initial, monthly, years, f, g, a, compound]
  )

  const finalRow    = rows[rows.length - 1]
  const totalContrib = initial + monthly * years * 12
  const netGain      = finalRow.arka - totalContrib

  const handleSendResults = async () => {
    if (!senderEmail || sendStatus === 'sending' || sendStatus === 'sent') return
    setSendStatus('sending')
    try {
      const res = await fetch('/api/send-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:   senderName,
          email:  senderEmail,
          params: {
            initial, monthly, years, f, g, a, compound,
            annual: (annual * 100).toFixed(2),
          },
          results: {
            finalCapital: finalRow.arka,
            totalContrib,
            netGain,
            multiplier: (finalRow.arka / (totalContrib || 1)).toFixed(1),
          },
        }),
      })
      if (!res.ok) throw new Error('Send failed')
      setSendStatus('sent')
    } catch {
      setSendStatus('error')
    }
  }

  const T = {
    en: {
      title: 'Investment Simulator',
      sub: 'Project your capital growth across ARKA strategies.',
      capital: 'Initial Capital',
      monthly: 'Monthly Contribution',
      horizon: 'Investment Horizon',
      mode: 'Your gains',
      compound: 'Reinvest',
      simple: 'Withdraw',
      help_compound: 'Reinvest: your gains are added to your capital.',
      help_simple: 'Withdraw: you receive your gains each month.',
      allocation: 'Strategy Allocation',
      foundation: 'Foundation',
      growth: 'Strategic Growth',
      alpha: 'Alpha Force',
      presets: 'Presets',
      custom: 'Custom',
      rate: 'Blended Annual Rate',
      projected: 'Projected Capital',
      after: 'after',
      years: 'years',
      contributed: 'Total Contributed',
      netGain: 'Net Gain',
      vs: 'vs. Benchmarks',
      yr: 'Yr',
      tableTitle: 'Year-by-Year Breakdown',
      show: 'Show Breakdown',
      hide: 'Hide Breakdown',
      disclaimer: '⚠ This simulator uses target reference rates and does not guarantee future results. Investing involves risk, including possible loss of capital.',
      apply: 'Contact',
    },
    es: {
      title: 'Simulador de Inversión',
      sub: 'Proyecta el crecimiento de tu capital en las estrategias ARKA.',
      capital: 'Capital Inicial',
      monthly: 'Aportación Mensual',
      horizon: 'Horizonte de Inversión',
      mode: 'Tus ganancias',
      compound: 'Reinvertir',
      simple: 'Retirar',
      help_compound: 'Reinvertir: tus ganancias se suman al capital.',
      help_simple: 'Retirar: recibes tus ganancias cada mes.',
      allocation: 'Asignación de Estrategias',
      foundation: 'Fundación',
      growth: 'Crecimiento Estratégico',
      alpha: 'Alpha Force',
      presets: 'Presets',
      custom: 'Personalizado',
      rate: 'Tasa Anual Ponderada',
      projected: 'Capital Proyectado',
      after: 'en',
      years: 'años',
      contributed: 'Total Aportado',
      netGain: 'Ganancia Neta',
      vs: 'vs. Benchmarks',
      yr: 'Año',
      tableTitle: 'Desglose Anual',
      show: 'Ver Desglose',
      hide: 'Ocultar Desglose',
      disclaimer: '⚠ Este simulador utiliza tasas de referencia objetivo y no garantiza resultados futuros. Invertir implica riesgo, incluyendo la posible pérdida de capital.',
      apply: 'Contacto',
    },
  }
  const tx = T[lang] || T.en

  return (
    <main className="pt-20 min-h-screen bg-[#050505]">

      {/* ── Page header ── */}
      <section className="px-5 sm:px-10 md:px-16 lg:px-28 xl:px-36 py-16 md:py-24 border-b border-white/[0.07]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-[0.5em] uppercase text-white/50 mb-5">ARKA</p>
          <h1 className="text-[clamp(2.2rem,5vw,4.2rem)] font-light leading-tight tracking-tight mb-4">
            <GradientValue>{tx.title}</GradientValue>
          </h1>
          <p className="text-white/72 text-base md:text-lg max-w-xl leading-relaxed">{tx.sub}</p>
        </div>
      </section>

      {/* ── Main grid ── */}
      <section className="px-5 sm:px-10 md:px-16 lg:px-28 xl:px-36 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[390px_1fr] gap-10 xl:gap-16">

            {/* ── Controls ── */}
            <div className="space-y-8">

              {/* Capital sliders */}
              <div className="space-y-6 p-6 rounded-xl border border-white/8 bg-white/[0.03]">
                <Slider label={tx.capital} value={initial} min={5000} max={1000000} step={5000}
                  onChange={setInitial} fmt={v => fmtUSD(v)} />
                <Slider label={tx.monthly} value={monthly} min={0} max={50000} step={500}
                  onChange={setMonthly} fmt={v => fmtUSD(v)} />
                <Slider label={`${tx.horizon} (${years} ${tx.years})`} value={years} min={1} max={30} step={1}
                  onChange={setYears} />
              </div>

              {/* Compounding mode */}
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.28em] uppercase text-white/55">{tx.mode}</p>
                <div className="flex gap-2">
                  {[true, false].map(v => (
                    <button key={String(v)}
                      onClick={() => setCompound(v)}
                      className={`flex-1 py-3 text-[10px] tracking-[0.18em] uppercase border rounded transition-all duration-200 ${
                        compound === v
                          ? 'border-[#C9A352]/60 text-[#C9A352] bg-[#C9A352]/8'
                          : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/75'
                      }`}>
                      {v ? tx.compound : tx.simple}
                    </button>
                  ))}
                </div>
                <div className="space-y-0.5 pt-1">
                  <p className="text-[10px] text-white/40 leading-relaxed">{tx.help_compound}</p>
                  <p className="text-[10px] text-white/40 leading-relaxed">{tx.help_simple}</p>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.28em] uppercase text-white/55">{tx.presets}</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((p, i) => (
                    <button key={p.id} onClick={() => applyPreset(p.id)}
                      style={preset === p.id ? { borderColor: accent, color: accent, backgroundColor: `${accent}14` } : undefined}
                      className={`py-2.5 text-[10px] tracking-[0.15em] uppercase border rounded transition-all duration-200 ${i === PRESETS.length - 1 ? 'col-span-2' : ''} ${
                        preset === p.id
                          ? ''
                          : 'border-white/8 text-white/45 hover:border-white/20 hover:text-white/70'
                      }`}>
                      {lang === 'es' ? p.es : p.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allocation */}
              <div className="space-y-5 p-6 rounded-xl border border-white/8 bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-white/55">{tx.allocation}</p>
                  <span className="text-[9px] text-white/40 tabular-nums">{f}% · {g}% · {a}%</span>
                </div>
                <AllocBar f={f} g={g} a={a} />
                <div className="space-y-5">
                  <Slider label={`${tx.foundation} (18%)`} value={f} min={0} max={100} step={5}
                    onChange={handleF} fmt={v => `${v}%`} />
                  <Slider label={`${tx.growth} (24%)`} value={g} min={0} max={100} step={5}
                    onChange={handleG} fmt={v => `${v}%`} />
                  <Slider label={`${tx.alpha} (36%)`} value={a} min={0} max={100} step={5}
                    onChange={handleA} fmt={v => `${v}%`} />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/[0.07]">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white/50">{tx.rate}</p>
                  <GoldValue className="text-xl font-light tabular-nums">{pct(annual)}</GoldValue>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[9px] text-white/35 leading-relaxed">{tx.disclaimer}</p>
            </div>

            {/* ── Results ── */}
            <div className="space-y-8">

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: tx.projected,
                    value: fmtUSD(finalRow.arka),
                    sub: `${tx.after} ${years} ${tx.years}`,
                    isGold: true,
                  },
                  {
                    label: tx.contributed,
                    value: fmtUSD(totalContrib),
                    sub: `+ ${fmtUSD(monthly, true)}/mo`,
                    isGold: false,
                  },
                  {
                    label: tx.netGain,
                    value: fmtUSD(netGain),
                    sub: `×${(finalRow.arka / totalContrib).toFixed(1)}`,
                    isGold: false,
                    isPositive: netGain > 0,
                  },
                ].map(({ label, value, sub, isGold, isPositive }) => (
                  <div key={label} className="p-4 md:p-5 rounded-xl border border-white/8 bg-white/[0.03] space-y-1.5">
                    <p className="text-[10px] tracking-[0.22em] uppercase text-white/50">{label}</p>
                    <p className="font-light tabular-nums leading-tight text-[clamp(0.9rem,1.9vw,1.2rem)]">
                      {isGold
                        ? <span style={{ color: accent }} className="tabular-nums">{value}</span>
                        : <GradientValue>{value}</GradientValue>
                      }
                    </p>
                    <p className="text-[9px] text-white/38">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 overflow-hidden">
                <LineChart rows={rows} accent={accent} />
              </div>

              {/* Market Context */}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-5">
                <p className="text-[10px] tracking-[0.28em] uppercase text-white/55">
                  {lang === 'es' ? 'Contexto de Mercado' : 'Market Context'}
                </p>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-white/38">
                      {lang === 'es' ? 'Participación EUA' : 'US Market Participation'}
                    </p>
                    <p className="text-4xl font-light text-[#C9A352] tabular-nums">55%</p>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      {lang === 'es'
                        ? 'de los estadounidenses invierte en mercados financieros'
                        : 'of Americans invest in financial markets'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-white/38">
                      {lang === 'es' ? 'Participación México' : 'Mexico Market Participation'}
                    </p>
                    <p className="text-4xl font-light text-white/45 tabular-nums">5%</p>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      {lang === 'es'
                        ? 'de los mexicanos participa en mercados financieros'
                        : 'of Mexicans participate in financial markets'}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <p className="text-[10px] text-white/35 leading-relaxed">
                  {lang === 'es'
                    ? 'ARKA existe para cerrar esa brecha — llevando gestión institucional de capital a inversores privados calificados.'
                    : 'ARKA exists to close that gap — bringing institutional-grade capital management to qualified private investors.'}
                </p>
              </div>

              {/* Benchmark comparison */}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-4">
                <p className="text-[10px] tracking-[0.28em] uppercase text-white/55 mb-5">{tx.vs}</p>
                {[
                  { label: 'ARKA',    value: finalRow.arka,  color: accent,        rate: pct(annual) },
                  { label: 'S&P 500', value: finalRow.sp500, color: PALETTE.sp500, rate: `${(BENCH.sp500 * 100).toFixed(1)}% / yr` },
                  { label: 'CETES',   value: finalRow.cetes, color: PALETTE.cetes, rate: `${(BENCH.cetes * 100).toFixed(1)}% / yr` },
                  { label: lang === 'es' ? 'Banca Trad.' : 'Trad. Banking', value: finalRow.bank, color: PALETTE.bank, rate: `${(BENCH.bank * 100).toFixed(1)}% / yr` },
                ].map(({ label, value, color, rate }) => {
                  const pctW = Math.round((value / finalRow.arka) * 100)
                  return (
                    <div key={label} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] tracking-wide font-medium" style={{ color }}>{label}</span>
                          <span className="text-[9px] text-white/35 tabular-nums">{rate}</span>
                        </div>
                        <span className="text-white/70 tabular-nums text-[10px]">{fmtUSD(value)}</span>
                      </div>
                      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pctW}%`, backgroundColor: color, opacity: label === 'ARKA' ? 1 : 0.7 }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Year-by-year table */}
              <div>
                <button onClick={() => setShowTable(v => !v)}
                  className="text-[10px] tracking-[0.2em] uppercase text-white/45 hover:text-white border-b border-white/12 hover:border-white/45 pb-0.5 transition-all mb-5">
                  {showTable ? tx.hide : tx.show}
                </button>

                {showTable && (
                  <div className="overflow-x-auto rounded-xl border border-white/8">
                    <table className="w-full min-w-[740px]">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="w-7" />
                          {[
                            { label: tx.yr,                                       cls: 'text-white/40' },
                            { label: lang === 'es' ? 'Aportado' : 'Invested',     cls: 'text-white/35' },
                            { label: 'ARKA',                                      cls: '',  style: { color: PALETTE.arka + 'bb' } },
                            { label: lang === 'es' ? 'Ganancia año' : 'Yr. gain', cls: 'text-white/35' },
                            { label: 'Ret. %',                                    cls: 'text-white/35' },
                            { label: 'S&P 500',                                   cls: 'text-white/22' },
                            { label: 'CETES',                                     cls: 'text-white/22' },
                            { label: lang === 'es' ? 'Banca' : 'Banking',         cls: 'text-white/22' },
                          ].map(({ label, cls, style }) => (
                            <th key={label} style={style}
                              className={`px-4 py-3.5 text-left text-[10px] tracking-[0.18em] uppercase font-normal whitespace-nowrap ${cls}`}>
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(1).map((r, idx) => {
                          const prev   = rows[idx]
                          const gain   = r.arka - prev.arka - (monthly * 12)
                          const retPct = prev.arka > 0 ? (gain / prev.arka) * 100 : 0
                          const isOpen = expandedYear === r.year
                          const MONTHS = lang === 'es'
                            ? ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
                            : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                          return (
                            <React.Fragment key={r.year}>
                              {/* ── Year row ── */}
                              <tr
                                onClick={() => setExpandedYear(isOpen ? null : r.year)}
                                className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer group"
                              >
                                <td className="pl-3 text-white/20 group-hover:text-[#C9A352]/70 transition-colors select-none text-[10px]">
                                  {isOpen ? '▾' : '▸'}
                                </td>
                                <td className="px-4 py-3.5 text-white/45 tabular-nums font-mono text-sm">{r.year}</td>
                                <td className="px-4 py-3.5 tabular-nums text-sm text-white/35">{fmtUSD(r.contributed)}</td>
                                <td className="px-4 py-3.5 tabular-nums font-medium text-sm" style={{ color: PALETTE.arka }}>{fmtUSD(r.arka)}</td>
                                <td className="px-4 py-3.5 tabular-nums text-sm text-white/60">{gain >= 0 ? '+' : ''}{fmtUSD(gain)}</td>
                                <td className="px-4 py-3.5 tabular-nums text-sm text-white/60">{retPct >= 0 ? '+' : ''}{retPct.toFixed(1)}%</td>
                                <td className="px-4 py-3.5 tabular-nums text-sm text-white/30">{fmtUSD(r.sp500)}</td>
                                <td className="px-4 py-3.5 tabular-nums text-sm text-white/25">{fmtUSD(r.cetes)}</td>
                                <td className="px-4 py-3.5 tabular-nums text-sm text-white/20">{fmtUSD(r.bank)}</td>
                              </tr>

                              {/* ── Monthly detail ── */}
                              {isOpen && r.months.map((mo, mi) => {
                                const moPrev   = mi === 0 ? prev : r.months[mi - 1]
                                const moGain   = mo.arka - moPrev.arka - monthly
                                const moRetPct = moPrev.arka > 0 ? (moGain / moPrev.arka) * 100 : 0
                                return (
                                  <tr key={`${r.year}-m${mo.month}`}
                                    className="border-b border-white/[0.02] bg-white/[0.012]">
                                    <td />
                                    <td className="pl-7 pr-4 py-2.5 text-[11px] text-white/35 whitespace-nowrap">
                                      {MONTHS[mi]}
                                      {compound && (
                                        <span className="text-white/18 ml-2 text-[9px]">{mo.days}d</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5 tabular-nums text-xs text-white/25">{fmtUSD(mo.contributed)}</td>
                                    <td className="px-4 py-2.5 tabular-nums text-xs" style={{ color: PALETTE.arka + 'cc' }}>{fmtUSD(mo.arka)}</td>
                                    <td className="px-4 py-2.5 tabular-nums text-xs text-white/40">{moGain >= 0 ? '+' : ''}{fmtUSD(moGain)}</td>
                                    <td className="px-4 py-2.5 tabular-nums text-xs text-white/40">{moRetPct >= 0 ? '+' : ''}{moRetPct.toFixed(2)}%</td>
                                    <td className="px-4 py-2.5 tabular-nums text-xs text-white/20">{fmtUSD(mo.sp500)}</td>
                                    <td className="px-4 py-2.5 tabular-nums text-xs text-white/18">{fmtUSD(mo.cetes)}</td>
                                    <td className="px-4 py-2.5 tabular-nums text-xs text-white/15">{fmtUSD(mo.bank)}</td>
                                  </tr>
                                )
                              })}
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Send results by email ── */}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-4">
                <div>
                  <p className="text-[10px] tracking-[0.28em] uppercase text-white/55 mb-1">
                    {lang === 'es' ? 'Recibir resultados por correo' : 'Receive results by email'}
                  </p>
                  <p className="text-[10px] text-white/30">
                    {lang === 'es'
                      ? 'Te enviamos un resumen completo de esta simulación.'
                      : 'We\'ll send you a full summary of this simulation.'}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    id="sim-sender-name" name="senderName"
                    type="text"
                    placeholder={lang === 'es' ? 'Tu nombre' : 'Your name'}
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    disabled={sendStatus === 'sent'}
                    className="w-full bg-white/[0.04] border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/25
                      focus:outline-none focus:border-white/25 transition-colors disabled:opacity-40"
                  />
                  <input
                    id="sim-sender-email" name="senderEmail"
                    type="email"
                    placeholder={lang === 'es' ? 'Tu correo' : 'Your email'}
                    value={senderEmail}
                    onChange={e => { setSenderEmail(e.target.value); if (sendStatus === 'error') setSendStatus('idle') }}
                    disabled={sendStatus === 'sent'}
                    className="w-full bg-white/[0.04] border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/25
                      focus:outline-none focus:border-white/25 transition-colors disabled:opacity-40"
                  />
                </div>
                <button
                  onClick={handleSendResults}
                  disabled={!senderEmail || sendStatus === 'sending' || sendStatus === 'sent'}
                  className={`w-full py-3.5 text-[10px] tracking-[0.22em] uppercase font-medium rounded transition-all duration-300
                    ${sendStatus === 'sent'
                      ? 'bg-[#004C45]/60 text-white/60 cursor-default'
                      : sendStatus === 'error'
                      ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10'
                      : 'border border-white/15 text-white/65 hover:border-white/35 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                    }`}
                >
                  {sendStatus === 'sending' && (lang === 'es' ? 'Enviando...' : 'Sending...')}
                  {sendStatus === 'sent'    && (lang === 'es' ? '✓ Correo enviado' : '✓ Email sent')}
                  {sendStatus === 'error'   && (lang === 'es' ? 'Error — intentar de nuevo' : 'Error — try again')}
                  {sendStatus === 'idle'    && (lang === 'es' ? 'Enviar resultados →' : 'Send results →')}
                </button>
              </div>

              {/* CTA */}
              <div className="flex gap-3 pt-2">
                <Link to="/contact"
                  className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-medium bg-[#004C45] text-white hover:bg-[#005c54] px-8 py-4 rounded-sm transition-all duration-300">
                  {tx.apply}
                </Link>
                <Link to="/profiler"
                  className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-medium border border-white/18 text-white/65 hover:border-white/40 hover:text-white px-8 py-4 rounded-sm transition-all duration-300">
                  {lang === 'es' ? 'Perfilador →' : 'Profiler →'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
