const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
const ESPECIALES_10_19 = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE']
const VEINTIS = ['VEINTE', 'VEINTIUNO', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE']
const DECENAS = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS']

const CURRENCY_LABELS = {
  USD: 'DÓLARES AMERICANOS',
  MXN: 'PESOS MEXICANOS',
  USDT: 'USDT',
  USDC: 'USDC',
  BTC: 'BTC',
  ETH: 'ETH',
}

function convertirDecenas(n) {
  if (n < 10) return UNIDADES[n]
  if (n < 20) return ESPECIALES_10_19[n - 10]
  if (n < 30) return VEINTIS[n - 20]
  const dec = Math.floor(n / 10)
  const uni = n % 10
  return uni === 0 ? DECENAS[dec] : `${DECENAS[dec]} Y ${UNIDADES[uni]}`
}

function convertirCentenas(n) {
  if (n === 100) return 'CIEN'
  const cen = Math.floor(n / 100)
  const resto = n % 100
  let str = CENTENAS[cen]
  if (resto > 0) str += (str ? ' ' : '') + convertirDecenas(resto)
  return str.trim()
}

// Supports integers up to 999,999,999 — sufficient for this product's investment amounts.
export function numeroALetras(num) {
  const n = Math.floor(Math.abs(Number(num) || 0))
  if (n === 0) return 'CERO'
  if (n > 999999999) return null

  const millones = Math.floor(n / 1000000)
  const miles = Math.floor((n % 1000000) / 1000)
  const cientos = n % 1000

  const partes = []
  if (millones > 0) partes.push(millones === 1 ? 'UN MILLÓN' : `${convertirCentenas(millones)} MILLONES`)
  if (miles > 0) partes.push(miles === 1 ? 'MIL' : `${convertirCentenas(miles)} MIL`)
  if (cientos > 0) partes.push(convertirCentenas(cientos))

  return partes.join(' ').trim()
}

// Builds a legal-style amount-in-words string, e.g. "DIEZ MIL DÓLARES AMERICANOS 00/100"
export function montoEnLetras(amount, currency) {
  const abs = Math.abs(Number(amount) || 0)
  const intPart = Math.floor(abs)
  const letras = numeroALetras(intPart)
  if (letras === null) return ''
  const centavos = Math.round((abs - intPart) * 100)
  const label = CURRENCY_LABELS[currency] || (currency || '')
  return `${letras}${label ? ` ${label}` : ''} ${String(centavos).padStart(2, '0')}/100`.trim()
}
