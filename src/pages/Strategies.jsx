import StrategyCard from '@/components/shared/StrategyCard'
import SectionHeading from '@/components/shared/SectionHeading'
import CTASection from '@/components/shared/CTASection'
import { STRATEGIES, STRATEGY_DISCLAIMER, STRATEGY_DISCLAIMER_ES, RISK_METRICS } from '@/config/site'
import { useLang } from '@/context/LanguageContext'

function RiskBlock({ title, items }) {
  return (
    <div className="arka-card p-6 space-y-4 h-full">
      <h3 className="text-white font-medium text-sm border-b border-[#1E293B] pb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-[#94A3B8] leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0B1F3A] border border-[#334155] shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Strategies() {
  const { lang, t } = useLang()
  const isEs = lang === 'es'
  const disclaimer = isEs ? STRATEGY_DISCLAIMER_ES : STRATEGY_DISCLAIMER

  // ── Unified hero ──────────────────────────────────────────────────────────
  const hero = isEs
    ? {
        eyebrow: 'Estrategias y Marco de Riesgo',
        h1: 'Tres mandatos, una arquitectura de riesgo.',
        desc: 'Cada estrategia de ARKA opera dentro de un único marco de riesgo definido. A continuación: los tres mandatos de inversión, seguidos de la arquitectura de riesgo que gobierna cada uno de ellos.',
      }
    : {
        eyebrow: 'Strategies & Risk Framework',
        h1: 'Three mandates, one risk architecture.',
        desc: 'Every ARKA strategy operates within a single, defined risk framework. Below: the three investment mandates, followed by the risk architecture that governs each of them.',
      }

  // ── Risk section labels ───────────────────────────────────────────────────
  const riskEyebrow = isEs ? 'Marco de Riesgo' : 'Risk Framework'
  const riskTitle   = isEs ? 'Arquitectura de riesgo definida.' : 'Defined risk architecture.'
  const riskIntro   = isEs
    ? 'El rendimiento solo es significativo cuando el riesgo se mide, controla y revisa continuamente. En ARKA, la arquitectura de riesgo no es una restricción de la estrategia — es la estrategia.'
    : 'Performance is only meaningful when risk is measured, controlled, and continuously reviewed. At ARKA, risk architecture is not a constraint on strategy — it is the strategy.'

  const metricsLabel = isEs ? 'Parámetros de Riesgo' : 'Risk Parameters'
  const metricsTitle = isEs ? 'Referencias del marco — editables, no promesas.' : 'Framework references — editable, not promises.'
  const metricsDisc  = isEs
    ? '⚠ Estos parámetros son referencias del marco de riesgo. No son garantías de rendimiento, compromisos fijos ni contratos de inversión. Todos los límites de riesgo están sujetos a revisión y pueden ajustarse bajo condiciones cambiantes del mercado.'
    : '⚠ These parameters are risk framework references. They are not performance guarantees, fixed commitments, or investment contracts. All risk limits are subject to review and may be adjusted under changing market conditions.'

  const archLabel = isEs ? 'Detalle de Arquitectura' : 'Architecture Detail'
  const archTitle = isEs ? 'Seis capas de gobernanza institucional del riesgo.' : 'Six layers of institutional risk governance.'

  const philLabel = isEs ? 'Filosofía de Riesgo' : 'Risk Philosophy'
  const philTitle = isEs ? 'La gestión de riesgo no es una restricción — es la estrategia.' : 'Risk management is not a constraint — it is the strategy.'

  const RISK_BLOCKS = isEs ? [
    { title: 'VaR y Control de Exposición', items: [
      'Value at Risk diario calculado a nivel de portafolio',
      'Límites de exposición por posición aplicados sistemáticamente',
      'Monitoreo de exposición bruta ajustada por correlación',
      'Re-evaluación intradía bajo condiciones adversas',
    ]},
    { title: 'Gestión de Drawdown', items: [
      'Límite de drawdown intradía: -0.10% a -0.50% por sesión',
      'Marco de stop de portafolio: -5% a -10%',
      'Disparadores obligatorios de reducción de posición',
      'Sin promediado en posiciones perdedoras',
    ]},
    { title: 'Marco de Stop de Portafolio', items: [
      'Stop duro en umbral de drawdown a nivel de portafolio',
      'Revisión y protocolo de bloqueo al cierre de sesión',
      'Secuencias automáticas de reducción bajo disparadores definidos',
      'La recuperación requiere re-autorización explícita',
    ]},
    { title: 'Monitoreo de Margen y Apalancamiento', items: [
      'Referencia de apalancamiento máximo: 1:100',
      'Monitoreo de margen en tiempo real continuo',
      'Protocolo de prevención de margin call activo permanentemente',
      'Apalancamiento reducido dinámicamente bajo volatilidad',
    ]},
    { title: 'Asignación Dinámica', items: [
      'Dimensionamiento revisado por sesión de mercado',
      'Exposición reducida — no mantenida — bajo condiciones adversas',
      'Sin asignación fija; todo el dimensionamiento es contextual',
      'Límites aplicados independientemente por estrategia y portafolio',
    ]},
    { title: 'Controles por Sesión', items: [
      'Ventana de ejecución primaria: sesión de Nueva York',
      'Evaluación de presupuesto de riesgo antes de la sesión',
      'Puntos de revisión de exposición durante la sesión',
      'Auditoría de P&L y drawdown al cierre de sesión',
    ]},
  ] : [
    { title: 'VaR & Exposure Control', items: [
      'Daily Value at Risk computed at portfolio level',
      'Position-level exposure limits enforced systematically',
      'Correlation-adjusted gross exposure monitoring',
      'Intraday re-evaluation under adverse conditions',
    ]},
    { title: 'Drawdown Management', items: [
      'Intraday drawdown limit: -0.10% to -0.50% per session',
      'Portfolio drawdown stop framework: -5% to -10%',
      'Mandatory position reduction triggers',
      'No averaging into losing positions',
    ]},
    { title: 'Portfolio Stop Framework', items: [
      'Hard stop at portfolio-level drawdown threshold',
      'Session-end exposure review and lock protocol',
      'Automatic reduction sequences under defined triggers',
      'Recovery process requires explicit re-authorization',
    ]},
    { title: 'Margin & Leverage Monitoring', items: [
      'Maximum leverage reference: 1:100',
      'Continuous real-time margin monitoring',
      'Margin call prevention protocol active at all times',
      'Leverage scaled down dynamically under volatility',
    ]},
    { title: 'Dynamic Allocation', items: [
      'Allocation sizing reviewed per market session',
      'Exposure reduced — not maintained — under adverse conditions',
      'No fixed allocation; all sizing is context-dependent',
      'Strategy-level and portfolio-level sizing limits enforced independently',
    ]},
    { title: 'Session-Based Controls', items: [
      'Primary execution window: New York session',
      'Pre-session risk budget evaluation',
      'Mid-session exposure review checkpoints',
      'End-of-session P&L and drawdown audit',
    ]},
  ]

  return (
    <main className="pt-20">
      {/* ── Unified hero ────────────────────────────────────────────────── */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">{hero.eyebrow}</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            {hero.h1}
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">{hero.desc}</p>
        </div>
      </section>

      {/* ════════════ PART 1 — STRATEGIES ════════════ */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading
            eyebrow={t('strategiesPage', 'eyebrow')}
            title={`${t('strategiesPage', 'h1_line1')} ${t('strategiesPage', 'h1_line2')}`}
            subtitle={t('strategiesPage', 'intro')}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {STRATEGIES.map((s) => (
              <StrategyCard key={s.id} strategy={s} />
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-10 p-6 arka-card">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8] mb-3">{t('strategiesPage', 'disclosure_label')}</p>
            <p className="text-[10px] text-[#94A3B8] leading-relaxed">{disclaimer}</p>
          </div>
        </div>
      </section>

      {/* ════════════ PART 2 — RISK FRAMEWORK ════════════ */}
      <section className="section-padding bg-[#050505] border-t border-[#1E293B]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">{riskEyebrow}</p>
          <h2 className="text-4xl md:text-5xl font-light text-white leading-tight tracking-tight mb-8">{riskTitle}</h2>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">{riskIntro}</p>
        </div>
      </section>

      {/* Risk Metrics */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading eyebrow={metricsLabel} title={metricsTitle} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {RISK_METRICS.map((m) => (
              <div key={m.key} className="arka-card p-6 space-y-3">
                <p className="text-[11px] tracking-[0.22em] uppercase text-[#94A3B8] font-medium leading-tight">
                  {isEs ? m.labelEs : m.labelEn}
                </p>
                <p className="text-white font-light text-lg leading-snug">
                  {isEs ? m.valueEs : m.value}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">{metricsDisc}</p>
        </div>
      </section>

      {/* Risk Architecture Detail */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka">
          <SectionHeading eyebrow={archLabel} title={archTitle} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {RISK_BLOCKS.map((block) => (
              <RiskBlock key={block.title} title={block.title} items={block.items} />
            ))}
          </div>
        </div>
      </section>

      {/* Risk Philosophy */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka max-w-4xl">
          <SectionHeading eyebrow={philLabel} title={philTitle} />
          <div className="space-y-6 text-[#94A3B8] text-base leading-relaxed">
            {isEs ? (
              <>
                <p className="text-justify">
                  La mayoría de las operaciones de inversión tratan la gestión de riesgo como una baranda aplicada después del diseño de la estrategia. En ARKA, el orden está invertido. La arquitectura de riesgo se define primero. Los parámetros de estrategia se construyen dentro de esa arquitectura — nunca alrededor de ella.
                </p>
                <p className="text-justify">
                  Esto significa que ningún objetivo de rendimiento supera un límite de riesgo. Si una condición de mercado activa un protocolo de stop, las posiciones se reducen independientemente de la oportunidad percibida. La disciplina no es opcional.
                </p>
              </>
            ) : (
              <>
                <p className="text-justify">
                  Most investment operations treat risk management as a guardrail applied after strategy
                  design. At ARKA, the order is reversed. Risk architecture is defined first. Strategy
                  parameters are built within that architecture — never around it.
                </p>
                <p className="text-justify">
                  This means that no performance target overrides a risk limit. If a market condition
                  activates a stop protocol, positions are reduced regardless of perceived opportunity.
                  Discipline is not optional.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow={isEs ? 'Inversores Calificados' : 'Qualified Investors'}
        title={isEs ? 'Solicita participación calificada en las estrategias de ARKA.' : 'Apply for qualified participation in ARKA strategies.'}
        secondaryLabel={t('home', 'profiler_cta')}
        secondaryHref="/profiler"
        secondaryExternal={false}
      />
    </main>
  )
}
