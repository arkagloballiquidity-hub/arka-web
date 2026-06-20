import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/context/LanguageContext'

// ── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    en: { q: 'What is your investment horizon?', opts: [
      { label: 'Less than 1 year',   pts: 0  },
      { label: '1 to 3 years',       pts: 5  },
      { label: '3 to 5 years',       pts: 10 },
      { label: '5 to 10 years',      pts: 16 },
      { label: 'More than 10 years', pts: 20 },
    ]},
    es: { q: '¿Cuál es tu horizonte de inversión?', opts: [
      { label: 'Menos de 1 año',  pts: 0  },
      { label: '1 a 3 años',      pts: 5  },
      { label: '3 a 5 años',      pts: 10 },
      { label: '5 a 10 años',     pts: 16 },
      { label: 'Más de 10 años',  pts: 20 },
    ]},
  },
  {
    id: 2,
    en: { q: 'What is your primary investment objective?', opts: [
      { label: 'Preserve my capital at all costs',       pts: 4  },
      { label: 'Stable, consistent returns',             pts: 10 },
      { label: 'Grow my wealth over the medium term',    pts: 15 },
      { label: 'Maximize returns — accept higher risk',  pts: 20 },
    ]},
    es: { q: '¿Cuál es tu objetivo principal de inversión?', opts: [
      { label: 'Preservar mi capital a toda costa',          pts: 4  },
      { label: 'Rendimientos estables y consistentes',       pts: 10 },
      { label: 'Crecer mi patrimonio a mediano plazo',       pts: 15 },
      { label: 'Maximizar rendimientos — acepto mayor riesgo', pts: 20 },
    ]},
  },
  {
    id: 3,
    en: { q: 'What temporary portfolio loss could you tolerate?', opts: [
      { label: 'None — I need full capital security', pts: 0  },
      { label: 'Up to –5%',                          pts: 6  },
      { label: 'Up to –10%',                         pts: 12 },
      { label: 'Up to –20%',                         pts: 17 },
      { label: 'More than –20%',                     pts: 20 },
    ]},
    es: { q: '¿Qué nivel de pérdida temporal tolerarías en tu portafolio?', opts: [
      { label: 'Ninguno — necesito seguridad total', pts: 0  },
      { label: 'Hasta –5%',                         pts: 6  },
      { label: 'Hasta –10%',                        pts: 12 },
      { label: 'Hasta –20%',                        pts: 17 },
      { label: 'Más del –20%',                      pts: 20 },
    ]},
  },
  {
    id: 4,
    en: { q: 'What is your investment experience level?', opts: [
      { label: 'No experience',                            pts: 4  },
      { label: 'Basic — savings accounts, funds',          pts: 8  },
      { label: 'Intermediate — equities, bonds',           pts: 13 },
      { label: 'Advanced — derivatives, FX, alternatives', pts: 18 },
      { label: 'Professional — institutional management',  pts: 20 },
    ]},
    es: { q: '¿Cuál es tu nivel de experiencia en inversiones?', opts: [
      { label: 'Sin experiencia',                         pts: 4  },
      { label: 'Básico — cuentas de ahorro, fondos',      pts: 8  },
      { label: 'Intermedio — acciones, bonos',            pts: 13 },
      { label: 'Avanzado — derivados, FX, alternativos',  pts: 18 },
      { label: 'Profesional — gestión institucional',     pts: 20 },
    ]},
  },
  {
    id: 5,
    en: { q: 'If your portfolio drops 15% in one month, what do you do?', opts: [
      { label: 'Withdraw all capital immediately',    pts: 0  },
      { label: 'Withdraw part of my capital',         pts: 6  },
      { label: 'Hold — wait for recovery',            pts: 13 },
      { label: 'Take the opportunity to invest more', pts: 20 },
    ]},
    es: { q: 'Si tu portafolio cae 15% en un mes, ¿qué haces?', opts: [
      { label: 'Retiro todo mi capital inmediatamente', pts: 0  },
      { label: 'Retiro parte de mi capital',            pts: 6  },
      { label: 'Espero sin hacer cambios',              pts: 13 },
      { label: 'Aprovecho para invertir más',           pts: 20 },
    ]},
  },
  {
    id: 6,
    en: { q: 'When might you need access to your invested capital?', opts: [
      { label: 'Within 1 year',      pts: 0  },
      { label: '1 to 3 years',       pts: 8  },
      { label: '3 to 5 years',       pts: 14 },
      { label: 'More than 5 years',  pts: 20 },
    ]},
    es: { q: '¿Cuándo podrías necesitar acceso a tu capital invertido?', opts: [
      { label: 'En menos de 1 año', pts: 0  },
      { label: '1 a 3 años',        pts: 8  },
      { label: '3 a 5 años',        pts: 14 },
      { label: 'Más de 5 años',     pts: 20 },
    ]},
  },
  {
    id: 7,
    en: { q: 'Which best describes your financial situation?', opts: [
      { label: 'This investment represents most of my savings', pts: 4  },
      { label: 'Surplus capital, not needed short-term',        pts: 11 },
      { label: 'Long-term capital, I have an emergency fund',   pts: 17 },
      { label: 'Institutional / diversified portfolio',         pts: 20 },
    ]},
    es: { q: '¿Cuál describe mejor tu situación financiera?', opts: [
      { label: 'Esta inversión representa la mayoría de mis ahorros', pts: 4  },
      { label: 'Capital excedente, no necesario a corto plazo',       pts: 11 },
      { label: 'Capital de largo plazo, tengo fondo de emergencia',   pts: 17 },
      { label: 'Portafolio institucional / diversificado',            pts: 20 },
    ]},
  },
  {
    id: 8,
    en: { q: 'What is your available capital range?', opts: [
      { label: '$5,000 – $25,000 USD',    pts: 5  },
      { label: '$25,000 – $100,000 USD',  pts: 10 },
      { label: '$100,000 – $500,000 USD', pts: 15 },
      { label: '$500,000+ USD',           pts: 20 },
    ]},
    es: { q: '¿Cuál es tu rango de capital disponible para invertir?', opts: [
      { label: '$5,000 – $25,000 USD',    pts: 5  },
      { label: '$25,000 – $100,000 USD',  pts: 10 },
      { label: '$100,000 – $500,000 USD', pts: 15 },
      { label: '$500,000+ USD',           pts: 20 },
    ]},
  },
  {
    id: 9,
    en: { q: 'How often do you plan to make additional contributions?', opts: [
      { label: 'I do not plan to contribute further',      pts: 4  },
      { label: 'Occasionally',                            pts: 9  },
      { label: 'Monthly — fixed contributions',           pts: 15 },
      { label: 'Actively, based on market opportunities', pts: 20 },
    ]},
    es: { q: '¿Con qué frecuencia harías aportaciones adicionales?', opts: [
      { label: 'No planeo hacer aportaciones',         pts: 4  },
      { label: 'Ocasionalmente',                       pts: 9  },
      { label: 'Mensualmente — aportaciones fijas',   pts: 15 },
      { label: 'Activamente, según oportunidades',    pts: 20 },
    ]},
  },
  {
    id: 10,
    en: { q: 'Which risk/return balance best matches your expectations?', opts: [
      { label: 'Very conservative — low returns, maximum security', pts: 4  },
      { label: 'Conservative-moderate — stable returns, low risk',  pts: 10 },
      { label: 'Moderate — balance between growth and stability',   pts: 16 },
      { label: 'Dynamic — accept volatility for higher returns',    pts: 20 },
    ]},
    es: { q: '¿Qué equilibrio riesgo/rendimiento describe mejor tu expectativa?', opts: [
      { label: 'Muy conservador — retornos bajos, máxima seguridad',    pts: 4  },
      { label: 'Conservador-moderado — rendimientos estables',          pts: 10 },
      { label: 'Moderado — balance entre crecimiento y estabilidad',    pts: 16 },
      { label: 'Dinámico — acepto volatilidad por mayores rendimientos', pts: 20 },
    ]},
  },
]

// ── Institutional profile palette ─────────────────────────────────────────────
// All profiles use white/silver tones — gold accent for the key highlight
function getProfile(score) {
  if (score <= 65) return {
    id: 'conservative',
    color: '#5E97C2',
    en: { name: 'Conservative', desc: 'Capital preservation is your priority. You prefer predictable, stable growth with minimal volatility. ARKA Foundation Strategy aligns best with your profile.' },
    es: { name: 'Conservador',  desc: 'La preservación de capital es tu prioridad. Prefieres crecimiento predecible y estable con mínima volatilidad. La Estrategia Fundación ARKA se alinea mejor con tu perfil.' },
    strategy: 'ARKA Foundation Strategy', rate: '18%',
    alloc: { foundation: 80, growth: 20, alpha: 0 },
    gradient: 'from-white/80 to-white/50',
    barColors: { foundation: 'rgba(255,255,255,0.7)', growth: '#C9A352', alpha: 'rgba(255,255,255,0.25)' },
  }
  if (score <= 115) return {
    id: 'moderate',
    color: '#46B58F',
    en: { name: 'Moderate', desc: 'You seek balanced growth with managed risk. You can tolerate moderate volatility in exchange for consistent capital appreciation. A blend of Foundation and Strategic Growth suits you.' },
    es: { name: 'Moderado',  desc: 'Buscas crecimiento equilibrado con riesgo gestionado. Puedes tolerar volatilidad moderada a cambio de apreciación de capital consistente. Una combinación de Fundación y Crecimiento Estratégico te conviene.' },
    strategy: 'Foundation + Strategic Growth', rate: '21%',
    alloc: { foundation: 50, growth: 50, alpha: 0 },
    gradient: 'from-[#C9A352] to-[#E8C87A]',
    barColors: { foundation: 'rgba(255,255,255,0.55)', growth: '#C9A352', alpha: 'rgba(255,255,255,0.2)' },
  }
  if (score <= 155) return {
    id: 'balanced',
    color: '#C9A352',
    en: { name: 'Balanced Growth', desc: 'You combine discipline with ambition. You are comfortable with measured volatility and seek meaningful capital growth over time. A diversified multi-strategy allocation suits your profile.' },
    es: { name: 'Crecimiento Equilibrado', desc: 'Combinas disciplina con ambición. Te sientes cómodo con volatilidad medida y buscas crecimiento de capital significativo. Una asignación multi-estrategia diversificada se adapta a tu perfil.' },
    strategy: 'Multi-Strategy Blend', rate: '26%',
    alloc: { foundation: 30, growth: 45, alpha: 25 },
    gradient: 'from-white to-[#C9A352]',
    barColors: { foundation: 'rgba(255,255,255,0.5)', growth: '#C9A352', alpha: 'rgba(255,255,255,0.3)' },
  }
  if (score <= 178) return {
    id: 'dynamic',
    color: '#E0A03C',
    en: { name: 'Dynamic', desc: 'You pursue superior risk-adjusted returns and are comfortable with active market exposure. ARKA Alpha Force and a growth-tilted allocation align with your high-performance profile.' },
    es: { name: 'Dinámico',  desc: 'Buscas retornos superiores ajustados al riesgo y te sientes cómodo con exposición activa al mercado. ARKA Alpha Force y una asignación orientada al crecimiento se alinean con tu perfil.' },
    strategy: 'ARKA Alpha Force + Growth', rate: '32%',
    alloc: { foundation: 10, growth: 35, alpha: 55 },
    gradient: 'from-[#C9A352] via-white to-white',
    barColors: { foundation: 'rgba(255,255,255,0.35)', growth: '#C9A352', alpha: 'rgba(255,255,255,0.65)' },
  }
  return {
    id: 'aggressive',
    color: '#9B6FD4',
    en: { name: 'Aggressive', desc: 'You pursue maximum return and full market exposure, accepting the highest volatility for the greatest growth potential. A full allocation to ARKA Alpha Force aligns with your maximum-risk profile.' },
    es: { name: 'Agresivo',  desc: 'Buscas el máximo rendimiento y exposición total al mercado, aceptando la mayor volatilidad a cambio del mayor potencial de crecimiento. Una asignación completa a ARKA Alpha Force se alinea con tu perfil de riesgo máximo.' },
    strategy: 'ARKA Alpha Force', rate: '36%',
    alloc: { foundation: 0, growth: 0, alpha: 100 },
    gradient: 'from-[#C9A352] to-white',
    barColors: { foundation: 'rgba(255,255,255,0.25)', growth: 'rgba(255,255,255,0.4)', alpha: '#C9A352' },
  }
}

// ── Gradient text ─────────────────────────────────────────────────────────────
function GradientText({ children, gradient, className = '' }) {
  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Profiler() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [step, setStep]         = useState(0)
  const [answers, setAnswers]   = useState({})
  const [selected, setSelected] = useState(null)
  const [dir, setDir]           = useState(1)

  // Email send
  const [senderName,  setSenderName]  = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [sendStatus,  setSendStatus]  = useState('idle') // idle | sending | sent | error

  const totalScore = Object.values(answers).reduce((s, v) => s + v, 0)
  const profile    = getProfile(totalScore)

  const current = step >= 1 && step <= 10 ? QUESTIONS[step - 1] : null
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
      if (step < 10) go(step + 1, 1)
      else go(11, 1)
    }, 380)
  }

  const runSimulator = () => {
    try {
      sessionStorage.setItem('arka_profiler_alloc', JSON.stringify({
        f:  profile.alloc.foundation,
        g:  profile.alloc.growth,
        a:  profile.alloc.alpha,
        id: profile.id,
      }))
    } catch {}
    navigate('/simulator')
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
    const pData = profile[lang] || profile.en
    try {
      const res = await fetch('/api/send-profiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:  senderName,
          email: senderEmail,
          profile: {
            name:     pData.name,
            desc:     pData.desc,
            strategy: profile.strategy,
            rate:     profile.rate,
            score:    totalScore,
            alloc:    profile.alloc,
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
      intro_sub:   'Answer 10 questions to discover which ARKA strategy aligns with your investor profile.',
      start:       'Begin Assessment',
      question:    'Question',
      of:          'of',
      back:        '← Back',
      result_title: 'Your Investor Profile',
      score:       'Profile Score',
      recommended: 'Recommended Strategy',
      ref_rate:    'Reference Rate',
      allocation:  'Suggested Allocation',
      foundation:  'Foundation',
      growth:      'Strategic Growth',
      alpha:       'Alpha Force',
      simulate:    'Run Simulation →',
      apply:       'Contact',
      restart:     'Retake Assessment',
      disclaimer:  '⚠ This profiling is indicative only. Strategy assignment is subject to eligibility review, KYC/AML procedures, and execution of applicable legal documents.',
    },
    es: {
      intro_title: 'Perfilador de Inversor',
      intro_sub:   'Responde 10 preguntas para descubrir qué estrategia ARKA se alinea con tu perfil de inversor.',
      start:       'Iniciar Evaluación',
      question:    'Pregunta',
      of:          'de',
      back:        '← Atrás',
      result_title: 'Tu Perfil de Inversor',
      score:       'Puntuación de Perfil',
      recommended: 'Estrategia Recomendada',
      ref_rate:    'Tasa de Referencia',
      allocation:  'Asignación Sugerida',
      foundation:  'Fundación',
      growth:      'Crecimiento Estratégico',
      alpha:       'Alpha Force',
      simulate:    'Ver Simulación →',
      apply:       'Contacto',
      restart:     'Repetir Evaluación',
      disclaimer:  '⚠ Este perfilamiento es indicativo. La asignación de estrategia está sujeta a revisión de elegibilidad, KYC/AML y ejecución de los documentos legales aplicables.',
    },
  }
  const tx = T[lang] || T.en
  const pData = profile[lang] || profile.en

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
                      { n: '10', label: lang === 'es' ? 'Preguntas' : 'Questions' },
                      { n: '~3', label: lang === 'es' ? 'Minutos'   : 'Minutes'   },
                      { n: '4',  label: lang === 'es' ? 'Perfiles'  : 'Profiles'  },
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
            {step >= 1 && step <= 10 && qData && (
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
                      {tx.question} {step} {tx.of} 10
                    </span>
                    <span className="text-[10px] text-white/35 tabular-nums font-mono">
                      {Math.round(step / 10 * 100)}%
                    </span>
                  </div>
                  <div className="h-px bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#C9A352] to-[#E8C87A] rounded-full"
                      initial={false}
                      animate={{ width: `${(step / 10) * 100}%` }}
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
            {step === 11 && (
              <motion.div key="results"
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-10">

                {/* Profile badge */}
                <div className="relative text-center py-8 border-b border-white/[0.07] overflow-hidden">
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
                    style={{ backgroundColor: profile.color, filter: 'blur(90px)', opacity: 0.18 }} />
                  <div className="relative space-y-5">
                    <p className="inline-flex items-center gap-2.5 text-[10px] tracking-[0.45em] uppercase text-white/45">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: profile.color }} />
                      {tx.result_title}
                    </p>
                    <h2 className="text-[clamp(2.2rem,6vw,4rem)] font-light tracking-tight" style={{ color: profile.color }}>
                      {pData.name}
                    </h2>
                    <p className="text-white/72 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                      {pData.desc}
                    </p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: tx.score,       value: `${totalScore} / 200`, isGold: true  },
                    { label: tx.ref_rate,    value: profile.rate,          isGold: true  },
                    { label: tx.recommended, value: profile.strategy,      isGold: false },
                  ].map(({ label, value, isGold }) => (
                    <div key={label} className="p-4 md:p-5 rounded-xl border border-white/8 bg-white/[0.03] space-y-2 text-center">
                      <p className="text-[9px] tracking-[0.25em] uppercase text-white/45">{label}</p>
                      <p className="font-light text-sm md:text-base leading-tight">
                        {isGold
                          ? <span style={{ color: profile.color }}>{value}</span>
                          : <span className="text-white/85">{value}</span>
                        }
                      </p>
                    </div>
                  ))}
                </div>

                {/* Suggested allocation */}
                <div className="p-6 rounded-xl border border-white/8 bg-white/[0.03] space-y-5">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-white/50">{tx.allocation}</p>
                  {[
                    { label: tx.foundation, key: 'foundation', val: profile.alloc.foundation, rate: '18%' },
                    { label: tx.growth,     key: 'growth',     val: profile.alloc.growth,     rate: '24%' },
                    { label: tx.alpha,      key: 'alpha',      val: profile.alloc.alpha,       rate: '36%' },
                  ].map(({ label, key, val, rate }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/80 text-sm tracking-wide">
                          {label}
                          <span className="text-white/35 ml-2 text-xs">({rate})</span>
                        </span>
                        <span className="text-white/65 tabular-nums font-medium text-sm">{val}%</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${val}%` }}
                          transition={{ duration: 0.7, delay: 0.2 }}
                          style={{ backgroundColor: profile.color, opacity: key === 'foundation' ? 0.55 : key === 'growth' ? 0.78 : 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Send profile by email ── */}
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-4">
                  <div>
                    <p className="text-[10px] tracking-[0.28em] uppercase text-white/55 mb-1">
                      {lang === 'es' ? 'Recibir perfil por correo' : 'Receive your profile by email'}
                    </p>
                    <p className="text-[10px] text-white/30">
                      {lang === 'es'
                        ? 'Te enviamos tu perfil de inversor y asignación sugerida.'
                        : 'We\'ll send your investor profile and suggested allocation.'}
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
                    {sendStatus === 'sent'    && (lang === 'es' ? '✓ Perfil enviado' : '✓ Profile sent')}
                    {sendStatus === 'error'   && (lang === 'es' ? 'Error — intentar de nuevo' : 'Error — try again')}
                    {sendStatus === 'idle'    && (lang === 'es' ? 'Enviar mi perfil →' : 'Send my profile →')}
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
