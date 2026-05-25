import { useState } from 'react'
import SectionHeading from '@/components/shared/SectionHeading'
import { SITE } from '@/config/site'

const INVESTOR_TYPES = [
  'Individual Qualified Investor',
  'Family Office',
  'Entrepreneur / Private Capital',
  'HNWI',
  'Institutional Investor',
  'Other',
]

const ALLOCATION_RANGES = [
  'Under $100,000',
  '$100,000 – $250,000',
  '$250,000 – $500,000',
  '$500,000 – $1,000,000',
  'Over $1,000,000',
  'Prefer not to disclose',
]

const STRATEGY_OPTIONS = [
  'ARKA Foundation Strategy (Conservative)',
  'ARKA Strategic Growth (Moderate)',
  'ARKA Alpha Force (Active / Quantitative)',
  'Undecided — need guidance',
]

export default function InvestorAccess() {
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Replace with actual form handler / API call
    setSubmitted(true)
  }

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">Investor Access</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            Private Access for<br />Qualified Participants
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            Participation in ARKA investment structures is subject to eligibility review,
            jurisdictional restrictions, KYC/AML verification, and acceptance under the applicable
            contracting process.
          </p>
        </div>
      </section>

      {/* Process Flow */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading eyebrow="Access Process" title="Five steps to qualified participation." />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            {['Initial Application', 'Eligibility Review', 'KYC / AML / KYB', 'Strategy Matching', 'Portal Activation'].map((step, i) => (
              <div key={step} className="relative flex flex-col items-center text-center p-4">
                <div className="w-10 h-10 rounded-full border border-[#1E293B] bg-[#0D1320] flex items-center justify-center mb-4">
                  <span className="font-mono text-[11px] text-[#94A3B8]">0{i + 1}</span>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute top-9 left-1/2 w-full h-px bg-[#1E293B]" />
                )}
                <p className="text-white text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: Info */}
            <div className="space-y-6">
              <SectionHeading eyebrow="Application" title="Begin your eligibility review." />
              <div className="space-y-4 text-[#94A3B8] text-sm leading-relaxed">
                <p>
                  Submitting this form does not constitute an investment commitment or guarantee
                  of access. All applications are reviewed individually.
                </p>
                <p>
                  Following submission, ARKA's investor relations team will contact you to proceed
                  with eligibility review and KYC/AML verification.
                </p>
                <div className="arka-card p-4 space-y-2">
                  <p className="text-[9px] tracking-[0.25em] uppercase">Investor Portal</p>
                  <a
                    href={SITE.investorPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#94A3B8] transition-colors text-sm"
                  >
                    {SITE.investorPortal} →
                  </a>
                </div>
                <div className="arka-card p-4 space-y-2">
                  <p className="text-[9px] tracking-[0.25em] uppercase">Investor Relations</p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-white hover:text-[#94A3B8] transition-colors text-sm"
                  >
                    {SITE.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            {submitted ? (
              <div className="arka-card p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full border border-[#1E293B] flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
                <h3 className="text-white font-medium text-xl">Application Received</h3>
                <p className="text-[#94A3B8] text-sm">
                  Our investor relations team will review your application and contact you within
                  2–3 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { id: 'fullName', label: 'Full Name', type: 'text', required: true },
                  { id: 'entity', label: 'Entity Name (if applicable)', type: 'text', required: false },
                  { id: 'email', label: 'Email Address', type: 'email', required: true },
                  { id: 'country', label: 'Country of Residence / Incorporation', type: 'text', required: true },
                ].map(({ id, label, type, required }) => (
                  <div key={id} className="space-y-1.5">
                    <label htmlFor={id} className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                      {label}{required && ' *'}
                    </label>
                    <input
                      id={id}
                      type={type}
                      required={required}
                      className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors placeholder-[#94A3B8]/40"
                      placeholder={label}
                    />
                  </div>
                ))}

                {/* Investor Type */}
                <div className="space-y-1.5">
                  <label htmlFor="investorType" className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                    Investor Type *
                  </label>
                  <select
                    id="investorType"
                    required
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors"
                  >
                    <option value="">Select investor type</option>
                    {INVESTOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Allocation Range */}
                <div className="space-y-1.5">
                  <label htmlFor="allocation" className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                    Estimated Allocation Range
                  </label>
                  <select
                    id="allocation"
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors"
                  >
                    <option value="">Select range</option>
                    {ALLOCATION_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Strategy Interest */}
                <div className="space-y-1.5">
                  <label htmlFor="strategy" className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                    Strategy Interest
                  </label>
                  <select
                    id="strategy"
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors"
                  >
                    <option value="">Select strategy</option>
                    {STRATEGY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                    Message (optional)
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors resize-none placeholder-[#94A3B8]/40"
                    placeholder="Any additional context you'd like to share..."
                  />
                </div>

                {/* Consent */}
                <div className="flex items-start gap-3 p-4 arka-card">
                  <input
                    id="agree"
                    type="checkbox"
                    required
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 accent-white"
                  />
                  <label htmlFor="agree" className="text-[10px] text-[#94A3B8] leading-relaxed cursor-pointer">
                    I understand this website does not constitute a public offer or guaranteed return.
                    I am a qualified investor and I am submitting this form in a private capacity.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!agreed}
                  className="w-full py-4 bg-white text-[#050505] text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#D8DEE9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded"
                >
                  Apply for Access
                </button>

                <p className="text-[10px] text-[#94A3B8] text-center">
                  Submitting this form does not guarantee access. All applications are subject to
                  eligibility review and compliance verification.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
