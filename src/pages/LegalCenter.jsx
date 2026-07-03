import SectionHeading from '@/components/shared/SectionHeading'
import { LEGAL_DOCUMENTS, GLOBAL_DISCLAIMER, GLOBAL_DISCLAIMER_ES, SITE, LEGAL_REGISTRATION_NUMBER } from '@/config/site'
import { useLang } from '@/context/LanguageContext'

// Content below is summarized from ARKA's official legal documents (Spanish
// originals, the authoritative version — see the linked PDFs). Summaries are
// provided in both languages for readability; they do not replace the source
// documents.
const LEGAL_CONTENT = {
  'aml-kyc': {
    title: 'AML / KYC Policy',
    titleEs: 'Política AML / KYC',
    files: [{ label: 'ARKA Savings — Terms & Conditions (Section IV)', labelEs: 'ARKA Savings — Términos y Condiciones (Sección IV)', href: '/legal/arka-terminos-condiciones-savings.pdf' }],
    body: `ARKA requires every investor to complete a sequential onboarding process before any capital is allocated: (1) account opening request through the Investor Portal, (2) identity verification — KYC for individuals, KYB for legal entities, including official ID, proof of address, and source-of-funds documentation, (3) Anti-Money Laundering (AML) compliance checks aligned with CNBV standards, and (4) account activation.

ARKA reserves the right to reject any account opening or program subscription request, without justification, when the applicant's profile does not meet ARKA's risk, compliance, or jurisdictional standards. Each investor may hold only one account; duplicate accounts are blocked.

ARKA may request additional documentation at any time to verify identity, source of funds, or regulatory compliance, and may temporarily suspend withdrawal or distribution processing during an active AML review.`,
    bodyEs: `ARKA requiere que todo inversionista complete un proceso secuencial de incorporación antes de asignar cualquier capital: (1) solicitud de apertura de cuenta a través del Portal del Inversionista, (2) verificación de identidad — KYC para personas físicas, KYB para personas morales, incluyendo identificación oficial, comprobante de domicilio y documentación de origen de fondos, (3) controles de cumplimiento contra el Lavado de Dinero (AML) alineados con estándares CNBV, y (4) activación de la cuenta.

ARKA se reserva el derecho de rechazar cualquier solicitud de apertura de cuenta o suscripción a un programa, sin necesidad de justificación, cuando el perfil del solicitante no cumpla con los estándares de riesgo, cumplimiento o jurisdicción de ARKA. Cada inversionista solo puede tener una cuenta; las cuentas duplicadas son bloqueadas.

ARKA podrá solicitar documentación adicional en cualquier momento para verificar identidad, origen de fondos o cumplimiento normativo, y podrá suspender temporalmente el procesamiento de retiros o distribuciones durante una investigación AML activa.`,
  },

  'privacy': {
    title: 'Privacy Policy',
    titleEs: 'Aviso de Privacidad',
    files: [{ label: 'ARKA — Comprehensive Privacy Notice', labelEs: 'ARKA — Aviso de Privacidad Integral', href: '/legal/arka-aviso-privacidad.pdf' }],
    body: `ARKA Global Liquidity Limited (IBC No. 2025-00568) is the data controller for personal information collected from investors, participants, and Portal users, under Mexico's Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP) and inspired by CNBV transparency standards.

Data collected includes identification data, contact data, financial/wealth data (source and amount of capital, economic activity, account statements), corporate data for legal entities (KYB), and Portal access/usage data. This data is used for identity verification (KYC/KYB), AML prevention, account and Savings program administration, processing deposits/withdrawals/distributions, and regulatory compliance. Secondary uses (new program announcements, satisfaction surveys) can be opted out of at any time without affecting service.

Data may be shared with banking infrastructure providers (Eqwire, JP Morgan, Citibank, DBS), the digital asset provider (CoinsBuy), the CRM/Portal provider (B2CORE/B2BROKER), KYC/AML verification providers, and competent authorities (CNBV, UIF) — never sold or transferred for unrelated commercial purposes.

Investors may exercise ARCO rights (Access, Rectification, Cancellation, Opposition) at any time by emailing soporte@arkaltd.io; ARKA acknowledges requests within 2 business days and resolves them within 20 business days. Security measures include encryption in transit and at rest, two-factor authentication, ISO 27001 and SOC 2 Type II certified infrastructure, and Equinix IBX data centers. Complaints may be filed with Mexico's Secretaría Anticorrupción y Buen Gobierno (SABG).`,
    bodyEs: `ARKA Global Liquidity Limited (IBC No. 2025-00568) es responsable del tratamiento de los datos personales de inversionistas, participantes y usuarios del Portal, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México e inspirado en los estándares de transparencia de la CNBV.

Los datos recabados incluyen datos de identificación, de contacto, patrimoniales y financieros (origen y monto del capital, actividad económica, estados de cuenta), datos corporativos para personas morales (KYB), y datos de acceso/uso del Portal. Estos datos se utilizan para verificación de identidad (KYC/KYB), prevención AML, administración de la cuenta y de los programas Savings, procesamiento de depósitos/retiros/distribuciones, y cumplimiento regulatorio. El Titular puede oponerse en cualquier momento a las finalidades secundarias (nuevos programas, encuestas) sin que ello afecte el servicio.

Los datos pueden compartirse con proveedores de infraestructura bancaria (Eqwire, JP Morgan, Citibank, DBS), el proveedor de activos digitales (CoinsBuy), el proveedor de CRM/Portal (B2CORE/B2BROKER), proveedores de verificación KYC/AML, y autoridades competentes (CNBV, UIF) — nunca se venden ni transfieren con fines comerciales ajenos.

El Titular puede ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación, Oposición) en cualquier momento escribiendo a soporte@arkaltd.io; ARKA acusa recibo en 2 días hábiles y resuelve en 20 días hábiles. Las medidas de seguridad incluyen cifrado en tránsito y en reposo, autenticación de dos factores, infraestructura certificada ISO 27001 y SOC 2 Tipo II, y centros de datos Equinix IBX. Las quejas pueden presentarse ante la Secretaría Anticorrupción y Buen Gobierno (SABG) de México.`,
  },

  'terms': {
    title: 'General Terms & Contracting Process',
    titleEs: 'Términos Generales y Proceso de Contratación',
    files: [{ label: 'ARKA Savings — Terms & Conditions', labelEs: 'ARKA Savings — Términos y Condiciones', href: '/legal/arka-terminos-condiciones-savings.pdf' }],
    body: `These Terms & Conditions govern participation in ARKA Savings, a privately administered wealth-management program. ARKA Savings is not a bank deposit regulated by the CNBV, nor a publicly distributed securities instrument — its structure is comparable to performance programs offered by private wealth managers, funds, and family offices internationally. Published rates are objectives, not an unconditional payment promise; past performance does not indicate future results.

ARKA offers two program types: Savings Fijo (a fixed amount committed for a fixed term, linear return, capital returned in full at maturity — this is the structure behind ARKA's Flex 20, Fijo 22/1, and Fijo 25/2 plans) and Savings Flexible (open contributions, daily accrued return, tiered rates). Essential conditions of an already-active program (rate, term, penalty terms) are not modified retroactively, except in force majeure.

Deposits are accepted via bank transfer, ACH, or approved stablecoins (USDT); cash is not accepted. Withdrawals of available capital process within 3–7 business days; capital committed to an active program is subject to the program's permanence period and early-withdrawal penalty. Funds are not government-insured (no IPAB/FDIC equivalent), though ARKA maintains internal capital segregation policies.

The agreement is governed by the laws of Saint Lucia, ARKA's jurisdiction of incorporation; disputes are submitted to Saint Lucia's competent courts. The official language of the Terms & Conditions is Spanish — in case of discrepancy between language versions, the Spanish version prevails.`,
    bodyEs: `Estos Términos y Condiciones rigen la participación en ARKA Savings, un programa de gestión patrimonial de administración privada. ARKA Savings no es un depósito bancario regulado por la CNBV, ni un instrumento del mercado de valores de distribución pública — su estructura es comparable a los programas de rendimiento ofrecidos por gestores patrimoniales privados, fondos y family offices a nivel internacional. Las tasas publicadas son objetivos, no una promesa incondicional de pago; el desempeño pasado no es indicativo de resultados futuros.

ARKA ofrece dos modalidades: Savings Fijo (un monto fijo comprometido durante un plazo determinado, rendimiento lineal, capital devuelto íntegramente al vencimiento — esta es la estructura detrás de los planes Flex 20, Fijo 22/1 y Fijo 25/2 de ARKA) y Savings Flexible (aportaciones abiertas, rendimiento diario acumulado, tasas por escalones). Las condiciones esenciales de un programa ya activo (tasa, plazo, penalización) no se modifican retroactivamente, salvo por causa de fuerza mayor.

Las aportaciones se aceptan por transferencia bancaria, ACH, o activos digitales estables aprobados (USDT); no se acepta efectivo. Los retiros de capital disponible se procesan en 3 a 7 días hábiles; el capital comprometido en un programa activo está sujeto al período de permanencia del programa y a la penalización por retiro anticipado. Los fondos no cuentan con seguro gubernamental (sin equivalente a IPAB/FDIC), aunque ARKA mantiene políticas internas de segregación de capital.

El acuerdo se rige por las leyes de Santa Lucía, jurisdicción de constitución de ARKA; las controversias se someten a los tribunales competentes de Santa Lucía. El idioma oficial de los Términos y Condiciones es el español — en caso de discrepancia entre versiones en distintos idiomas, prevalecerá la versión en español.`,
  },

  'risk-disclosure': {
    title: 'Risk Disclosure',
    titleEs: 'Divulgación de Riesgos',
    files: [
      { label: 'Risk Disclosure Letter (bilingual)', labelEs: 'Carta de Divulgación de Riesgos (bilingüe)', href: '/legal/arka-carta-exposicion-riesgos.pdf' },
      { label: 'Risk Disclosure & Investment Philosophy', labelEs: 'Risk Disclosure & Investment Philosophy', href: '/legal/arka-risk-disclosure-filosofia.pdf' },
    ],
    body: `ARKA's underlying strategies trade contracts for difference (CFDs), foreign exchange, and global equity indices (SPX, NAS100, US30) — leveraged instruments that qualify as high-risk financial products under CNBV terminology. These instruments do not imply direct ownership of the underlying asset, and can generate losses exceeding deposited capital if risk controls are not adequate.

Key risk factors: market risk (continuous price fluctuation), leverage risk (up to 1:100 — a 1% adverse move can produce a significant margin loss), liquidity risk (slippage or inability to close positions under adverse conditions), volatility risk (abrupt moves, price gaps), capital loss risk (real possibility of losing part or all allocated capital), foreign exchange risk (operations run in USD), operational/technology risk, and regulatory/jurisdictional risk (ARKA operates under IBC No. 2025-00568 in Saint Lucia; applicable regulation may differ from the investor's country of residence).

Risk management measures: Value-at-Risk (VaR) methodology, intraday drawdown limits between -0.10% and -0.50% per session, maximum portfolio risk stop between -5% and -10%, continuous exposure monitoring, and a segregated Dealing Desk structure — no single person controls capital, risk, and execution simultaneously. These measures reduce risk; they do not eliminate it.

ARKA's governing philosophy: "Capital preservation first. Performance second. Consistency always." ARKA does not guarantee returns, does not operate without predefined risk parameters, does not allocate capital without completed KYC/AML, and does not accept investors seeking 100%-per-month returns. Past performance does not guarantee future results.`,
    bodyEs: `Las estrategias de ARKA operan contratos por diferencia (CFD), divisas y índices bursátiles globales (SPX, NAS100, US30) — instrumentos apalancados que califican como productos financieros de alto riesgo conforme a la terminología CNBV. Estos instrumentos no implican la propiedad directa del activo subyacente y pueden generar pérdidas superiores al capital depositado si no se aplican controles de riesgo adecuados.

Factores de riesgo principales: riesgo de mercado (fluctuación continua de precios), riesgo de apalancamiento (hasta 1:100 — una variación adversa del 1% puede traducirse en una pérdida significativa del margen), riesgo de liquidez (deslizamiento o imposibilidad de cerrar posiciones en condiciones adversas), riesgo de volatilidad (movimientos abruptos, gaps de precio), riesgo de pérdida de capital (posibilidad real de perder parte o la totalidad del capital asignado), riesgo de tipo de cambio (las operaciones se realizan en USD), riesgo operativo/tecnológico, y riesgo regulatorio/jurisdiccional (ARKA opera bajo IBC No. 2025-00568 en Santa Lucía; la regulación aplicable puede diferir de la del país de residencia del inversionista).

Medidas de gestión de riesgo: metodología de Valor en Riesgo (VaR), límites de drawdown intradía entre -0.10% y -0.50% por sesión, stop máximo de riesgo del portafolio entre -5% y -10%, monitoreo continuo de exposición, y una estructura de Dealing Desk segregada — ninguna persona controla capital, riesgo y ejecución simultáneamente. Estas medidas reducen el riesgo; no lo eliminan.

Filosofía rectora de ARKA: "Capital preservation first. Performance second. Consistency always." ARKA no garantiza rendimientos, no opera sin parámetros de riesgo predefinidos, no asigna capital sin proceso KYC/AML completado, y no acepta inversionistas que busquen rendimientos del 100% mensual. El rendimiento pasado no garantiza resultados futuros.`,
  },

  'disclaimer': {
    title: 'Website Disclaimer',
    titleEs: 'Aviso Legal del Sitio',
    body: `This website is for informational purposes only and does not constitute an offer to sell securities, investment advice, legal advice, tax advice, or solicitation of any kind. Information on this website may be changed without notice.

ARKA Global Liquidity Limited is not a credit institution, brokerage firm, or financial intermediary regulated by Mexico's CNBV. ARKA adopts CNBV transparency and disclosure standards as a voluntary reference framework, which does not imply CNBV regulatory oversight. ARKA makes no representations regarding the accuracy or completeness of information provided, and target rates, simulations, or projections shown on this site are references only, not guarantees of performance.`,
    bodyEs: `Este sitio web es solo para fines informativos y no constituye una oferta de venta de valores, asesoramiento de inversión, asesoramiento legal, asesoramiento fiscal ni solicitud de ningún tipo. La información en este sitio web puede cambiar sin previo aviso.

ARKA Global Liquidity Limited no es una institución de crédito, casa de bolsa ni intermediario financiero regulado por la CNBV de México. ARKA adopta los estándares de transparencia y divulgación de la CNBV como un marco de referencia voluntario, lo cual no implica supervisión regulatoria por parte de la CNBV. ARKA no realiza declaraciones sobre la exactitud o integridad de la información proporcionada, y las tasas objetivo, simulaciones o proyecciones mostradas en este sitio son solo referencias, no garantías de rendimiento.`,
  },

  'jurisdictions': {
    title: 'Governing Law & Jurisdiction',
    titleEs: 'Ley Aplicable y Jurisdicción',
    files: [
      { label: 'ARKA Savings — Terms & Conditions (Section XIV)', labelEs: 'ARKA Savings — Términos y Condiciones (Sección XIV)', href: '/legal/arka-terminos-condiciones-savings.pdf' },
      { label: 'Risk Disclosure Letter', labelEs: 'Carta de Divulgación de Riesgos', href: '/legal/arka-carta-exposicion-riesgos.pdf' },
    ],
    body: `ARKA Global Liquidity Limited is incorporated under IBC No. 2025-00568 in Saint Lucia, and its Terms & Conditions are governed by the laws of Saint Lucia. Any legal action arising from ARKA's agreements is submitted to the exclusive jurisdiction of Saint Lucia's competent courts; investors irrevocably accept this jurisdiction.

For relationships with investors residing in Mexico, ARKA adopts the transparency, disclosure, and investor-protection standards published by the Comisión Nacional Bancaria y de Valores (CNBV) as a voluntary reference, without this implying that ARKA is a CNBV-regulated entity. Investors should consider that the regulation applicable to ARKA may differ from the regulation of their own country of residence, and that regulatory changes may affect the platform's operating conditions.

The official language of ARKA's legal documents is Spanish; in case of discrepancy between language versions, the Spanish version prevails.`,
    bodyEs: `ARKA Global Liquidity Limited está constituida bajo IBC No. 2025-00568 en Santa Lucía, y sus Términos y Condiciones se rigen por las leyes de Santa Lucía. Cualquier acción legal derivada de los acuerdos de ARKA se somete a la jurisdicción exclusiva de los tribunales competentes de Santa Lucía; los inversionistas aceptan irrevocablemente dicha jurisdicción.

Para las relaciones con inversionistas residentes en México, ARKA adopta como referencia voluntaria los estándares de transparencia, divulgación y protección al inversionista publicados por la Comisión Nacional Bancaria y de Valores (CNBV), sin que esto implique que ARKA sea una entidad regulada por la CNBV. Los inversionistas deben considerar que la regulación aplicable a ARKA puede diferir de la de su propio país de residencia, y que los cambios regulatorios pueden afectar las condiciones operativas de la plataforma.

El idioma oficial de los documentos legales de ARKA es el español; en caso de discrepancia entre versiones en distintos idiomas, prevalecerá la versión en español.`,
  },

  'qualification': {
    title: 'Investor Qualification Notice',
    titleEs: 'Aviso de Calificación del Inversionista',
    files: [
      { label: 'Risk Disclosure Letter (Section 06)', labelEs: 'Carta de Divulgación de Riesgos (Sección 06)', href: '/legal/arka-carta-exposicion-riesgos.pdf' },
      { label: 'Risk Disclosure & Investment Philosophy (Section 05)', labelEs: 'Risk Disclosure & Investment Philosophy (Sección 05)', href: '/legal/arka-risk-disclosure-filosofia.pdf' },
    ],
    body: `In accordance with CNBV client-classification guidelines, ARKA directs its services exclusively to investors who: have prior experience in financial markets, genuinely understand how leveraged and derivative instruments work, have sufficient financial capacity to absorb losses without affecting their overall financial situation, hold a medium-to-long-term investment horizon (a minimum of 6 months is recommended), and are willing to complete the KYC/AML process before capital allocation.

A compatible investor understands markets carry risk, does not depend on the allocated funds for immediate needs, values consistency over speculation, and accepts that past performance does not guarantee future results. An investor is not compatible with ARKA if they expect fixed, guaranteed, or impossible returns, need to recover capital in under 30 days, will not accept temporary drawdown, or are unwilling to provide KYC/AML documentation.`,
    bodyEs: `Conforme a los lineamientos de clasificación de clientes de la CNBV, ARKA dirige sus servicios exclusivamente a inversionistas que: cuenten con experiencia previa en mercados financieros, comprendan realmente el funcionamiento de instrumentos apalancados y derivados, tengan capacidad patrimonial para absorber pérdidas sin afectar su situación financiera general, tengan un horizonte de inversión de mediano a largo plazo (se recomienda un mínimo de 6 meses), y estén dispuestos a completar el proceso KYC/AML antes de la asignación de capital.

Un inversionista compatible comprende que los mercados conllevan riesgo, no depende de los fondos asignados para necesidades inmediatas, valora la consistencia sobre la especulación, y acepta que el rendimiento pasado no garantiza resultados futuros. Un inversionista no es compatible con ARKA si espera rendimientos fijos, garantizados o imposibles, necesita recuperar el capital en menos de 30 días, no acepta la posibilidad de un drawdown temporal, o se niega a proporcionar documentación KYC/AML.`,
  },

  'confidentiality': {
    title: 'Confidentiality Notice',
    titleEs: 'Aviso de Confidencialidad',
    files: [{ label: 'ARKA Savings — Terms & Conditions (Section XIII)', labelEs: 'ARKA Savings — Términos y Condiciones (Sección XIII)', href: '/legal/arka-terminos-condiciones-savings.pdf' }],
    body: `ARKA treats investor information with strict confidentiality, in accordance with Mexico's LFPDPPP and applicable international standards. Personal data collected during onboarding is used exclusively for identity verification (KYC/AML), account and active-program administration, communications related to the investor relationship, and compliance with legal and regulatory obligations.

ARKA will not disclose an investor's personal or account information to third parties, except: when required by a competent authority under applicable law, when necessary to provide contracted services to infrastructure providers bound by confidentiality agreements, or with the investor's express consent. ARKA's wealth-management methodology, capital administration models, and Savings program parameters are proprietary and confidential; investors agree not to disclose, reproduce, or share this information with third parties.`,
    bodyEs: `ARKA trata la información de los inversionistas con estricta confidencialidad, conforme a la LFPDPPP de México y los estándares internacionales aplicables. Los datos personales recopilados durante la incorporación se utilizan exclusivamente para verificación de identidad (KYC/AML), administración de la cuenta y de los programas activos, comunicaciones relacionadas con la relación patrimonial, y cumplimiento de obligaciones legales y regulatorias.

ARKA no divulgará la información personal ni de cuenta del inversionista a terceros, salvo: cuando sea requerido por autoridad competente conforme a la ley aplicable, cuando sea necesario para la prestación de los servicios contratados con proveedores de infraestructura sujetos a acuerdos de confidencialidad, o con el consentimiento expreso del inversionista. La metodología de gestión patrimonial, los modelos de administración de capital y los parámetros de los programas Savings de ARKA son información propietaria y confidencial; el inversionista se compromete a no divulgar, reproducir ni compartir dicha información con terceros.`,
  },
}

export default function LegalCenter() {
  const { lang, t } = useLang()
  const isEs = lang === 'es'
  const disclaimer = isEs ? GLOBAL_DISCLAIMER_ES : GLOBAL_DISCLAIMER

  return (
    <main className="pt-20">
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-4xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] mb-6">{t('legal', 'eyebrow')}</p>
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight tracking-tight mb-8">
            {t('legal', 'h1_line1')}<br />{t('legal', 'h1_line2')}
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
            {t('legal', 'intro')}
          </p>
          <p className="text-[#94A3B8]/70 text-xs leading-relaxed max-w-2xl mt-4 italic">
            {t('legal', 'official_lang_note')}
          </p>
        </div>
      </section>

      {/* Document Cards */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-arka">
          <SectionHeading eyebrow={t('legal', 'docs_eyebrow')} title={t('legal', 'docs_title')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {LEGAL_DOCUMENTS.map((doc) => {
              const content = LEGAL_CONTENT[doc.slug]
              const title = isEs ? (doc.titleEs || doc.title) : doc.title
              return (
                <div key={doc.slug} className="arka-card p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-white font-medium">{title}</h3>
                    <span className="text-[9px] tracking-widest uppercase text-[#94A3B8] border border-[#1E293B] px-2 py-0.5 rounded shrink-0 ml-3">
                      {t('legal', 'active')}
                    </span>
                  </div>
                  {content && (
                    <p className="text-[#94A3B8] text-xs leading-relaxed whitespace-pre-line line-clamp-4">
                      {(isEs ? content.bodyEs : content.body).split('\n\n')[0]}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      const el = document.getElementById(`legal-${doc.slug}`)
                      el?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-[10px] tracking-[0.2em] uppercase text-[#94A3B8] hover:text-white transition-colors"
                  >
                    {t('legal', 'read_full')}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Full Document Sections */}
      <section className="section-padding bg-[#050505]">
        <div className="container-arka max-w-3xl">
          <div className="space-y-12">
            {LEGAL_DOCUMENTS.map((doc) => {
              const content = LEGAL_CONTENT[doc.slug]
              if (!content) return null
              const title = isEs ? (doc.titleEs || content.titleEs) : content.title
              const body = isEs ? content.bodyEs : content.body
              return (
                <div key={doc.slug} id={`legal-${doc.slug}`} className="space-y-4 border-t border-[#1E293B] pt-10">
                  <h2 className="text-white font-medium text-xl">{title}</h2>
                  <div className="space-y-4">
                    {body.split('\n\n').map((para, i) => (
                      <p key={i} className="text-[#94A3B8] text-sm leading-relaxed">{para}</p>
                    ))}
                  </div>
                  {content.files && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {content.files.map((f) => (
                        <a
                          key={f.href}
                          href={f.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-white border border-[#1E293B] hover:border-[#334155] hover:bg-[#0B1F3A] px-4 py-2.5 rounded transition-all duration-300"
                        >
                          {t('legal', 'download_pdf')} — {isEs ? f.labelEs : f.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer Legal Note */}
      <section className="py-12 bg-[#0A0A0A] border-t border-[#1E293B]">
        <div className="container-arka">
          <div className="space-y-4">
            <p className="text-[10px] text-[#94A3B8] leading-relaxed max-w-4xl">
              {disclaimer}
            </p>
            <p className="text-[10px] text-[#94A3B8]">
              <strong className="text-white">ARKA Global Investments</strong>{t('legal', 'entity_mid')}
              <strong className="text-white">ARKA Global Liquidity LTD</strong>{t('legal', 'entity_end')}
              {LEGAL_REGISTRATION_NUMBER !== 'PENDING_CONFIRMATION' ? (
                <> {t('legal', 'reg_no')} {LEGAL_REGISTRATION_NUMBER}.</>
              ) : (
                <> {t('legal', 'reg_pending')}</>
              )}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
