import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/context/LanguageContext'
import { useFxRate } from '@/hooks/useFxRate'

const MIN_MXN = 500000
function fmtUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

// ── Questions — horizon, liquidity need, and commitment tolerance ───────────
// Each option scores 0 (short-term lean) to 2 (long-term lean). Max score: 12.
const QUESTIONS = [
  {
    id: 1,
    en: { q: 'For how long can you keep this capital invested without needing it?', opts: [
      { label: '6 months',        pts: 0 },
      { label: '1 year',          pts: 1 },
      { label: '2 years or more', pts: 2 },
    ]},
    es: { q: '¿Por cuánto tiempo puedes mantener este capital invertido sin necesitarlo?', opts: [
      { label: '6 meses',           pts: 0 },
      { label: '1 año',             pts: 1 },
      { label: '2 años o más',      pts: 2 },
    ]},
  },
  {
    id: 2,
    en: { q: 'How important is early access to this capital in case of an emergency?', opts: [
      { label: 'Very important — I might need it soon',      pts: 0 },
      { label: 'Somewhat important — I prefer some flexibility', pts: 1 },
      { label: 'Not relevant — I will not touch this capital', pts: 2 },
    ]},
    es: { q: '¿Qué tan importante es tener acceso anticipado a este capital ante un imprevisto?', opts: [
      { label: 'Muy importante — podría necesitarlo pronto', pts: 0 },
      { label: 'Algo importante — prefiero cierta flexibilidad', pts: 1 },
      { label: 'No es relevante — no pienso tocar este capital', pts: 2 },
    ]},
  },
  {
    id: 3,
    en: { q: 'If you needed to withdraw before completing the term, how comfortable are you forfeiting 25% of the accrued return as a penalty?', opts: [
      { label: 'Not comfortable — I prefer shorter terms',    pts: 0 },
      { label: 'I would accept it if necessary',              pts: 1 },
      { label: 'Not a concern — I do not plan to withdraw early', pts: 2 },
    ]},
    es: { q: 'Si necesitaras retirar antes de completar el plazo, ¿qué tan cómodo estás con perder el 25% del rendimiento acumulado como penalización?', opts: [
      { label: 'Nada cómodo — prefiero plazos cortos',        pts: 0 },
      { label: 'Lo aceptaría si fuera necesario',              pts: 1 },
      { label: 'No me preocupa — no pienso retirar antes de tiempo', pts: 2 },
    ]},
  },
  {
    id: 4,
    en: { q: 'What is your main objective with this capital?', opts: [
      { label: 'Short-term liquidity with a fixed return',        pts: 0 },
      { label: 'Balanced growth over a medium-term horizon',      pts: 1 },
      { label: 'Maximize the fixed rate with a long-term commitment', pts: 2 },
    ]},
    es: { q: '¿Cuál es tu objetivo principal con este capital?', opts: [
      { label: 'Liquidez a corto plazo con un rendimiento fijo',        pts: 0 },
      { label: 'Crecimiento balanceado a mediano plazo',                pts: 1 },
      { label: 'Maximizar la tasa fija con un compromiso de largo plazo', pts: 2 },
    ]},
  },
  {
    id: 5,
    en: { q: 'What amount do you have available to invest?', opts: [
      { label: '$500,000 – $1,000,000 MXN',  pts: 0 },
      { label: '$1,000,000 – $3,000,000 MXN', pts: 1 },
      { label: '$3,000,000+ MXN',            pts: 2 },
    ]},
    es: { q: '¿Qué monto tienes disponible para invertir?', opts: [
      { label: '$500,000 – $1,000,000 MXN',  pts: 0 },
      { label: '$1,000,000 – $3,000,000 MXN', pts: 1 },
      { label: '$3,000,000+ MXN',            pts: 2 },
    ]},
  },
  {
    id: 6,
    en: { q: 'Have you previously invested in fixed-term products (CETES, promissory notes, term deposits)?', opts: [
      { label: 'No, this would be my first time', pts: 0 },
      { label: 'Yes, occasionally',                pts: 1 },
      { label: 'Yes, regularly',                   pts: 2 },
    ]},
    es: { q: '¿Has invertido antes en productos de plazo fijo (CETES, pagarés, depósitos a término)?', opts: [
      { label: 'No, sería mi primera vez',   pts: 0 },
      { label: 'Sí, ocasionalmente',          pts: 1 },
      { label: 'Sí, regularmente',            pts: 2 },
    ]},
  },
]
const TOTAL_QUESTIONS = QUESTIONS.length
const MAX_SCORE = TOTAL_QUESTIONS * 2

// ── Recommended plans — mirrors Simulator.jsx canonical plan data ───────────
const PLANS = [
  {
    id: 'flex20', name: 'Flex 20', color: '#5E97C2',
    rate: 0.20, maxLoss: 0.05, termDays: 183,
    en: { term: '6-month term', reason: 'Your priority is flexibility and shorter-term liquidity — Flex 20 gives you a fixed institutional return without a long lock-up.' },
    es: { term: 'Plazo de 6 meses', reason: 'Tu prioridad es la flexibilidad y la liquidez a corto plazo — Flex 20 te da un rendimiento fijo institucional sin un compromiso prolongado.' },
  },
  {
    id: 'fijo22', name: 'Fijo 22/1', color: '#00A896',
    rate: 0.22, maxLoss: 0.075, termDays: 366,
    en: { term: '12-month term', reason: 'You are comfortable with a one-year commitment in exchange for a higher fixed annual rate — Fijo 22/1 is a balanced fit.' },
    es: { term: 'Plazo de 12 meses', reason: 'Te sientes cómodo con un compromiso de un año a cambio de una tasa anual fija más alta — Fijo 22/1 es un equilibrio adecuado.' },
  },
  {
    id: 'fijo25', name: 'Fijo 25/2', color: '#C9A352',
    rate: 0.25, maxLoss: 0.10, termDays: 731,
    en: { term: '24-month term', reason: 'You prioritize maximizing the fixed reference rate and are comfortable locking capital for the long term — Fijo 25/2 offers ARKA’s highest fixed annual rate.' },
    es: { term: 'Plazo de 24 meses', reason: 'Buscas maximizar la tasa de referencia fija y te sientes cómodo inmovilizando capital a largo plazo — Fijo 25/2 ofrece la tasa anual fija más alta de ARKA.' },
  },
]

function getRecommendation(score) {
  if (score <= 4) return PLANS[0]
  if (score <= 8) return PLANS[1]
  return PLANS[2]
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Profiler() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const { rate: fxRate } = useFxRate()
  const minInvestmentLabel = `${fmtUSD(MIN_MXN / fxRate)} USD (≈ ${fmtUSD(MIN_MXN)} MXN)`
  const [step, setStep]         = useState(0)
  const [answers, setAnswers]   = useState({})
  const [selected, setSelected] = useState(null)
  const [dir, setDir]           = useState(1)

  // Email send
  const [senderName,  setSenderName]  = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [sendStatus,  setSendStatus]  = useState('idle') // idle | sending | sent | error

  const totalScore = Object.values(answers).reduce((s, v) => s + v, 0)
  const plan        = getRecommendation(totalScore)
  const pData       = plan[lang] || plan.en

  const current = step >= 1 && step <= TOTAL_QUESTIONS ? QUESTIONS[step - 1] : null
  const qData   = current ? current[lang] || current.en : null

  const go = (nextStep, direction = 1) => {
    setDir(direction)
    setSelected(null)
    setStep(nextStep)
  }

  const choose = (pts) => {
    if (!current) return
    setAnswers(prev => ({ ...prev, [current.id]: pts }))
    setSelected(pts)
    setTimeout(() => {
      if (step < TOTAL_QUESTIONS) go(step + 1, 1)
      else go(TOTAL_QUESTIONS + 1, 1)
    }, 380)
  }

  const runSimulator = () => {
    try { sessionStorage.setItem('arka_profiler_plan', plan.id) } catch {}
    navigate(`/simulator?plan=${plan.id}`)
  }

  const restart = () => {
    setAnswers({})
    setSelected(null)
    setDir(1)
    setStep(0)
    setSendStatus('idle')
    setSenderName('')
    setSenderEmail('')
  }

  const handleSendProfile = async () => {
    if (!senderEmail || sendStatus === 'sending' || sendStatus === 'sent') return
    setSendStatus('sending')
    try {
      const res = await fetch('/api/send-profiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:  senderName,
          email: senderEmail,
          plan: {
            id:            plan.id,
            name:          plan.name,
            term:          pData.term,
            rate:          `${(plan.rate * 100).toFixed(0)}%`,
            maxLoss:       `${(plan.maxLoss * 100).toFixed(1)}%`,
            minInvestment: minInvestmentLabel,
            reason:        pData.reason,
            score:         totalScore,
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
      intro_title: 'Investor Profiler',
      intro_sub:   `Answer ${TOTAL_QUESTIONS} questions to discover which ARKA fixed-term plan matches your horizon and liquidity needs.`,
      start:       'Begin Assessment',
      question:    'Question',
      of:          'of',
      back:        '← Back',
      result_title: 'Your Recommended Plan',
      score:       'Profile Score',
      recommended: 'Recommended Plan',
      ref_rate:    'Fixed Annual Rate',
      term_label:  'Term',
      minInvestment: 'Minimum Investment',
      maxRisk:     'Maximum Risk',
      why:         'Why this plan',
      simulate:    'Run Simulation →',
      apply:       'Contact',
      restart:     'Retake Assessment',
      disclaimer:  '⚠ This profiling is indicative only. Plan assignment is subject to eligibility review, KYC/AML procedures, and execution of applicable legal documents. Early withdrawal before the term ends forfeits 25% of the returns accrued to date.',
    },
    es: {
      intro_title: 'Perfilador de Inversor',
      intro_sub:   `Responde ${TOTAL_QUESTIONS} preguntas para descubrir qué plan a plazo fijo de ARKA se alinea con tu horizonte y necesidades de liquidez.`,
      start:       'Iniciar Evaluación',
      question:    'Pregunta',
      of:          'de',
      back:        '← Atrás',
      result_title: 'Tu Plan Recomendado',
      score:       'Puntuación de Perfil',
      recommended: 'Plan Recomendado',
      ref_rate:    'Tasa Anual Fija',
      term_label:  'Plazo',
      minInvestment: 'Inversión Mínima',
      maxRisk:     'Riesgo Máximo',
      why:         'Por qué este plan',
      simulate:    'Ver Simulación →',
      apply:       'Contacto',
      restart:     'Repetir Evaluación',
      disclaimer:  '⚠ Este perfilamiento es indicativo. La asignación de plan está sujeta a revisión de elegibilidad, KYC/AML y ejecución de los documentos legales aplicables. El retiro anticipado antes de finalizar el plazo penaliza con el 25% de los rendimientos acumulados a la fecha.',
    },
  }
  const tx = T[lang] || T.en

  return (
    <main className="pt-20 min-h-screen bg-[#050505]">

      {/* ── Page header ── */}
      <section className="px-5 sm:px-10 md:px-16 lg:px-28 xl:px-36 py-16 md:py-20 border-b border-white/[0.07]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] tracking-[0.5em] uppercase text-white/50 mb-5">ARKA</p>
          <h1 className="text-[clamp(2.2rem,5vw,4.2rem)] font-light leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-white to-white/65 bg-clip-text text-transparent">
              {tx.intro_title}
            </span>
          </h1>
        </div>
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-28 xl:px-36 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">

          <AnimatePresence mode="wait" custom={dir}>

            {/* ── Intro ── */}
            {step === 0 && (
              <motion.div key="intro"
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="text-center space-y-12 py-12">
                <div className="space-y-6">
                  <p className="text-white/75 text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
                    {tx.intro_sub}
                  </p>
                  <div className="flex justify-center gap-10 pt-4">
                    {[
                      { n: String(TOTAL_QUESTIONS), label: lang === 'es' ? 'Preguntas' : 'Questions' },
                      { n: '~2', label: lang === 'es' ? 'Minutos'   : 'Minutes'   },
                      { n: '3',  label: lang === 'es' ? 'Planes'    : 'Plans'  },
                    ].map(({ n, label }) => (
                      <div key={n} className="text-center">
                        <p className="text-4xl font-extralight bg-gradient-to-b from-white to-white/55 bg-clip-text text-transparent">
                          {n}
                        </p>
                        <p className="text-[10px] tracking-[0.28em] uppercase text-white/45 mt-2">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => go(1, 1)}
                  className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-medium bg-[#004C45] text-white hover:bg-[#005c54] px-12 py-4 rounded-sm transition-all duration-300">
                  {tx.start}
                </button>
              </motion.div>
            )}

            {/* ── Question ── */}
            {step >= 1 && step <= TOTAL_QUESTIONS && qData && (
              <motion.div key={`q-${step}`}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -30 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="space-y-10">

                {/* Progress bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] tracking-[0.3em] uppercase text-white/45">
                      {tx.question} {step} {tx.of} {TOTAL_QUESTIONS}
                    </span>
                    <span className="text-[10px] text-white/35 tabular-nums font-mono">
                      {Math.round(step / TOTAL_QUESTIONS * 100)}%
                    </span>
                  </div>
                  <div className="h-px bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#C9A352] to-[#E8C87A] rounded-full"
                      initial={false}
                      animate={{ width: `${(step / TOTAL_QUESTIONS) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>

                {/* Question text */}
                <h2 className="text-[clamp(1.3rem,3vw,2rem)] font-light text-white leading-snug">
                  {qData.q}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {qData.opts.map((opt, i) => {
                    const isSelected = answers[current.id] === opt.pts || selected === opt.pts
                    return (
                      <motion.button key={i} onClick={() => choose(opt.pts)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className={`w-full text-left px-6 py-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? 'border-[#C9A352]/60 bg-[#C9A352]/10 text-white'
                            : 'border-white/8 bg-white/[0.02] text-white/72 hover:border-white/22 hover:text-white hover:bg-white/[0.05]'
                        }`}>
                        <span className="text-[10px] tracking-[0.2em] uppercase font-medium mr-4 text-white/30">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm md:text-base">{opt.label}</span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Back */}
                {step > 1 && (
                  <button onClick={() => go(step - 1, -1)}
                    className="text-[10px] tracking-[0.2em] uppercase text-white/35 hover:text-white/65 transition-colors">
                    {tx.back}
                  </button>
                )}
              </motion.div>
            )}

            {/* ── Results ── */}
            {step === TOTAL_QUESTIONS + 1 && (
              <motion.div key="results"
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-10">

                {/* Plan badge */}
                <div className="relative text-center py-8 border-b border-white/[0.07] overflow-hidden">
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
                    style={{ backgroundColor: plan.color, filter: 'blur(90px)', opacity: 0.18 }} />
                  <div className="relative space-y-5">
                    <p className="inline-flex items-center gap-2.5 text-[10px] tracking-[0.45em] uppercase text-white/45">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.color }} />
                      {tx.result_title}
                    </p>
                    <h2 className="text-[clamp(2.2rem,6vw,4rem)] font-light tracking-tight" style={{ color: plan.color }}>
                      {plan.name}
                    </h2>
                    <p className="text-white/72 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                      {pData.reason}
                    </p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: tx.ref_rate,    value: `${(plan.rate * 100).toFixed(0)}%`,     isGold: true },
                    { label: tx.term_label,  value: pData.term,                              isGold: false },
                    { label: tx.maxRisk,     value: `−${(plan.maxLoss * 100).toFixed(1)}%`,  isGold: false },
                  ].map(({ label, value, isGold }) => (
                    <div key={label} className="p-4 md:p-5 rounded-xl border border-white/8 bg-white/[0.03] space-y-2 text-center">
                      <p className="text-[9px] tracking-[0.25em] uppercase text-white/45">{label}</p>
                      <p className="font-light text-sm md:text-base leading-tight">
                        {isGold
                          ? <span style={{ color: plan.color }}>{value}</span>
                          : <span className="text-white/85">{value}</span>
                        }
                      </p>
                    </div>
                  ))}
                </div>

                {/* Plan detail */}
                <div className="p-6 rounded-xl border border-white/8 bg-white/[0.03] space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] tracking-[0.28em] uppercase text-white/50">{tx.minInvestment}</span>
                    <span className="text-white/85 text-sm">{minInvestmentLabel}</span>
                  </div>
                  <div className="h-px bg-white/[0.06]" />
                  <div className="space-y-1.5">
                    <p className="text-[10px] tracking-[0.25em] uppercase text-white/50">{tx.why}</p>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {tx.score}: <span className="tabular-nums" style={{ color: plan.color }}>{totalScore} / {MAX_SCORE}</span>
                    </p>
                  </div>
                </div>

                {/* ── Send profile by email ── */}
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-4">
                  <div>
                    <p className="text-[10px] tracking-[0.28em] uppercase text-white/55 mb-1">
                      {lang === 'es' ? 'Recibir plan por correo' : 'Receive your plan by email'}
                    </p>
                    <p className="text-[10px] text-white/30">
                      {lang === 'es'
                        ? 'Te enviamos tu plan recomendado y sus condiciones.'
                        : 'We\'ll send your recommended plan and its terms.'}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      id="prof-sender-name" name="senderName"
                      type="text"
                      placeholder={lang === 'es' ? 'Tu nombre' : 'Your name'}
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      disabled={sendStatus === 'sent'}
                      className="w-full bg-white/[0.04] border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/25
                        focus:outline-none focus:border-white/25 transition-colors disabled:opacity-40"
                    />
                    <input
                      id="prof-sender-email" name="senderEmail"
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
                    onClick={handleSendProfile}
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
                    {sendStatus === 'sent'    && (lang === 'es' ? '✓ Plan enviado' : '✓ Plan sent')}
                    {sendStatus === 'error'   && (lang === 'es' ? 'Error — intentar de nuevo' : 'Error — try again')}
                    {sendStatus === 'idle'    && (lang === 'es' ? 'Enviar mi plan →' : 'Send my plan →')}
                  </button>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button onClick={runSimulator}
                    className="inline-flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] uppercase font-medium bg-[#004C45] text-white hover:bg-[#005c54] px-8 py-4 rounded-sm transition-all duration-300">
                    {tx.simulate}
                  </button>
                  <Link to="/contact"
                    className="inline-flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] uppercase font-medium border border-white/18 text-white/65 hover:border-white/40 hover:text-white px-8 py-4 rounded-sm transition-all duration-300">
                    {tx.apply}
                  </Link>
                  <button onClick={restart}
                    className="inline-flex items-center justify-center gap-2 text-[10px] tracking-[0.18em] uppercase text-white/35 hover:text-white/65 px-4 py-4 transition-colors">
                    {tx.restart}
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="text-[9px] text-white/30 leading-relaxed">{tx.disclaimer}</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>
    </main>
  )
}
