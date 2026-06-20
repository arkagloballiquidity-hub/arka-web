import SectionHeading from '@/components/shared/SectionHeading'
import CTASection from '@/components/shared/CTASection'
import { useLang } from '@/context/LanguageContext'

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
  const { t } = useLang()

  return (
    <main className="pt-20">
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">{t('assets', 'eyebrow')}</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            {t('assets', 'h1')}
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            {t('assets', 'intro')}
          </p>
        </div>
      </section>

      {/* Asset Pillars */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading
            eyebrow={t('assets', 'eco_eyebrow')}
            title={t('assets', 'eco_title')}
            subtitle={t('assets', 'eco_subtitle')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AssetPillar title={t('assets', 'pillar1_title')} body={t('assets', 'pillar1_body')} />
            <AssetPillar title={t('assets', 'pillar2_title')} body={t('assets', 'pillar2_body')} />
            <AssetPillar title={t('assets', 'pillar3_title')} body={t('assets', 'pillar3_body')} />
            <AssetPillar title={t('assets', 'pillar4_title')} body={t('assets', 'pillar4_body')} />
          </div>
        </div>
      </section>

      {/* Positioning statement */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-3xl">
          <div className="p-8 arka-card space-y-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8]">{t('assets', 'clarify_label')}</p>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              {t('assets', 'clarify_p1')}
            </p>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              {t('assets', 'clarify_p2')}
            </p>
          </div>
        </div>
      </section>

      <CTASection eyebrow={t('assets', 'cta_eyebrow')} title={t('assets', 'cta_title')} />
    </main>
  )
}
