import { Link } from 'react-router-dom'
import { NAV_LINKS, SITE, GLOBAL_DISCLAIMER, LEGAL_REGISTRATION_NUMBER, OFFICES } from '@/config/site'

export default function Footer() {
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
              {SITE.tagline}
              <br />
              {SITE.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8] mb-4">Navigation</p>
            <nav className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-xs tracking-wide text-[#94A3B8] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8] mb-4">Contact</p>
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
                Investor Portal →
              </a>
              <Link to="/access" className="hover:text-white transition-colors">
                Apply for Access →
              </Link>
            </div>
          </div>
        </div>

        {/* Offices */}
        <div className="border-t border-[#1E293B] pt-8 mb-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#94A3B8] mb-4">Offices</p>
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
            {GLOBAL_DISCLAIMER}
          </p>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-[10px] text-[#94A3B8]">
            <p>
              <span className="text-white font-medium">ARKA Global Investments</span> is the investment brand within the ARKA ecosystem.{' '}
              <span className="text-white font-medium">ARKA Global Liquidity LTD</span> acts as the legal/operating entity where applicable.
              {LEGAL_REGISTRATION_NUMBER !== 'PENDING_CONFIRMATION' && (
                <> Registration No. {LEGAL_REGISTRATION_NUMBER}.</>
              )}
            </p>
            <p className="shrink-0">© {new Date().getFullYear()} ARKA Global Liquidity LTD. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
