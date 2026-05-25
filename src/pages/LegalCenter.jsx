import SectionHeading from '@/components/shared/SectionHeading'
import { LEGAL_DOCUMENTS, GLOBAL_DISCLAIMER, SITE, LEGAL_REGISTRATION_NUMBER } from '@/config/site'

const LEGAL_CONTENT = {
  'aml-kyc': {
    title: 'AML / KYC Policy',
    body: `ARKA Global Liquidity LTD maintains a strict Anti-Money Laundering (AML) and Know Your Customer (KYC) compliance framework consistent with applicable international standards.

All participants are required to complete identity verification, source-of-funds documentation, and politically exposed persons (PEP) screening prior to mandate execution.

ARKA reserves the right to reject any application that does not satisfy its compliance requirements without providing a reason.`,
  },
  'privacy': {
    title: 'Privacy Policy',
    body: `ARKA Global Liquidity LTD collects personal and entity information solely for the purposes of investor eligibility review, KYC/AML compliance, and mandate administration.

Data is not sold, shared, or transferred to third parties except as required by applicable law or regulatory obligation.

Participants may request access to, correction of, or deletion of their personal data subject to applicable legal retention requirements.`,
  },
  'terms': {
    title: 'General Terms & Contracting Process',
    body: `Access to ARKA investment mandates is governed by individually negotiated investment agreements. No participation is effective until all applicable legal documents have been executed by authorized signatories of both parties.

Terms may vary by mandate, strategy, jurisdiction, and investor classification. All contracts are governed by the laws of the applicable jurisdiction as specified in each individual agreement.`,
  },
  'risk-disclosure': {
    title: 'Risk Disclosure',
    body: `Investment in financial markets involves significant risk, including possible loss of all capital invested.

ARKA's strategies involve leveraged exposure to global financial instruments. Past performance, simulations, backtests, or internal projections do not guarantee future results. Target return references are objectives only and are not contractually guaranteed.

Investors should only participate with capital they can afford to lose and should seek independent legal, financial, and tax advice before engaging.`,
  },
  'disclaimer': {
    title: 'Website Disclaimer',
    body: `This website is for informational purposes only and does not constitute an offer to sell securities, investment advice, legal advice, tax advice, or solicitation of any kind.

Information on this website may be changed without notice. ARKA Global Liquidity LTD makes no representations regarding the accuracy or completeness of information provided.`,
  },
  'jurisdictions': {
    title: 'Restricted Jurisdictions',
    body: `ARKA investment mandates are not available to residents or entities of jurisdictions where such participation would be prohibited, restricted, or require regulatory registration not held by ARKA Global Liquidity LTD.

This includes but may not be limited to: the United States of America, certain FATF non-compliant jurisdictions, and jurisdictions with specific private investment restrictions.

Eligibility is determined on a case-by-case basis during the application review process.`,
  },
  'qualification': {
    title: 'Investor Qualification Notice',
    body: `Participation in ARKA investment structures is restricted to qualified investors, accredited investors, or their equivalent under applicable jurisdictional definitions.

Qualified status is assessed during the eligibility review process and must be confirmed in writing before any mandate is executed. Providing false qualification representations constitutes a material breach of any applicable agreement.`,
  },
  'confidentiality': {
    title: 'Confidentiality Notice',
    body: `Information shared during the application, KYC/AML review, strategy matching, and contracting process is treated as strictly confidential.

ARKA Global Liquidity LTD will not disclose investor information to third parties except as required by law, regulatory obligation, or with the express written consent of the relevant investor.`,
  },
}

export default function LegalCenter() {
  return (
    <main className="pt-20">
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">Legal Center</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            Legal Documentation<br />& Disclosures
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            All legal documents governing participation in ARKA investment structures are available
            below. Review all applicable documents before applying for access.
          </p>
        </div>
      </section>

      {/* Document Cards */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading eyebrow="Legal Documents" title="Eight documents. Full disclosure." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {LEGAL_DOCUMENTS.map((doc) => {
              const content = LEGAL_CONTENT[doc.slug]
              return (
                <div key={doc.slug} className="arka-card p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-white font-medium">{doc.title}</h3>
                    <span className="text-[9px] tracking-widest uppercase text-[#94A3B8] border border-[#1E293B] px-2 py-0.5 rounded shrink-0 ml-3">
                      Active
                    </span>
                  </div>
                  {content && (
                    <p className="text-[#94A3B8] text-xs leading-relaxed whitespace-pre-line line-clamp-4">
                      {content.body.split('\n\n')[0]}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      const el = document.getElementById(`legal-${doc.slug}`)
                      el?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-[10px] tracking-[0.2em] uppercase text-[#94A3B8] hover:text-white transition-colors"
                  >
                    Read Full Document ↓
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Full Document Sections */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-3xl">
          <div className="space-y-12">
            {LEGAL_DOCUMENTS.map((doc) => {
              const content = LEGAL_CONTENT[doc.slug]
              if (!content) return null
              return (
                <div key={doc.slug} id={`legal-${doc.slug}`} className="space-y-4 border-t border-[#1E293B] pt-10">
                  <h2 className="text-white font-medium text-xl">{content.title}</h2>
                  <div className="space-y-4">
                    {content.body.split('\n\n').map((para, i) => (
                      <p key={i} className="text-[#94A3B8] text-sm leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer Legal Note */}
      <section className="py-12 bg-[#0A0A0A] border-t border-[#1E293B]">
        <div className="container-arka">
          <div className="space-y-4">
            <p className="text-[10px] text-[#94A3B8] leading-relaxed max-w-4xl">
              {GLOBAL_DISCLAIMER}
            </p>
            <p className="text-[10px] text-[#94A3B8]">
              <strong className="text-white">ARKA Global Investments</strong> is the investment brand within the ARKA ecosystem.{' '}
              <strong className="text-white">ARKA Global Liquidity LTD</strong> acts as the legal/operating entity where applicable.
              {LEGAL_REGISTRATION_NUMBER !== 'PENDING_CONFIRMATION' ? (
                <> Registration No. {LEGAL_REGISTRATION_NUMBER}.</>
              ) : (
                <> Registration number to be confirmed before public deployment.</>
              )}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
