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

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const data = Object.fromEntries(new FormData(e.target))

    try {
      const res = await fetch('https://formsubmit.co/ajax/finances@arkaglobalinvestments.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, _subject: `Investor Inquiry — ${data.name}` }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Could not send message. Please email us directly.')
      }
    } catch {
      setError('Network error. Please email us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="pt-20">
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">Contact</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            Contact Investor<br />Relations
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            For qualified investor inquiries, access applications, and institutional correspondence.
          </p>
        </div>
      </section>

      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <SectionHeading eyebrow="Reach Us" title="Direct institutional contact." />

              <div className="space-y-5">
                <div className="arka-card p-5 space-y-1">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#94A3B8]">Investor Relations Email</p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-white hover:text-[#94A3B8] transition-colors text-base"
                  >
                    {SITE.email}
                  </a>
                </div>

                <div className="arka-card p-5 space-y-1">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#94A3B8]">Investor Portal</p>
                  <a
                    href={SITE.investorPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#94A3B8] transition-colors text-base"
                  >
                    {SITE.investorPortal}
                  </a>
                </div>

                <div className="arka-card p-5 space-y-1">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#94A3B8]">Legal / Operating Entity</p>
                  <p className="text-white text-sm">ARKA Global Liquidity LTD</p>
                  <p className="text-[#94A3B8] text-xs">For legal correspondence and contract inquiries</p>
                </div>
              </div>

              <div className="p-4 arka-card">
                <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                  ARKA does not accept unsolicited investment proposals, media inquiries, or
                  partnership requests through this form. All contact is subject to confidentiality
                  obligations consistent with ARKA's institutional framework.
                </p>
              </div>
            </div>

            {/* Form */}
            {submitted ? (
              <div className="arka-card p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full border border-[#1E293B] flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
                <h3 className="text-white font-medium text-xl">Message Received</h3>
                <p className="text-[#94A3B8] text-sm">
                  We will respond within 2–3 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { id: 'name',    label: 'Full Name',             type: 'text',  required: true  },
                  { id: 'email',   label: 'Email Address',          type: 'email', required: true  },
                  { id: 'entity',  label: 'Entity / Organization',  type: 'text',  required: false },
                  { id: 'country', label: 'Country',                type: 'text',  required: true  },
                ].map(({ id, label, type, required }) => (
                  <div key={id} className="space-y-1.5">
                    <label htmlFor={id} className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                      {label}{required && ' *'}
                    </label>
                    <input
                      id={id}
                      name={id}
                      type={type}
                      required={required}
                      className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors placeholder-[#94A3B8]/40"
                      placeholder={label}
                    />
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label htmlFor="investor_type" className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                    Investor Type
                  </label>
                  <select
                    id="investor_type"
                    name="investor_type"
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors"
                  >
                    <option value="">Select type</option>
                    {INVESTOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors resize-none placeholder-[#94A3B8]/40"
                    placeholder="Describe your inquiry..."
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs">{error}{' '}
                    <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#004C45] text-white text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-[#005c54] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded"
                >
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
