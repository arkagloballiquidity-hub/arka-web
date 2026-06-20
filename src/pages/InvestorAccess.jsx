import { useState } from 'react'
import SectionHeading from '@/components/shared/SectionHeading'
import { SITE } from '@/config/site'
import { useLang } from '@/context/LanguageContext'

export default function InvestorAccess() {
  const { t } = useLang()
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const INVESTOR_TYPES = [
    t('access', 'type_individual'),
    t('access', 'type_family'),
    t('access', 'type_entrepreneur'),
    t('access', 'type_hnwi'),
    t('access', 'type_institutional'),
    t('access', 'type_other'),
  ]

  const ALLOCATION_RANGES = [
    t('access', 'alloc_1'),
    t('access', 'alloc_2'),
    t('access', 'alloc_3'),
    t('access', 'alloc_4'),
    t('access', 'alloc_5'),
    t('access', 'alloc_6'),
  ]

  const STRATEGY_OPTIONS = [
    t('access', 'strat_1'),
    t('access', 'strat_2'),
    t('access', 'strat_3'),
    t('access', 'strat_4'),
  ]

  const STEPS = [
    t('access', 'step1'),
    t('access', 'step2'),
    t('access', 'step3'),
    t('access', 'step4'),
    t('access', 'step5'),
  ]

  const FIELDS = [
    { id: 'fullName', label: t('access', 'f_name'),    type: 'text',  required: true  },
    { id: 'entity',   label: t('access', 'f_entity'),  type: 'text',  required: false },
    { id: 'email',    label: t('access', 'f_email'),   type: 'email', required: true  },
    { id: 'country',  label: t('access', 'f_country'), type: 'text',  required: true  },
  ]

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
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">{t('access', 'eyebrow')}</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            {t('access', 'h1')}
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            {t('access', 'intro')}
          </p>
        </div>
      </section>

      {/* Process Flow */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading eyebrow={t('access', 'process_eyebrow')} title={t('access', 'process_title')} />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            {STEPS.map((step, i) => (
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
              <SectionHeading eyebrow={t('access', 'app_eyebrow')} title={t('access', 'app_title')} />
              <div className="space-y-4 text-[#94A3B8] text-sm leading-relaxed">
                <p>{t('access', 'app_p1')}</p>
                <p>{t('access', 'app_p2')}</p>
                <div className="arka-card p-4 space-y-2">
                  <p className="text-[9px] tracking-[0.25em] uppercase">{t('access', 'portal_label')}</p>
                  <a
                    href={SITE.investorPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#94A3B8] transition-colors text-sm"
                  >
                    {SITE.portalDomain} →
                  </a>
                </div>
                <div className="arka-card p-4 space-y-2">
                  <p className="text-[9px] tracking-[0.25em] uppercase">{t('access', 'ir_label')}</p>
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
                <h3 className="text-white font-medium text-xl">{t('access', 'received_title')}</h3>
                <p className="text-[#94A3B8] text-sm">
                  {t('access', 'received_body')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {FIELDS.map(({ id, label, type, required }) => (
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
                    {t('access', 'f_investor_type')} *
                  </label>
                  <select
                    id="investorType"
                    required
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors"
                  >
                    <option value="">{t('access', 'f_investor_type_ph')}</option>
                    {INVESTOR_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                {/* Allocation Range */}
                <div className="space-y-1.5">
                  <label htmlFor="allocation" className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                    {t('access', 'f_allocation')}
                  </label>
                  <select
                    id="allocation"
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors"
                  >
                    <option value="">{t('access', 'f_allocation_ph')}</option>
                    {ALLOCATION_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Strategy Interest */}
                <div className="space-y-1.5">
                  <label htmlFor="strategy" className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                    {t('access', 'f_strategy')}
                  </label>
                  <select
                    id="strategy"
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors"
                  >
                    <option value="">{t('access', 'f_strategy_ph')}</option>
                    {STRATEGY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                    {t('access', 'f_message')}
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors resize-none placeholder-[#94A3B8]/40"
                    placeholder={t('access', 'f_message_ph')}
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
                    {t('access', 'consent')}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!agreed}
                  className="w-full py-4 bg-white text-[#050505] text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#D8DEE9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded"
                >
                  {t('access', 'submit')}
                </button>

                <p className="text-[10px] text-[#94A3B8] text-center">
                  {t('access', 'submit_note')}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
