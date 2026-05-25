import SectionHeading from '@/components/shared/SectionHeading'
import CTASection from '@/components/shared/CTASection'
import { MARKETS } from '@/config/site'

export default function Markets() {
  return (
    <main className="pt-20">
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">Markets & Execution</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            Systematic Exposure Across<br />Global Markets
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            ARKA operates active strategies across selected global financial markets, with a primary
            focus on index exposure, tactical allocation, and algorithmic foreign exchange models.
          </p>
        </div>
      </section>

      {/* Market Grid */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading eyebrow="Active Markets" title="Selected instruments. Institutional exposure." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MARKETS.map((m) => (
              <div key={m.ticker} className="arka-card p-8 space-y-4">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-white text-2xl font-medium">{m.ticker}</span>
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8] border border-[#1E293B] px-2 py-1 rounded">
                    {m.role}
                  </span>
                </div>
                <p className="text-[#94A3B8] text-base">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Execution Model */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionHeading eyebrow="Execution Model" title="Systematic + hybrid discretionary/algorithmic." />
              <div className="space-y-6 text-[#94A3B8] text-sm leading-relaxed">
                <p>
                  ARKA's execution architecture combines systematic rule-based models with selective
                  discretionary oversight at defined conditions. The core logic is algorithmic; human
                  intervention is structurally limited and rule-governed.
                </p>
                <p>
                  Proprietary strategy parameters, signal logic, and model architecture are not
                  disclosed. All execution decisions are governed by the risk framework.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Primary Session', value: 'New York — institutional liquidity window' },
                { label: 'Execution Type', value: 'Systematic + hybrid discretionary/algorithmic' },
                { label: 'Order Architecture', value: 'FIX API institutional connectivity' },
                { label: 'Liquidity Source', value: 'Prime of Prime — oneZero aggregation' },
                { label: 'Latency Infrastructure', value: 'Equinix IBX co-location' },
                { label: 'Proprietary Logic', value: 'Not disclosed' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-3 border-b border-[#1E293B]">
                  <span className="text-[#94A3B8] text-sm">{item.label}</span>
                  <span className="text-white text-sm text-right max-w-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection eyebrow="Investor Access" title="Access ARKA's systematic strategies as a qualified participant." />
    </main>
  )
}
