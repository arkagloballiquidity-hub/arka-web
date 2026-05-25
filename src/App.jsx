import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { LanguageProvider } from '@/context/LanguageContext'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import Home from '@/pages/Home'
import About from '@/pages/About'
import Strategies from '@/pages/Strategies'
import RiskFramework from '@/pages/RiskFramework'
import Markets from '@/pages/Markets'
import Infrastructure from '@/pages/Infrastructure'
import StrategicAssets from '@/pages/StrategicAssets'
import InvestorAccess from '@/pages/InvestorAccess'
import LegalCenter from '@/pages/LegalCenter'
import Contact from '@/pages/Contact'
import Simulator from '@/pages/Simulator'
import Profiler from '@/pages/Profiler'

const SEO_MAP = {
  '/': {
    title: 'ARKA Global Investments | Private Quantitative Investment Platform',
    description:
      'ARKA Global Investments is a private quantitative investment platform for qualified investors, family offices, and institutional capital seeking disciplined strategies, defined risk architecture, and long-term capital growth.',
  },
  '/about': {
    title: 'About ARKA | ARKA Global Investments',
    description:
      'Learn about ARKA Global Investments — built over a decade of quantitative research, systematic execution, and institutional structuring for private capital stewardship.',
  },
  '/strategies': {
    title: 'Investment Strategies | ARKA Global Investments',
    description:
      'Explore ARKA Foundation Strategy, ARKA Strategic Growth, and ARKA Alpha Force — three private investment mandates with defined risk architecture and disciplined systematic execution.',
  },
  '/risk': {
    title: 'Risk Framework | ARKA Global Investments',
    description:
      'ARKA\'s defined risk architecture — VaR methodology, drawdown management, portfolio stop framework, and session-based controls governing every investment mandate.',
  },
  '/infrastructure': {
    title: 'Infrastructure & Custody | ARKA Global Investments',
    description:
      'Institutional infrastructure for private capital — segregated accounts, oneZero liquidity, Equinix IBX execution, and real-time investor portal access.',
  },
  '/strategic-assets': {
    title: 'Strategic Assets | ARKA Global Investments',
    description:
      'ARKA\'s strategic asset-backed alignment — institutional ecosystem, asset-backed structuring, and long-term private capital architecture.',
  },
  '/access': {
    title: 'Investor Access | ARKA Global Investments',
    description:
      'Apply for qualified access to ARKA investment structures. Eligibility review, KYC/AML verification, and strategy matching for private capital participants.',
  },
  '/legal': {
    title: 'Legal Center | ARKA Global Investments',
    description:
      'Legal documentation, risk disclosures, AML/KYC policy, privacy policy, and general terms governing participation in ARKA investment structures.',
  },
  '/contact': {
    title: 'Contact Investor Relations | ARKA Global Investments',
    description:
      'Contact ARKA Global Investments investor relations team for qualified investor inquiries and institutional correspondence.',
  },
  '/simulator': {
    title: 'Investment Simulator | ARKA Global Investments',
    description:
      'Project your capital growth across ARKA investment strategies. Interactive simulator with compound interest calculations and benchmark comparisons.',
  },
  '/profiler': {
    title: 'Investor Profiler | ARKA Global Investments',
    description:
      'Discover which ARKA investment strategy matches your risk profile. Complete the 10-question investor assessment.',
  },
}

function SEOUpdater() {
  const location = useLocation()

  useEffect(() => {
    const meta = SEO_MAP[location.pathname] || SEO_MAP['/']
    document.title = meta.title

    let descEl = document.querySelector('meta[name="description"]')
    if (!descEl) {
      descEl = document.createElement('meta')
      descEl.name = 'description'
      document.head.appendChild(descEl)
    }
    descEl.content = meta.description

    // OpenGraph
    const ogMeta = {
      'og:title': meta.title,
      'og:description': meta.description,
      'og:type': 'website',
      'og:url': `https://www.arkaglobalinvestments.com${location.pathname}`,
      'og:site_name': 'ARKA Global Investments',
    }
    Object.entries(ogMeta).forEach(([property, content]) => {
      let el = document.querySelector(`meta[property="${property}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('property', property)
        document.head.appendChild(el)
      }
      el.content = content
    })

    // Scroll to top on route change
    window.scrollTo(0, 0)
  }, [location.pathname])

  return null
}

function Layout({ children, isHome }) {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Header is always fixed, z-50, renders above everything */}
      <Header />
      <div className="flex-1">{children}</div>
      {/* Footer below the video scroll on home; normal on other pages */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <SEOUpdater />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/about" element={<About />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/risk" element={<RiskFramework />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/infrastructure" element={<Infrastructure />} />
          <Route path="/strategic-assets" element={<StrategicAssets />} />
          <Route path="/access" element={<InvestorAccess />} />
          <Route path="/legal" element={<LegalCenter />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/profiler" element={<Profiler />} />
          {/* Catch-all */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
      </LanguageProvider>
    </BrowserRouter>
  )
}
