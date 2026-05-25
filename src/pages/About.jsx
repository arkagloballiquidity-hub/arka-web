import SectionHeading from '@/components/shared/SectionHeading'
import CTASection from '@/components/shared/CTASection'
import { TIMELINE } from '@/config/site'

function Pillar({ title, body }) {
  return (
    <div className="space-y-3 border-t border-[#1E293B] pt-6">
      <h4 className="text-white font-medium">{title}</h4>
      <p className="text-[#94A3B8] text-sm leading-relaxed">{body}</p>
    </div>
  )
}

export default function About() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">About ARKA</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            Built through research,<br />discipline, and institutional<br />structuring.
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            ARKA Global Investments was developed over a decade of quantitative research, market
            analysis, and infrastructure construction — not as a retail trading operation, but as a
            private institutional capital management platform.
          </p>
        </div>
      </section>

      {/* Evolution Timeline */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading eyebrow="Our Evolution" title="A decade of disciplined development." />
          <div className="space-y-0">
            {TIMELINE.map((item, i) => (
              <div key={item.period} className="grid md:grid-cols-[180px_1fr] gap-6 py-10 border-b border-[#1E293B]">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-[#94A3B8] uppercase">{item.period}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-medium text-lg">{item.title}</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka">
          <SectionHeading
            eyebrow="Our Philosophy"
            title="Capital preservation first. Performance through discipline."
            subtitle="Every investment mandate at ARKA is built around a single premise: risk management is not a control function — it is the strategy."
          />
          <div className="grid md:grid-cols-2 gap-8">
            <Pillar
              title="Capital Preservation"
              body="Long-term wealth stewardship requires that capital protection comes before performance optimization. Drawdown is not a side effect — it is the primary variable."
            />
            <Pillar
              title="Systematic Discipline"
              body="Every entry, exit, and sizing decision follows a defined systematic framework. Discretionary overrides are structurally limited."
            />
            <Pillar
              title="Institutional Execution"
              body="Order flow, timing, and position management are aligned with institutional market windows to minimize adverse selection and slippage."
            />
            <Pillar
              title="Continuous Risk Review"
              body="Intraday and portfolio-level risk parameters are monitored in real time. Strategy exposure is reduced — not averaged — under adverse conditions."
            />
          </div>
        </div>
      </section>

      {/* Our Platform */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka max-w-4xl">
          <SectionHeading eyebrow="Our Platform" title="Private mandates. Quantitative research. Global markets." />
          <div className="space-y-6 text-[#94A3B8] text-base leading-relaxed">
            <p>
              ARKA Global Investments develops and manages private investment mandates across global
              financial markets. The platform operates at the intersection of quantitative strategy
              research, institutional execution infrastructure, and disciplined capital allocation.
            </p>
            <p>
              Participation is restricted to qualified investors who meet defined eligibility criteria.
              The platform does not operate as a public fund, retail brokerage, or general advisory service.
            </p>
          </div>

          <div className="mt-10 p-6 arka-card">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8] mb-4">Legal / Operating Structure</p>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              <strong className="text-white">ARKA Global Investments</strong> is the investment brand and platform identity.{' '}
              <strong className="text-white">ARKA Global Liquidity LTD</strong> acts as the legal and operating entity where applicable,
              including in contracts, compliance documentation, and regulatory correspondence.
              These are distinct designations within the same institutional ecosystem.
            </p>
          </div>
        </div>
      </section>

      <CTASection eyebrow="Qualified Access" title="Explore private participation in ARKA strategies." />
    </main>
  )
}
