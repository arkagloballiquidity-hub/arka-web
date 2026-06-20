import SectionHeading from '@/components/shared/SectionHeading'
import CTASection from '@/components/shared/CTASection'
import { INFRASTRUCTURE_ITEMS, SITE } from '@/config/site'
import { useLang } from '@/context/LanguageContext'

function InfraCard({ label, detail }) {
  return (
    <div className="arka-card p-6 space-y-3 hover:border-[#334155] transition-colors duration-300">
      <div className="w-8 h-px bg-[#0B1F3A]" />
      <h3 className="text-white font-medium">{label}</h3>
      <p className="text-[#94A3B8] text-sm leading-relaxed">{detail}</p>
    </div>
  )
}

export default function Infrastructure() {
  const { lang, t } = useLang()
  const isEs = lang === 'es'

  return (
    <main className="pt-20">
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">{t('infraPage', 'eyebrow')}</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            {t('infraPage', 'h1')}
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            {t('infraPage', 'intro')}
          </p>
        </div>
      </section>

      {/* Infrastructure Cards */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading eyebrow={t('infraPage', 'stack_eyebrow')} title={t('infraPage', 'stack_title')} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INFRASTRUCTURE_ITEMS.map((item) => (
              <InfraCard
                key={item.label}
                label={isEs ? item.labelEs : item.label}
                detail={isEs ? item.detailEs : item.detail}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <SectionHeading eyebrow={t('infraPage', 'partners_eyebrow')} title={t('infraPage', 'partners_title')} />
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
                {t('infraPage', 'partners_body')}
              </p>
              <p className="text-[10px] text-[#94A3B8] border border-[#1E293B] p-4 rounded">
                {t('infraPage', 'partners_warning')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['oneZero', 'Equinix IBX', 'B2BROKER', 'Eqwire', 'JP Morgan', 'Citibank', 'DBS'].map((name) => (
                <div key={name} className="arka-card px-5 py-4 flex items-center">
                  <span className="text-[#94A3B8] text-sm font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Investor Portal */}
      <section className="section-padding bg-[#0A0A0A] border-t border-[#1E293B]">
        <div className="container-arka max-w-3xl text-center space-y-6">
          <SectionHeading
            eyebrow={t('infraPage', 'portal_eyebrow')}
            title={t('infraPage', 'portal_title')}
            subtitle={t('infraPage', 'portal_subtitle')}
            align="center"
          />
          <a
            href={SITE.investorPortal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 border border-[#1E293B] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#0B1F3A] hover:border-[#0B1F3A] transition-all duration-300 rounded"
          >
            {t('infraPage', 'portal_button')}
          </a>
        </div>
      </section>

      <CTASection eyebrow={t('infraPage', 'cta_eyebrow')} title={t('infraPage', 'cta_title')} />
    </main>
  )
}
