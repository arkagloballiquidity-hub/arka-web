import SectionHeading from '@/components/shared/SectionHeading'
import CTASection from '@/components/shared/CTASection'
import { MARKETS } from '@/config/site'
import { useLang } from '@/context/LanguageContext'

export default function Markets() {
  const { lang, t } = useLang()
  const isEs = lang === 'es'

  const SPECS = [
    { label: t('markets', 'spec1_label'), value: t('markets', 'spec1_value') },
    { label: t('markets', 'spec2_label'), value: t('markets', 'spec2_value') },
    { label: t('markets', 'spec3_label'), value: t('markets', 'spec3_value') },
    { label: t('markets', 'spec4_label'), value: t('markets', 'spec4_value') },
    { label: t('markets', 'spec5_label'), value: t('markets', 'spec5_value') },
    { label: t('markets', 'spec6_label'), value: t('markets', 'spec6_value') },
  ]

  return (
    <main className="pt-20">
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">{t('markets', 'eyebrow')}</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            {t('markets', 'h1')}
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            {t('markets', 'intro')}
          </p>
        </div>
      </section>

      {/* Market Grid */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading eyebrow={t('markets', 'grid_eyebrow')} title={t('markets', 'grid_title')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MARKETS.map((m) => (
              <div key={m.ticker} className="arka-card p-8 space-y-4">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-white text-2xl font-medium">{m.ticker}</span>
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#94A3B8] border border-[#1E293B] px-2 py-1 rounded">
                    {isEs ? m.roleEs : m.role}
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
              <SectionHeading eyebrow={t('markets', 'model_eyebrow')} title={t('markets', 'model_title')} />
              <div className="space-y-6 text-[#94A3B8] text-sm leading-relaxed">
                <p>{t('markets', 'model_p1')}</p>
                <p>{t('markets', 'model_p2')}</p>
              </div>
            </div>
            <div className="space-y-4">
              {SPECS.map((item) => (
                <div key={item.label} className="flex justify-between items-center py-3 border-b border-[#1E293B]">
                  <span className="text-[#94A3B8] text-sm">{item.label}</span>
                  <span className="text-white text-sm text-right max-w-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection eyebrow={t('markets', 'cta_eyebrow')} title={t('markets', 'cta_title')} />
    </main>
  )
}
