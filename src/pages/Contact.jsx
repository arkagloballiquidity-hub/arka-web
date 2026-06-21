import { useState } from 'react'
import SectionHeading from '@/components/shared/SectionHeading'
import { SITE } from '@/config/site'
import { useLang } from '@/context/LanguageContext'

export default function Contact() {
  const { t } = useLang()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const AMOUNTS = [
    t('contact', 'amount_1'),
    t('contact', 'amount_2'),
    t('contact', 'amount_3'),
    t('contact', 'amount_4'),
    t('contact', 'amount_5'),
    t('contact', 'amount_6'),
  ]

  const FIELDS = [
    { id: 'name',    label: t('contact', 'f_name'),    type: 'text',  required: true  },
    { id: 'email',   label: t('contact', 'f_email'),   type: 'email', required: true  },
    { id: 'phone',   label: t('contact', 'f_phone'),   type: 'tel',   required: true  },
    { id: 'entity',  label: t('contact', 'f_entity'),  type: 'text',  required: false },
    { id: 'country', label: t('contact', 'f_country'), type: 'text',  required: true  },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const data = Object.fromEntries(new FormData(e.target))

    try {
      const res = await fetch('/api/send-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError(t('contact', 'err_send'))
      }
    } catch {
      setError(t('contact', 'err_network'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="pt-20">
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">{t('contact', 'eyebrow')}</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            {t('contact', 'h1_line1')}<br />{t('contact', 'h1_line2')}
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            {t('contact', 'intro')}
          </p>
        </div>
      </section>

      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <SectionHeading eyebrow={t('contact', 'reach_eyebrow')} title={t('contact', 'reach_title')} />

              <div className="space-y-5">
                <div className="arka-card p-5 space-y-1">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#94A3B8]">{t('contact', 'email_label')}</p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-white hover:text-[#94A3B8] transition-colors text-base"
                  >
                    {SITE.email}
                  </a>
                </div>

                <div className="arka-card p-5 space-y-1">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#94A3B8]">{t('contact', 'portal_label')}</p>
                  <a
                    href={SITE.investorPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#94A3B8] transition-colors text-base"
                  >
                    {SITE.portalDomain}
                  </a>
                </div>

                <div className="arka-card p-5 space-y-1">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#94A3B8]">{t('contact', 'entity_label')}</p>
                  <p className="text-white text-sm">ARKA Global Liquidity LTD</p>
                  <p className="text-[#94A3B8] text-xs">{t('contact', 'entity_sub')}</p>
                </div>
              </div>

              <div className="p-4 arka-card">
                <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                  {t('contact', 'note')}
                </p>
              </div>
            </div>

            {/* Form */}
            {submitted ? (
              <div className="arka-card p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full border border-[#1E293B] flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
                <h3 className="text-white font-medium text-xl">{t('contact', 'received_title')}</h3>
                <p className="text-[#94A3B8] text-sm">
                  {t('contact', 'received_body')}
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
                      name={id}
                      type={type}
                      required={required}
                      className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors placeholder-[#94A3B8]/40"
                      placeholder={label}
                    />
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label htmlFor="amount" className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                    {t('contact', 'f_amount')}
                  </label>
                  <select
                    id="amount"
                    name="amount"
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors"
                  >
                    <option value="">{t('contact', 'f_amount_ph')}</option>
                    {AMOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="block text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">
                    {t('contact', 'f_message')} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full bg-[#0D1320] border border-[#1E293B] text-white text-sm px-4 py-3 rounded focus:outline-none focus:border-[#334155] transition-colors resize-none placeholder-[#94A3B8]/40"
                    placeholder={t('contact', 'f_message_ph')}
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
                  {loading ? t('contact', 'submitting') : t('contact', 'submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
