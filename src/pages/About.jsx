import SectionHeading from '@/components/shared/SectionHeading'
import CTASection from '@/components/shared/CTASection'
import { TIMELINE } from '@/config/site'
import { useLang } from '@/context/LanguageContext'

function Pillar({ title, body }) {
  return (
    <div className="space-y-3 border-t border-[#1E293B] pt-6">
      <h4 className="text-white font-medium">{title}</h4>
      <p className="text-[#94A3B8] text-sm leading-relaxed">{body}</p>
    </div>
  )
}

export default function About() {
  const { lang, t } = useLang()
  const isEs = lang === 'es'

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">{t('about', 'eyebrow')}</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            {t('about', 'h1')}
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            {t('about', 'intro')}
          </p>
        </div>
      </section>

      {/* Evolution Timeline */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading eyebrow={t('about', 'evolution_eyebrow')} title={t('about', 'evolution_title')} />
          <div className="space-y-0">
            {TIMELINE.map((item) => (
              <div key={item.period} className="grid md:grid-cols-[180px_1fr] gap-6 py-10 border-b border-[#1E293B]">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-[#94A3B8] uppercase">{item.period}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-medium text-lg">{isEs ? item.titleEs : item.title}</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">{isEs ? item.bodyEs : item.body}</p>
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
            eyebrow={t('about', 'philosophy_eyebrow')}
            title={t('about', 'philosophy_title')}
            subtitle={t('about', 'philosophy_subtitle')}
          />
          <div className="grid md:grid-cols-2 gap-8">
            <Pillar title={t('about', 'pillar1_title')} body={t('about', 'pillar1_body')} />
            <Pillar title={t('about', 'pillar2_title')} body={t('about', 'pillar2_body')} />
            <Pillar title={t('about', 'pillar3_title')} body={t('about', 'pillar3_body')} />
            <Pillar title={t('about', 'pillar4_title')} body={t('about', 'pillar4_body')} />
          </div>
        </div>
      </section>

      {/* Our Platform */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka max-w-4xl">
          <SectionHeading eyebrow={t('about', 'platform_eyebrow')} title={t('about', 'platform_title')} />
          <div className="space-y-6 text-[#94A3B8] text-base leading-relaxed">
            <p>{t('about', 'platform_p1')}</p>
            <p>{t('about', 'platform_p2')}</p>
          </div>

          <div className="mt-10 p-6 arka-card">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8] mb-4">{t('about', 'structure_label')}</p>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              <strong className="text-white">ARKA Global Investments</strong>{t('about', 'structure_mid')}
              <strong className="text-white">ARKA Global Liquidity LTD</strong>{t('about', 'structure_end')}
            </p>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow={t('about', 'cta_eyebrow')}
        title={t('about', 'cta_title')}
        secondaryLabel={t('home', 'profiler_cta')}
        secondaryHref="/profiler"
        secondaryExternal={false}
      />
    </main>
  )
}
