import SectionHeading from '@/components/shared/SectionHeading'
import CTASection from '@/components/shared/CTASection'

function AssetPillar({ title, body }) {
  return (
    <div className="arka-card p-7 space-y-4 hover:border-[#334155] transition-colors duration-300">
      <div className="w-8 h-px bg-[#0B1F3A]" />
      <h3 className="text-white font-medium text-base">{title}</h3>
      <p className="text-[#94A3B8] text-sm leading-relaxed">{body}</p>
    </div>
  )
}

export default function StrategicAssets() {
  return (
    <main className="pt-20">
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">Strategic Assets</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            Strategic Asset-Backed<br />Alignment
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            ARKA operates within a broader ecosystem of strategic assets and financial infrastructure
            designed to support long-term institutional growth, capital alignment, and asset-backed
            structuring.
          </p>
        </div>
      </section>

      {/* Asset Pillars */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading
            eyebrow="Ecosystem Overview"
            title="Institutional alignment. Long-term capital architecture."
            subtitle="This section describes ARKA's broader asset ecosystem — not real estate sales, property listings, or retail investment products."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AssetPillar
              title="Strategic Asset Ecosystem"
              body="ARKA's institutional framework is supported by a diversified ecosystem of strategic assets, financial relationships, and structured capital instruments aligned with long-term institutional objectives."
            />
            <AssetPillar
              title="Asset-Backed Structuring"
              body="Select mandates and operational structures are designed around asset-backed principles, providing additional collateral alignment and institutional credibility to the capital base."
            />
            <AssetPillar
              title="Long-Term Institutional Alignment"
              body="Strategic assets are evaluated on long-term alignment with ARKA's capital stewardship mission — not on short-term yield optimization or speculative appreciation."
            />
            <AssetPillar
              title="Private Capital Architecture"
              body="The architecture for private capital participation within the ARKA ecosystem is designed to maintain separation between operating entities, investor mandates, and strategic asset structures."
            />
          </div>
        </div>
      </section>

      {/* Positioning statement */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-3xl">
          <div className="p-8 arka-card space-y-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">Important Clarification</p>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              This section does not represent real estate sales, property investment products, or
              retail investment services. ARKA's strategic asset narrative is exclusively
              institutional — focused on capital alignment, ecosystem positioning, and structural
              backing for long-term private mandates.
            </p>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              Details on strategic asset composition and valuation are available only to qualified
              participants under an executed NDA and contracting process.
            </p>
          </div>
        </div>
      </section>

      <CTASection eyebrow="Qualified Access" title="Explore participation in ARKA's institutional ecosystem." />
    </main>
  )
}
