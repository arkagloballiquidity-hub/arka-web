import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const profileColors = {
  Conservative:        'text-[#94A3B8] border-[#1E293B]',
  Moderate:            'text-[#CBD5E1] border-[#334155]',
  'Active / Quantitative': 'text-white border-[#475569]',
}

export default function StrategyCard({ strategy, featured = false }) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-6 p-8 rounded-lg border transition-all duration-300 group',
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
          {strategy.profile}
        </span>
      </div>

      {/* Name & target */}
      <div className="space-y-2">
        <h3 className="text-white font-medium text-lg leading-tight">{strategy.name}</h3>
        <p className="text-[#94A3B8] text-sm leading-relaxed">{strategy.objective}</p>
      </div>

      {/* Target reference */}
      <div className="border-t border-[#1E293B] pt-5 space-y-1">
        <p className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8]">Target Reference</p>
        <p className="text-2xl font-light text-white">{strategy.targetRef}</p>
        <p className="text-[10px] text-[#94A3B8]">Strategic objective — not a guarantee</p>
      </div>

      {/* Ideal for */}
      <div className="space-y-1">
        <p className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8]">Ideal for</p>
        <p className="text-sm text-[#94A3B8]">{strategy.idealFor}</p>
      </div>

      <Link
        to="/access"
        className="mt-auto text-[11px] tracking-[0.15em] uppercase text-white border border-[#1E293B] hover:bg-[#0B1F3A] hover:border-[#0B1F3A] px-5 py-3 text-center transition-all duration-300 rounded"
      >
        Apply for Access
      </Link>
    </div>
  )
}
