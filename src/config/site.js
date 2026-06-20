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

export const STRATEGIES = [
  {
    id: 'foundation',
    name: 'ARKA Foundation Strategy',
    nameEs: 'Estrategia Fundación ARKA',
    profile: 'Conservative',
    profileEs: 'Conservadora',
    objective: 'Capital preservation and stable long-term growth.',
    objectiveEs: 'Preservación de capital y crecimiento estable a largo plazo.',
    targetRef: '18% annual objective',
    targetRefEs: 'Objetivo anual del 18%',
    idealFor: 'Long-term private capital, conservative investors, family offices.',
    idealForEs: 'Capital privado a largo plazo, inversores conservadores, family offices.',
    description:
      'A disciplined capital allocation strategy focused on stability, consistency, and long-term capital preservation through systematic global market exposure.',
    descriptionEs:
      'Una estrategia disciplinada de asignación de capital enfocada en la estabilidad, la consistencia y la preservación de capital a largo plazo mediante exposición sistemática a los mercados globales.',
  },
  {
    id: 'growth',
    name: 'ARKA Strategic Growth',
    nameEs: 'Crecimiento Estratégico ARKA',
    profile: 'Moderate',
    profileEs: 'Moderada',
    objective: 'Capital appreciation with controlled institutional exposure.',
    objectiveEs: 'Apreciación de capital con exposición institucional controlada.',
    targetRef: '24% annual objective',
    targetRefEs: 'Objetivo anual del 24%',
    idealFor: 'Entrepreneurs, experienced investors, private capital allocators.',
    idealForEs: 'Empresarios, inversores experimentados, asignadores de capital privado.',
    description:
      'An actively managed portfolio designed to enhance capital appreciation through dynamic global market positioning, quantitative research, and institutional risk management.',
    descriptionEs:
      'Un portafolio gestionado activamente diseñado para potenciar la apreciación de capital mediante posicionamiento dinámico en los mercados globales, investigación cuantitativa y gestión institucional del riesgo.',
  },
  {
    id: 'alpha',
    name: 'ARKA Alpha Force',
    nameEs: 'ARKA Alpha Force',
    profile: 'Active / Quantitative',
    profileEs: 'Activa / Cuantitativa',
    objective: 'Capture market inefficiencies through quantitative models and systematic execution.',
    objectiveEs: 'Capturar ineficiencias de mercado mediante modelos cuantitativos y ejecución sistemática.',
    targetRef: '36% annual objective',
    targetRefEs: 'Objetivo anual del 36%',
    idealFor: 'HNWI, family offices, alternative strategy investors.',
    idealForEs: 'HNWI, family offices, inversores en estrategias alternativas.',
    description:
      'A performance-oriented strategy seeking superior risk-adjusted returns by capturing market inefficiencies through advanced quantitative models, systematic execution, and opportunistic allocation.',
    descriptionEs:
      'Una estrategia orientada al rendimiento que busca retornos superiores ajustados al riesgo capturando ineficiencias de mercado mediante modelos cuantitativos avanzados, ejecución sistemática y asignación oportunista.',
  },
]

// ⚠️  Risk references — editable, not promises.
export const RISK_METRICS = [
  { key: 'intraday',  labelEn: 'Intraday Drawdown Limit',       labelEs: 'Límite de Drawdown Intradía',       value: '-0.10% to -0.50% per session',                       valueEs: '-0.10% a -0.50% por sesión' },
  { key: 'portfolio', labelEn: 'Portfolio Stop Framework',       labelEs: 'Marco de Stop de Portafolio',        value: '-5% to -10%',                                        valueEs: '-5% a -10%' },
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
  'Target objectives are not guaranteed. Past performance, simulations, models, or internal references do not guarantee future results. Investing involves risk, including possible loss of capital.'

export const STRATEGY_DISCLAIMER_ES =
  'Los objetivos no están garantizados. El rendimiento pasado, las simulaciones, los modelos o las referencias internas no garantizan resultados futuros. Invertir implica riesgo, incluyendo la posible pérdida de capital.'
