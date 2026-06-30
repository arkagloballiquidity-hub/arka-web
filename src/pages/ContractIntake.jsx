import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { montoEnLetras } from '@/utils/numberToWordsEs'

const ID_TYPES = ['INE / Identificación nacional', 'Pasaporte', 'Licencia de conducir', 'Documento migratorio', 'Otro']

const ECONOMIC_ACTIVITIES = [
  'Empresario / dueño de negocio', 'Profesionista independiente', 'Empleado', 'Inversionista',
  'Comerciante', 'Sector inmobiliario', 'Sector financiero', 'Tecnología / servicios digitales',
  'Criptoactivos / activos digitales', 'Otro',
]

const FUNDS_ORIGINS = [
  'Ahorro personal', 'Sueldos u honorarios', 'Utilidades de negocio', 'Venta de inmueble',
  'Venta de empresa o participación accionaria', 'Rendimientos de inversiones previas',
  'Criptoactivos', 'Herencia', 'Otro',
]

const PLAN_TYPES = ['Flexible', 'Fijo / Fixed']

const CURRENCIES = ['USD', 'MXN']

const STEP_LABELS = ['Mandante', 'Identificación', 'Actividad', 'Plan de Ahorro', 'Beneficiarios', 'Revisión']

const ACCENT = '#004C45'
const ACCENT_HOVER = '#005c54'

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
  'w-full bg-white/[0.05] border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/35 focus:outline-none focus:border-[#005c54] transition-colors'

function TextInput(props) {
  return <input {...props} className={inputClass} />
}

function TextArea(props) {
  return <textarea {...props} className={inputClass} />
}

function PillGroup({ options, value, onChange, columns = 2 }) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : ''}`}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150 ${
            value === opt
              ? 'border-[#005c54] bg-[#004C45]/25 text-white'
              : 'border-white/10 bg-white/[0.03] text-white/75 hover:border-white/25 hover:text-white'
          }`}
        >
          {opt}
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
  return { fullName: '', relationship: '', percentage: '', idType: '', idNumber: '', idExpiry: '', contact: '' }
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
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [error, setError] = useState('')
  const [sendStatus, setSendStatus] = useState('idle') // idle | sending | sent | error
  const idCounter = useRef(1)

  const [form, setForm] = useState({
    fullName: '', nationality: '', phone: '', email: '', address: '',
    idType: '', idTypeOther: '', idNumber: '', idIssuingAuthority: '', idIssueDate: '', idExpiryDate: '',
    economicActivity: '', economicActivityOther: '', fundsOrigin: '', fundsOriginOther: '', activityDescription: '',
    planType: '', initialAmountNumber: '', initialAmountWords: '', currency: '',
  })
  const [amountWordsTouched, setAmountWordsTouched] = useState(false)

  const [beneficiaries, setBeneficiaries] = useState([{ ...emptyBeneficiary(), percentage: 100, _id: 0 }])
  const [agree, setAgree] = useState(false)

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

  const update = (field) => (e) => {
    const value = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e
    setForm((f) => ({ ...f, [field]: value }))
  }

  const recomputeAmountWords = (amount, currency) => {
    if (amountWordsTouched) return
    const words = montoEnLetras(amount, currency)
    setForm((f) => ({ ...f, initialAmountWords: words }))
  }

  const handleAmountChange = (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, initialAmountNumber: value }))
    recomputeAmountWords(value, form.currency)
  }

  const handleCurrencyChange = (val) => {
    setForm((f) => ({ ...f, currency: val }))
    recomputeAmountWords(form.initialAmountNumber, val)
  }

  const updateBeneficiary = (id, field, value) => {
    setBeneficiaries((list) => list.map((b) => (b._id === id ? { ...b, [field]: value } : b)))
  }

  const addBeneficiary = () => {
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

  const validateStep = () => {
    if (step === 1) {
      if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim())
        return 'Completa nombre, teléfono, correo y domicilio.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Correo electrónico inválido.'
    }
    if (step === 2) {
      if (!form.idType) return 'Selecciona el tipo de identificación oficial.'
      if (form.idType === 'Otro' && !form.idTypeOther.trim()) return 'Especifica el tipo de documento.'
      if (!form.idNumber.trim() || !form.idIssuingAuthority.trim()) return 'Completa número de identificación y autoridad emisora.'
      if (!form.idIssueDate || !form.idExpiryDate) return 'Completa las fechas de expedición y vencimiento.'
    }
    if (step === 3) {
      if (!form.economicActivity) return 'Selecciona tu actividad económica principal.'
      if (form.economicActivity === 'Otro' && !form.economicActivityOther.trim()) return 'Especifica tu actividad económica.'
      if (!form.fundsOrigin) return 'Selecciona el origen principal de los recursos.'
      if (form.fundsOrigin === 'Otro' && !form.fundsOriginOther.trim()) return 'Especifica el origen de los recursos.'
    }
    if (step === 4) {
      if (!form.planType) return 'Selecciona el tipo de Plan de Ahorro.'
      if (!form.initialAmountNumber || Number(form.initialAmountNumber) <= 0) return 'Indica el monto de aportación inicial.'
      if (!form.currency) return 'Selecciona la divisa de aportación.'
      if (form.currency === 'MXN' && !mxnRate) return 'Esperando el tipo de cambio del día — intenta de nuevo en un momento.'
    }
    if (step === 5) {
      for (const b of beneficiaries) {
        if (!b.fullName.trim() || !b.relationship.trim() || !b.percentage)
          return 'Completa nombre, parentesco y porcentaje de cada beneficiario.'
      }
      if (totalPercentage !== 100) return `El porcentaje total debe sumar 100% (actualmente ${totalPercentage}%).`
    }
    if (step === 6) {
      if (!agree) return 'Confirma que la información proporcionada es verídica.'
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
            usdEquivalent: usdEquivalent !== null ? formatMoney(usdEquivalent) : '',
            exchangeRate: exchangeRateLabel,
          },
          beneficiaries: beneficiaries.map(({ _id, ...rest }) => rest),
        }),
      })
      if (!res.ok) throw new Error('Send failed')
      setSendStatus('sent')
      go(7, 1)
    } catch {
      setSendStatus('error')
      setError('No se pudo enviar el cuestionario. Intenta de nuevo.')
    }
  }

  const progressPct = step >= 1 && step <= 6 ? Math.round((step / 6) * 100) : step >= 7 ? 100 : 0

  if (!framed) {
    return (
      <main className="min-h-screen bg-[rgb(25,25,25)] flex items-center justify-center px-6 text-center">
        <p className="text-white/50 text-sm max-w-sm">
          Esta página solo está disponible dentro del portal ARKA.
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
            Cuestionario para Contrato de Mandato
          </h1>
        </div>

        {step >= 1 && step <= 6 && (
          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-xs tracking-[0.15em] uppercase text-white/55">
              <span>{STEP_LABELS[step - 1]}</span>
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
                Completa la siguiente información para preparar tu Contrato de Mandato. Los datos deben coincidir
                con tu identificación oficial y documentación KYC. Toma aproximadamente 5 minutos.
              </p>
              <button onClick={() => go(1, 1)}
                className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-semibold bg-[#004C45] text-white hover:bg-[#005c54] px-12 py-4 rounded-sm transition-all duration-300">
                Comenzar
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
              className="space-y-5">
              <h2 className="text-lg font-semibold text-white mb-1">1. Datos generales del Mandante</h2>
              <Field label="Nombre completo del Mandante" required hint="Exactamente como aparece en tu identificación oficial">
                <TextInput value={form.fullName} onChange={update('fullName')} placeholder="Nombre completo" />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nacionalidad" required>
                  <TextInput value={form.nationality} onChange={update('nationality')} placeholder="Nacionalidad" />
                </Field>
                <Field label="Teléfono con lada internacional" required>
                  <TextInput value={form.phone} onChange={update('phone')} placeholder="+52 55 0000 0000" />
                </Field>
              </div>
              <Field label="Correo electrónico contractual" required hint="Autorizado para notificaciones del contrato">
                <TextInput type="email" value={form.email} onChange={update('email')} placeholder="correo@ejemplo.com" />
              </Field>
              <Field label="Domicilio completo" required hint="Calle, número, colonia, código postal, ciudad/municipio, estado y país">
                <TextArea rows={3} value={form.address} onChange={update('address')} placeholder="Domicilio completo" />
              </Field>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
              className="space-y-5">
              <h2 className="text-lg font-semibold text-white mb-1">2. Identificación oficial</h2>
              <Field label="Tipo de identificación oficial" required>
                <PillGroup options={ID_TYPES} value={form.idType} onChange={(v) => setForm((f) => ({ ...f, idType: v }))} />
              </Field>
              {form.idType === 'Otro' && (
                <Field label="Especifica el tipo de documento" required>
                  <TextInput value={form.idTypeOther} onChange={update('idTypeOther')} />
                </Field>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Número de identificación" required>
                  <TextInput value={form.idNumber} onChange={update('idNumber')} />
                </Field>
                <Field label="Autoridad emisora" required>
                  <TextInput value={form.idIssuingAuthority} onChange={update('idIssuingAuthority')} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Fecha de expedición" required>
                  <TextInput type="date" value={form.idIssueDate} onChange={update('idIssueDate')} />
                </Field>
                <Field label="Fecha de vencimiento" required>
                  <TextInput type="date" value={form.idExpiryDate} onChange={update('idExpiryDate')} />
                </Field>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
              className="space-y-5">
              <h2 className="text-lg font-semibold text-white mb-1">3. Actividad económica y origen de fondos</h2>
              <Field label="Actividad económica principal" required>
                <PillGroup options={ECONOMIC_ACTIVITIES} value={form.economicActivity} onChange={(v) => setForm((f) => ({ ...f, economicActivity: v }))} />
              </Field>
              {form.economicActivity === 'Otro' && (
                <Field label="Especifica tu actividad económica" required>
                  <TextInput value={form.economicActivityOther} onChange={update('economicActivityOther')} />
                </Field>
              )}
              <Field label="Origen principal de los recursos a aportar" required>
                <PillGroup options={FUNDS_ORIGINS} value={form.fundsOrigin} onChange={(v) => setForm((f) => ({ ...f, fundsOrigin: v }))} />
              </Field>
              {form.fundsOrigin === 'Otro' && (
                <Field label="Especifica el origen de los recursos" required>
                  <TextInput value={form.fundsOriginOther} onChange={update('fundsOriginOther')} />
                </Field>
              )}
              <Field label="Describe brevemente tu actividad económica y el origen de los recursos">
                <TextArea rows={3} value={form.activityDescription} onChange={update('activityDescription')} />
              </Field>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
              className="space-y-5">
              <h2 className="text-lg font-semibold text-white mb-1">4. Plan de Ahorro seleccionado</h2>
              <Field label="Tipo de Plan de Ahorro / Savings" required>
                <PillGroup options={PLAN_TYPES} value={form.planType} onChange={(v) => setForm((f) => ({ ...f, planType: v }))} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Aportación inicial — monto en número" required>
                  <TextInput type="number" min="0" step="0.01" value={form.initialAmountNumber} onChange={handleAmountChange} placeholder="10000" />
                </Field>
                <Field label="Aportación inicial — monto en letra" hint="Se genera automáticamente; puedes editarlo">
                  <TextInput value={form.initialAmountWords}
                    onChange={(e) => { setAmountWordsTouched(true); update('initialAmountWords')(e) }} />
                </Field>
              </div>
              <Field label="Divisa de aportación" required>
                <PillGroup options={CURRENCIES} value={form.currency} onChange={handleCurrencyChange} />
              </Field>

              {form.currency === 'MXN' && (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm space-y-1">
                  {rateStatus === 'loading' && <p className="text-white/55">Obteniendo el tipo de cambio del día…</p>}
                  {rateStatus === 'error' && (
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-red-400 text-xs">No se pudo obtener el tipo de cambio.</p>
                      <button type="button" onClick={() => setRateStatus('idle')}
                        className="text-xs text-white/70 hover:text-white underline shrink-0">
                        Reintentar
                      </button>
                    </div>
                  )}
                  {rateStatus === 'loaded' && mxnRate && (
                    <>
                      <p className="text-white/85">
                        Equivalente aproximado: <span className="font-semibold text-white">${formatMoney(usdEquivalent)} USD</span>
                      </p>
                      <p className="text-white/50 text-xs">Tipo de cambio del día: {exchangeRateLabel}</p>
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
                <h2 className="text-lg font-semibold text-white">5. Beneficiarios</h2>
                <span className={`text-sm tabular-nums font-semibold ${totalPercentage === 100 ? 'text-[#46B58F]' : 'text-[#E0705A]'}`}>
                  Total asignado: {totalPercentage}%
                </span>
              </div>
              <p className="text-white/55 text-xs">
                Agrega los beneficiarios que necesites. Los porcentajes deben sumar 100%.
              </p>

              {beneficiaries.map((b, i) => (
                <div key={b._id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs tracking-[0.1em] uppercase text-white/60 font-medium">
                      Beneficiario {i + 1}
                    </p>
                    {beneficiaries.length > 1 && (
                      <button type="button" onClick={() => removeBeneficiary(b._id)}
                        className="text-xs tracking-[0.06em] uppercase text-white/50 hover:text-red-400 transition-colors">
                        Eliminar
                      </button>
                    )}
                  </div>
                  <Field label="Nombre completo" required>
                    <TextInput value={b.fullName} onChange={(e) => updateBeneficiary(b._id, 'fullName', e.target.value)} />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Parentesco" required>
                      <TextInput value={b.relationship} onChange={(e) => updateBeneficiary(b._id, 'relationship', e.target.value)} />
                    </Field>
                    <Field label="Porcentaje asignado (%)" required>
                      <TextInput type="number" min="0" max="100" value={b.percentage}
                        onChange={(e) => updateBeneficiary(b._id, 'percentage', e.target.value)} />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Tipo de identificación">
                      <select value={b.idType} onChange={(e) => updateBeneficiary(b._id, 'idType', e.target.value)}
                        className={inputClass}>
                        <option value="">Selecciona…</option>
                        {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Número de identificación">
                      <TextInput value={b.idNumber} onChange={(e) => updateBeneficiary(b._id, 'idNumber', e.target.value)} />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Fecha de vencimiento de identificación">
                      <TextInput type="date" value={b.idExpiry} onChange={(e) => updateBeneficiary(b._id, 'idExpiry', e.target.value)} />
                    </Field>
                    <Field label="Teléfono o email (opcional)">
                      <TextInput value={b.contact} onChange={(e) => updateBeneficiary(b._id, 'contact', e.target.value)} />
                    </Field>
                  </div>
                </div>
              ))}

              <div className="flex gap-3">
                <button type="button" onClick={addBeneficiary}
                  className="flex-1 text-xs tracking-[0.1em] uppercase font-medium border border-white/15 text-white/75 hover:border-white/35 hover:text-white px-4 py-3 rounded-sm transition-all duration-300">
                  + Agregar beneficiario
                </button>
                <button type="button" onClick={distributeEvenly}
                  className="flex-1 text-xs tracking-[0.1em] uppercase font-medium border border-white/15 text-white/75 hover:border-white/35 hover:text-white px-4 py-3 rounded-sm transition-all duration-300">
                  Distribuir % equitativamente
                </button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
              className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-1">6. Revisión</h2>
              <p className="text-white/55 text-sm mb-2">Revisa que toda tu información sea correcta antes de enviar.</p>

              <SummarySection title="1. Datos generales del Mandante">
                <SummaryRow label="Nombre completo" value={form.fullName} />
                <SummaryRow label="Nacionalidad" value={form.nationality} />
                <SummaryRow label="Teléfono" value={form.phone} />
                <SummaryRow label="Correo" value={form.email} />
                <SummaryRow label="Domicilio" value={form.address} />
              </SummarySection>

              <SummarySection title="2. Identificación oficial">
                <SummaryRow label="Tipo" value={form.idType === 'Otro' ? form.idTypeOther : form.idType} />
                <SummaryRow label="Número" value={form.idNumber} />
                <SummaryRow label="Autoridad emisora" value={form.idIssuingAuthority} />
                <SummaryRow label="Fecha de expedición" value={form.idIssueDate} />
                <SummaryRow label="Fecha de vencimiento" value={form.idExpiryDate} />
              </SummarySection>

              <SummarySection title="3. Actividad económica y origen de fondos">
                <SummaryRow label="Actividad económica" value={form.economicActivity === 'Otro' ? form.economicActivityOther : form.economicActivity} />
                <SummaryRow label="Origen de los recursos" value={form.fundsOrigin === 'Otro' ? form.fundsOriginOther : form.fundsOrigin} />
                <SummaryRow label="Descripción" value={form.activityDescription} />
              </SummarySection>

              <SummarySection title="4. Plan de Ahorro">
                <SummaryRow label="Tipo de plan" value={form.planType} />
                <SummaryRow label="Aportación inicial" value={form.initialAmountNumber ? `${formatMoney(form.initialAmountNumber)} ${form.currency}` : ''} />
                <SummaryRow label="Monto en letra" value={form.initialAmountWords} />
                {form.currency === 'MXN' && (
                  <>
                    <SummaryRow label="Equivalente en USD" value={usdEquivalent !== null ? `$${formatMoney(usdEquivalent)} USD` : 'Calculando…'} />
                    <SummaryRow label="Tipo de cambio" value={exchangeRateLabel} />
                  </>
                )}
              </SummarySection>

              <SummarySection title="5. Beneficiarios">
                {beneficiaries.map((b, i) => (
                  <div key={b._id} className={i > 0 ? 'pt-3 mt-3 border-t border-white/10' : ''}>
                    <p className="text-white/70 text-xs font-medium mb-1">Beneficiario {i + 1}</p>
                    <SummaryRow label="Nombre" value={b.fullName} />
                    <SummaryRow label="Parentesco" value={b.relationship} />
                    <SummaryRow label="Porcentaje" value={b.percentage ? `${b.percentage}%` : ''} />
                    <SummaryRow label="Identificación" value={b.idType ? `${b.idType}${b.idNumber ? ' — ' + b.idNumber : ''}` : b.idNumber} />
                    <SummaryRow label="Vencimiento ID" value={b.idExpiry} />
                    <SummaryRow label="Contacto" value={b.contact} />
                  </div>
                ))}
              </SummarySection>

              <label className="flex items-start gap-3 text-sm text-white/80 cursor-pointer pt-2">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-[#004C45]" />
                <span>Confirmo que la información proporcionada es verídica y corresponde a mi documentación oficial vigente.</span>
              </label>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 py-12">
              <p className="text-4xl">✓</p>
              <h2 className="text-xl font-semibold text-white">Cuestionario enviado</h2>
              <p className="text-white/70 text-sm max-w-md mx-auto">
                Hemos recibido tu información. Nuestro equipo preparará tu Contrato de Mandato y se pondrá en
                contacto contigo a través del correo proporcionado.
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
              ← Atrás
            </button>
            {step < 6 ? (
              <button onClick={next}
                className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase font-semibold bg-[#004C45] text-white hover:bg-[#005c54] px-10 py-3.5 rounded-sm transition-all duration-300">
                Siguiente →
              </button>
            ) : (
              <button onClick={submit} disabled={sendStatus === 'sending'}
                className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase font-semibold bg-[#004C45] text-white hover:bg-[#005c54] px-10 py-3.5 rounded-sm transition-all duration-300 disabled:opacity-50">
                {sendStatus === 'sending' ? 'Enviando…' : 'Enviar cuestionario'}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
