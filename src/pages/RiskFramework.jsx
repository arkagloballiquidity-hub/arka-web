import SectionHeading from '@/components/shared/SectionHeading'
import CTASection from '@/components/shared/CTASection'
import { RISK_METRICS } from '@/config/site'

function RiskBlock({ title, items }) {
  return (
    <div className="arka-card p-6 space-y-4">
      <h3 className="text-white font-medium border-b border-[#1E293B] pb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-[#94A3B8]">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0B1F3A] border border-[#1E293B] shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function RiskFramework() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">Risk Framework</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            Defined Risk Architecture
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            Performance is only meaningful when risk is measured, controlled, and continuously
            reviewed. At ARKA, risk architecture is not a constraint on strategy — it is the strategy.
          </p>
        </div>
      </section>

      {/* Risk Metrics */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading eyebrow="Risk Parameters" title="Framework references — editable, not promises." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {RISK_METRICS.map((m) => (
              <div key={m.label} className="arka-card p-6 space-y-2">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8]">{m.label}</p>
                <p className="text-white font-light text-base">{m.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#94A3B8]">
            ⚠ These parameters are risk framework references. They are not performance guarantees,
            fixed commitments, or investment contracts. All risk limits are subject to review and
            may be adjusted under changing market conditions.
          </p>
        </div>
      </section>

      {/* Risk Architecture Detail */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka">
          <SectionHeading eyebrow="Architecture Detail" title="Six layers of institutional risk governance." />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RiskBlock
              title="VaR & Exposure Control"
              items={[
                'Daily Value at Risk computed at portfolio level',
                'Position-level exposure limits enforced systematically',
                'Correlation-adjusted gross exposure monitoring',
                'Intraday re-evaluation under adverse conditions',
              ]}
            />
            <RiskBlock
              title="Drawdown Management"
              items={[
                'Intraday drawdown limit: -0.10% to -0.50% per session',
                'Portfolio drawdown stop framework: -5% to -10%',
                'Mandatory position reduction triggers',
                'No averaging into losing positions',
              ]}
            />
            <RiskBlock
              title="Portfolio Stop Framework"
              items={[
                'Hard stop at portfolio-level drawdown threshold',
                'Session-end exposure review and lock protocol',
                'Automatic reduction sequences under defined triggers',
                'Recovery process requires explicit re-authorization',
              ]}
            />
            <RiskBlock
              title="Margin & Leverage Monitoring"
              items={[
                'Maximum leverage reference: 1:100',
                'Continuous real-time margin monitoring',
                'Margin call prevention protocol active at all times',
                'Leverage scaled down dynamically under volatility',
              ]}
            />
            <RiskBlock
              title="Dynamic Allocation"
              items={[
                'Allocation sizing reviewed per market session',
                'Exposure reduced — not maintained — under adverse conditions',
                'No fixed allocation; all sizing is context-dependent',
                'Strategy-level and portfolio-level sizing limits enforced independently',
              ]}
            />
            <RiskBlock
              title="Session-Based Controls"
              items={[
                'Primary execution window: New York session',
                'Pre-session risk budget evaluation',
                'Mid-session exposure review checkpoints',
                'End-of-session P&L and drawdown audit',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka max-w-4xl">
          <SectionHeading eyebrow="Risk Philosophy" title="Risk management is not a constraint — it is the strategy." />
          <div className="space-y-6 text-[#94A3B8] text-base leading-relaxed">
            <p>
              Most investment operations treat risk management as a guardrail applied after strategy
              design. At ARKA, the order is reversed. Risk architecture is defined first. Strategy
              parameters are built within that architecture — never around it.
            </p>
            <p>
              This means that no performance target overrides a risk limit. If a market condition
              activates a stop protocol, positions are reduced regardless of perceived opportunity.
              Discipline is not optional.
            </p>
          </div>
        </div>
      </section>

      <CTASection eyebrow="Qualified Investors" title="Review strategies within ARKA's risk architecture." secondaryLabel="Explore Strategies" secondaryHref="/strategies" secondaryExternal={false} />
    </main>
  )
}
