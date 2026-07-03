import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Option lists: `value` is the canonical string sent to the backend (and used
// for the "Otro" sentinel comparisons in api/send-contract-intake.js) — it
// never changes with language. `es`/`en` are display-only.
const ID_TYPES = [
  { value: 'INE / Identificación nacional', es: 'INE / Identificación nacional', en: 'National ID (INE)' },
  { value: 'Pasaporte', es: 'Pasaporte', en: 'Passport' },
  { value: 'Licencia de conducir', es: 'Licencia de conducir', en: 'Driver’s License' },
  { value: 'Documento migratorio', es: 'Documento migratorio', en: 'Immigration Document' },
  { value: 'Otro', es: 'Otro', en: 'Other' },
]

const ECONOMIC_ACTIVITIES = [
  { value: 'Empresario / dueño de negocio', es: 'Empresario / dueño de negocio', en: 'Business Owner / Entrepreneur' },
  { value: 'Profesionista independiente', es: 'Profesionista independiente', en: 'Independent Professional' },
  { value: 'Empleado', es: 'Empleado', en: 'Employee' },
  { value: 'Inversionista', es: 'Inversionista', en: 'Investor' },
  { value: 'Comerciante', es: 'Comerciante', en: 'Merchant / Trader' },
  { value: 'Sector inmobiliario', es: 'Sector inmobiliario', en: 'Real Estate Sector' },
  { value: 'Sector financiero', es: 'Sector financiero', en: 'Financial Sector' },
  { value: 'Tecnología / servicios digitales', es: 'Tecnología / servicios digitales', en: 'Technology / Digital Services' },
  { value: 'Criptoactivos / activos digitales', es: 'Criptoactivos / activos digitales', en: 'Crypto / Digital Assets' },
  { value: 'Otro', es: 'Otro', en: 'Other' },
]

const FUNDS_ORIGINS = [
  { value: 'Ahorro personal', es: 'Ahorro personal', en: 'Personal Savings' },
  { value: 'Sueldos u honorarios', es: 'Sueldos u honorarios', en: 'Salary or Professional Fees' },
  { value: 'Utilidades de negocio', es: 'Utilidades de negocio', en: 'Business Profits' },
  { value: 'Venta de inmueble', es: 'Venta de inmueble', en: 'Real Estate Sale' },
  { value: 'Venta de empresa o participación accionaria', es: 'Venta de empresa o participación accionaria', en: 'Sale of a Company or Equity Stake' },
  { value: 'Rendimientos de inversiones previas', es: 'Rendimientos de inversiones previas', en: 'Returns from Prior Investments' },
  { value: 'Criptoactivos', es: 'Criptoactivos', en: 'Crypto Assets' },
  { value: 'Herencia', es: 'Herencia', en: 'Inheritance' },
  { value: 'Otro', es: 'Otro', en: 'Other' },
]

const RELATIONSHIPS = [
  { value: 'Cónyuge', es: 'Cónyuge', en: 'Spouse' },
  { value: 'Hijo/a', es: 'Hijo/a', en: 'Child' },
  { value: 'Padre', es: 'Padre', en: 'Father' },
  { value: 'Madre', es: 'Madre', en: 'Mother' },
  { value: 'Hermano/a', es: 'Hermano/a', en: 'Sibling' },
  { value: 'Abuelo/a', es: 'Abuelo/a', en: 'Grandparent' },
  { value: 'Nieto/a', es: 'Nieto/a', en: 'Grandchild' },
  { value: 'Tío/a', es: 'Tío/a', en: 'Uncle / Aunt' },
  { value: 'Sobrino/a', es: 'Sobrino/a', en: 'Nephew / Niece' },
  { value: 'Primo/a', es: 'Primo/a', en: 'Cousin' },
  { value: 'Otro', es: 'Otro', en: 'Other' },
]

const CURRENCIES = [
  { value: 'USD', es: 'USD', en: 'USD' },
  { value: 'MXN', es: 'MXN', en: 'MXN' },
]

// Canonical plan data — name and maxLoss are language-neutral. Values sent to
// the backend (planReturnRate, planTerm, planPayout, planPenalty) always use
// the Spanish fields, since api/send-contract-intake.js renders an
// internal-facing email for ARKA staff in Spanish regardless of the
// investor-facing UI language.
const SAVINGS_PLANS = [
  {
    name: 'Flex 20',
    maxLoss: '5%',
    descriptionEs: 'Plan diseñado para personas que quieran tener su dinero fijo por periodos de 6 meses.',
    descriptionEn: 'A plan designed for people who want to keep their money fixed for 6-month periods.',
    termEs: '6 meses', termEn: '6 months',
    minInvestment: '$500,000.00 MXN',
    returnRateEs: '20% anual', returnRateEn: '20% annual',
    payoutEs: 'Al día 183, tomando como inicio la fecha en que se realizó el lote de inversión.',
    payoutEn: 'On day 183, counted from the date the investment lot was executed.',
    penaltyEs: '25% sobre los rendimientos obtenidos al momento de la solicitud de retiro.',
    penaltyEn: '25% of the returns earned at the time the withdrawal is requested.',
  },
  {
    name: 'Fijo 22/1',
    maxLoss: '7.5%',
    descriptionEs: 'Plan diseñado para personas que quieran tener su dinero fijo durante 1 año.',
    descriptionEn: 'A plan designed for people who want to keep their money fixed for 1 year.',
    termEs: '1 año', termEn: '1 year',
    minInvestment: '$500,000.00 MXN',
    returnRateEs: '22% anual', returnRateEn: '22% annual',
    payoutEs: 'Al día 366, tomando como inicio la fecha en que se realizó el lote de inversión.',
    payoutEn: 'On day 366, counted from the date the investment lot was executed.',
    penaltyEs: '25% sobre los rendimientos obtenidos al momento de la solicitud de retiro.',
    penaltyEn: '25% of the returns earned at the time the withdrawal is requested.',
  },
  {
    name: 'Fijo 25/2',
    maxLoss: '10%',
    descriptionEs: 'Plan diseñado para personas que quieran tener su dinero fijo durante 2 años.',
    descriptionEn: 'A plan designed for people who want to keep their money fixed for 2 years.',
    termEs: '2 años', termEn: '2 years',
    minInvestment: '$500,000.00 MXN',
    returnRateEs: '25% anual', returnRateEn: '25% annual',
    payoutEs: 'Al día 731, tomando como inicio la fecha en que se realizó el lote de inversión.',
    payoutEn: 'On day 731, counted from the date the investment lot was executed.',
    penaltyEs: '25% sobre los rendimientos obtenidos al momento de la solicitud de retiro.',
    penaltyEn: '25% of the returns earned at the time the withdrawal is requested.',
  },
]

// Segmento B2B — aportación mínima $500,000 MXN o el equivalente en USD
const MXN_MINIMUM = 500000
const USD_MINIMUM = 28571.42

const MAX_BENEFICIARIES = 4

// Only the B2Core portal is allowed to frame this page (enforced by CSP
// frame-ancestors in vercel.json). We additionally verify event.origin on
// every postMessage as defence-in-depth, so a rogue frame can never inject a
// forged SSO email or locale even if the CSP were ever relaxed.
const ALLOWED_PARENT_ORIGINS = ['https://my.arkaltd.io']

const ACCENT = '#004C45'
const ACCENT_HOVER = '#005c54'

// ── Bilingual copy ───────────────────────────────────────────────────────────
const T = {
  es: {
    stepLabels: ['Mandante', 'Identificación', 'Actividad', 'Plan de Ahorro', 'Beneficiarios', 'Revisión'],
    notFramed: 'Esta página solo está disponible dentro del portal ARKA.',
    heading: 'Cuestionario para Contrato de Mandato',
    intro: 'Completa la siguiente información para preparar tu Contrato de Mandato. Los datos deben coincidir con tu identificación oficial y documentación KYC. Toma aproximadamente 5 minutos.',
    start: 'Comenzar',
    back: '← Atrás',
    next: 'Siguiente →',
    sending: 'Enviando…',
    submit: 'Enviar cuestionario',
    successTitle: 'Cuestionario enviado',
    successBody: 'Hemos recibido tu información. Nuestro equipo preparará tu Contrato de Mandato y se pondrá en contacto contigo a través del correo proporcionado.',

    s1Heading: '1. Datos generales del Mandante',
    fullName: 'Nombre completo del Mandante',
    fullNameHint: 'Exactamente como aparece en tu identificación oficial',
    fullNamePh: 'Nombre completo',
    nationality: 'Nacionalidad',
    taxId: 'RFC / Tax ID',
    phone: 'Teléfono con lada internacional',
    phonePh: '+52 55 0000 0000',
    email: 'Correo con el que te registraste',
    emailHint: 'Correo con el que te registraste en el portal ARKA',
    emailPh: 'correo@ejemplo.com',
    addressLabel: 'Domicilio',
    street: 'Calle',
    number: 'Número',
    colony: 'Colonia',
    zip: 'Código postal',
    city: 'Ciudad / Municipio',
    state: 'Estado',
    country: 'País',

    s2Heading: '2. Identificación oficial',
    idType: 'Tipo de identificación oficial',
    specifyDocType: 'Especifica el tipo de documento',

    s3Heading: '3. Actividad económica y origen de fondos',
    economicActivity: 'Actividad económica principal',
    specifyActivity: 'Especifica tu actividad económica',
    fundsOrigin: 'Origen principal de los recursos a aportar',
    specifyFundsOrigin: 'Especifica el origen de los recursos',

    s4Heading: '4. Plan de Ahorro seleccionado',
    planType: 'Tipo de Plan de Ahorro / Savings',
    planTypeHint: `Segmento B2B — aportación mínima $500,000.00 MXN o el equivalente a $${USD_MINIMUM.toFixed(2)} USD`,
    planMaxLoss: 'Riesgo máximo de pérdida',
    planTerm: 'Plazo fijo',
    planMinInvestment: 'Inversión mínima',
    planReturn: 'Rendimiento',
    planPayout: 'Entrega de rendimiento',
    planPenalty: 'Penalización por retiro anticipado',
    initialAmount: 'Aportación inicial — monto en número',
    initialAmountPh: '10000',
    belowMinimum: (amount, currency) => `El monto mínimo es ${amount} ${currency}.`,
    currency: 'Divisa de aportación',
    usdApproxNote: '* El monto en USD es aproximado y puede variar según el tipo de cambio vigente el día de la transferencia.',
    rateLoading: 'Obteniendo el tipo de cambio del día…',
    rateError: 'No se pudo obtener el tipo de cambio.',
    retry: 'Reintentar',
    exchangeEquivalent: 'Equivalente aproximado:',
    exchangeRateOfDay: 'Tipo de cambio del día:',

    s5Heading: '5. Beneficiarios',
    totalAssigned: 'Total asignado:',
    beneficiariesHint: (n) => `Agrega hasta ${n} beneficiarios. Los porcentajes deben sumar 100%.`,
    minorNote: 'Los beneficiarios menores de edad serán representados por medio de un albacea legal a favor del menor de edad.',
    beneficiaryN: (n) => `Beneficiario ${n}`,
    remove: 'Eliminar',
    beneficiaryNameHint: 'Como aparece en el acta de nacimiento e identificación oficial',
    relationship: 'Parentesco',
    selectPh: 'Selecciona…',
    percentage: 'Porcentaje asignado (%)',
    specifyRelationship: 'Especifica el parentesco',
    beneficiaryPhone: 'Teléfono',
    beneficiaryEmail: 'Correo electrónico',
    addBeneficiary: '+ Agregar beneficiario',
    maxBeneficiaries: (n) => `Máximo ${n} beneficiarios`,
    distributeEvenly: 'Distribuir % equitativamente',

    s6Heading: '6. Revisión',
    reviewIntro: 'Revisa que toda tu información sea correcta antes de enviar.',
    section1: '1. Datos generales del Mandante',
    section2: '2. Identificación oficial',
    section3: '3. Actividad económica y origen de fondos',
    section4: '4. Plan de Ahorro',
    section5: '5. Beneficiarios',
    rowFullName: 'Nombre completo',
    rowNationality: 'Nacionalidad',
    rowTaxId: 'RFC / Tax ID',
    rowPhone: 'Teléfono',
    rowEmail: 'Correo',
    rowAddress: 'Domicilio',
    rowType: 'Tipo',
    rowEconomicActivity: 'Actividad económica',
    rowFundsOrigin: 'Origen de los recursos',
    rowPlanType: 'Tipo de plan',
    rowReturn: 'Rendimiento',
    rowTerm: 'Plazo fijo',
    rowMaxLoss: 'Riesgo máximo de pérdida',
    rowInitialAmount: 'Aportación inicial',
    rowUsdEquivalent: 'Equivalente en USD',
    calculating: 'Calculando…',
    rowExchangeRate: 'Tipo de cambio',
    rowName: 'Nombre',
    rowPercentage: 'Porcentaje',
    agree: 'Confirmo que la información proporcionada es verídica y corresponde a mi documentación oficial vigente.',

    err: {
      step1Required: 'Completa nombre, teléfono, correo y RFC / Tax ID.',
      invalidEmail: 'Correo electrónico inválido.',
      addressRequired: 'Completa todos los campos del domicilio.',
      idTypeRequired: 'Selecciona el tipo de identificación oficial.',
      idTypeOtherRequired: 'Especifica el tipo de documento.',
      economicActivityRequired: 'Selecciona tu actividad económica principal.',
      economicActivityOtherRequired: 'Especifica tu actividad económica.',
      fundsOriginRequired: 'Selecciona el origen principal de los recursos.',
      fundsOriginOtherRequired: 'Especifica el origen de los recursos.',
      planTypeRequired: 'Selecciona el tipo de Plan de Ahorro.',
      amountRequired: 'Indica el monto de aportación inicial.',
      currencyRequired: 'Selecciona la divisa de aportación.',
      waitingRate: 'Esperando el tipo de cambio del día — intenta de nuevo en un momento.',
      belowMinimum: (amount, currency) => `El monto mínimo es ${amount} ${currency}.`,
      beneficiariesRequired: 'Completa nombre, parentesco, porcentaje, teléfono y correo de cada beneficiario.',
      relationshipOtherRequired: 'Especifica el parentesco del beneficiario.',
      invalidBeneficiaryEmail: 'Hay un correo de beneficiario inválido.',
      percentageMismatch: (pct) => `El porcentaje total debe sumar 100% (actualmente ${pct}%).`,
      agreeRequired: 'Confirma que la información proporcionada es verídica.',
      sendFailed: 'No se pudo enviar el cuestionario. Intenta de nuevo.',
    },
  },

  en: {
    stepLabels: ['Principal', 'Identification', 'Activity', 'Savings Plan', 'Beneficiaries', 'Review'],
    notFramed: 'This page is only available within the ARKA portal.',
    heading: 'Mandate Agreement Questionnaire',
    intro: 'Complete the following information to prepare your Mandate Agreement. The data must match your official identification and KYC documentation. It takes approximately 5 minutes.',
    start: 'Begin',
    back: '← Back',
    next: 'Next →',
    sending: 'Sending…',
    submit: 'Submit questionnaire',
    successTitle: 'Questionnaire submitted',
    successBody: 'We have received your information. Our team will prepare your Mandate Agreement and will contact you through the email provided.',

    s1Heading: '1. Principal — General Information',
    fullName: 'Full Name of the Principal',
    fullNameHint: 'Exactly as it appears on your official ID',
    fullNamePh: 'Full name',
    nationality: 'Nationality',
    taxId: 'RFC / Tax ID',
    phone: 'Phone with international dialing code',
    phonePh: '+1 555 000 0000',
    email: 'Email you registered with',
    emailHint: 'The email you registered with in the ARKA portal',
    emailPh: 'email@example.com',
    addressLabel: 'Address',
    street: 'Street',
    number: 'Number',
    colony: 'Neighborhood',
    zip: 'Postal code',
    city: 'City / Municipality',
    state: 'State',
    country: 'Country',

    s2Heading: '2. Official Identification',
    idType: 'Type of official identification',
    specifyDocType: 'Specify the document type',

    s3Heading: '3. Economic Activity & Source of Funds',
    economicActivity: 'Main economic activity',
    specifyActivity: 'Specify your economic activity',
    fundsOrigin: 'Main source of the funds to be contributed',
    specifyFundsOrigin: 'Specify the source of funds',

    s4Heading: '4. Selected Savings Plan',
    planType: 'Savings Plan Type',
    planTypeHint: `B2B segment — minimum contribution $500,000.00 MXN or the equivalent of $${USD_MINIMUM.toFixed(2)} USD`,
    planMaxLoss: 'Maximum loss risk',
    planTerm: 'Fixed term',
    planMinInvestment: 'Minimum investment',
    planReturn: 'Return',
    planPayout: 'Return payout',
    planPenalty: 'Early withdrawal penalty',
    initialAmount: 'Initial contribution — amount in figures',
    initialAmountPh: '10000',
    belowMinimum: (amount, currency) => `The minimum amount is ${amount} ${currency}.`,
    currency: 'Contribution currency',
    usdApproxNote: '* The USD amount is approximate and may vary based on the exchange rate in effect on the day of transfer.',
    rateLoading: 'Getting today’s exchange rate…',
    rateError: 'Could not retrieve the exchange rate.',
    retry: 'Retry',
    exchangeEquivalent: 'Approximate equivalent:',
    exchangeRateOfDay: 'Today’s exchange rate:',

    s5Heading: '5. Beneficiaries',
    totalAssigned: 'Total assigned:',
    beneficiariesHint: (n) => `Add up to ${n} beneficiaries. Percentages must add up to 100%.`,
    minorNote: 'Beneficiaries who are minors will be represented by a legal guardian acting on the minor’s behalf.',
    beneficiaryN: (n) => `Beneficiary ${n}`,
    remove: 'Remove',
    beneficiaryNameHint: 'As it appears on the birth certificate and official ID',
    relationship: 'Relationship',
    selectPh: 'Select…',
    percentage: 'Assigned percentage (%)',
    specifyRelationship: 'Specify the relationship',
    beneficiaryPhone: 'Phone',
    beneficiaryEmail: 'Email',
    addBeneficiary: '+ Add beneficiary',
    maxBeneficiaries: (n) => `Maximum ${n} beneficiaries`,
    distributeEvenly: 'Distribute % evenly',

    s6Heading: '6. Review',
    reviewIntro: 'Review that all your information is correct before submitting.',
    section1: '1. Principal — General Information',
    section2: '2. Official Identification',
    section3: '3. Economic Activity & Source of Funds',
    section4: '4. Savings Plan',
    section5: '5. Beneficiaries',
    rowFullName: 'Full name',
    rowNationality: 'Nationality',
    rowTaxId: 'RFC / Tax ID',
    rowPhone: 'Phone',
    rowEmail: 'Email',
    rowAddress: 'Address',
    rowType: 'Type',
    rowEconomicActivity: 'Economic activity',
    rowFundsOrigin: 'Source of funds',
    rowPlanType: 'Plan type',
    rowReturn: 'Return',
    rowTerm: 'Fixed term',
    rowMaxLoss: 'Maximum loss risk',
    rowInitialAmount: 'Initial contribution',
    rowUsdEquivalent: 'USD equivalent',
    calculating: 'Calculating…',
    rowExchangeRate: 'Exchange rate',
    rowName: 'Name',
    rowPercentage: 'Percentage',
    agree: 'I confirm that the information provided is truthful and corresponds to my current official documentation.',

    err: {
      step1Required: 'Complete name, phone, email, and RFC / Tax ID.',
      invalidEmail: 'Invalid email address.',
      addressRequired: 'Complete all address fields.',
      idTypeRequired: 'Select the type of official identification.',
      idTypeOtherRequired: 'Specify the document type.',
      economicActivityRequired: 'Select your main economic activity.',
      economicActivityOtherRequired: 'Specify your economic activity.',
      fundsOriginRequired: 'Select the main source of funds.',
      fundsOriginOtherRequired: 'Specify the source of funds.',
      planTypeRequired: 'Select the Savings Plan type.',
      amountRequired: 'Enter the initial contribution amount.',
      currencyRequired: 'Select the contribution currency.',
      waitingRate: 'Waiting for today’s exchange rate — try again in a moment.',
      belowMinimum: (amount, currency) => `The minimum amount is ${amount} ${currency}.`,
      beneficiariesRequired: 'Complete name, relationship, percentage, phone, and email for each beneficiary.',
      relationshipOtherRequired: 'Specify the beneficiary’s relationship.',
      invalidBeneficiaryEmail: 'One of the beneficiary emails is invalid.',
      percentageMismatch: (pct) => `The total percentage must add up to 100% (currently ${pct}%).`,
      agreeRequired: 'Confirm that the information provided is truthful.',
      sendFailed: 'Could not submit the questionnaire. Try again.',
    },
  },
}

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs tracking-[0.06em] uppercase text-white/70 font-medium">
        {label} {required && <span style={{ color: ACCENT_HOVER }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-white/45">{hint}</p>}
    </div>
  )
}

const inputClass =
  'w-full bg-white/[0.05] border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/35 focus:outline-none focus:border-[#005c54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

function TextInput({ className = '', ...props }) {
  return <input {...props} className={`${inputClass} ${className}`} />
}

function PillGroup({ options, value, onChange, columns = 2, lang }) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : ''}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150 ${
            value === opt.value
              ? 'border-[#005c54] bg-[#004C45]/25 text-white'
              : 'border-white/10 bg-white/[0.03] text-white/75 hover:border-white/25 hover:text-white'
          }`}
        >
          {lang === 'en' ? opt.en : opt.es}
        </button>
      ))}
    </div>
  )
}

function SummaryRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-white/50 text-xs shrink-0">{label}</span>
      <span className="text-white/95 text-sm text-right">{value}</span>
    </div>
  )
}

function SummarySection({ title, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-0.5">
      <p className="text-xs tracking-[0.12em] uppercase text-white/55 font-medium mb-2">{title}</p>
      {children}
    </div>
  )
}

function emptyBeneficiary() {
  return { fullName: '', relationship: '', relationshipOther: '', percentage: '', phone: '', email: '' }
}

// Decodes a JWT payload without verifying the signature — used only to prefill the
// contractual email (and detect the B2Core UI language) from the B2Core session.
// B2Core is the only origin allowed to frame this page (see vercel.json), so the
// token can be trusted for this purpose.
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

function normalizeLang(raw) {
  const v = String(raw || '').toLowerCase()
  if (v.startsWith('en')) return 'en'
  if (v.startsWith('es')) return 'es'
  return null
}

// Reads a language hint straight from the URL (e.g. B2Core embedding this page
// with ?lang=en) so the form renders correctly on first paint, before any
// postMessage from the parent portal arrives.
function detectLangFromUrl() {
  try {
    const q = new URLSearchParams(window.location.search)
    return normalizeLang(q.get('lang') || q.get('locale') || q.get('language'))
  } catch {
    return null
  }
}

function formatMoney(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return ''
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// True only when the page is rendered inside an iframe (e.g. embedded in B2Core).
// Direct browser navigation to this URL renders the blocked screen below instead.
function isEmbedded() {
  try {
    return window.self !== window.top
  } catch {
    return true // cross-origin frame access throws — it's framed by a different origin
  }
}

export default function ContractIntake() {
  const [framed] = useState(isEmbedded)
  const [lang, setLang] = useState(() => detectLangFromUrl() || 'es')
  const t = T[lang] || T.es
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [error, setError] = useState('')
  const [sendStatus, setSendStatus] = useState('idle') // idle | sending | sent | error
  const idCounter = useRef(1)

  const [form, setForm] = useState({
    fullName: '', nationality: '', phone: '', email: '', taxId: '',
    addressStreet: '', addressNumber: '', addressColony: '', addressZip: '', addressCity: '', addressState: '', addressCountry: '',
    idType: '', idTypeOther: '',
    economicActivity: '', economicActivityOther: '', fundsOrigin: '', fundsOriginOther: '',
    planType: '', initialAmountNumber: '', currency: '',
  })

  const [beneficiaries, setBeneficiaries] = useState([{ ...emptyBeneficiary(), percentage: 100, _id: 0 }])
  const [agree, setAgree] = useState(false)

  // Pulls the contractual email — and UI language — from the B2Core portal
  // session (SSO), so both always match what the client sees in the portal.
  // Falls back to manual entry / Spanish if B2Core doesn't respond (e.g.
  // previewing outside the portal).
  const [ssoEmail, setSsoEmail] = useState(null)

  useEffect(() => {
    if (!framed) return
    function handleMessage(event) {
      // Reject messages from any frame that isn't the trusted B2Core portal.
      if (!ALLOWED_PARENT_ORIGINS.includes(event.origin)) return
      const data = event.data
      if (!data || typeof data !== 'object') return

      // B2Core may broadcast the active portal language directly.
      if (data.type === 'embed-locale' || data.type === 'embed-language' || data.type === 'embed-lang-change') {
        const detected = normalizeLang(data.locale || data.language || data.lang)
        if (detected) setLang(detected)
        return
      }

      if (data.type !== 'embed-jwt-token') return
      const token = data.token || data.jwt || data.access_token
      if (!token) return
      const payload = decodeJwtPayload(token)
      const email =
        payload?.email ||
        payload?.user_email ||
        (typeof payload?.sub === 'string' && payload.sub.includes('@') ? payload.sub : null)
      if (email) {
        setSsoEmail(email)
        setForm((f) => ({ ...f, email }))
      }
      // Some B2Core deployments carry the user's locale as a JWT claim.
      const jwtLang = normalizeLang(payload?.locale || payload?.lang || payload?.language)
      if (jwtLang) setLang(jwtLang)
    }
    window.addEventListener('message', handleMessage)
    window.parent.postMessage({ type: 'embed-iframe-ready' }, '*')
    window.parent.postMessage({ type: 'embed-request-jwt-token' }, '*')
    return () => window.removeEventListener('message', handleMessage)
  }, [framed])

  // Approximate same-day USD/MXN exchange rate, fetched once when MXN is selected
  const [mxnRate, setMxnRate] = useState(null)
  const [rateStatus, setRateStatus] = useState('idle') // idle | loading | loaded | error

  useEffect(() => {
    if (form.currency !== 'MXN' || mxnRate !== null || rateStatus === 'loading') return
    setRateStatus('loading')
    fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=MXN')
      .then((r) => r.json())
      .then((data) => {
        const rate = data?.rates?.MXN
        if (!rate) throw new Error('no rate')
        setMxnRate(rate)
        setRateStatus('loaded')
      })
      .catch(() => setRateStatus('error'))
  }, [form.currency, mxnRate, rateStatus])

  const usdEquivalent =
    form.currency === 'USD'
      ? (form.initialAmountNumber ? Number(form.initialAmountNumber) : null)
      : (mxnRate && form.initialAmountNumber ? Number(form.initialAmountNumber) / mxnRate : null)

  const exchangeRateLabel = form.currency === 'MXN' && mxnRate ? `1 USD ≈ ${mxnRate.toFixed(2)} MXN` : ''

  const currentMinimum = form.currency === 'MXN' ? MXN_MINIMUM : form.currency === 'USD' ? USD_MINIMUM : null
  const belowMinimum =
    currentMinimum !== null && form.initialAmountNumber !== '' && Number(form.initialAmountNumber) < currentMinimum

  const selectedPlan = SAVINGS_PLANS.find((p) => p.name === form.planType)

  const fullAddress = [
    [form.addressStreet, form.addressNumber].filter(Boolean).join(' '),
    form.addressColony,
    form.addressZip ? `CP ${form.addressZip}` : '',
    form.addressCity,
    form.addressState,
    form.addressCountry,
  ].filter(Boolean).join(', ')

  const update = (field) => (e) => {
    const value = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e
    setForm((f) => ({ ...f, [field]: value }))
  }

  const handleAmountChange = (e) => {
    setForm((f) => ({ ...f, initialAmountNumber: e.target.value }))
  }

  const handleCurrencyChange = (val) => {
    setForm((f) => ({ ...f, currency: val }))
  }

  const updateBeneficiary = (id, field, value) => {
    setBeneficiaries((list) => list.map((b) => (b._id === id ? { ...b, [field]: value } : b)))
  }

  const addBeneficiary = () => {
    if (beneficiaries.length >= MAX_BENEFICIARIES) return
    idCounter.current += 1
    setBeneficiaries((list) => [...list, { ...emptyBeneficiary(), _id: idCounter.current }])
  }

  const removeBeneficiary = (id) => {
    setBeneficiaries((list) => (list.length > 1 ? list.filter((b) => b._id !== id) : list))
  }

  const distributeEvenly = () => {
    setBeneficiaries((list) => {
      const n = list.length
      const base = Math.floor(100 / n)
      const remainder = 100 - base * n
      return list.map((b, i) => ({ ...b, percentage: i === n - 1 ? base + remainder : base }))
    })
  }

  const totalPercentage = beneficiaries.reduce((s, b) => s + (Number(b.percentage) || 0), 0)

  const go = (next, direction = 1) => {
    setError('')
    setDir(direction)
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validateStep = () => {
    if (step === 1) {
      if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.taxId.trim())
        return t.err.step1Required
      if (!emailRe.test(form.email)) return t.err.invalidEmail
      if (!form.addressStreet.trim() || !form.addressNumber.trim() || !form.addressColony.trim() ||
          !form.addressZip.trim() || !form.addressCity.trim() || !form.addressState.trim() || !form.addressCountry.trim())
        return t.err.addressRequired
    }
    if (step === 2) {
      if (!form.idType) return t.err.idTypeRequired
      if (form.idType === 'Otro' && !form.idTypeOther.trim()) return t.err.idTypeOtherRequired
    }
    if (step === 3) {
      if (!form.economicActivity) return t.err.economicActivityRequired
      if (form.economicActivity === 'Otro' && !form.economicActivityOther.trim()) return t.err.economicActivityOtherRequired
      if (!form.fundsOrigin) return t.err.fundsOriginRequired
      if (form.fundsOrigin === 'Otro' && !form.fundsOriginOther.trim()) return t.err.fundsOriginOtherRequired
    }
    if (step === 4) {
      if (!form.planType) return t.err.planTypeRequired
      if (!form.initialAmountNumber || Number(form.initialAmountNumber) <= 0) return t.err.amountRequired
      if (!form.currency) return t.err.currencyRequired
      if (form.currency === 'MXN' && !mxnRate) return t.err.waitingRate
      if (belowMinimum) return t.err.belowMinimum(formatMoney(currentMinimum), form.currency)
    }
    if (step === 5) {
      for (const b of beneficiaries) {
        if (!b.fullName.trim() || !b.relationship.trim() || !b.percentage || !b.phone.trim() || !b.email.trim())
          return t.err.beneficiariesRequired
        if (b.relationship === 'Otro' && !b.relationshipOther.trim()) return t.err.relationshipOtherRequired
        if (!emailRe.test(b.email)) return t.err.invalidBeneficiaryEmail
      }
      if (totalPercentage !== 100) return t.err.percentageMismatch(totalPercentage)
    }
    if (step === 6) {
      if (!agree) return t.err.agreeRequired
    }
    return ''
  }

  const next = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    go(step + 1, 1)
  }
  const back = () => go(step - 1, -1)

  const submit = async () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setSendStatus('sending')
    try {
      const res = await fetch('/api/send-contract-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mandante: {
            ...form,
            address: fullAddress,
            usdEquivalent: usdEquivalent !== null ? formatMoney(usdEquivalent) : '',
            exchangeRate: exchangeRateLabel,
            planReturnRate: selectedPlan?.returnRateEs || '',
            planTerm: selectedPlan?.termEs || '',
            planMaxLoss: selectedPlan?.maxLoss || '',
            planPayout: selectedPlan?.payoutEs || '',
            planPenalty: selectedPlan?.penaltyEs || '',
          },
          beneficiaries: beneficiaries.map(({ _id, relationship, relationshipOther, ...rest }) => ({
            ...rest,
            relationship: relationship === 'Otro' ? relationshipOther : relationship,
          })),
        }),
      })
      if (!res.ok) throw new Error('Send failed')
      setSendStatus('sent')
      go(7, 1)
    } catch {
      setSendStatus('error')
      setError(t.err.sendFailed)
    }
  }

  const progressPct = step >= 1 && step <= 6 ? Math.round((step / 6) * 100) : step >= 7 ? 100 : 0

  if (!framed) {
    return (
      <main className="min-h-screen bg-[rgb(25,25,25)] flex items-center justify-center px-6 text-center">
        <p className="text-white/50 text-sm max-w-sm">
          {t.notFramed}
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[rgb(25,25,25)] px-5 sm:px-10 md:px-16 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.35em] uppercase text-white/60 mb-3">ARKA Global Liquidity</p>
          <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-medium text-white">
            {t.heading}
          </h1>
        </div>

        {step >= 1 && step <= 6 && (
          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-xs tracking-[0.15em] uppercase text-white/55">
              <span>{t.stepLabels[step - 1]}</span>
              <span>{step} / 6</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div className="h-full" style={{ backgroundColor: ACCENT_HOVER }}
                initial={false} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.35 }} />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" custom={dir}>

          {step === 0 && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="text-center space-y-8 py-8">
              <p className="text-white/80 text-base leading-relaxed max-w-lg mx-auto">
                {t.intro}
              </p>
              <button onClick={() => go(1, 1)}
                className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-semibold bg-[#004C45] text-white hover:bg-[#005c54] px-12 py-4 rounded-sm transition-all duration-300">
                {t.start}
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
              className="space-y-5">
              <h2 className="text-lg font-semibold text-white mb-1">{t.s1Heading}</h2>
              <Field label={t.fullName} required hint={t.fullNameHint}>
                <TextInput value={form.fullName} onChange={update('fullName')} placeholder={t.fullNamePh} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t.nationality} required>
                  <TextInput value={form.nationality} onChange={update('nationality')} placeholder={t.nationality} />
                </Field>
                <Field label={t.taxId} required>
                  <TextInput value={form.taxId} onChange={update('taxId')} placeholder={t.taxId} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t.phone} required>
                  <TextInput value={form.phone} onChange={update('phone')} placeholder={t.phonePh} />
                </Field>
                <Field label={t.email} required hint={t.emailHint}>
                  <TextInput type="email" value={form.email} onChange={update('email')} placeholder={t.emailPh}
                    disabled={!!ssoEmail} />
                </Field>
              </div>

              <p className="text-xs tracking-[0.06em] uppercase text-white/70 font-medium pt-2">
                {t.addressLabel} <span style={{ color: ACCENT_HOVER }}>*</span>
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Field label={t.street} required>
                    <TextInput value={form.addressStreet} onChange={update('addressStreet')} placeholder={t.street} />
                  </Field>
                </div>
                <Field label={t.number} required>
                  <TextInput value={form.addressNumber} onChange={update('addressNumber')} placeholder={t.number} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t.colony} required>
                  <TextInput value={form.addressColony} onChange={update('addressColony')} placeholder={t.colony} />
                </Field>
                <Field label={t.zip} required>
                  <TextInput value={form.addressZip} onChange={update('addressZip')} placeholder={t.zip} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label={t.city} required>
                  <TextInput value={form.addressCity} onChange={update('addressCity')} placeholder={t.city} />
                </Field>
                <Field label={t.state} required>
                  <TextInput value={form.addressState} onChange={update('addressState')} placeholder={t.state} />
                </Field>
                <Field label={t.country} required>
                  <TextInput value={form.addressCountry} onChange={update('addressCountry')} placeholder={t.country} />
                </Field>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
              className="space-y-5">
              <h2 className="text-lg font-semibold text-white mb-1">{t.s2Heading}</h2>
              <Field label={t.idType} required>
                <PillGroup options={ID_TYPES} value={form.idType} onChange={(v) => setForm((f) => ({ ...f, idType: v }))} lang={lang} />
              </Field>
              {form.idType === 'Otro' && (
                <Field label={t.specifyDocType} required>
                  <TextInput value={form.idTypeOther} onChange={update('idTypeOther')} />
                </Field>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
              className="space-y-5">
              <h2 className="text-lg font-semibold text-white mb-1">{t.s3Heading}</h2>
              <Field label={t.economicActivity} required>
                <PillGroup options={ECONOMIC_ACTIVITIES} value={form.economicActivity} onChange={(v) => setForm((f) => ({ ...f, economicActivity: v }))} lang={lang} />
              </Field>
              {form.economicActivity === 'Otro' && (
                <Field label={t.specifyActivity} required>
                  <TextInput value={form.economicActivityOther} onChange={update('economicActivityOther')} />
                </Field>
              )}
              <Field label={t.fundsOrigin} required>
                <PillGroup options={FUNDS_ORIGINS} value={form.fundsOrigin} onChange={(v) => setForm((f) => ({ ...f, fundsOrigin: v }))} lang={lang} />
              </Field>
              {form.fundsOrigin === 'Otro' && (
                <Field label={t.specifyFundsOrigin} required>
                  <TextInput value={form.fundsOriginOther} onChange={update('fundsOriginOther')} />
                </Field>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
              className="space-y-5">
              <h2 className="text-lg font-semibold text-white mb-1">{t.s4Heading}</h2>

              <Field label={t.planType} required hint={t.planTypeHint}>
                <div className="space-y-2">
                  {SAVINGS_PLANS.map((plan) => (
                    <button key={plan.name} type="button"
                      onClick={() => setForm((f) => ({ ...f, planType: plan.name }))}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 ${
                        form.planType === plan.name
                          ? 'border-[#005c54] bg-[#004C45]/25 text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/75 hover:border-white/25 hover:text-white'
                      }`}>
                      <div className="flex justify-between items-center gap-3">
                        <span className="font-medium text-sm">{plan.name}</span>
                        <span className="text-xs text-white/50 shrink-0">
                          {lang === 'en' ? plan.returnRateEn : plan.returnRateEs} · {lang === 'en' ? plan.termEn : plan.termEs}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </Field>

              {selectedPlan && (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-3 text-sm">
                  <p className="text-white/75">{lang === 'en' ? selectedPlan.descriptionEn : selectedPlan.descriptionEs}</p>
                  <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                    {[
                      [t.planMaxLoss, selectedPlan.maxLoss],
                      [t.planTerm, lang === 'en' ? selectedPlan.termEn : selectedPlan.termEs],
                      [t.planMinInvestment, selectedPlan.minInvestment],
                      [t.planReturn, lang === 'en' ? selectedPlan.returnRateEn : selectedPlan.returnRateEs],
                      [t.planPayout, lang === 'en' ? selectedPlan.payoutEn : selectedPlan.payoutEs],
                      [t.planPenalty, lang === 'en' ? selectedPlan.penaltyEn : selectedPlan.penaltyEs],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-white/45 text-[11px] tracking-[0.06em] uppercase">{label}</p>
                        <p className="text-white/90 text-xs mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t.initialAmount} required>
                  <TextInput type="number" min="0" step="0.01" value={form.initialAmountNumber} onChange={handleAmountChange}
                    placeholder={t.initialAmountPh} className={belowMinimum ? 'border-red-500/70' : ''} />
                  {belowMinimum && (
                    <p className="text-xs text-red-400 mt-1">
                      {t.belowMinimum(`$${formatMoney(currentMinimum)}`, form.currency)}
                    </p>
                  )}
                </Field>
                <Field label={t.currency} required>
                  <PillGroup options={CURRENCIES} value={form.currency} onChange={handleCurrencyChange} lang={lang} />
                </Field>
              </div>

              <p className="text-white/40 text-xs">
                {t.usdApproxNote}
              </p>

              {form.currency === 'MXN' && (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm space-y-1">
                  {rateStatus === 'loading' && <p className="text-white/55">{t.rateLoading}</p>}
                  {rateStatus === 'error' && (
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-red-400 text-xs">{t.rateError}</p>
                      <button type="button" onClick={() => setRateStatus('idle')}
                        className="text-xs text-white/70 hover:text-white underline shrink-0">
                        {t.retry}
                      </button>
                    </div>
                  )}
                  {rateStatus === 'loaded' && mxnRate && (
                    <>
                      <p className="text-white/85">
                        {t.exchangeEquivalent} <span className="font-semibold text-white">${formatMoney(usdEquivalent)} USD</span>*
                      </p>
                      <p className="text-white/50 text-xs">{t.exchangeRateOfDay} {exchangeRateLabel}</p>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
              className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{t.s5Heading}</h2>
                <span className={`text-sm tabular-nums font-semibold ${totalPercentage === 100 ? 'text-[#46B58F]' : 'text-[#E0705A]'}`}>
                  {t.totalAssigned} {totalPercentage}%
                </span>
              </div>
              <p className="text-white/55 text-xs">
                {t.beneficiariesHint(MAX_BENEFICIARIES)}
              </p>
              <p className="text-white/40 text-xs italic">
                {t.minorNote}
              </p>

              {beneficiaries.map((b, i) => (
                <div key={b._id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs tracking-[0.1em] uppercase text-white/60 font-medium">
                      {t.beneficiaryN(i + 1)}
                    </p>
                    {beneficiaries.length > 1 && (
                      <button type="button" onClick={() => removeBeneficiary(b._id)}
                        className="text-xs tracking-[0.06em] uppercase text-white/50 hover:text-red-400 transition-colors">
                        {t.remove}
                      </button>
                    )}
                  </div>
                  <Field label={t.rowFullName} required hint={t.beneficiaryNameHint}>
                    <TextInput value={b.fullName} onChange={(e) => updateBeneficiary(b._id, 'fullName', e.target.value)} />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={t.relationship} required>
                      <select value={b.relationship} onChange={(e) => updateBeneficiary(b._id, 'relationship', e.target.value)}
                        className={inputClass}>
                        <option value="">{t.selectPh}</option>
                        {RELATIONSHIPS.map((r) => (
                          <option key={r.value} value={r.value}>{lang === 'en' ? r.en : r.es}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t.percentage} required>
                      <TextInput type="number" min="0" max="100" value={b.percentage}
                        onChange={(e) => updateBeneficiary(b._id, 'percentage', e.target.value)} />
                    </Field>
                  </div>
                  {b.relationship === 'Otro' && (
                    <Field label={t.specifyRelationship} required>
                      <TextInput value={b.relationshipOther} onChange={(e) => updateBeneficiary(b._id, 'relationshipOther', e.target.value)} />
                    </Field>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={t.beneficiaryPhone} required>
                      <TextInput value={b.phone} onChange={(e) => updateBeneficiary(b._id, 'phone', e.target.value)} />
                    </Field>
                    <Field label={t.beneficiaryEmail} required>
                      <TextInput type="email" value={b.email} onChange={(e) => updateBeneficiary(b._id, 'email', e.target.value)} />
                    </Field>
                  </div>
                </div>
              ))}

              <div className="flex gap-3">
                <button type="button" onClick={addBeneficiary} disabled={beneficiaries.length >= MAX_BENEFICIARIES}
                  className="flex-1 text-xs tracking-[0.1em] uppercase font-medium border border-white/15 text-white/75 hover:border-white/35 hover:text-white px-4 py-3 rounded-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/15 disabled:hover:text-white/75">
                  {beneficiaries.length >= MAX_BENEFICIARIES ? t.maxBeneficiaries(MAX_BENEFICIARIES) : t.addBeneficiary}
                </button>
                <button type="button" onClick={distributeEvenly}
                  className="flex-1 text-xs tracking-[0.1em] uppercase font-medium border border-white/15 text-white/75 hover:border-white/35 hover:text-white px-4 py-3 rounded-sm transition-all duration-300">
                  {t.distributeEvenly}
                </button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
              className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-1">{t.s6Heading}</h2>
              <p className="text-white/55 text-sm mb-2">{t.reviewIntro}</p>

              <SummarySection title={t.section1}>
                <SummaryRow label={t.rowFullName} value={form.fullName} />
                <SummaryRow label={t.rowNationality} value={form.nationality} />
                <SummaryRow label={t.rowTaxId} value={form.taxId} />
                <SummaryRow label={t.rowPhone} value={form.phone} />
                <SummaryRow label={t.rowEmail} value={form.email} />
                <SummaryRow label={t.rowAddress} value={fullAddress} />
              </SummarySection>

              <SummarySection title={t.section2}>
                <SummaryRow label={t.rowType} value={form.idType === 'Otro' ? form.idTypeOther : (ID_TYPES.find(o => o.value === form.idType)?.[lang === 'en' ? 'en' : 'es'] || form.idType)} />
              </SummarySection>

              <SummarySection title={t.section3}>
                <SummaryRow label={t.rowEconomicActivity} value={form.economicActivity === 'Otro' ? form.economicActivityOther : (ECONOMIC_ACTIVITIES.find(o => o.value === form.economicActivity)?.[lang === 'en' ? 'en' : 'es'] || form.economicActivity)} />
                <SummaryRow label={t.rowFundsOrigin} value={form.fundsOrigin === 'Otro' ? form.fundsOriginOther : (FUNDS_ORIGINS.find(o => o.value === form.fundsOrigin)?.[lang === 'en' ? 'en' : 'es'] || form.fundsOrigin)} />
              </SummarySection>

              <SummarySection title={t.section4}>
                <SummaryRow label={t.rowPlanType} value={form.planType} />
                <SummaryRow label={t.rowReturn} value={lang === 'en' ? selectedPlan?.returnRateEn : selectedPlan?.returnRateEs} />
                <SummaryRow label={t.rowTerm} value={lang === 'en' ? selectedPlan?.termEn : selectedPlan?.termEs} />
                <SummaryRow label={t.rowMaxLoss} value={selectedPlan?.maxLoss} />
                <SummaryRow label={t.rowInitialAmount} value={form.initialAmountNumber ? `${formatMoney(form.initialAmountNumber)} ${form.currency}` : ''} />
                {form.currency === 'MXN' && (
                  <>
                    <SummaryRow label={t.rowUsdEquivalent} value={usdEquivalent !== null ? `$${formatMoney(usdEquivalent)} USD*` : t.calculating} />
                    <SummaryRow label={t.rowExchangeRate} value={exchangeRateLabel} />
                  </>
                )}
              </SummarySection>

              <SummarySection title={t.section5}>
                {beneficiaries.map((b, i) => (
                  <div key={b._id} className={i > 0 ? 'pt-3 mt-3 border-t border-white/10' : ''}>
                    <p className="text-white/70 text-xs font-medium mb-1">{t.beneficiaryN(i + 1)}</p>
                    <SummaryRow label={t.rowName} value={b.fullName} />
                    <SummaryRow label={t.relationship} value={b.relationship === 'Otro' ? b.relationshipOther : (RELATIONSHIPS.find(o => o.value === b.relationship)?.[lang === 'en' ? 'en' : 'es'] || b.relationship)} />
                    <SummaryRow label={t.rowPercentage} value={b.percentage ? `${b.percentage}%` : ''} />
                    <SummaryRow label={t.rowPhone} value={b.phone} />
                    <SummaryRow label={t.rowEmail} value={b.email} />
                  </div>
                ))}
              </SummarySection>

              <label className="flex items-start gap-3 text-sm text-white/80 cursor-pointer pt-2">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-[#004C45]" />
                <span>{t.agree}</span>
              </label>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 py-12">
              <p className="text-4xl">✓</p>
              <h2 className="text-xl font-semibold text-white">{t.successTitle}</h2>
              <p className="text-white/70 text-sm max-w-md mx-auto">
                {t.successBody}
              </p>
            </motion.div>
          )}

        </AnimatePresence>

        {error && step >= 1 && step <= 6 && (
          <p className="text-sm text-red-400 mt-5">{error}</p>
        )}

        {step >= 1 && step <= 6 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
            <button onClick={back}
              className="text-xs tracking-[0.1em] uppercase font-medium text-white/55 hover:text-white/85 transition-colors disabled:opacity-0"
              disabled={step === 1}>
              {t.back}
            </button>
            {step < 6 ? (
              <button onClick={next}
                className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase font-semibold bg-[#004C45] text-white hover:bg-[#005c54] px-10 py-3.5 rounded-sm transition-all duration-300">
                {t.next}
              </button>
            ) : (
              <button onClick={submit} disabled={sendStatus === 'sending'}
                className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase font-semibold bg-[#004C45] text-white hover:bg-[#005c54] px-10 py-3.5 rounded-sm transition-all duration-300 disabled:opacity-50">
                {sendStatus === 'sending' ? t.sending : t.submit}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
