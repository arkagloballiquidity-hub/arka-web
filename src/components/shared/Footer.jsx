import { Link } from 'react-router-dom'
import { NAV_LINKS, SITE, GLOBAL_DISCLAIMER, GLOBAL_DISCLAIMER_ES, LEGAL_REGISTRATION_NUMBER, OFFICES } from '@/config/site'
import { useLang } from '@/context/LanguageContext'

const NAV_LABEL_KEYS = {
  '/': 'nav_home',
  '/about': 'nav_about',
  '/strategies': 'nav_strategies',
  '/infrastructure': 'nav_infrastructure',
  '/legal': 'nav_legal',
  '/contact': 'nav_contact',
}

export default function Footer() {
  const { lang, t } = useLang()
  const isEs = lang === 'es'
  const disclaimer = isEs ? GLOBAL_DISCLAIMER_ES : GLOBAL_DISCLAIMER

  return (
    <footer className="bg-[#050505] border-t border-[#1E293B]">
      <div className="container-arka py-16">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div>
              <p className="text-white font-semibold text-base tracking-widest uppercase">ARKA</p>
              <p className="text-[#94A3B8] text-[10px] tracking-[0.3em] uppercase">Global Investments</p>
            </div>
            <p className="text-[#94A3B8] text-xs leading-relaxed max-w-xs">
              {t('footer', 'tagline')}
              <br />
              {t('footer', 'brand_desc')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8] mb-4">{t('footer', 'nav_label')}</p>
            <nav className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-xs tracking-wide text-[#94A3B8] hover:text-white transition-colors"
                >
                  {t('footer', NAV_LABEL_KEYS[link.href]) || link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8] mb-4">{t('footer', 'contact_label')}</p>
            <div className="flex flex-col gap-3 text-xs text-[#94A3B8]">
              <a href={`mailto:${SITE.email}`} className="hover:text-white transition-colors">
                {SITE.email}
              </a>
              <a
                href={SITE.investorPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {t('footer', 'portal')}
              </a>
              <Link to="/contact" className="hover:text-white transition-colors">
                {t('footer', 'apply')}
              </Link>
            </div>
          </div>
        </div>

        {/* Offices */}
        <div className="border-t border-[#1E293B] pt-8 mb-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8] mb-4">{t('footer', 'offices_label')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {OFFICES.map((office) => (
              <div key={office.city} className="space-y-0.5 text-[11px] text-[#94A3B8] leading-relaxed">
                <p className="text-white font-medium text-xs">{office.city}</p>
                <p>{office.address}</p>
                <p>{office.building}</p>
                {office.zip && <p>{office.zip}</p>}
                <p>{office.country}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-[#1E293B] pt-8 space-y-4">
          <p className="text-[10px] text-[#94A3B8] leading-relaxed max-w-5xl">
            {disclaimer}
          </p>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-[10px] text-[#94A3B8]">
            <p>
              <span className="text-white font-medium">ARKA Global Investments</span>{t('footer', 'entity_mid')}
              <span className="text-white font-medium">ARKA Global Liquidity LTD</span>{t('footer', 'entity_end')}
              {LEGAL_REGISTRATION_NUMBER !== 'PENDING_CONFIRMATION' && (
                <> {t('footer', 'reg_no')} {LEGAL_REGISTRATION_NUMBER}.</>
              )}
            </p>
            <p className="shrink-0">© {new Date().getFullYear()} ARKA Global Liquidity LTD. {t('footer', 'rights')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
