import { Resend } from 'resend'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE   = process.env.SITE_URL || 'https://arka-web-six.vercel.app'

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
const RATES = { foundation: 0.18, growth: 0.24, alpha: 0.36 }
const BENCH = { sp500: 0.10, cetes: 0.105, bank: 0.045 }

function calcProjection({ initial, monthly, years, f, g, a, compound }) {
  const annual = (f * RATES.foundation + g * RATES.growth + a * RATES.alpha) / 100
  const daily  = Math.pow(1 + annual, 1 / 365) - 1
  const mRate  = compound ? Math.pow(1 + daily, 365 / 12) - 1 : annual / 12
  const mSP    = compound ? Math.pow(1 + BENCH.sp500,  1/12) - 1 : BENCH.sp500  / 12
  const mCetes = compound ? Math.pow(1 + BENCH.cetes,  1/12) - 1 : BENCH.cetes  / 12
  const mBank  = compound ? Math.pow(1 + BENCH.bank,   1/12) - 1 : BENCH.bank   / 12

  let arka = initial, sp500 = initial, cetes = initial, bank = initial
  let totalContrib = initial
  const rows = [{ year: 0, arka: initial, sp500: initial, cetes: initial, bank: initial, contributed: initial }]

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      if (compound) {
        arka  = arka  * (1 + mRate)  + monthly
        sp500 = sp500 * (1 + mSP)   + monthly
        cetes = cetes * (1 + mCetes) + monthly
        bank  = bank  * (1 + mBank)  + monthly
      } else {
        arka  += initial * mRate   + monthly
        sp500 += initial * mSP    + monthly
        cetes += initial * mCetes + monthly
        bank  += initial * mBank  + monthly
      }
      totalContrib += monthly
    }
    rows.push({ year: y, arka: Math.round(arka), sp500: Math.round(sp500), cetes: Math.round(cetes), bank: Math.round(bank), contributed: Math.round(totalContrib) })
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

  const { name, email, params, results } = req.body || {}
  if (!email || !params || !results)
    return res.status(400).json({ error: 'Missing required fields' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))
    return res.status(400).json({ error: 'Invalid email' })

  const safeName  = String(name || 'Investor').replace(/[<>&"']/g, '')
  const firstName = safeName.split(' ')[0]

  const rows = calcProjection({
    initial:  params.initial,
    monthly:  params.monthly,
    years:    params.years,
    f: params.f, g: params.g, a: params.a,
    compound: params.compound,
  })

  // Fetch logo for PDF
  let logoBytes = null
  try {
    const r = await fetch(`${SITE}/logo_arka.png`)
    if (r.ok) logoBytes = Buffer.from(await r.arrayBuffer())
  } catch { /* skip logo if unavailable */ }

  const pdfBuffer = await buildPDF({ firstName, params, results, rows, logoBytes })

  const { error: mailErr } = await resend.emails.send({
    from:    process.env.RESEND_FROM || 'ARKA Global Investments <noreply@arkaglobalinvestments.com>',
    to:      email,
    subject: 'ARKA — Your Investment Simulation Results',
    html:    buildEmail({ firstName, params, results, rows }),
    attachments: [{ filename: 'ARKA-Simulation-Report.pdf', content: Buffer.from(pdfBuffer).toString('base64') }],
  })

  if (mailErr) {
    console.error('Resend error:', mailErr)
    return res.status(400).json({ error: 'Error sending email', detail: mailErr.message || String(mailErr) })
  }

  await sendTelegram(
    `📊 <b>Nueva Simulación — ARKA</b>\n\n` +
    `👤 ${esc(name || '(sin nombre)')}\n📧 ${esc(email)}\n\n` +
    `💰 Capital inicial: <b>${fmtUSD(params.initial)}</b>\n` +
    `📈 Capital proyectado: <b>${fmtUSD(results.finalCapital)}</b>\n` +
    `💹 Ganancia neta: <b>${fmtUSD(results.netGain)}</b> (×${results.multiplier})\n` +
    `🗓 Horizonte: <b>${params.years} años</b>\n` +
    `📊 Tasa ponderada: <b>${params.annual}%</b>\n` +
    `🔀 Mix: Foundation ${params.f}% · Growth ${params.g}% · Alpha ${params.a}%`
  )

  return res.status(200).json({ sent: true })
}

// ── Email template ────────────────────────────────────────────────────────────
function buildEmail({ firstName, params, results, rows }) {
  const paramRows = [
    ['Initial Capital',      fmtUSD(params.initial)],
    ['Monthly Contribution', fmtUSD(params.monthly)],
    ['Investment Horizon',   `${params.years} years`],
    ['Blended Annual Rate',  `${params.annual}%`],
    ['Strategy Mix',         `Foundation ${params.f}% · Growth ${params.g}% · Alpha ${params.a}%`],
    ['Compounding',          params.compound ? 'Compound Interest' : 'Simple Interest'],
  ]

  // Select key years for table
  const step = params.years <= 10 ? 1 : params.years <= 20 ? 2 : 5
  const tableRows = rows.filter((r, i) => i > 0 && (r.year % step === 0 || r.year === params.years))

  const final = rows[rows.length - 1]

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ARKA Simulation Results</title></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#fff">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505">
<tr><td align="center" style="padding:48px 16px">
<table width="100%" style="max-width:580px">

  <!-- Header / Logo -->
  <tr><td style="padding:28px 0 24px;border-bottom:1px solid #1a1a1a;text-align:center">
    <img src="${SITE}/logo_arka.png" width="36" height="36" alt="ARKA" style="filter:brightness(0)invert(1);vertical-align:middle;margin-right:10px" />
    <span style="font-size:11px;letter-spacing:.5em;text-transform:uppercase;color:#C9A352;font-weight:700;vertical-align:middle">ARKA GLOBAL INVESTMENTS</span>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:32px 0 20px">
    <p style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#444;margin:0 0 16px">Investment Simulation Report</p>
    <h1 style="font-size:22px;font-weight:300;margin:0 0 12px;color:#fff">Hello, ${esc(firstName)}.</h1>
    <p style="font-size:14px;color:#888;line-height:1.8;margin:0">
      Here are the results of your personalized simulation using <strong style="color:#ccc">ARKA Global Investments</strong> strategies.
    </p>
  </td></tr>

  <!-- Primary KPI -->
  <tr><td style="padding:0 0 12px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:28px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:12px;text-align:center">
        <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#555;margin:0 0 10px">Projected Capital</p>
        <p style="font-size:36px;font-weight:700;color:#C9A352;margin:0;letter-spacing:-.5px">${fmtUSD(results.finalCapital)}</p>
        <p style="font-size:10px;color:#555;margin:8px 0 0">after ${params.years} year${params.years !== 1 ? 's' : ''}</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- KPI row -->
  <tr><td style="padding:0 0 28px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:49%;padding:18px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:#555;margin:0 0 8px">Total Contributed</p>
          <p style="font-size:18px;font-weight:300;color:#ccc;margin:0">${fmtUSD(results.totalContrib)}</p>
        </td>
        <td style="width:2%"></td>
        <td style="width:49%;padding:18px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:#555;margin:0 0 8px">Net Gain</p>
          <p style="font-size:18px;font-weight:300;color:#ccc;margin:0">${fmtUSD(results.netGain)} <span style="font-size:12px;color:#C9A352">×${results.multiplier}</span></p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Parameters -->
  <tr><td style="padding:24px 0;border-top:1px solid #1a1a1a">
    <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#3a3a3a;margin:0 0 16px">Simulation Parameters</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${paramRows.map(([k, v], i) => `<tr style="background:${i % 2 === 0 ? '#0d0d0d' : 'transparent'}">
        <td style="padding:9px 12px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#555">${k}</td>
        <td style="padding:9px 12px;font-size:11px;color:#bbb;text-align:right">${v}</td>
      </tr>`).join('')}
    </table>
  </td></tr>

  <!-- Benchmark comparison -->
  <tr><td style="padding:28px 0;border-top:1px solid #1a1a1a">
    <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#3a3a3a;margin:0 0 20px">Final Value vs Benchmarks</p>
    ${[
      { label: 'ARKA',    value: final.arka,  color: '#C9A352', bold: true  },
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

  <!-- Year-by-year table -->
  <tr><td style="padding:28px 0;border-top:1px solid #1a1a1a">
    <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#3a3a3a;margin:0 0 16px">Year-by-Year Growth</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      <tr style="background:#111">
        ${['Year','ARKA','S&amp;P 500','CETES','Contributed'].map(h =>
          `<td style="padding:8px 10px;font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:#555">${h}</td>`
        ).join('')}
      </tr>
      ${tableRows.map((r, i) => `<tr style="background:${i % 2 === 0 ? '#0d0d0d' : 'transparent'}">
        <td style="padding:8px 10px;font-size:10px;color:#666;font-family:monospace">Yr ${r.year}</td>
        <td style="padding:8px 10px;font-size:10px;color:#C9A352;font-weight:600">${fmtUSD(r.arka)}</td>
        <td style="padding:8px 10px;font-size:10px;color:#777">${fmtUSD(r.sp500)}</td>
        <td style="padding:8px 10px;font-size:10px;color:#666">${fmtUSD(r.cetes)}</td>
        <td style="padding:8px 10px;font-size:10px;color:#555">${fmtUSD(r.contributed)}</td>
      </tr>`).join('')}
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:32px 0;text-align:center;border-top:1px solid #1a1a1a">
    <p style="font-size:13px;color:#666;margin:0 0 20px;line-height:1.8">Ready to put your capital to work?</p>
    <a href="${SITE}/access" style="display:inline-block;background:#004C45;color:#fff;text-decoration:none;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding:14px 36px;border-radius:2px">
      Apply for Access
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 0;border-top:1px solid #111;text-align:center">
    <p style="font-size:9px;color:#2a2a2a;line-height:1.9;margin:0">
      ARKA Global Investments &nbsp;·&nbsp; This simulation uses target reference rates and does not guarantee future results.<br>
      Investing involves risk, including possible loss of principal. &nbsp;·&nbsp; Please do not reply to this email.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ── PDF builder ───────────────────────────────────────────────────────────────
async function buildPDF({ firstName, params, results, rows, logoBytes }) {
  const pdfDoc = await PDFDocument.create()
  const page   = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()

  const bold  = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const reg   = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const obliq = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const GOLD  = rgb(0.788, 0.639, 0.322)
  const WHITE = rgb(1, 1, 1)
  const LGRAY = rgb(0.8, 0.8, 0.8)
  const GRAY  = rgb(0.53, 0.53, 0.53)
  const DGRAY = rgb(0.2, 0.2, 0.2)
  const BG    = rgb(0.04, 0.04, 0.04)
  const CARD  = rgb(0.086, 0.086, 0.086)
  const ROW   = rgb(0.067, 0.067, 0.067)

  const M = 48
  const W = width - M * 2

  // Background
  page.drawRectangle({ x: 0, y: 0, width, height, color: BG })

  // Header
  page.drawRectangle({ x: 0, y: height - 68, width, height: 68, color: ROW })

  let logoDrawn = false
  if (logoBytes) {
    try {
      const logoImg  = await pdfDoc.embedPng(logoBytes)
      const logoDims = logoImg.scale(0.016)
      page.drawImage(logoImg, { x: M, y: height - 48, width: logoDims.width, height: logoDims.height })
      logoDrawn = true
    } catch { /* fall through to text */ }
  }
  const logoX = logoDrawn ? M + 54 : M
  page.drawText('ARKA GLOBAL INVESTMENTS', { x: logoX, y: height - 36, size: 8, font: bold, color: GOLD, characterSpacing: 3 })
  const rLabel = 'INVESTMENT SIMULATION REPORT'
  page.drawText(rLabel, { x: width - M - bold.widthOfTextAtSize(rLabel, 7.5), y: height - 36, size: 7.5, font: reg, color: GRAY, characterSpacing: 1.5 })

  let y = height - 88

  // Greeting
  page.drawText(`Hello, ${firstName}.`, { x: M, y, size: 20, font: obliq, color: WHITE })
  y -= 20
  page.drawText('Here are the results of your personalized investment simulation.', { x: M, y, size: 9.5, font: reg, color: GRAY })
  y -= 18
  page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.5, color: GOLD })
  y -= 22

  // Primary KPI
  page.drawText('PROJECTED CAPITAL', { x: M, y, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 18
  page.drawText(fmtUSD(results.finalCapital), { x: M, y, size: 30, font: bold, color: GOLD })
  y -= 16
  page.drawText(`after ${params.years} year${params.years !== 1 ? 's' : ''}`, { x: M, y, size: 9, font: reg, color: GRAY })
  y -= 22

  // Secondary KPIs
  const kpiW = (W - 10) / 2
  const kpiH = 48
  const kpis = [
    { label: 'TOTAL CONTRIBUTED', value: fmtUSD(results.totalContrib) },
    { label: 'NET GAIN',          value: `${fmtUSD(results.netGain)}  x${results.multiplier}` },
  ]
  kpis.forEach(({ label, value }, i) => {
    const kx = M + i * (kpiW + 10)
    const ky = y - kpiH
    page.drawRectangle({ x: kx, y: ky, width: kpiW, height: kpiH, color: CARD })
    page.drawText(label, { x: kx + 10, y: ky + kpiH - 14, size: 7, font: bold, color: GRAY, characterSpacing: 1 })
    page.drawText(value, { x: kx + 10, y: ky + 12, size: 12, font: bold, color: LGRAY })
  })
  y -= kpiH + 22

  // Parameters
  page.drawText('SIMULATION PARAMETERS', { x: M, y, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 14
  const paramRows = [
    ['Initial Capital',      fmtUSD(params.initial)],
    ['Monthly Contribution', fmtUSD(params.monthly)],
    ['Investment Horizon',   `${params.years} years`],
    ['Blended Annual Rate',  `${params.annual}%`],
    ['Strategy Mix',         `Foundation ${params.f}% / Growth ${params.g}% / Alpha ${params.a}%`],
    ['Compounding',          params.compound ? 'Compound Interest' : 'Simple Interest'],
  ]
  paramRows.forEach(([label, value], i) => {
    const rh = 20
    if (i % 2 === 0) page.drawRectangle({ x: M, y: y - rh + 5, width: W, height: rh, color: ROW })
    page.drawText(label, { x: M + 8, y: y - 8, size: 8.5, font: reg, color: GRAY })
    page.drawText(value, { x: M + W - reg.widthOfTextAtSize(value, 8.5) - 4, y: y - 8, size: 8.5, font: reg, color: LGRAY })
    y -= rh
  })
  y -= 16

  // Benchmark comparison
  page.drawText('FINAL VALUE VS BENCHMARKS', { x: M, y, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 16
  const final = rows[rows.length - 1]
  const benchmarks = [
    { label: 'ARKA',    value: final.arka,  color: GOLD                      },
    { label: 'S&P 500', value: final.sp500, color: rgb(0.58, 0.64, 0.72)     },
    { label: 'CETES',   value: final.cetes, color: rgb(0.39, 0.46, 0.55)     },
    { label: 'Banking', value: final.bank,  color: rgb(0.28, 0.34, 0.42)     },
  ]
  benchmarks.forEach(({ label, value, color }) => {
    const pct = value / final.arka
    page.drawText(label, { x: M, y, size: 8.5, font: reg, color: LGRAY })
    page.drawText(fmtUSD(value), { x: M + W - reg.widthOfTextAtSize(fmtUSD(value), 8.5), y, size: 8.5, font: reg, color })
    y -= 13
    page.drawRectangle({ x: M, y: y - 2, width: W, height: 3, color: DGRAY })
    page.drawRectangle({ x: M, y: y - 2, width: W * pct, height: 3, color })
    y -= 18
  })
  y -= 8

  // Year-by-year table — add new page if needed
  if (y < 200) {
    const page2 = pdfDoc.addPage([595, 842])
    page2.drawRectangle({ x: 0, y: 0, width, height, color: BG })
    page2.drawRectangle({ x: 0, y: height - 68, width, height: 68, color: ROW })
    page2.drawText('ARKA GLOBAL INVESTMENTS', { x: M, y: height - 36, size: 8, font: bold, color: GOLD, characterSpacing: 3 })
    page2.drawText('YEAR-BY-YEAR GROWTH', { x: width - M - bold.widthOfTextAtSize('YEAR-BY-YEAR GROWTH', 7.5), y: height - 36, size: 7.5, font: reg, color: GRAY, characterSpacing: 1.5 })
    await drawTable(page2, rows, params, M, height - 90, W, bold, reg, GOLD, GRAY, LGRAY, ROW, DGRAY, BG)
    // Footer page 2
    page2.drawLine({ start: { x: M, y: 50 }, end: { x: M + W, y: 50 }, thickness: 0.3, color: DGRAY })
    const ft = 'ARKA Global Investments  ·  Target reference rates only — does not guarantee results.'
    page2.drawText(ft, { x: (width - reg.widthOfTextAtSize(ft, 7)) / 2, y: 32, size: 7, font: reg, color: rgb(0.2, 0.2, 0.2) })
  } else {
    await drawTable(page, rows, params, M, y, W, bold, reg, GOLD, GRAY, LGRAY, ROW, DGRAY, BG)
  }

  // Footer page 1
  const footY = 34
  page.drawLine({ start: { x: M, y: footY + 18 }, end: { x: M + W, y: footY + 18 }, thickness: 0.3, color: DGRAY })
  const ft = 'ARKA Global Investments  ·  Target reference rates only — does not guarantee results. Investing involves risk.'
  page.drawText(ft, { x: (width - reg.widthOfTextAtSize(ft, 7)) / 2, y: footY, size: 7, font: reg, color: rgb(0.2, 0.2, 0.2) })

  return pdfDoc.save()
}

async function drawTable(page, rows, params, M, startY, W, bold, reg, GOLD, GRAY, LGRAY, ROW, DGRAY) {
  let y = startY
  const step = params.years <= 10 ? 1 : params.years <= 20 ? 2 : 5
  const tableRows = rows.filter((r, i) => i > 0 && (r.year % step === 0 || r.year === params.years))

  const cols = [
    { label: 'YEAR',        w: 0.08 },
    { label: 'ARKA',        w: 0.24 },
    { label: 'S&P 500',     w: 0.24 },
    { label: 'CETES',       w: 0.24 },
    { label: 'CONTRIBUTED', w: 0.20 },
  ]

  // Header row
  page.drawRectangle({ x: M, y: y - 18, width: W, height: 18, color: ROW })
  let cx = M + 6
  cols.forEach(({ label, w }) => {
    page.drawText(label, { x: cx, y: y - 13, size: 7, font: bold, color: GRAY, characterSpacing: 0.8 })
    cx += W * w
  })
  y -= 18

  tableRows.forEach((r, i) => {
    const rh = 17
    if (i % 2 === 0) page.drawRectangle({ x: M, y: y - rh, width: W, height: rh, color: rgb(0.055, 0.055, 0.055) })
    const fmtUSD_local = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
    const cells = [`Yr ${r.year}`, fmtUSD_local(r.arka), fmtUSD_local(r.sp500), fmtUSD_local(r.cetes), fmtUSD_local(r.contributed)]
    cx = M + 6
    cells.forEach((cell, ci) => {
      const color = ci === 1 ? GOLD : ci === 0 ? GRAY : LGRAY
      page.drawText(cell, { x: cx, y: y - rh + 5, size: 8, font: ci === 1 ? bold : reg, color })
      cx += W * cols[ci].w
    })
    y -= rh
  })
}
