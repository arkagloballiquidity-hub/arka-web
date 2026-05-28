import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '@/context/LanguageContext'

// ── Rates & presets ──────────────────────────────────────────────────────────
const RATES = { foundation: 0.18, growth: 0.24, alpha: 0.36 }
const BENCH = { sp500: 0.108, cetes: 0.097, bank: 0.045 }

const PRESETS = [
  { id: 'conservative', en: 'Conservative', es: 'Conservadora',  f: 100, g: 0,  a: 0  },
  { id: 'balanced',     en: 'Balanced',     es: 'Equilibrada',   f: 50,  g: 35, a: 15 },
  { id: 'growth',       en: 'Growth',       es: 'Crecimiento',   f: 20,  g: 60, a: 20 },
  { id: 'aggressive',   en: 'Aggressive',   es: 'Agresiva',      f: 0,   g: 40, a: 60 },
]

function blended(f, g, a) {
  return (f * RATES.foundation + g * RATES.growth + a * RATES.alpha) / 100
}

function calcProjection({ initial, monthly, years, f, g, a, compound }) {
  const annual  = blended(f, g, a)
  const daily   = Math.pow(1 + annual, 1 / 365) - 1
  const mRate   = compound ? Math.pow(1 + daily, 365 / 12) - 1 : annual / 12
  // Benchmarks always use standard compound (market convention — not affected by toggle)
  const mSP    = Math.pow(1 + BENCH.sp500, 1 / 12) - 1
  const mCetes = Math.pow(1 + BENCH.cetes, 1 / 12) - 1
  const mBank  = Math.pow(1 + BENCH.bank,  1 / 12) - 1

  let arka = initial, sp500 = initial, cetes = initial, bank = initial
  const rows = [{ year: 0, arka: initial, sp500: initial, cetes: initial, bank: initial, contributed: initial }]
  let totalContrib = initial

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      // ARKA respects compound toggle; benchmarks always compound
      if (compound) {
        arka = arka * (1 + mRate) + monthly
      } else {
        arka += initial * mRate + monthly
      }
      sp500 = sp500 * (1 + mSP)   + monthly
      cetes = cetes * (1 + mCetes) + monthly
      bank  = bank  * (1 + mBank)  + monthly
      totalContrib += monthly
    }
    rows.push({
      year: y,
      arka:  Math.round(arka),
      sp500: Math.round(sp500),
      cetes: Math.round(cetes),
      bank:  Math.round(bank),
      contributed: Math.round(totalContrib),
    })
  }
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
function LineChart({ rows }) {
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
    { key: 'arka',  color: PALETTE.arka,  w: 2.5, label: 'ARKA' },
    { key: 'sp500', color: PALETTE.sp500, w: 1.6, label: 'S&P 500' },
    { key: 'cetes', color: PALETTE.cetes, w: 1.4, label: 'CETES' },
    { key: 'bank',  color: PALETTE.bank,  w: 1.2, label: 'Banking' },
  ]

  const gridSteps = [0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#C9A352" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#C9A352" stopOpacity="0" />
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
  const [f, setF] = useState(50)
  const [g, setG] = useState(35)
  const [a, setA] = useState(15)
  const [showTable, setShowTable] = useState(false)

  // Email send
  const [senderName,  setSenderName]  = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [sendStatus,  setSendStatus]  = useState('idle') // idle | sending | sent | error

  // Load profiler allocation if coming from Profiler page
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('arka_profiler_alloc')
      if (saved) {
        const { f: pf, g: pg, a: pa, id } = JSON.parse(saved)
        setF(pf); setG(pg); setA(pa)
        setPreset(id || 'custom')
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
      mode: 'Compounding Mode',
      compound: 'Compound',
      simple: 'Simple',
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
      apply: 'Apply for Access',
    },
    es: {
      title: 'Simulador de Inversión',
      sub: 'Proyecta el crecimiento de tu capital en las estrategias ARKA.',
      capital: 'Capital Inicial',
      monthly: 'Aportación Mensual',
      horizon: 'Horizonte de Inversión',
      mode: 'Modo de Capitalización',
      compound: 'Compuesta',
      simple: 'Simple',
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
      apply: 'Solicitar Acceso',
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
              </div>

              {/* Presets */}
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.28em] uppercase text-white/55">{tx.presets}</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map(p => (
                    <button key={p.id} onClick={() => applyPreset(p.id)}
                      className={`py-2.5 text-[10px] tracking-[0.15em] uppercase border rounded transition-all duration-200 ${
                        preset === p.id
                          ? 'border-white/30 text-white bg-white/8'
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
                        ? <GoldValue>{value}</GoldValue>
                        : <GradientValue>{value}</GradientValue>
                      }
                    </p>
                    <p className="text-[9px] text-white/38">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 overflow-hidden">
                <LineChart rows={rows} />
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
                  { label: 'ARKA',    value: finalRow.arka,  color: PALETTE.arka,  rate: pct(annual) },
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
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/8">
                          {[tx.yr, 'ARKA', 'S&P 500', 'CETES', lang === 'es' ? 'Banca' : 'Banking', tx.contributed].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase text-white/45 font-normal whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(1).map(r => (
                          <tr key={r.year} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 text-white/55 tabular-nums font-mono text-sm">{r.year}</td>
                            <td className="px-4 py-3 tabular-nums font-light text-sm" style={{ color: PALETTE.arka }}>{fmtUSD(r.arka)}</td>
                            <td className="px-4 py-3 tabular-nums font-light text-sm text-white/55">{fmtUSD(r.sp500)}</td>
                            <td className="px-4 py-3 tabular-nums font-light text-sm text-white/45">{fmtUSD(r.cetes)}</td>
                            <td className="px-4 py-3 tabular-nums font-light text-sm text-white/35">{fmtUSD(r.bank)}</td>
                            <td className="px-4 py-3 tabular-nums font-light text-sm text-white/35">{fmtUSD(r.contributed)}</td>
                          </tr>
                        ))}
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
                <Link to="/access"
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
