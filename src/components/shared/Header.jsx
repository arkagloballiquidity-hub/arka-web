import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SITE } from '@/config/site'
import { NavHeader } from '@/components/ui/nav-header'
import { useLang } from '@/context/LanguageContext'

const TOOLS = [
  { key: 'simulator', href: '/simulator', external: false },
  { key: 'profiler',  href: '/profiler',  external: false },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { lang, toggle, t } = useLang()

  const NAV_TABS = [
    { label: t('nav', 'home'),       href: '/' },
    { label: t('nav', 'about'),      href: '/about' },
    { label: t('nav', 'strategies'), href: '/strategies' },
    { label: t('nav', 'risk'),       href: '/risk' },
    { label: t('nav', 'access'),     href: '/access' },
    { label: t('nav', 'contact'),    href: '/contact' },
  ]

  const MOBILE_LINKS = [
    ...NAV_TABS,
    { label: t('nav', 'simulator'), href: TOOLS[0].href, external: false },
    { label: t('nav', 'profiler'),  href: TOOLS[1].href, external: false },
  ]

  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/85 backdrop-blur-md border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-6 md:px-10 h-16 md:h-20">

        {/* Logo */}
        <Link to="/" className="flex items-center h-8 shrink-0">
          <img
            src="/logo_arka.png"
            alt="ARKA Global Investments"
            className="h-full w-auto object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </Link>

        {/* Pill nav — desktop */}
        <div className="hidden lg:block">
          <NavHeader tabs={NAV_TABS} />
        </div>

        {/* Right side — desktop */}
        <div className="hidden lg:flex items-center gap-5 shrink-0">
          {/* Tools — internal routes */}
          <Link
            to={TOOLS[0].href}
            className="text-[10px] tracking-[0.18em] uppercase text-white/45 hover:text-[#C9A352] transition-colors duration-200"
          >
            {t('nav', 'simulator')}
          </Link>
          <Link
            to={TOOLS[1].href}
            className="text-[10px] tracking-[0.18em] uppercase text-white/45 hover:text-[#C9A352] transition-colors duration-200"
          >
            {t('nav', 'profiler')}
          </Link>

          {/* Divider */}
          <span className="w-px h-3 bg-white/15" />

          {/* Portal */}
          <a
            href={SITE.investorPortal}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.18em] uppercase text-white/45 hover:text-white transition-colors duration-200"
          >
            {t('nav', 'portal')}
          </a>

          {/* Language toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-1 text-[10px] tracking-[0.18em] uppercase font-medium border border-white/15 rounded-full px-3 py-1.5 transition-all duration-200 hover:border-[#C9A352]/60 hover:text-[#C9A352]"
            aria-label="Toggle language"
          >
            <span className={lang === 'en' ? 'text-white' : 'text-white/35'}>EN</span>
            <span className="text-white/20 mx-0.5">|</span>
            <span className={lang === 'es' ? 'text-white' : 'text-white/35'}>ES</span>
          </button>

          {/* Apply CTA */}
          <Link
            to="/access"
            className="text-[10px] tracking-[0.18em] uppercase px-5 py-2.5 border border-white/20 text-white hover:bg-white hover:text-[#050505] transition-all duration-300 rounded-full font-medium"
          >
            {t('nav', 'apply')}
          </Link>
        </div>

        {/* Hamburger — mobile */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle navigation"
        >
          <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/5 px-6 py-8 flex flex-col gap-5">
          {MOBILE_LINKS.map((tab) =>
            tab.external ? (
              <a
                key={tab.href}
                href={tab.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm tracking-[0.15em] uppercase text-[#C9A352]/70 hover:text-[#C9A352] transition-colors"
              >
                {tab.label} ↗
              </a>
            ) : (
              <Link
                key={tab.href}
                to={tab.href}
                className="text-sm tracking-[0.15em] uppercase text-white/60 hover:text-white transition-colors"
              >
                {tab.label}
              </Link>
            )
          )}

          <div className="border-t border-white/10 pt-5 flex flex-col gap-4">
            <a href={SITE.investorPortal} target="_blank" rel="noopener noreferrer"
              className="text-sm tracking-widest uppercase text-white/50">
              {t('nav', 'portal')}
            </a>
            <button
              onClick={toggle}
              className="text-sm tracking-widest uppercase text-left text-white/50 hover:text-white"
            >
              {lang === 'en' ? '🌐 Cambiar a Español' : '🌐 Switch to English'}
            </button>
            <Link to="/access"
              className="text-sm tracking-widest uppercase px-5 py-3.5 border border-white/20 text-white text-center rounded-full">
              {t('nav', 'apply')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
