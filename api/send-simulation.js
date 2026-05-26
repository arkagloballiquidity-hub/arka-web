import { Resend } from 'resend'
import PDFDocument from 'pdfkit'

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

  const safeName  = esc(name || 'Investor')
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
      content:  pdfBuffer.toString('base64'),
    }],
  })

  if (mailErr) {
    console.error('Resend error:', mailErr)
    return res.status(400).json({ error: 'Error sending email', detail: mailErr.message || String(mailErr) })
  }

  // ── Telegram notification to Gabriel ────────────────────────────────────────
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

  <!-- Logo / Brand -->
  <tr><td style="padding-bottom:32px;border-bottom:1px solid #161616;text-align:center">
    <p style="font-size:10px;letter-spacing:.55em;text-transform:uppercase;color:#C9A352;margin:0;font-weight:600">
      ARKA GLOBAL INVESTMENTS
    </p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:36px 0 24px">
    <p style="font-size:10px;letter-spacing:.35em;text-transform:uppercase;color:#444;margin:0 0 20px">
      Investment Simulation Report
    </p>
    <h1 style="font-size:22px;font-weight:300;margin:0 0 16px;line-height:1.4;color:#fff">
      Hello, ${firstName}.
    </h1>
    <p style="font-size:14px;color:#888;line-height:1.9;margin:0">
      Here are the results of your personalized investment simulation using
      <strong style="color:#ddd">ARKA Global Investments</strong> strategies.
      These projections are based on target reference rates.
    </p>
  </td></tr>

  <!-- Primary KPI -->
  <tr><td style="padding:8px 0">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:24px;background:#0c0c0c;border:1px solid #1e1e1e;border-radius:12px;text-align:center">
        <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#555;margin:0 0 10px">
          Projected Capital
        </p>
        <p style="font-size:32px;font-weight:300;color:#C9A352;margin:0;letter-spacing:-.5px">
          ${fmtUSD(results.finalCapital)}
        </p>
        <p style="font-size:10px;color:#444;margin:8px 0 0;letter-spacing:.1em">
          after ${params.years} year${params.years !== 1 ? 's' : ''}
        </p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Secondary KPIs -->
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

  <!-- Parameters -->
  <tr><td style="padding:24px 0;border-top:1px solid #161616;border-bottom:1px solid #161616">
    <p style="font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:#3a3a3a;margin:0 0 18px">
      Simulation Parameters
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${rows.map(([k, v]) => `
      <tr>
        <td style="padding:7px 0;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#444">${k}</td>
        <td style="padding:7px 0;font-size:12px;color:#bbb;text-align:right">${v}</td>
      </tr>`).join('')}
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:36px 0;text-align:center">
    <p style="font-size:13px;color:#777;margin:0 0 24px;line-height:1.8;max-width:400px;margin-left:auto;margin-right:auto">
      Ready to put your capital to work with institutional-grade discipline?
    </p>
    <a href="${process.env.SITE_URL || 'https://arkaglobalinvestments.com'}/access"
      style="display:inline-block;background:#004C45;color:#fff;text-decoration:none;font-size:10px;letter-spacing:.22em;text-transform:uppercase;padding:14px 36px;border-radius:2px">
      Apply for Access
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 0;border-top:1px solid #111;text-align:center">
    <p style="font-size:9px;color:#2a2a2a;line-height:2;margin:0">
      ARKA Global Investments<br>
      ⚠ This simulation uses target reference rates and does not guarantee future results.<br>
      Investing involves risk, including possible loss of principal.<br>
      Please do not reply to this email.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ── PDF builder ───────────────────────────────────────────────────────────────
function buildPDF({ firstName, params, results }) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margin: 56, info: { Title: 'ARKA Investment Simulation Report' } })
    const chunks = []
    doc.on('data',  c => chunks.push(c))
    doc.on('end',   () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const GOLD  = '#C9A352'
    const DARK  = '#0A0A0A'
    const GRAY  = '#888888'
    const LIGHT = '#CCCCCC'
    const W     = doc.page.width - 112  // content width

    // ── Background ──
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK)

    // ── Header bar ──
    doc.rect(0, 0, doc.page.width, 80).fill('#111111')
    doc.fontSize(8).fillColor(GOLD).font('Helvetica-Bold')
       .text('ARKA GLOBAL INVESTMENTS', 56, 34, { characterSpacing: 4 })
    doc.fontSize(8).fillColor(GRAY).font('Helvetica')
       .text('INVESTMENT SIMULATION REPORT', { align: 'right', characterSpacing: 2 })

    // ── Greeting ──
    doc.moveDown(2)
    doc.fontSize(22).fillColor('#FFFFFF').font('Helvetica-Oblique')
       .text(`Hello, ${firstName}.`, 56)
    doc.fontSize(10).fillColor(GRAY).font('Helvetica').moveDown(0.4)
       .text('Here are the results of your personalized investment simulation.', 56)

    // ── Gold divider ──
    const y1 = doc.y + 18
    doc.moveTo(56, y1).lineTo(56 + W, y1).lineWidth(0.5).strokeColor(GOLD).stroke()

    // ── Primary KPI ──
    doc.moveDown(1.8)
    doc.fontSize(9).fillColor(GRAY).font('Helvetica').characterSpacing(2)
       .text('PROJECTED CAPITAL', 56, doc.y, { characterSpacing: 2 })
    doc.fontSize(36).fillColor(GOLD).font('Helvetica-Bold').characterSpacing(0)
       .text(fmtUSD(results.finalCapital), 56)
    doc.fontSize(9).fillColor(GRAY).font('Helvetica')
       .text(`after ${params.years} year${params.years !== 1 ? 's' : ''}`, 56)

    // ── Secondary KPIs (side by side) ──
    doc.moveDown(1.2)
    const kpiY  = doc.y
    const kpiW  = (W - 16) / 2

    ;[
      { label: 'TOTAL CONTRIBUTED', value: fmtUSD(results.totalContrib) },
      { label: 'NET GAIN',          value: `${fmtUSD(results.netGain)}  ×${results.multiplier}` },
    ].forEach((k, i) => {
      const x = 56 + i * (kpiW + 16)
      doc.rect(x, kpiY, kpiW, 54).fill('#161616')
      doc.fontSize(8).fillColor(GRAY).font('Helvetica').characterSpacing(1.5)
         .text(k.label, x + 14, kpiY + 12, { width: kpiW - 28 })
      doc.fontSize(15).fillColor(LIGHT).font('Helvetica-Bold').characterSpacing(0)
         .text(k.value, x + 14, kpiY + 28, { width: kpiW - 28 })
    })

    // ── Parameters table ──
    doc.moveDown(0.5)
    doc.y = kpiY + 74
    doc.fontSize(8).fillColor(GRAY).font('Helvetica').characterSpacing(2)
       .text('SIMULATION PARAMETERS', 56)
    doc.moveDown(0.5)

    const paramRows = [
      ['Initial Capital',      fmtUSD(params.initial)],
      ['Monthly Contribution', fmtUSD(params.monthly)],
      ['Investment Horizon',   `${params.years} years`],
      ['Blended Annual Rate',  `${params.annual}%`],
      ['Strategy Mix',         `Foundation ${params.f}%  ·  Growth ${params.g}%  ·  Alpha ${params.a}%`],
      ['Compounding',          params.compound ? 'Compound Interest' : 'Simple Interest'],
    ]

    paramRows.forEach(([label, value], i) => {
      const rowY = doc.y
      if (i % 2 === 0) doc.rect(56, rowY - 4, W, 22).fill('#111111')
      doc.fontSize(9).fillColor(GRAY).font('Helvetica').characterSpacing(0)
         .text(label, 70, rowY)
      doc.fontSize(9).fillColor(LIGHT).font('Helvetica')
         .text(value, 56, rowY, { width: W, align: 'right' })
      doc.moveDown(0.55)
    })

    // ── Strategy allocation bars ──
    doc.moveDown(0.8)
    doc.fontSize(8).fillColor(GRAY).font('Helvetica').characterSpacing(2)
       .text('STRATEGY ALLOCATION', 56)
    doc.moveDown(0.6)

    const allocs = [
      { label: 'Foundation (18%)',       pct: params.f, color: '#C9A352' },
      { label: 'Strategic Growth (24%)', pct: params.g, color: '#A08040' },
      { label: 'Alpha Force (36%)',      pct: params.a, color: '#7a6030' },
    ]

    allocs.forEach(({ label, pct, color }) => {
      const barY = doc.y
      doc.fontSize(9).fillColor(LIGHT).font('Helvetica').characterSpacing(0)
         .text(label, 56, barY)
      doc.fontSize(9).fillColor(GOLD)
         .text(`${pct}%`, 56, barY, { width: W, align: 'right' })
      doc.moveDown(0.3)
      const trackY = doc.y
      doc.rect(56, trackY, W, 3).fill('#1e1e1e')
      if (pct > 0) doc.rect(56, trackY, W * (pct / 100), 3).fill(color)
      doc.moveDown(0.9)
    })

    // ── Footer ──
    const footY = doc.page.height - 60
    doc.moveTo(56, footY).lineTo(56 + W, footY).lineWidth(0.3).strokeColor('#222222').stroke()
    doc.fontSize(7.5).fillColor('#333333').font('Helvetica').characterSpacing(0)
       .text(
         'ARKA Global Investments  ·  This report uses target reference rates and does not guarantee future results. Investing involves risk.',
         56, footY + 10, { width: W, align: 'center' }
       )

    doc.end()
  })
}
