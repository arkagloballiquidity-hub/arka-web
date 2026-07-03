import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLang } from '@/context/LanguageContext'
import { useFxRate } from '@/hooks/useFxRate'
import { PLAN_MIN_MXN } from '@/config/site'

const PLAN_ACCENT = { flex20: '#5E97C2', fijo22: '#00A896', fijo25: '#C9A352' }

function fmtUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function StrategyCard({ strategy, featured = false }) {
  const { lang, t } = useLang()
  const isEs = lang === 'es'
  const accent = PLAN_ACCENT[strategy.id] || '#C9A352'
  const { rate: fxRate } = useFxRate()
  const minInvestmentLabel = isEs
    ? `$${PLAN_MIN_MXN.toLocaleString('en-US')} MXN (≈ ${fmtUSD(PLAN_MIN_MXN / fxRate)} USD) mínimo`
    : `$${PLAN_MIN_MXN.toLocaleString('en-US')} MXN (≈ ${fmtUSD(PLAN_MIN_MXN / fxRate)} USD) minimum`

  return (
    <div
      className={cn(
        'relative flex flex-col gap-6 p-8 rounded-lg border transition-all duration-300 group h-full',
        featured
          ? 'bg-[#0B1F3A] border-[#1E293B] hover:border-[#334155]'
          : 'bg-[#0D1320] border-[#1E293B] hover:border-[#334155]'
      )}
    >
      {/* Top block grows to fill — anchors every row below (Target Reference
          onward) at the same height across cards, regardless of how much
          text the badge/name/objective/description happen to wrap to. */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Profile badge */}
        <div className="flex items-center justify-between">
          <span
            className="text-[9px] tracking-[0.3em] uppercase px-3 py-1 border rounded-full"
            style={{ color: accent, borderColor: `${accent}55` }}
          >
            {isEs ? strategy.profileEs : strategy.profile}
          </span>
        </div>

        {/* Name & objective */}
        <div className="space-y-2">
          <h3 className="text-white font-medium text-lg leading-tight">{isEs ? strategy.nameEs : strategy.name}</h3>
          <p className="text-white/90 text-sm leading-relaxed">{isEs ? strategy.objectiveEs : strategy.objective}</p>
        </div>

        {/* Full description */}
        <p className="text-[#94A3B8] text-sm leading-relaxed text-justify">{isEs ? strategy.descriptionEs : strategy.description}</p>
      </div>

      {/* Target reference */}
      <div className="border-t border-[#1E293B] pt-5 space-y-1">
        <p className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8]">{t('home', 'strategy_label')}</p>
        <p className="text-2xl font-light" style={{ color: accent }}>{isEs ? strategy.targetRefEs : strategy.targetRef}</p>
        <p className="text-[10px] text-[#94A3B8]">{t('strategiesPage', 'detail_target_sub')}</p>
      </div>

      {/* Max risk */}
      <div className="flex items-center justify-between border-t border-[#1E293B] pt-4">
        <span className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8]">{t('home', 'strategy_maxrisk')}</span>
        <span className="text-sm font-light text-[#e0a3a3]">{t('strategies', `${strategy.id}_maxrisk`)}</span>
      </div>

      {/* Minimum investment */}
      <div className="flex items-center justify-between border-t border-[#1E293B] pt-4">
        <span className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8]">{t('strategiesPage', 'min_investment_label')}</span>
        <span className="text-sm font-light text-white">{minInvestmentLabel}</span>
      </div>

      {/* Ideal for — also grows, so the penalty note and CTA line up
          across cards regardless of how long this text runs. */}
      <div className="flex-1 space-y-1">
        <p className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8]">{t('strategies', 'ideal_label')}</p>
        <p className="text-sm text-[#94A3B8]">{isEs ? strategy.idealForEs : strategy.idealFor}</p>
      </div>

      {/* Early withdrawal penalty */}
      <p className="text-[10px] text-[#e0a3a3]/85 leading-relaxed border-t border-[#1E293B] pt-4">
        ⚠ {isEs ? strategy.penaltyEs : strategy.penalty}
      </p>

      <Link
        to="/contact"
        className="mt-auto text-[11px] tracking-[0.15em] uppercase text-white border border-[#1E293B] hover:bg-[#0B1F3A] hover:border-[#0B1F3A] px-5 py-3 text-center transition-all duration-300 rounded"
      >
        {t('home', 'strategy_apply')}
      </Link>
    </div>
  )
}
