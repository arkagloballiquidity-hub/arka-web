import StrategyCard from '@/components/shared/StrategyCard'
import SectionHeading from '@/components/shared/SectionHeading'
import CTASection from '@/components/shared/CTASection'
import { STRATEGIES, STRATEGY_DISCLAIMER } from '@/config/site'

export default function Strategies() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">Investment Strategies</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            Three mandates.<br />One disciplined framework.
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            Each ARKA strategy is designed around a defined risk architecture, systematic execution
            model, and allocation philosophy suited to different qualified investor profiles.
          </p>
        </div>
      </section>

      {/* Strategies */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STRATEGIES.map((s) => (
              <StrategyCard key={s.id} strategy={s} />
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-10 p-6 arka-card">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8] mb-3">Important Disclosure</p>
            <p className="text-[10px] text-[#94A3B8] leading-relaxed">{STRATEGY_DISCLAIMER}</p>
          </div>
        </div>
      </section>

      {/* Detailed Strategy Descriptions */}
      {STRATEGIES.map((s, i) => (
        <section
          key={s.id}
          className={`section-padding ${i % 2 === 0 ? 'bg-[#050505]' : 'bg-[#0A0A0A]'}`}
        >
          <div className="container-arka">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-6">
                <span className="text-[9px] tracking-[0.3em] uppercase px-3 py-1 border border-[#1E293B] text-[#94A3B8] rounded-full">
                  {s.profile}
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-white leading-tight">{s.name}</h2>
                <p className="text-[#94A3B8] text-base leading-relaxed">{s.description}</p>
                <p className="text-[#94A3B8] text-sm leading-relaxed">
                  <strong className="text-white">Ideal for:</strong> {s.idealFor}
                </p>
              </div>
              <div className="space-y-4">
                <div className="arka-card p-6 space-y-2">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#94A3B8]">Strategic Objective</p>
                  <p className="text-white text-base">{s.objective}</p>
                </div>
                <div className="arka-card p-6 space-y-2">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#94A3B8]">Target Reference</p>
                  <p className="text-4xl font-light text-white">{s.targetRef}</p>
                  <p className="text-[10px] text-[#94A3B8]">Strategic reference objective — not a guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Legal note */}
      <section className="py-10 bg-[#050505] border-t border-[#1E293B]">
        <div className="container-arka">
          <p className="text-[10px] text-[#94A3B8] leading-relaxed max-w-4xl">
            ⚠ All target references are objectives only and are not guaranteed. Actual results may
            vary materially. Investment involves risk, including potential loss of capital. Strategy
            parameters, allocation rules, and risk limits are subject to change without notice.
          </p>
        </div>
      </section>

      <CTASection primaryLabel="Apply for Access" secondaryLabel="View Risk Framework" secondaryHref="/risk" secondaryExternal={false} />
    </main>
  )
}
