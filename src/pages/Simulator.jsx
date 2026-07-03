import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '@/context/LanguageContext'
import { useFxRate } from '@/hooks/useFxRate'

// ── Fixed-term plans — canonical data (mirrors ContractIntake.jsx) ──────────
const PLANS = [
  {
    id: 'flex20', name: 'Flex 20', color: '#5E97C2',
    rate: 0.20, maxLoss: 0.05, termDays: 183, termMonths: 6,
    term: { en: '6 months', es: '6 meses' },
  },
  {
    id: 'fijo22', name: 'Fijo 22/1', color: '#00A896',
    rate: 0.22, maxLoss: 0.075, termDays: 366, termMonths: 12,
    term: { en: '12 months', es: '12 meses' },
  },
  {
    id: 'fijo25', name: 'Fijo 25/2', color: '#C9A352',
    rate: 0.25, maxLoss: 0.10, termDays: 731, termMonths: 24,
    term: { en: '24 months', es: '24 meses' },
  },
]
const MIN_MXN = 500000
const BENCH = { sp500: 0.108, cetes: 0.097, bank: 0.045 }

// ARKA plans pay simple interest, prorated by day count over the fixed term —
// not compounded. Benchmarks are shown compounded daily for a realistic comparison.
function arkaValueAtDay(principal, rate, days) {
  return principal * (1 + (rate * days) / 365)
}
function benchValueAtDay(principal, annualRate, days) {
  const daily = Math.pow(1 + annualRate, 1 / 365) - 1
  return principal * Math.pow(1 + daily, days)
}

// ── Formatting ───────────────────────────────────────────────────────────────
function fmtUSD(n, short = false) {
  if (short) {
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
    return `$${Math.round(n)}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function pct(v) { return `${(v * 100).toFixed(2)}%` }

const PALETTE = { arka: '#C9A352', sp500: '#94A3B8', cetes: '#64748B', bank: '#475569' }

// ── Term growth chart (day 0 → maturity) ─────────────────────────────────────
function TermChart({ points, accent }) {
  const W = 800, H = 280
  const PAD = { top: 24, right: 20, bottom: 40, left: 76 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom
  const n = points.length - 1
  const maxVal = Math.max(...points.map(p => p.arka))

  const sx = i => PAD.left + (i / n) * iW
  const sy = v => PAD.top + iH - (v / maxVal) * iH
  const toPath = key => points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(i).toFixed(1)},${sy(p[key]).toFixed(1)}`).join(' ')

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
        <linearGradient id="termAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridSteps.map(p => {
        const y = PAD.top + iH * (1 - p)
        return (
          <g key={p}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="white" strokeOpacity={0.05} strokeWidth={1} strokeDasharray="3,5" />
            <text x={PAD.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.45)" fontFamily="monospace">
              {fmtUSD(maxVal * p, true)}
            </text>
          </g>
        )
      })}
      {points.map((p, i) => (
        <text key={i} x={sx(i)} y={H - 18} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)" fontFamily="monospace">
          {p.label}
        </text>
      ))}
      <path d={`${toPath('arka')} L${sx(n)},${PAD.top + iH} L${PAD.left},${PAD.top + iH} Z`} fill="url(#termAreaGrad)" />
      {LINES.map(({ key, color, w }) => (
        <path key={key} d={toPath(key)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={key === 'arka' ? 1 : 0.6} />
      ))}
      {LINES.map(({ key, color, label }, i) => (
        <g key={key} transform={`translate(${PAD.left + i * 145},${18})`}>
          <line x1={0} y1={-3} x2={20} y2={-3} stroke={color} strokeWidth={key === 'arka' ? 2.5 : 1.5} opacity={key === 'arka' ? 1 : 0.7} />
          <text x={24} y={0} fontSize="10" fill={key === 'arka' ? color : 'rgba(255,255,255,0.6)'} fontFamily="system-ui">{label}</text>
        </g>
      ))}
    </svg>
  )
}

// ── Slider (with typeable value) ─────────────────────────────────────────────
function Slider({ label, value, min, max, step, onChange, fmt }) {
  const sliderId = `slider-${label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')

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
            type="text" autoFocus value={raw}
            onChange={e => setRaw(e.target.value)}
            onBlur={() => commit(raw)}
            onKeyDown={e => { if (e.key === 'Enter') commit(raw); if (e.key === 'Escape') setEditing(false) }}
            className="text-white text-base font-light tabular-nums bg-transparent border-b border-[#C9A352]/70 outline-none text-right w-32"
          />
        ) : (
          <button type="button" onClick={() => { setRaw(String(value)); setEditing(true) }}
            className="text-white text-base font-light tabular-nums hover:text-[#C9A352] transition-colors duration-150 cursor-text text-right">
            {fmt ? fmt(value) : value}
          </button>
        )}
      </div>
      <input
        id={sliderId} name={sliderId} type="range" min={min} max={max} step={step} value={value}
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

function GradientValue({ children, className = '' }) {
  return <span className={`bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent ${className}`}>{children}</span>
}
function GoldValue({ children, className = '' }) {
  return <span className={`bg-gradient-to-r from-[#C9A352] to-[#E8C87A] bg-clip-text text-transparent ${className}`}>{children}</span>
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Simulator() {
  const { lang } = useLang()
  const isEs = lang === 'es'
  const { rate: fxRate } = useFxRate()
  const minUsd = MIN_MXN / fxRate

  const [planId, setPlanId] = useState('fijo22')
  const [amount, setAmount] = useState(50000)
  const [exitDay, setExitDay] = useState(null) // null = hold to maturity

  const [senderName,  setSenderName]  = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [sendStatus,  setSendStatus]  = useState('idle')

  const plan = PLANS.find(p => p.id === planId) || PLANS[1]

  // Preselect a plan recommended by the Profiler — via URL param or sessionStorage
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search)
      const qp = q.get('plan')
      if (qp && PLANS.some(p => p.id === qp)) { setPlanId(qp); return }
      const saved = sessionStorage.getItem('arka_profiler_plan')
      if (saved && PLANS.some(p => p.id === saved)) {
        setPlanId(saved)
        sessionStorage.removeItem('arka_profiler_plan')
      }
    } catch {}
  }, [])

  useEffect(() => { setExitDay(null) }, [planId])

  const maturityValue = arkaValueAtDay(amount, plan.rate, plan.termDays)
  const maturityGain  = maturityValue - amount

  const effectiveExitDay = exitDay ?? plan.termDays
  const isEarly = effectiveExitDay < plan.termDays
  const accruedAtExit = arkaValueAtDay(amount, plan.rate, effectiveExitDay) - amount
  const penalty        = isEarly ? accruedAtExit * 0.25 : 0
  const netPayoutAtExit = amount + accruedAtExit - penalty

  const chartPoints = useMemo(() => {
    const steps = plan.termMonths
    return Array.from({ length: steps + 1 }, (_, i) => {
      const day = Math.round((i / steps) * plan.termDays)
      return {
        label: i === 0 ? (isEs ? 'Hoy' : 'Today') : `M${i}`,
        arka:  arkaValueAtDay(amount, plan.rate, day),
        sp500: benchValueAtDay(amount, BENCH.sp500, day),
        cetes: benchValueAtDay(amount, BENCH.cetes, day),
        bank:  benchValueAtDay(amount, BENCH.bank, day),
      }
    })
  }, [amount, plan, isEs])

  const benchAtMaturity = {
    sp500: benchValueAtDay(amount, BENCH.sp500, plan.termDays),
    cetes: benchValueAtDay(amount, BENCH.cetes, plan.termDays),
    bank:  benchValueAtDay(amount, BENCH.bank, plan.termDays),
  }

  const handleSendResults = async () => {
    if (!senderEmail || sendStatus === 'sending' || sendStatus === 'sent') return
    setSendStatus('sending')
    try {
      const res = await fetch('/api/send-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: senderName,
          email: senderEmail,
          plan: { id: plan.id, name: plan.name, rate: (plan.rate * 100).toFixed(0), termDays: plan.termDays },
          amount,
          results: {
            maturityValue,
            maturityGain,
            multiplier: (maturityValue / (amount || 1)).toFixed(2),
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
      sub: 'Compare ARKA’s fixed-term plans and project your capital at maturity.',
      comparator: 'Compare Plans',
      select: 'Select',
      selected: 'Selected',
      term: 'Term',
      rate: 'Fixed Annual Rate',
      maxRisk: 'Maximum Risk',
      minInvestment: 'Minimum Investment',
      payoutDay: 'Paid at day',
      penaltyNote: '25% penalty on accrued returns if withdrawn early',
      calc: 'Maturity Calculator',
      amount: 'Investment Amount',
      minNote: `Minimum ${fmtUSD(minUsd)} USD (≈ ${fmtUSD(MIN_MXN)} MXN)`,
      principal: 'Principal',
      fixedReturn: 'Fixed Return',
      atMaturity: 'Capital at Maturity',
      onDay: 'on day',
      earlyTitle: 'Early Withdrawal Preview',
      earlyDesc: 'Move the slider to see what you would receive if you requested withdrawal before completing the term. Early withdrawal forfeits 25% of the returns accrued to that date.',
      dayOfExit: 'Day of Withdrawal',
      holdToMaturity: 'Hold to maturity',
      accrued: 'Accrued Return',
      penalty: 'Penalty (25%)',
      netPayout: 'Net Payout',
      vs: 'vs. Benchmarks — same term',
      chartTitle: 'Capital Growth Over the Term',
      disclaimer: '⚠ Fixed annual rates are contractual references for the completed term and are not guarantees of performance. Early withdrawal before the term ends forfeits 25% of the returns accrued to date. Investing involves risk, including possible loss of capital up to the maximum reference per plan.',
      apply: 'Contact',
      profiler: 'Profiler →',
      sendTitle: 'Receive results by email',
      sendDesc: 'We\'ll send you a full summary of this simulation.',
      namePh: 'Your name',
      emailPh: 'Your email',
      sending: 'Sending...',
      sent: '✓ Email sent',
      error: 'Error — try again',
      send: 'Send results →',
    },
    es: {
      title: 'Simulador de Inversión',
      sub: 'Compara los planes a plazo fijo de ARKA y proyecta tu capital al vencimiento.',
      comparator: 'Comparar Planes',
      select: 'Seleccionar',
      selected: 'Seleccionado',
      term: 'Plazo',
      rate: 'Tasa Anual Fija',
      maxRisk: 'Riesgo Máximo',
      minInvestment: 'Inversión Mínima',
      payoutDay: 'Se entrega el día',
      penaltyNote: 'Penalización del 25% sobre rendimientos acumulados si se retira antes',
      calc: 'Calculadora de Vencimiento',
      amount: 'Monto a Invertir',
      minNote: `Mínimo ${fmtUSD(minUsd)} USD (≈ ${fmtUSD(MIN_MXN)} MXN)`,
      principal: 'Capital Inicial',
      fixedReturn: 'Rendimiento Fijo',
      atMaturity: 'Capital al Vencimiento',
      onDay: 'el día',
      earlyTitle: 'Vista de Retiro Anticipado',
      earlyDesc: 'Mueve el control para ver qué recibirías si solicitas el retiro antes de completar el plazo. El retiro anticipado penaliza con el 25% de los rendimientos acumulados a esa fecha.',
      dayOfExit: 'Día de Retiro',
      holdToMaturity: 'Mantener a vencimiento',
      accrued: 'Rendimiento Acumulado',
      penalty: 'Penalización (25%)',
      netPayout: 'Pago Neto',
      vs: 'vs. Benchmarks — mismo plazo',
      chartTitle: 'Crecimiento del Capital Durante el Plazo',
      disclaimer: '⚠ Las tasas anuales fijas son referencias contractuales al completar el plazo y no son garantía de rendimiento. El retiro anticipado antes de finalizar el plazo penaliza con el 25% de los rendimientos acumulados a la fecha. Invertir implica riesgo, incluyendo la posible pérdida de capital hasta el máximo de referencia por plan.',
      apply: 'Contacto',
      profiler: 'Perfilador →',
      sendTitle: 'Recibir resultados por correo',
      sendDesc: 'Te enviamos un resumen completo de esta simulación.',
      namePh: 'Tu nombre',
      emailPh: 'Tu correo',
      sending: 'Enviando...',
      sent: '✓ Correo enviado',
      error: 'Error — intentar de nuevo',
      send: 'Enviar resultados →',
    },
  }
  const tx = T[lang] || T.en
  const planTermLabel = plan.term[lang] || plan.term.en

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

      {/* ── Comparator ── */}
      <section className="px-5 sm:px-10 md:px-16 lg:px-28 xl:px-36 py-12 md:py-16 border-b border-white/[0.07]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-[0.28em] uppercase text-white/55 mb-6">{tx.comparator}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map(p => {
              const active = p.id === planId
              return (
                <div key={p.id}
                  className={`rounded-xl border p-6 space-y-4 transition-all duration-300 ${
                    active ? 'bg-white/[0.05]' : 'bg-white/[0.02] border-white/8 hover:border-white/20'
                  }`}
                  style={active ? { borderColor: `${p.color}80` } : undefined}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-light text-lg">{p.name}</h3>
                    <span className="text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border"
                      style={{ color: p.color, borderColor: `${p.color}50` }}>
                      {p.term[lang] || p.term.en}
                    </span>
                  </div>
                  <div>
                    <p className="text-3xl font-extralight tabular-nums" style={{ color: p.color }}>{pct(p.rate)}</p>
                    <p className="text-[10px] text-white/40 mt-1">{tx.rate}</p>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-white/[0.07] text-[11px]">
                    <div className="flex justify-between"><span className="text-white/45">{tx.maxRisk}</span><span className="text-white/70 tabular-nums">−{pct(p.maxLoss)}</span></div>
                    <div className="flex justify-between"><span className="text-white/45">{tx.minInvestment}</span><span className="text-white/70">{fmtUSD(minUsd)} USD</span></div>
                    <div className="flex justify-between"><span className="text-white/45">{tx.payoutDay}</span><span className="text-white/70">{p.termDays}</span></div>
                  </div>
                  <p className="text-[9px] text-white/30 leading-relaxed pt-1">{tx.penaltyNote}</p>
                  <button onClick={() => setPlanId(p.id)}
                    className={`w-full py-3 text-[10px] tracking-[0.2em] uppercase rounded transition-all duration-200 ${
                      active ? 'text-black' : 'border border-white/15 text-white/65 hover:border-white/35 hover:text-white'
                    }`}
                    style={active ? { backgroundColor: p.color } : undefined}>
                    {active ? tx.selected : tx.select}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Calculator ── */}
      <section className="px-5 sm:px-10 md:px-16 lg:px-28 xl:px-36 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[390px_1fr] gap-10 xl:gap-16">

            {/* ── Controls ── */}
            <div className="space-y-8">
              <p className="text-[10px] tracking-[0.28em] uppercase text-white/55">{tx.calc} — <span style={{ color: plan.color }}>{plan.name}</span></p>

              <div className="space-y-6 p-6 rounded-xl border border-white/8 bg-white/[0.03]">
                <Slider label={tx.amount} value={amount} min={Math.round(minUsd)} max={2000000} step={1000}
                  onChange={setAmount} fmt={v => fmtUSD(v)} />
                <p className="text-[10px] text-white/35 leading-relaxed">
                  {tx.minNote} · ≈ ${Math.round(amount * fxRate).toLocaleString('en-US')} MXN
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-xl border border-white/8 bg-white/[0.03]">
                <div className="flex justify-between"><span className="text-[10px] tracking-[0.2em] uppercase text-white/50">{tx.term}</span><span className="text-white/85 text-sm">{planTermLabel}</span></div>
                <div className="flex justify-between"><span className="text-[10px] tracking-[0.2em] uppercase text-white/50">{tx.rate}</span><GoldValue className="text-sm font-medium">{pct(plan.rate)}</GoldValue></div>
                <div className="flex justify-between"><span className="text-[10px] tracking-[0.2em] uppercase text-white/50">{tx.maxRisk}</span><span className="text-[#e0a3a3] text-sm">−{pct(plan.maxLoss)}</span></div>
                <div className="flex justify-between"><span className="text-[10px] tracking-[0.2em] uppercase text-white/50">{tx.payoutDay}</span><span className="text-white/85 text-sm tabular-nums">{plan.termDays}</span></div>
              </div>

              <p className="text-[9px] text-white/35 leading-relaxed">{tx.disclaimer}</p>
            </div>

            {/* ── Results ── */}
            <div className="space-y-8">

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: tx.principal,   value: fmtUSD(amount),          sub: planTermLabel,                       isGold: false },
                  { label: tx.fixedReturn, value: fmtUSD(maturityGain),    sub: `+${pct(maturityGain / amount)}`,    isGold: false },
                  { label: tx.atMaturity,  value: fmtUSD(maturityValue),   sub: `${tx.onDay} ${plan.termDays}`,      isGold: true  },
                ].map(({ label, value, sub, isGold }) => (
                  <div key={label} className="p-4 md:p-5 rounded-xl border border-white/8 bg-white/[0.03] space-y-1.5">
                    <p className="text-[10px] tracking-[0.22em] uppercase text-white/50">{label}</p>
                    <p className="font-light tabular-nums leading-tight text-[clamp(0.9rem,1.9vw,1.2rem)]">
                      {isGold ? <span style={{ color: plan.color }}>{value}</span> : <GradientValue>{value}</GradientValue>}
                    </p>
                    <p className="text-[9px] text-white/38">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 overflow-hidden space-y-3">
                <p className="text-[10px] tracking-[0.28em] uppercase text-white/55">{tx.chartTitle}</p>
                <TermChart points={chartPoints} accent={plan.color} />
              </div>

              {/* Early withdrawal preview */}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-5">
                <div>
                  <p className="text-[10px] tracking-[0.28em] uppercase text-white/55 mb-1.5">{tx.earlyTitle}</p>
                  <p className="text-[10px] text-white/38 leading-relaxed">{tx.earlyDesc}</p>
                </div>
                <Slider label={tx.dayOfExit} value={effectiveExitDay} min={0} max={plan.termDays} step={1}
                  onChange={v => setExitDay(v === plan.termDays ? null : v)}
                  fmt={v => v >= plan.termDays ? tx.holdToMaturity : `${tx.onDay} ${v}`} />
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { label: tx.accrued,   value: fmtUSD(accruedAtExit), color: '#94A3B8' },
                    { label: tx.penalty,   value: `−${fmtUSD(penalty)}`, color: isEarly ? '#e0a3a3' : '#4b5563' },
                    { label: tx.netPayout, value: fmtUSD(netPayoutAtExit), color: plan.color },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className="text-[9px] tracking-[0.18em] uppercase text-white/40 mb-1.5">{label}</p>
                      <p className="text-sm font-light tabular-nums" style={{ color }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benchmark comparison */}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-4">
                <p className="text-[10px] tracking-[0.28em] uppercase text-white/55 mb-5">{tx.vs}</p>
                {[
                  { label: 'ARKA', value: maturityValue, color: plan.color, rate: pct(plan.rate) + '/yr' },
                  { label: 'S&P 500', value: benchAtMaturity.sp500, color: PALETTE.sp500, rate: `${(BENCH.sp500 * 100).toFixed(1)}%/yr` },
                  { label: 'CETES', value: benchAtMaturity.cetes, color: PALETTE.cetes, rate: `${(BENCH.cetes * 100).toFixed(1)}%/yr` },
                  { label: isEs ? 'Banca Trad.' : 'Trad. Banking', value: benchAtMaturity.bank, color: PALETTE.bank, rate: `${(BENCH.bank * 100).toFixed(1)}%/yr` },
                ].map(({ label, value, color, rate }) => {
                  const pctW = Math.round((value / maturityValue) * 100)
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
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctW}%`, backgroundColor: color, opacity: label === 'ARKA' ? 1 : 0.7 }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Send by email */}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-4">
                <div>
                  <p className="text-[10px] tracking-[0.28em] uppercase text-white/55 mb-1">{tx.sendTitle}</p>
                  <p className="text-[10px] text-white/30">{tx.sendDesc}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input id="sim-sender-name" name="senderName" type="text" placeholder={tx.namePh}
                    value={senderName} onChange={e => setSenderName(e.target.value)} disabled={sendStatus === 'sent'}
                    className="w-full bg-white/[0.04] border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors disabled:opacity-40" />
                  <input id="sim-sender-email" name="senderEmail" type="email" placeholder={tx.emailPh}
                    value={senderEmail} onChange={e => { setSenderEmail(e.target.value); if (sendStatus === 'error') setSendStatus('idle') }} disabled={sendStatus === 'sent'}
                    className="w-full bg-white/[0.04] border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors disabled:opacity-40" />
                </div>
                <button onClick={handleSendResults} disabled={!senderEmail || sendStatus === 'sending' || sendStatus === 'sent'}
                  className={`w-full py-3.5 text-[10px] tracking-[0.22em] uppercase font-medium rounded transition-all duration-300 ${
                    sendStatus === 'sent' ? 'bg-[#004C45]/60 text-white/60 cursor-default'
                    : sendStatus === 'error' ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10'
                    : 'border border-white/15 text-white/65 hover:border-white/35 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}>
                  {sendStatus === 'sending' && tx.sending}
                  {sendStatus === 'sent'    && tx.sent}
                  {sendStatus === 'error'   && tx.error}
                  {sendStatus === 'idle'    && tx.send}
                </button>
              </div>

              {/* CTA */}
              <div className="flex gap-3 pt-2">
                <Link to="/contact" className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-medium bg-[#004C45] text-white hover:bg-[#005c54] px-8 py-4 rounded-sm transition-all duration-300">
                  {tx.apply}
                </Link>
                <Link to="/profiler" className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-medium border border-white/18 text-white/65 hover:border-white/40 hover:text-white px-8 py-4 rounded-sm transition-all duration-300">
                  {tx.profiler}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
