import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLang } from '@/context/LanguageContext'

const profileColors = {
  Conservative:        'text-[#94A3B8] border-[#1E293B]',
  Moderate:            'text-[#CBD5E1] border-[#334155]',
  'Active / Quantitative': 'text-white border-[#475569]',
}

export default function StrategyCard({ strategy, featured = false }) {
  const { lang, t } = useLang()
  const isEs = lang === 'es'

  return (
    <div
      className={cn(
        'relative flex flex-col gap-6 p-8 rounded-lg border transition-all duration-300 group h-full',
        featured
          ? 'bg-[#0B1F3A] border-[#1E293B] hover:border-[#334155]'
          : 'bg-[#0D1320] border-[#1E293B] hover:border-[#334155]'
      )}
    >
      {/* Profile badge */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-[9px] tracking-[0.3em] uppercase px-3 py-1 border rounded-full',
            profileColors[strategy.profile] || profileColors.Conservative
          )}
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

      {/* Target reference */}
      <div className="border-t border-[#1E293B] pt-5 space-y-1">
        <p className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8]">{t('home', 'strategy_label')}</p>
        <p className="text-2xl font-light text-white">{isEs ? strategy.targetRefEs : strategy.targetRef}</p>
        <p className="text-[10px] text-[#94A3B8]">{t('strategiesPage', 'detail_target_sub')}</p>
      </div>

      {/* Max risk */}
      <div className="flex items-center justify-between border-t border-[#1E293B] pt-4">
        <span className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8]">{t('home', 'strategy_maxrisk')}</span>
        <span className="text-sm font-light text-[#e0a3a3]">{t('strategies', `${strategy.id}_maxrisk`)}</span>
      </div>

      {/* Ideal for */}
      <div className="space-y-1">
        <p className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8]">{t('strategies', 'ideal_label')}</p>
        <p className="text-sm text-[#94A3B8]">{isEs ? strategy.idealForEs : strategy.idealFor}</p>
      </div>

      <Link
        to="/contact"
        className="mt-auto text-[11px] tracking-[0.15em] uppercase text-white border border-[#1E293B] hover:bg-[#0B1F3A] hover:border-[#0B1F3A] px-5 py-3 text-center transition-all duration-300 rounded"
      >
        {t('home', 'strategy_apply')}
      </Link>
    </div>
  )
}
