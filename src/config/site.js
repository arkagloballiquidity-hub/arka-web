// ─── ARKA Global Investments — Site Configuration ───────────────────────────
// Edit this file to update content without touching component code.

// ⚠️  IMPORTANT: Confirm registration number with legal before production.
//     Discrepancy found between 2025-00568 and 2024-00428.
export const LEGAL_REGISTRATION_NUMBER = '2025-00568'

export const SITE = {
  brandName: 'ARKA Global Investments',
  legalEntity: 'ARKA Global Liquidity LTD',
  tagline: 'Private Quantitative Investment Platform',
  description:
    'Disciplined strategies. Defined risk architecture. Long-term capital growth.',
  email: 'contacto@arkaltd.io',
  // All portal links point to the sign-in page
  investorPortal: 'https://my.arkaltd.io/en/auth/sign-in',
  portalDomain: 'my.arkaltd.io',
  domain: 'www.arkaglobalinvestments.com',
}

// Footer navigation — labels resolved via i18n (footer.nav_*) by href.
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About ARKA', href: '/about' },
  { label: 'Investment Strategies', href: '/strategies' },
  { label: 'Infrastructure', href: '/infrastructure' },
  { label: 'Legal Center', href: '/legal' },
  { label: 'Contact', href: '/contact' },
]

// Segment: qualified investors — minimum $500,000 MXN (≈ $28,571.42 USD, ref. FX ~17.5)
export const PLAN_MIN_MXN = 500000
export const PLAN_MIN_USD = 28571.42

export const STRATEGIES = [
  {
    id: 'flex20',
    name: 'Flex 20',
    nameEs: 'Flex 20',
    profile: '6-Month Term',
    profileEs: 'Plazo de 6 Meses',
    objective: 'Fixed 20% annual return over a 6-month investment term.',
    objectiveEs: 'Rendimiento fijo del 20% anual a un plazo de 6 meses.',
    targetRef: '20% annual',
    targetRefEs: '20% anual',
    minInvestment: '$500,000 MXN (≈ $28,571 USD) minimum',
    minInvestmentEs: '$500,000 MXN (≈ $28,571 USD) mínimo',
    payout: 'Paid at day 183, counted from the investment lot execution date.',
    payoutEs: 'Se entrega el día 183, contado desde la fecha de ejecución del lote de inversión.',
    penalty: 'Early withdrawal forfeits 25% of the returns accrued to date.',
    penaltyEs: 'El retiro anticipado penaliza con el 25% de los rendimientos acumulados a la fecha.',
    idealFor: 'Qualified investors seeking shorter commitment cycles without sacrificing a fixed institutional return.',
    idealForEs: 'Inversores calificados que buscan ciclos de compromiso más cortos sin sacrificar un rendimiento fijo institucional.',
    description:
      'A fixed-term plan designed for investors who want their capital locked for 6-month cycles — the most flexible entry point into ARKA’s fixed-return platform.',
    descriptionEs:
      'Plan diseñado para personas que quieran tener su dinero fijo por periodos de 6 meses — la puerta de entrada más flexible a la plataforma de rendimiento fijo de ARKA.',
  },
  {
    id: 'fijo22',
    name: 'Fijo 22/1',
    nameEs: 'Fijo 22/1',
    profile: '12-Month Term',
    profileEs: 'Plazo de 12 Meses',
    objective: 'Fixed 22% annual return over a 12-month investment term.',
    objectiveEs: 'Rendimiento fijo del 22% anual a un plazo de 12 meses.',
    targetRef: '22% annual',
    targetRefEs: '22% anual',
    minInvestment: '$500,000 MXN (≈ $28,571 USD) minimum',
    minInvestmentEs: '$500,000 MXN (≈ $28,571 USD) mínimo',
    payout: 'Paid at day 366, counted from the investment lot execution date.',
    payoutEs: 'Se entrega el día 366, contado desde la fecha de ejecución del lote de inversión.',
    penalty: 'Early withdrawal forfeits 25% of the returns accrued to date.',
    penaltyEs: 'El retiro anticipado penaliza con el 25% de los rendimientos acumulados a la fecha.',
    idealFor: 'Investors comfortable with a one-year lock, seeking a balanced step-up in fixed annual return.',
    idealForEs: 'Inversores cómodos con un plazo de un año que buscan un incremento equilibrado en el rendimiento anual fijo.',
    description:
      'A fixed-term plan designed for investors who want their capital locked for a full year — a balanced step between flexibility and maximum reference rate.',
    descriptionEs:
      'Plan diseñado para personas que quieran tener su dinero fijo durante 1 año — un punto de equilibrio entre flexibilidad y la tasa de referencia más alta.',
  },
  {
    id: 'fijo25',
    name: 'Fijo 25/2',
    nameEs: 'Fijo 25/2',
    profile: '24-Month Term',
    profileEs: 'Plazo de 24 Meses',
    objective: 'Fixed 25% annual return over a 24-month investment term.',
    objectiveEs: 'Rendimiento fijo del 25% anual a un plazo de 24 meses.',
    targetRef: '25% annual',
    targetRefEs: '25% anual',
    minInvestment: '$500,000 MXN (≈ $28,571 USD) minimum',
    minInvestmentEs: '$500,000 MXN (≈ $28,571 USD) mínimo',
    payout: 'Paid at day 731, counted from the investment lot execution date.',
    payoutEs: 'Se entrega el día 731, contado desde la fecha de ejecución del lote de inversión.',
    penalty: 'Early withdrawal forfeits 25% of the returns accrued to date.',
    penaltyEs: 'El retiro anticipado penaliza con el 25% de los rendimientos acumulados a la fecha.',
    idealFor: 'Long-term private capital and family offices seeking ARKA’s highest fixed-term reference rate.',
    idealForEs: 'Capital privado de largo plazo y family offices que buscan la tasa de referencia fija más alta de la plataforma ARKA.',
    description:
      'A fixed-term plan designed for investors who want their capital locked for 2 years — ARKA’s highest fixed annual reference rate for qualified long-term capital.',
    descriptionEs:
      'Plan diseñado para personas que quieran tener su dinero fijo durante 2 años — la tasa anual de referencia más alta de ARKA para capital calificado de largo plazo.',
  },
]

// ⚠️  Risk references — editable, not promises.
export const RISK_METRICS = [
  { key: 'intraday',  labelEn: 'Intraday Drawdown Limit',       labelEs: 'Límite de Drawdown Intradía',       value: '-0.10% to -0.50% per session',                       valueEs: '-0.10% a -0.50% por sesión' },
  { key: 'portfolio', labelEn: 'Portfolio Stop Framework',       labelEs: 'Marco de Stop de Portafolio',        value: '-5% to -10% (plan-dependent)',                       valueEs: '-5% a -10% (según plan)' },
  { key: 'leverage',  labelEn: 'Maximum Leverage Reference',     labelEs: 'Referencia de Apalancamiento Máximo', value: '1:100 with continuous margin monitoring',            valueEs: '1:100 con monitoreo continuo de margen' },
  { key: 'var',       labelEn: 'VaR Methodology',                labelEs: 'Metodología VaR',                    value: 'Value at Risk — daily & portfolio level',            valueEs: 'Value at Risk — nivel diario y de portafolio' },
  { key: 'session',   labelEn: 'Session-Based Controls',         labelEs: 'Controles por Sesión',               value: 'New York session primary window',                    valueEs: 'Ventana primaria: sesión de Nueva York' },
  { key: 'dynamic',   labelEn: 'Dynamic Allocation',             labelEs: 'Asignación Dinámica',                value: 'Continuous exposure review under adverse conditions', valueEs: 'Revisión continua de exposición bajo condiciones adversas' },
]

export const TIMELINE = [
  {
    period: '2015–2018',
    title: 'Foundation & Market Research',
    titleEs: 'Fundación e Investigación de Mercado',
    body: 'Development of proprietary trading frameworks across global derivatives markets, including liquidity analysis, order flow research, market microstructure, and yield inefficiency modeling.',
    bodyEs: 'Desarrollo de marcos de trading propietarios en los mercados globales de derivados, incluyendo análisis de liquidez, investigación de order flow, microestructura de mercado y modelado de ineficiencias de rendimiento.',
  },
  {
    period: '2019–2023',
    title: 'Quantitative Infrastructure Expansion',
    titleEs: 'Expansión de Infraestructura Cuantitativa',
    body: 'Expansion of proprietary financial technology, multi-cycle stress testing, FIX API execution architecture, macroeconomic signal integration, and risk-engine optimization.',
    bodyEs: 'Expansión de tecnología financiera propietaria, pruebas de estrés multi-ciclo, arquitectura de ejecución FIX API, integración de señales macroeconómicas y optimización del motor de riesgo.',
  },
  {
    period: '2024–2025',
    title: 'Institutional Structuring & Compliance',
    titleEs: 'Estructuración Institucional y Cumplimiento',
    body: 'Implementation of broker-grade infrastructure, institutional liquidity relationships, AML/KYC protocols, compliance structure, and proprietary quantitative analytics.',
    bodyEs: 'Implementación de infraestructura de grado bróker, relaciones de liquidez institucional, protocolos AML/KYC, estructura de cumplimiento y analítica cuantitativa propietaria.',
  },
]

export const INFRASTRUCTURE_ITEMS = [
  { label: 'Segregated Client Accounts', labelEs: 'Cuentas de Cliente Segregadas', detail: 'Capital held in individually segregated structures.', detailEs: 'Capital mantenido en estructuras individualmente segregadas.' },
  { label: 'Liquidity Aggregation', labelEs: 'Agregación de Liquidez', detail: 'oneZero institutional liquidity aggregation.', detailEs: 'Agregación de liquidez institucional oneZero.' },
  { label: 'Execution Infrastructure', labelEs: 'Infraestructura de Ejecución', detail: 'Equinix IBX co-location for ultra-low-latency execution.', detailEs: 'Co-location en Equinix IBX para ejecución de ultra-baja latencia.' },
  { label: 'Prime of Prime', labelEs: 'Prime of Prime', detail: 'B2BROKER Prime of Prime institutional access.', detailEs: 'Acceso institucional Prime of Prime de B2BROKER.' },
  { label: 'Banking Network', labelEs: 'Red Bancaria', detail: 'Eqwire, JP Morgan, Citibank, DBS — institutional references.', detailEs: 'Eqwire, JP Morgan, Citibank, DBS — referencias institucionales.' },
  { label: 'Investor Portal', labelEs: 'Portal del Inversor', detail: 'Real-time visibility at my.arkaltd.io.', detailEs: 'Visibilidad en tiempo real en my.arkaltd.io.' },
]

export const MARKETS = [
  { ticker: 'SPXUSD', label: 'S&P 500', role: 'Primary index exposure', roleEs: 'Exposición principal a índices' },
  { ticker: 'NAS100', label: 'Nasdaq 100', role: 'Tactical index exposure', roleEs: 'Exposición táctica a índices' },
  { ticker: 'US30', label: 'Dow Jones 30', role: 'Tactical index exposure', roleEs: 'Exposición táctica a índices' },
  { ticker: 'EURUSD', label: 'Euro / US Dollar', role: 'Algorithmic FX model', roleEs: 'Modelo algorítmico de FX' },
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

export const OFFICES = [
  {
    city: 'Querétaro, México',
    address: 'Manuel Gómez Morín No. 10, Oficina 10-E',
    building: 'HighPark, Centro Sur',
    zip: 'CP 76090',
    country: 'México',
  },
  {
    city: 'Gros-Islet, Saint Lucia',
    address: 'Ground Floor, La Place Creole Building',
    building: 'Rodney Village, Rodney Bay',
    zip: '',
    country: 'Saint Lucia',
  },
]

export const GLOBAL_DISCLAIMER =
  'This website is for informational purposes only and does not constitute an offer to sell securities, financial advice, legal advice, tax advice, or investment solicitation. Participation is available only to qualified participants, subject to eligibility review, jurisdictional restrictions, KYC/AML procedures, and execution of applicable legal documents. Investment strategies involve risk, including possible loss of capital. Target returns, historical results, simulations, or projections are not guarantees of future performance.'

export const GLOBAL_DISCLAIMER_ES =
  'Este sitio web es solo para fines informativos y no constituye una oferta de venta de valores, asesoramiento financiero, legal, fiscal ni solicitud de inversión. La participación está disponible únicamente para participantes calificados, sujeto a revisión de elegibilidad, restricciones jurisdiccionales, procedimientos KYC/AML y ejecución de documentos legales aplicables. Las estrategias de inversión implican riesgo, incluyendo la posible pérdida de capital. Los rendimientos objetivo, resultados históricos, simulaciones o proyecciones no son garantía de rendimiento futuro.'

export const STRATEGY_DISCLAIMER =
  'Fixed annual rates are contractual references, not guarantees of performance. Early withdrawal before the completed term forfeits 25% of the returns accrued to date. Investing involves risk, including possible loss of capital up to the maximum reference per plan.'

export const STRATEGY_DISCLAIMER_ES =
  'Las tasas anuales fijas son referencias contractuales, no garantías de rendimiento. El retiro anticipado antes de completar el plazo penaliza con el 25% de los rendimientos acumulados a la fecha. Invertir implica riesgo, incluyendo la posible pérdida de capital hasta el máximo de referencia por plan.'
