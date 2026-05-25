// ─── ARKA Global Investments — Site Configuration ───────────────────────────
// Edit this file to update content without touching component code.

// ⚠️  IMPORTANT: Confirm registration number with legal before production.
//     Discrepancy found between 2025-00568 and 2024-00428.
export const LEGAL_REGISTRATION_NUMBER = 'PENDING_CONFIRMATION'

export const SITE = {
  brandName: 'ARKA Global Investments',
  legalEntity: 'ARKA Global Liquidity LTD',
  tagline: 'Private Quantitative Investment Platform',
  description:
    'Disciplined strategies. Defined risk architecture. Long-term capital growth.',
  email: 'finances@arkaglobalinvestments.com',
  investorPortal: 'https://my.arkaltd.io',
  domain: 'www.arkaglobalinvestments.com',
}

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About ARKA', href: '/about' },
  { label: 'Investment Strategies', href: '/strategies' },
  { label: 'Risk Framework', href: '/risk' },
  { label: 'Infrastructure', href: '/infrastructure' },
  { label: 'Investor Access', href: '/access' },
  { label: 'Legal Center', href: '/legal' },
  { label: 'Contact', href: '/contact' },
]

export const STRATEGIES = [
  {
    id: 'foundation',
    name: 'ARKA Foundation Strategy',
    profile: 'Conservative',
    objective: 'Capital preservation and stable long-term growth.',
    targetRef: '18% annual objective',
    idealFor: 'Long-term private capital, conservative investors, family offices.',
    description:
      'A disciplined capital allocation strategy focused on stability, consistency, and long-term capital preservation through systematic global market exposure.',
  },
  {
    id: 'growth',
    name: 'ARKA Strategic Growth',
    profile: 'Moderate',
    objective: 'Capital appreciation with controlled institutional exposure.',
    targetRef: '24% annual objective',
    idealFor: 'Entrepreneurs, experienced investors, private capital allocators.',
    description:
      'An actively managed portfolio designed to enhance capital appreciation through dynamic global market positioning, quantitative research, and institutional risk management.',
  },
  {
    id: 'alpha',
    name: 'ARKA Alpha Force',
    profile: 'Active / Quantitative',
    objective: 'Capture market inefficiencies through quantitative models and systematic execution.',
    targetRef: '36% annual objective',
    idealFor: 'HNWI, family offices, alternative strategy investors.',
    description:
      'A performance-oriented strategy seeking superior risk-adjusted returns by capturing market inefficiencies through advanced quantitative models, systematic execution, and opportunistic allocation.',
  },
]

// ⚠️  Risk references — editable, not promises.
export const RISK_METRICS = [
  { label: 'Intraday Drawdown Limit', value: '-0.10% to -0.50% per session' },
  { label: 'Portfolio Stop Framework', value: '-5% to -10%' },
  { label: 'Maximum Leverage Reference', value: '1:100 with continuous margin monitoring' },
  { label: 'VaR Methodology', value: 'Value at Risk — daily & portfolio level' },
  { label: 'Session-Based Controls', value: 'New York session primary window' },
  { label: 'Dynamic Allocation', value: 'Continuous exposure review under adverse conditions' },
]

export const TIMELINE = [
  {
    period: '2015–2018',
    title: 'Foundation & Market Research',
    body: 'Development of proprietary trading frameworks across global derivatives markets, including liquidity analysis, order flow research, market microstructure, and yield inefficiency modeling.',
  },
  {
    period: '2019–2023',
    title: 'Quantitative Infrastructure Expansion',
    body: 'Expansion of proprietary financial technology, multi-cycle stress testing, FIX API execution architecture, macroeconomic signal integration, and risk-engine optimization.',
  },
  {
    period: '2024–2025',
    title: 'Institutional Structuring & Compliance',
    body: 'Implementation of broker-grade infrastructure, institutional liquidity relationships, AML/KYC protocols, compliance structure, and proprietary quantitative analytics.',
  },
]

export const INFRASTRUCTURE_ITEMS = [
  { label: 'Segregated Client Accounts', detail: 'Capital held in individually segregated structures.' },
  { label: 'Liquidity Aggregation', detail: 'oneZero institutional liquidity aggregation.' },
  { label: 'Execution Infrastructure', detail: 'Equinix IBX co-location for ultra-low-latency execution.' },
  { label: 'Prime of Prime', detail: 'B2BROKER Prime of Prime institutional access.' },
  { label: 'Banking Network', detail: 'Eqwire, JP Morgan, Citibank, DBS — institutional references.' },
  { label: 'Investor Portal', detail: 'Real-time visibility at my.arkaltd.io.' },
]

export const MARKETS = [
  { ticker: 'SPXUSD', label: 'S&P 500', role: 'Primary index exposure' },
  { ticker: 'NAS100', label: 'Nasdaq 100', role: 'Tactical index exposure' },
  { ticker: 'US30', label: 'Dow Jones 30', role: 'Tactical index exposure' },
  { ticker: 'EURUSD', label: 'Euro / US Dollar', role: 'Algorithmic FX model' },
]

export const LEGAL_DOCUMENTS = [
  { title: 'AML / KYC Policy', slug: 'aml-kyc' },
  { title: 'Privacy Policy', slug: 'privacy' },
  { title: 'General Terms & Contracting Process', slug: 'terms' },
  { title: 'Risk Disclosure', slug: 'risk-disclosure' },
  { title: 'Website Disclaimer', slug: 'disclaimer' },
  { title: 'Restricted Jurisdictions', slug: 'jurisdictions' },
  { title: 'Investor Qualification Notice', slug: 'qualification' },
  { title: 'Confidentiality Notice', slug: 'confidentiality' },
]

export const GLOBAL_DISCLAIMER =
  'This website is for informational purposes only and does not constitute an offer to sell securities, financial advice, legal advice, tax advice, or investment solicitation. Participation is available only to qualified participants, subject to eligibility review, jurisdictional restrictions, KYC/AML procedures, and execution of applicable legal documents. Investment strategies involve risk, including possible loss of capital. Target returns, historical results, simulations, or projections are not guarantees of future performance.'

export const STRATEGY_DISCLAIMER =
  'Target objectives are not guaranteed. Past performance, simulations, models, or internal references do not guarantee future results. Investing involves risk, including possible loss of capital.'
