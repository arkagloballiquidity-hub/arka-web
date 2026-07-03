import { Resend } from 'resend'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE   = 'https://www.arkaglobalinvestments.com'
const CONTACT_EMAIL = 'contacto@arkaltd.io'

// Plan accent colors (shared with the site + profiler email)
const PLAN_COLORS = { flex20: '#5E97C2', fijo22: '#C9A352', fijo25: '#9B6FD4' }
function planColor(id) { return PLAN_COLORS[id] || '#C9A352' }
const TERM_MONTHS = { flex20: 6, fijo22: 12, fijo25: 24 }

const __dirname = dirname(fileURLToPath(import.meta.url))
let montserratBoldBytes, montserratRegBytes, montserratLightBytes, logoPngBytes
try {
  montserratBoldBytes  = readFileSync(join(__dirname, 'fonts/Montserrat-Bold.ttf'))
  montserratRegBytes   = readFileSync(join(__dirname, 'fonts/Montserrat-Regular.ttf'))
  montserratLightBytes = readFileSync(join(__dirname, 'fonts/Montserrat-Light.ttf'))
} catch { /* fall back to Helvetica */ }
try { logoPngBytes = readFileSync(join(__dirname, 'logo_arka.png')) } catch { /* no logo */ }

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function fmtUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

async function sendTelegram(text) {
  const token  = process.env.TELEGRAM_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  }).catch(() => {})
}

// ── Projection engine (mirrors frontend) ─────────────────────────────────────
// ARKA fixed-term plans pay simple interest, prorated by day count over the
// term — not compounded. Benchmarks are shown compounded daily for comparison.
const BENCH = { sp500: 0.108, cetes: 0.097, bank: 0.045 }

function arkaValueAtDay(principal, rate, days) {
  return principal * (1 + (rate * days) / 365)
}
function benchValueAtDay(principal, annualRate, days) {
  const daily = Math.pow(1 + annualRate, 1 / 365) - 1
  return principal * Math.pow(1 + daily, days)
}

function calcSeries(amount, rate, termDays, termMonths) {
  const steps = termMonths || 12
  const rows = []
  for (let i = 0; i <= steps; i++) {
    const day = Math.round((i / steps) * termDays)
    rows.push({
      month: i,
      day,
      arka:  Math.round(arkaValueAtDay(amount, rate, day)),
      sp500: Math.round(benchValueAtDay(amount, BENCH.sp500, day)),
      cetes: Math.round(benchValueAtDay(amount, BENCH.cetes, day)),
      bank:  Math.round(benchValueAtDay(amount, BENCH.bank, day)),
    })
  }
  return rows
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).end()

  const { name, email, plan, amount, results } = req.body || {}
  if (!email || !plan || !amount || !results)
    return res.status(400).json({ error: 'Missing required fields' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))
    return res.status(400).json({ error: 'Invalid email' })

  const safeName  = String(name || 'Investor').replace(/[<>&"']/g, '')
  const firstName = safeName.split(' ')[0]

  const rateDecimal = Number(plan.rate) / 100
  const termMonths  = TERM_MONTHS[plan.id] || 12
  const rows = calcSeries(amount, rateDecimal, plan.termDays, termMonths)

  const pdfBuffer = await buildPDF({ firstName, plan, amount, results, rows })

  const { error: mailErr } = await resend.emails.send({
    from:    process.env.RESEND_FROM || 'ARKA Global Investments <noreply@arkaglobalinvestments.com>',
    to:      email,
    subject: `ARKA — Your ${plan.name} Simulation Results`,
    html:    buildEmail({ firstName, plan, amount, results, rows }),
    attachments: [{ filename: 'ARKA-Simulation-Report.pdf', content: Buffer.from(pdfBuffer).toString('base64') }],
  })

  if (mailErr) {
    console.error('Resend error:', mailErr)
    return res.status(400).json({ error: 'Error sending email', detail: mailErr.message || String(mailErr) })
  }

  await sendTelegram(
    `📊 <b>Nueva Simulación — ARKA</b>\n\n` +
    `👤 ${esc(name || '(sin nombre)')}\n📧 ${esc(email)}\n\n` +
    `📋 Plan: <b>${esc(plan.name)}</b> (${plan.rate}% anual, ${plan.termDays} días)\n` +
    `💰 Monto: <b>${fmtUSD(amount)}</b>\n` +
    `📈 Capital al vencimiento: <b>${fmtUSD(results.maturityValue)}</b>\n` +
    `💹 Rendimiento fijo: <b>${fmtUSD(results.maturityGain)}</b> (×${results.multiplier})`
  )

  return res.status(200).json({ sent: true })
}

// ── Email template ────────────────────────────────────────────────────────────
function buildEmail({ firstName, plan, amount, results, rows }) {
  const accent = planColor(plan.id)
  const paramRows = [
    ['Plan',                 `${plan.name} (${plan.termDays} days)`],
    ['Investment Amount',    fmtUSD(amount)],
    ['Fixed Annual Rate',    `${plan.rate}%`],
    ['Paid at Day',          String(plan.termDays)],
  ]

  const tableRows = rows.filter((r, i) => i > 0)
  const final = rows[rows.length - 1]

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ARKA Simulation Results</title></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#fff">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505">
<tr><td align="center" style="padding:48px 16px">
<table width="100%" style="max-width:580px">

  <!-- Header logo -->
  <tr><td style="padding:28px 0 24px;border-bottom:1px solid #1a1a1a;text-align:center">
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;display:inline-table">
      <tr>
        <td style="vertical-align:middle;padding-right:14px">
          <img src="https://www.arkaglobalinvestments.com/logo_arka.png" width="40" height="40" alt="ARKA" style="display:block;border:0" />
        </td>
        <td style="vertical-align:middle;text-align:left">
          <div style="font-size:16px;letter-spacing:4px;font-weight:700;color:#C9A352;font-family:Arial,sans-serif;text-transform:uppercase">ARKA</div>
          <div style="font-size:7px;letter-spacing:2px;text-transform:uppercase;color:#666;font-family:Arial,sans-serif;margin-top:2px">GLOBAL INVESTMENTS</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:32px 0 20px">
    <p style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#444;margin:0 0 16px">Investment Simulation Report</p>
    <h1 style="font-size:22px;font-weight:300;margin:0 0 12px;color:#fff">Hello, ${esc(firstName)}.</h1>
    <p style="font-size:14px;color:#888;line-height:1.8;margin:0">
      Here are the results of your personalized simulation using ARKA’s <strong style="color:#ccc">${esc(plan.name)}</strong> fixed-term plan.
    </p>
  </td></tr>

  <!-- Primary KPI -->
  <tr><td style="padding:0 0 12px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:28px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:12px;text-align:center">
        <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#555;margin:0 0 10px">Capital at Maturity</p>
        <p style="font-size:36px;font-weight:700;color:${accent};margin:0;letter-spacing:-.5px">${fmtUSD(results.maturityValue)}</p>
        <p style="font-size:10px;color:#555;margin:8px 0 0">paid at day ${plan.termDays}</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- KPI row -->
  <tr><td style="padding:0 0 28px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:49%;padding:18px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:#555;margin:0 0 8px">Principal</p>
          <p style="font-size:18px;font-weight:300;color:#ccc;margin:0">${fmtUSD(amount)}</p>
        </td>
        <td style="width:2%"></td>
        <td style="width:49%;padding:18px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:#555;margin:0 0 8px">Fixed Return</p>
          <p style="font-size:18px;font-weight:300;color:#ccc;margin:0">${fmtUSD(results.maturityGain)} <span style="font-size:12px;color:${accent}">×${results.multiplier}</span></p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Parameters -->
  <tr><td style="padding:24px 0;border-top:1px solid #1a1a1a">
    <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#3a3a3a;margin:0 0 16px">Plan Parameters</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${paramRows.map(([k, v], i) => `<tr style="background:${i % 2 === 0 ? '#0d0d0d' : 'transparent'}">
        <td style="padding:9px 12px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#555">${k}</td>
        <td style="padding:9px 12px;font-size:11px;color:#bbb;text-align:right">${v}</td>
      </tr>`).join('')}
    </table>
  </td></tr>

  <!-- Market Context -->
  <tr><td style="padding:28px 0;border-top:1px solid #1a1a1a">
    <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#3a3a3a;margin:0 0 20px">Market Context</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:49%;padding:20px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:#555;margin:0 0 8px">US Market Participation</p>
          <p style="font-size:28px;font-weight:700;color:${accent};margin:0">55%</p>
          <p style="font-size:9px;color:#555;margin:8px 0 0;line-height:1.6">of Americans invest in financial markets</p>
        </td>
        <td style="width:2%"></td>
        <td style="width:49%;padding:20px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:#555;margin:0 0 8px">Mexico Market Participation</p>
          <p style="font-size:28px;font-weight:700;color:#888;margin:0">5%</p>
          <p style="font-size:9px;color:#555;margin:8px 0 0;line-height:1.6">of Mexicans participate in financial markets</p>
        </td>
      </tr>
    </table>
    <p style="font-size:10px;color:#444;margin:16px 0 0;line-height:1.7;text-align:center">
      ARKA exists to close that gap — bringing institutional-grade capital management to qualified private investors.
    </p>
  </td></tr>

  <!-- Benchmark comparison -->
  <tr><td style="padding:28px 0;border-top:1px solid #1a1a1a">
    <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#3a3a3a;margin:0 0 20px">Final Value vs Benchmarks</p>
    ${[
      { label: 'ARKA',    value: final.arka,  color: accent,    bold: true  },
      { label: 'S&amp;P 500', value: final.sp500, color: '#94A3B8', bold: false },
      { label: 'CETES',   value: final.cetes, color: '#64748B', bold: false },
      { label: 'Banking', value: final.bank,  color: '#475569', bold: false },
    ].map(b => {
      const pct = Math.round((b.value / final.arka) * 100)
      return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px">
        <tr>
          <td style="font-size:10px;color:${b.color};font-weight:${b.bold ? '700' : '400'};padding-bottom:5px">${b.label}</td>
          <td style="font-size:10px;color:#888;text-align:right;padding-bottom:5px">${fmtUSD(b.value)}</td>
        </tr>
        <tr><td colspan="2">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="width:${pct}%;height:4px;background:${b.color};border-radius:2px;opacity:${b.bold ? '1' : '0.6'}"></td>
            <td style="height:4px;background:#1a1a1a;border-radius:2px"></td>
          </tr></table>
        </td></tr>
      </table>`
    }).join('')}
  </td></tr>

  <!-- Growth timeline table -->
  <tr><td style="padding:28px 0;border-top:1px solid #1a1a1a">
    <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#3a3a3a;margin:0 0 16px">Capital Growth Over the Term</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      <tr style="background:#111">
        ${['Day','ARKA','S&amp;P 500','CETES','Banking'].map(h =>
          `<td style="padding:8px 10px;font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:#555">${h}</td>`
        ).join('')}
      </tr>
      ${tableRows.map((r, i) => `<tr style="background:${i % 2 === 0 ? '#0d0d0d' : 'transparent'}">
        <td style="padding:8px 10px;font-size:10px;color:#666;font-family:monospace">${r.day}</td>
        <td style="padding:8px 10px;font-size:10px;color:${accent};font-weight:600">${fmtUSD(r.arka)}</td>
        <td style="padding:8px 10px;font-size:10px;color:#777">${fmtUSD(r.sp500)}</td>
        <td style="padding:8px 10px;font-size:10px;color:#666">${fmtUSD(r.cetes)}</td>
        <td style="padding:8px 10px;font-size:10px;color:#555">${fmtUSD(r.bank)}</td>
      </tr>`).join('')}
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:32px 0;text-align:center;border-top:1px solid #1a1a1a">
    <p style="font-size:13px;color:#666;margin:0 0 20px;line-height:1.8">Ready to put your capital to work?</p>
    <a href="${SITE}/contact" style="display:inline-block;background:#004C45;color:#fff;text-decoration:none;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding:14px 36px;border-radius:2px">
      Contact Us
    </a>
    <p style="font-size:11px;color:#666;margin:18px 0 0">Or email us at <a href="mailto:${CONTACT_EMAIL}" style="color:${accent};text-decoration:none">${CONTACT_EMAIL}</a></p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 0;border-top:1px solid #111;text-align:center">
    <p style="font-size:9px;color:#2a2a2a;line-height:1.9;margin:0">
      ARKA Global Investments &nbsp;·&nbsp; Fixed annual rates are contractual references and do not guarantee performance.<br>
      Early withdrawal before the term ends forfeits 25% of the returns accrued to date. Investing involves risk, including possible loss of capital.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ── PDF builder ───────────────────────────────────────────────────────────────
async function loadFonts(pdfDoc) {
  if (montserratBoldBytes && montserratRegBytes && montserratLightBytes) {
    try {
      const bold  = await pdfDoc.embedFont(montserratBoldBytes)
      const reg   = await pdfDoc.embedFont(montserratRegBytes)
      const light = await pdfDoc.embedFont(montserratLightBytes)
      return { bold, reg, light }
    } catch { /* fall through */ }
  }
  const bold  = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const reg   = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const light = await pdfDoc.embedFont(StandardFonts.Helvetica)
  return { bold, reg, light }
}

async function drawWordmark(page, pdfDoc, fonts, x, y, GOLD, GRAY) {
  if (logoPngBytes) {
    try {
      const img = await pdfDoc.embedPng(logoPngBytes)
      const logoH = 32, logoW = Math.round(logoH * img.width / img.height)
      page.drawImage(img, { x, y: y - 8, width: logoW, height: logoH })
      page.drawText('ARKA', { x: x + logoW + 10, y: y + 8, size: 13, font: fonts.bold, color: GOLD, characterSpacing: 3 })
      page.drawText('GLOBAL INVESTMENTS', { x: x + logoW + 10, y: y - 4, size: 6, font: fonts.reg, color: GRAY, characterSpacing: 2 })
      return
    } catch { /* fall through */ }
  }
  const WHITE = rgb(1, 1, 1)
  page.drawRectangle({ x, y: y - 4, width: 64, height: 28, color: GOLD })
  page.drawText('ARKA', { x: x + 7, y: y + 4, size: 13, font: fonts.bold, color: WHITE, characterSpacing: 3 })
  page.drawText('GLOBAL INVESTMENTS', { x: x + 74, y: y + 8, size: 6, font: fonts.reg, color: GRAY, characterSpacing: 2 })
}

function wrapText(text, font, size, maxWidth) {
  const words = String(text).split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (line) lines.push(line)
      line = word
    } else { line = test }
  }
  if (line) lines.push(line)
  return lines
}

async function drawHeader(page, pdfDoc, fonts, width, height, M, GOLD, GRAY, ROW, title) {
  page.drawRectangle({ x: 0, y: height - 70, width, height: 70, color: ROW })
  page.drawLine({ start: { x: 0, y: height - 70 }, end: { x: width, y: height - 70 }, thickness: 0.5, color: GOLD })
  await drawWordmark(page, pdfDoc, fonts, M, height - 52, GOLD, GRAY)
  const tw = fonts.reg.widthOfTextAtSize(title, 7.5)
  page.drawText(title, { x: width - M - tw, y: height - 45, size: 7.5, font: fonts.reg, color: GRAY, characterSpacing: 1.5 })
}

async function buildPDF({ firstName, plan, amount, results, rows }) {
  const pdfDoc = await PDFDocument.create()
  const fonts  = await loadFonts(pdfDoc)
  const { bold, reg, light } = fonts

  const GOLD  = rgb(0.788, 0.639, 0.322)
  const WHITE = rgb(1, 1, 1)
  const LGRAY = rgb(0.82, 0.82, 0.82)
  const GRAY  = rgb(0.55, 0.55, 0.55)
  const DGRAY = rgb(0.22, 0.22, 0.22)
  const BG    = rgb(0.035, 0.035, 0.035)
  const CARD  = rgb(0.078, 0.078, 0.078)
  const ROW   = rgb(0.06, 0.06, 0.06)
  const DARK  = rgb(0.14, 0.14, 0.14)

  const pageW = 595, pageH = 842
  const M = 50
  const W = pageW - M * 2

  // ── Page 1 ─────────────────────────────────────────────────────────────────
  const page1 = pdfDoc.addPage([pageW, pageH])
  page1.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: BG })

  await drawHeader(page1, pdfDoc, fonts, pageW, pageH, M, GOLD, GRAY, ROW, 'INVESTMENT SIMULATION REPORT')

  let y = pageH - 90

  // Greeting
  page1.drawText(`Hello, ${firstName}.`, { x: M, y, size: 22, font: light, color: WHITE })
  y -= 22
  page1.drawText(`Here are the results of your ${plan.name} plan simulation.`, { x: M, y, size: 9.5, font: reg, color: GRAY })
  y -= 14
  page1.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.5, color: GOLD })
  y -= 24

  // Primary KPI block
  const kpiBlockH = 76
  page1.drawRectangle({ x: M, y: y - kpiBlockH, width: W, height: kpiBlockH, color: CARD })
  page1.drawRectangle({ x: M, y: y - kpiBlockH, width: 3, height: kpiBlockH, color: GOLD })
  page1.drawText('CAPITAL AT MATURITY', { x: M + 16, y: y - 18, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  page1.drawText(fmtUSD(results.maturityValue), { x: M + 16, y: y - 46, size: 28, font: bold, color: GOLD })
  page1.drawText(`paid at day ${plan.termDays}`, { x: M + 16, y: y - 66, size: 9, font: reg, color: GRAY })
  y -= kpiBlockH + 14

  // Secondary KPIs
  const kpiW = (W - 12) / 2
  const kpiH = 52
  const kpis = [
    { label: 'PRINCIPAL',    value: fmtUSD(amount) },
    { label: 'FIXED RETURN', value: `${fmtUSD(results.maturityGain)}   ×${results.multiplier}` },
  ]
  kpis.forEach(({ label, value }, i) => {
    const kx = M + i * (kpiW + 12)
    const ky = y - kpiH
    page1.drawRectangle({ x: kx, y: ky, width: kpiW, height: kpiH, color: CARD })
    page1.drawText(label, { x: kx + 12, y: ky + kpiH - 16, size: 7, font: bold, color: GRAY, characterSpacing: 1 })
    page1.drawText(value, { x: kx + 12, y: ky + 14, size: 12, font: bold, color: LGRAY })
  })
  y -= kpiH + 22

  // Parameters
  page1.drawText('PLAN PARAMETERS', { x: M, y, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 14
  const paramRows = [
    ['Plan',              `${plan.name} (${plan.termDays} days)`],
    ['Investment Amount', fmtUSD(amount)],
    ['Fixed Annual Rate', `${plan.rate}%`],
    ['Paid at Day',       String(plan.termDays)],
  ]
  paramRows.forEach(([label, value], i) => {
    const rh = 24
    if (i % 2 === 0) page1.drawRectangle({ x: M, y: y - rh + 6, width: W, height: rh, color: ROW })
    page1.drawText(label, { x: M + 10, y: y - 12, size: 8.5, font: reg, color: GRAY })
    const maxVw = W - bold.widthOfTextAtSize(label, 8.5) - 30
    let v = value
    while (v.length > 4 && bold.widthOfTextAtSize(v, 8.5) > maxVw) v = v.slice(0, -4) + '…'
    const vw = bold.widthOfTextAtSize(v, 8.5)
    page1.drawText(v, { x: M + W - vw - 8, y: y - 12, size: 8.5, font: bold, color: LGRAY })
    y -= rh
  })
  y -= 18

  // Benchmarks
  page1.drawText('FINAL VALUE VS BENCHMARKS', { x: M, y, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 16
  const final = rows[rows.length - 1]
  const benchmarks = [
    { label: 'ARKA',    value: final.arka,  color: GOLD },
    { label: 'S&P 500', value: final.sp500, color: rgb(0.58, 0.64, 0.72) },
    { label: 'CETES',   value: final.cetes, color: rgb(0.39, 0.46, 0.55) },
    { label: 'Banking', value: final.bank,  color: rgb(0.30, 0.36, 0.44) },
  ]
  benchmarks.forEach(({ label, value, color }) => {
    const pct = value / final.arka
    page1.drawText(label, { x: M, y, size: 8.5, font: bold, color: LGRAY })
    const vw = reg.widthOfTextAtSize(fmtUSD(value), 8.5)
    page1.drawText(fmtUSD(value), { x: M + W - vw, y, size: 8.5, font: reg, color })
    y -= 13
    page1.drawRectangle({ x: M, y: y - 3, width: W, height: 4, color: DARK })
    page1.drawRectangle({ x: M, y: y - 3, width: Math.max(4, W * pct), height: 4, color })
    y -= 20
  })
  y -= 8

  // ── Page 2 — Market Context + Growth Timeline ───────────────────────────────
  const page2 = pdfDoc.addPage([pageW, pageH])
  page2.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: BG })
  await drawHeader(page2, pdfDoc, fonts, pageW, pageH, M, GOLD, GRAY, ROW, 'CAPITAL GROWTH OVER THE TERM')

  let y2 = pageH - 92

  // Market context block
  page2.drawText('MARKET CONTEXT', { x: M, y: y2, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  y2 -= 16

  const ctxH = 72
  const ctxW = (W - 12) / 2
  const ctxData = [
    { label: 'US MARKET PARTICIPATION', value: '55%', sub: 'of Americans invest in financial markets', highlight: true },
    { label: 'MEXICO MARKET PARTICIPATION', value: '5%', sub: 'of Mexicans participate in financial markets', highlight: false },
  ]
  ctxData.forEach(({ label, value, sub, highlight }, i) => {
    const cx = M + i * (ctxW + 12)
    const cy = y2 - ctxH
    page2.drawRectangle({ x: cx, y: cy, width: ctxW, height: ctxH, color: CARD })
    if (highlight) page2.drawRectangle({ x: cx, y: cy, width: 3, height: ctxH, color: GOLD })
    page2.drawText(label, { x: cx + 12, y: cy + ctxH - 16, size: 6.5, font: bold, color: GRAY, characterSpacing: 1 })
    page2.drawText(value, { x: cx + 12, y: cy + ctxH - 44, size: 24, font: bold, color: highlight ? GOLD : GRAY })
    const subLines = wrapText(sub, reg, 7.5, ctxW - 24)
    subLines.forEach((ln, si) => {
      page2.drawText(ln, { x: cx + 12, y: cy + 18 - si * 11, size: 7.5, font: reg, color: GRAY })
    })
  })
  y2 -= ctxH + 10

  // Caption
  const caption = 'ARKA exists to close that gap — bringing institutional-grade capital management to qualified private investors.'
  const capLines = wrapText(caption, reg, 8.5, W)
  capLines.forEach((ln, i) => {
    page2.drawText(ln, { x: M, y: y2 - 14 - i * 13, size: 8.5, font: reg, color: GRAY })
  })
  y2 -= 14 + capLines.length * 13 + 20
  page2.drawLine({ start: { x: M, y: y2 }, end: { x: M + W, y: y2 }, thickness: 0.4, color: DARK })
  y2 -= 18

  // Growth timeline table
  page2.drawText('CAPITAL GROWTH OVER THE TERM', { x: M, y: y2, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  y2 -= 14

  await drawTable(page2, rows, M, y2, W, bold, reg, GOLD, GRAY, LGRAY, ROW, DARK, BG)

  // Footer — both pages
  for (const pg of [page1, page2]) {
    const footY = 34
    pg.drawLine({ start: { x: M, y: footY + 18 }, end: { x: M + W, y: footY + 18 }, thickness: 0.3, color: DARK })
    const ft = 'ARKA Global Investments  ·  Fixed annual rates are contractual references — early withdrawal forfeits 25% of accrued returns.'
    const ftW = reg.widthOfTextAtSize(ft, 7)
    pg.drawText(ft, { x: (pageW - ftW) / 2, y: footY, size: 7, font: reg, color: DGRAY })
  }

  return pdfDoc.save()
}

async function drawTable(page, rows, M, startY, W, bold, reg, GOLD, GRAY, LGRAY, ROW, DARK) {
  let y = startY
  const tableRows = rows.filter((r, i) => i > 0)

  const cols = [
    { label: 'DAY',      w: 0.12 },
    { label: 'ARKA',     w: 0.25 },
    { label: 'S&P 500',  w: 0.23 },
    { label: 'CETES',    w: 0.20 },
    { label: 'BANKING',  w: 0.20 },
  ]

  // Header
  page.drawRectangle({ x: M, y: y - 20, width: W, height: 20, color: DARK })
  let cx = M + 8
  cols.forEach(({ label, w }) => {
    page.drawText(label, { x: cx, y: y - 14, size: 7, font: bold, color: GRAY, characterSpacing: 0.8 })
    cx += W * w
  })
  y -= 20

  tableRows.forEach((r, i) => {
    const rh = 18
    if (i % 2 === 0) page.drawRectangle({ x: M, y: y - rh, width: W, height: rh, color: ROW })
    const cells = [String(r.day), fmtUSD(r.arka), fmtUSD(r.sp500), fmtUSD(r.cetes), fmtUSD(r.bank)]
    cx = M + 8
    cells.forEach((cell, ci) => {
      const color = ci === 1 ? GOLD : ci === 0 ? GRAY : LGRAY
      const font  = ci === 1 ? bold : reg
      const sz    = 8.5
      page.drawText(cell, { x: cx, y: y - rh + 5, size: sz, font, color })
      cx += W * cols[ci].w
    })
    y -= rh
  })
}
