import { Resend } from 'resend'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const resend = new Resend(process.env.RESEND_API_KEY)

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

export default async function handler(req, res) {
  // ── CORS ──────────────────────────────────────────────────────────────────
  const origin  = req.headers.origin || ''
  const allowed = (process.env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim())
  const isOk    = /^https?:\/\/localhost(:\d+)?$/.test(origin) || allowed.includes(origin)
  res.setHeader('Access-Control-Allow-Origin',  isOk ? origin : 'null')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).end()

  // ── Validate ───────────────────────────────────────────────────────────────
  const { name, email, params, results } = req.body || {}
  if (!email || !params || !results)
    return res.status(400).json({ error: 'Missing required fields' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))
    return res.status(400).json({ error: 'Invalid email' })

  const safeName  = String(name || 'Investor').replace(/[<>&"']/g, '')
  const firstName = safeName.split(' ')[0]

  // ── Generate PDF ──────────────────────────────────────────────────────────
  const pdfBuffer = await buildPDF({ firstName, params, results })

  // ── Send email ─────────────────────────────────────────────────────────────
  const { error: mailErr } = await resend.emails.send({
    from:    process.env.RESEND_FROM || 'ARKA Global Investments <noreply@arkaglobalinvestments.com>',
    to:      email,
    subject: 'ARKA — Your Investment Simulation Results',
    html:    buildEmail({ firstName, params, results }),
    attachments: [{
      filename: 'ARKA-Simulation-Report.pdf',
      content:  Buffer.from(pdfBuffer).toString('base64'),
    }],
  })

  if (mailErr) {
    console.error('Resend error:', mailErr)
    return res.status(400).json({ error: 'Error sending email', detail: mailErr.message || String(mailErr) })
  }

  // ── Telegram notification ─────────────────────────────────────────────────
  await sendTelegram(
    `📊 <b>Nueva Simulación — ARKA</b>\n\n` +
    `👤 ${esc(name || '(sin nombre)')}\n` +
    `📧 ${esc(email)}\n\n` +
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
function buildEmail({ firstName, params, results }) {
  const rows = [
    ['Initial Capital',       fmtUSD(params.initial)],
    ['Monthly Contribution',  fmtUSD(params.monthly)],
    ['Investment Horizon',    `${params.years} years`],
    ['Blended Annual Rate',   `${params.annual}%`],
    ['Strategy Mix',          `Foundation ${params.f}% · Growth ${params.g}% · Alpha ${params.a}%`],
    ['Compounding Mode',      params.compound ? 'Compound Interest' : 'Simple Interest'],
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ARKA Simulation Results</title></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#fff;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505">
<tr><td align="center" style="padding:48px 16px">
<table width="100%" style="max-width:560px;border-collapse:collapse">

  <tr><td style="padding-bottom:32px;border-bottom:1px solid #161616;text-align:center">
    <p style="font-size:10px;letter-spacing:.55em;text-transform:uppercase;color:#C9A352;margin:0;font-weight:600">
      ARKA GLOBAL INVESTMENTS
    </p>
  </td></tr>

  <tr><td style="padding:36px 0 24px">
    <p style="font-size:10px;letter-spacing:.35em;text-transform:uppercase;color:#444;margin:0 0 20px">Investment Simulation Report</p>
    <h1 style="font-size:22px;font-weight:300;margin:0 0 16px;line-height:1.4;color:#fff">Hello, ${firstName}.</h1>
    <p style="font-size:14px;color:#888;line-height:1.9;margin:0">
      Here are the results of your personalized investment simulation using
      <strong style="color:#ddd">ARKA Global Investments</strong> strategies.
    </p>
  </td></tr>

  <tr><td style="padding:8px 0">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:24px;background:#0c0c0c;border:1px solid #1e1e1e;border-radius:12px;text-align:center">
        <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#555;margin:0 0 10px">Projected Capital</p>
        <p style="font-size:32px;font-weight:300;color:#C9A352;margin:0;letter-spacing:-.5px">${fmtUSD(results.finalCapital)}</p>
        <p style="font-size:10px;color:#444;margin:8px 0 0">after ${params.years} year${params.years !== 1 ? 's' : ''}</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:8px 0 24px">
    <table width="100%" cellpadding="0" cellspacing="8">
      <tr>
        <td width="50%" style="padding:18px;background:#0c0c0c;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:#444;margin:0 0 8px">Total Contributed</p>
          <p style="font-size:18px;font-weight:300;color:#ddd;margin:0">${fmtUSD(results.totalContrib)}</p>
        </td>
        <td width="8px"></td>
        <td width="50%" style="padding:18px;background:#0c0c0c;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:#444;margin:0 0 8px">Net Gain</p>
          <p style="font-size:18px;font-weight:300;color:#ddd;margin:0">${fmtUSD(results.netGain)}
            <span style="font-size:11px;color:#C9A352;margin-left:4px">×${results.multiplier}</span>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="padding:24px 0;border-top:1px solid #161616;border-bottom:1px solid #161616">
    <p style="font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:#3a3a3a;margin:0 0 18px">Simulation Parameters</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${rows.map(([k, v]) => `
      <tr>
        <td style="padding:7px 0;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#444">${k}</td>
        <td style="padding:7px 0;font-size:12px;color:#bbb;text-align:right">${v}</td>
      </tr>`).join('')}
    </table>
  </td></tr>

  <tr><td style="padding:36px 0;text-align:center">
    <p style="font-size:13px;color:#777;margin:0 0 24px;line-height:1.8">Ready to put your capital to work?</p>
    <a href="${process.env.SITE_URL || 'https://arkaglobalinvestments.com'}/access"
      style="display:inline-block;background:#004C45;color:#fff;text-decoration:none;font-size:10px;letter-spacing:.22em;text-transform:uppercase;padding:14px 36px;border-radius:2px">
      Apply for Access
    </a>
  </td></tr>

  <tr><td style="padding:24px 0;border-top:1px solid #111;text-align:center">
    <p style="font-size:9px;color:#2a2a2a;line-height:2;margin:0">
      ARKA Global Investments<br>
      ⚠ This simulation uses target reference rates and does not guarantee future results.<br>
      Please do not reply to this email.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ── PDF builder (pdf-lib) ─────────────────────────────────────────────────────
async function buildPDF({ firstName, params, results }) {
  const pdfDoc = await PDFDocument.create()
  const page   = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const reg    = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const obliq  = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const GOLD  = rgb(0.788, 0.639, 0.322)
  const WHITE = rgb(1, 1, 1)
  const LGRAY = rgb(0.8, 0.8, 0.8)
  const GRAY  = rgb(0.53, 0.53, 0.53)
  const DGRAY = rgb(0.2, 0.2, 0.2)
  const BG    = rgb(0.04, 0.04, 0.04)
  const CARD  = rgb(0.086, 0.086, 0.086)

  const M = 56  // margin
  const W = width - M * 2

  // ── Background ──
  page.drawRectangle({ x: 0, y: 0, width, height, color: BG })

  // ── Header bar ──
  page.drawRectangle({ x: 0, y: height - 70, width, height: 70, color: rgb(0.067, 0.067, 0.067) })
  page.drawText('ARKA GLOBAL INVESTMENTS', { x: M, y: height - 38, size: 8, font: bold, color: GOLD, characterSpacing: 3 })
  const rLabel = 'INVESTMENT SIMULATION REPORT'
  const rW = bold.widthOfTextAtSize(rLabel, 8)
  page.drawText(rLabel, { x: width - M - rW, y: height - 38, size: 8, font: reg, color: GRAY, characterSpacing: 1.5 })

  let y = height - 100

  // ── Greeting ──
  page.drawText(`Hello, ${firstName}.`, { x: M, y, size: 22, font: obliq, color: WHITE })
  y -= 22
  page.drawText('Here are the results of your personalized investment simulation.', { x: M, y, size: 10, font: reg, color: GRAY })
  y -= 22

  // ── Gold divider ──
  page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.5, color: GOLD })
  y -= 28

  // ── Primary KPI ──
  page.drawText('PROJECTED CAPITAL', { x: M, y, size: 8, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 20
  const capText = fmtUSD(results.finalCapital)
  page.drawText(capText, { x: M, y, size: 32, font: bold, color: GOLD })
  y -= 18
  page.drawText(`after ${params.years} year${params.years !== 1 ? 's' : ''}`, { x: M, y, size: 9, font: reg, color: GRAY })
  y -= 28

  // ── Secondary KPIs ──
  const kpiW = (W - 12) / 2
  const kpiH = 52
  const kpis = [
    { label: 'TOTAL CONTRIBUTED', value: fmtUSD(results.totalContrib) },
    { label: 'NET GAIN',          value: `${fmtUSD(results.netGain)}  x${results.multiplier}` },
  ]
  kpis.forEach(({ label, value }, i) => {
    const kx = M + i * (kpiW + 12)
    const ky = y - kpiH
    page.drawRectangle({ x: kx, y: ky, width: kpiW, height: kpiH, color: CARD })
    page.drawText(label, { x: kx + 12, y: ky + kpiH - 18, size: 7.5, font: bold, color: GRAY, characterSpacing: 1 })
    page.drawText(value, { x: kx + 12, y: ky + 14, size: 13, font: bold, color: LGRAY })
  })
  y -= kpiH + 28

  // ── Parameters ──
  page.drawText('SIMULATION PARAMETERS', { x: M, y, size: 8, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 14

  const paramRows = [
    ['Initial Capital',      fmtUSD(params.initial)],
    ['Monthly Contribution', fmtUSD(params.monthly)],
    ['Investment Horizon',   `${params.years} years`],
    ['Blended Annual Rate',  `${params.annual}%`],
    ['Strategy Mix',         `Foundation ${params.f}%  /  Growth ${params.g}%  /  Alpha ${params.a}%`],
    ['Compounding',          params.compound ? 'Compound Interest' : 'Simple Interest'],
  ]

  paramRows.forEach(([label, value], i) => {
    const rowH = 22
    if (i % 2 === 0) {
      page.drawRectangle({ x: M, y: y - rowH + 6, width: W, height: rowH, color: rgb(0.067, 0.067, 0.067) })
    }
    page.drawText(label, { x: M + 10, y: y - 8, size: 9, font: reg, color: GRAY })
    const vW = reg.widthOfTextAtSize(value, 9)
    page.drawText(value, { x: M + W - vW, y: y - 8, size: 9, font: reg, color: LGRAY })
    y -= rowH
  })

  y -= 20

  // ── Allocation bars ──
  page.drawText('STRATEGY ALLOCATION', { x: M, y, size: 8, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 18

  const allocs = [
    { label: 'Foundation (18%)',       pct: params.f, color: GOLD },
    { label: 'Strategic Growth (24%)', pct: params.g, color: rgb(0.627, 0.502, 0.251) },
    { label: 'Alpha Force (36%)',      pct: params.a, color: rgb(0.478, 0.376, 0.188) },
  ]

  allocs.forEach(({ label, pct, color }) => {
    page.drawText(label, { x: M, y, size: 9, font: reg, color: LGRAY })
    const pW = bold.widthOfTextAtSize(`${pct}%`, 9)
    page.drawText(`${pct}%`, { x: M + W - pW, y, size: 9, font: bold, color: GOLD })
    y -= 14
    page.drawRectangle({ x: M, y: y - 2, width: W, height: 3, color: DGRAY })
    if (pct > 0) page.drawRectangle({ x: M, y: y - 2, width: W * (pct / 100), height: 3, color })
    y -= 22
  })

  // ── Footer ──
  const footY = 40
  page.drawLine({ start: { x: M, y: footY + 20 }, end: { x: M + W, y: footY + 20 }, thickness: 0.3, color: DGRAY })
  const footText = 'ARKA Global Investments  ·  Target reference rates only — does not guarantee results. Investing involves risk.'
  const ftW = reg.widthOfTextAtSize(footText, 7.5)
  page.drawText(footText, { x: (width - ftW) / 2, y: footY, size: 7.5, font: reg, color: rgb(0.2, 0.2, 0.2) })

  return pdfDoc.save()
}
