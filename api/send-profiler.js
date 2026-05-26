import { Resend } from 'resend'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const resend = new Resend(process.env.RESEND_API_KEY)

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
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
  const { name, email, profile } = req.body || {}
  if (!email || !profile)
    return res.status(400).json({ error: 'Missing required fields' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))
    return res.status(400).json({ error: 'Invalid email' })

  const safeName  = String(name || 'Investor').replace(/[<>&"']/g, '')
  const firstName = safeName.split(' ')[0]

  // ── Generate PDF ──────────────────────────────────────────────────────────
  const pdfBuffer = await buildPDF({ firstName, profile })

  // ── Send email ─────────────────────────────────────────────────────────────
  const { error: mailErr } = await resend.emails.send({
    from:    process.env.RESEND_FROM || 'ARKA Global Investments <noreply@arkaglobalinvestments.com>',
    to:      email,
    subject: `ARKA — Your Investor Profile: ${esc(profile.name)}`,
    html:    buildEmail({ firstName, profile }),
    attachments: [{
      filename: 'ARKA-Investor-Profile.pdf',
      content:  Buffer.from(pdfBuffer).toString('base64'),
    }],
  })

  if (mailErr) {
    console.error('Resend error:', mailErr)
    return res.status(400).json({ error: 'Error sending email', detail: mailErr.message || String(mailErr) })
  }

  // ── Telegram notification ─────────────────────────────────────────────────
  await sendTelegram(
    `🎯 <b>Nuevo Perfil — ARKA</b>\n\n` +
    `👤 ${esc(name || '(sin nombre)')}\n` +
    `📧 ${esc(email)}\n\n` +
    `📋 Perfil: <b>${esc(profile.name)}</b>\n` +
    `💹 Tasa referencia: <b>${esc(profile.rate)}</b>\n` +
    `📊 Estrategia recomendada: <b>${esc(profile.strategy)}</b>\n` +
    `🔢 Score: <b>${profile.score} / 200</b>\n` +
    `🔀 Asignación: Foundation ${profile.alloc?.foundation}% · Growth ${profile.alloc?.growth}% · Alpha ${profile.alloc?.alpha}%`
  )

  return res.status(200).json({ sent: true })
}

// ── Email template ────────────────────────────────────────────────────────────
function buildEmail({ firstName, profile }) {
  const alloc = profile.alloc || {}
  const allocBars = [
    { label: 'Foundation',      val: alloc.foundation || 0, rate: '18%', color: '#C9A352' },
    { label: 'Strategic Growth', val: alloc.growth    || 0, rate: '24%', color: '#A08040' },
    { label: 'Alpha Force',      val: alloc.alpha     || 0, rate: '36%', color: '#7a6030' },
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ARKA Investor Profile</title></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#fff;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505">
<tr><td align="center" style="padding:48px 16px">
<table width="100%" style="max-width:560px;border-collapse:collapse">

  <tr><td style="padding-bottom:32px;border-bottom:1px solid #161616;text-align:center">
    <p style="font-size:10px;letter-spacing:.55em;text-transform:uppercase;color:#C9A352;margin:0;font-weight:600">ARKA GLOBAL INVESTMENTS</p>
  </td></tr>

  <tr><td style="padding:36px 0 24px">
    <p style="font-size:10px;letter-spacing:.35em;text-transform:uppercase;color:#444;margin:0 0 20px">Investor Risk Profile</p>
    <h1 style="font-size:22px;font-weight:300;margin:0 0 16px;line-height:1.4;color:#fff">Hello, ${firstName}.</h1>
    <p style="font-size:14px;color:#888;line-height:1.9;margin:0">
      Based on your responses, we have identified your investor profile within
      <strong style="color:#ddd">ARKA Global Investments</strong>.
    </p>
  </td></tr>

  <tr><td style="padding:8px 0 24px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:28px;background:#0c0c0c;border:1px solid #1e1e1e;border-radius:12px;text-align:center">
        <p style="font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:#444;margin:0 0 12px">Your Investor Profile</p>
        <p style="font-size:28px;font-weight:300;color:#C9A352;margin:0">${esc(profile.name)}</p>
        <p style="font-size:12px;color:#666;margin:12px auto 0;line-height:1.7;max-width:380px">${esc(profile.desc || '')}</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 0 24px">
    <table width="100%" cellpadding="0" cellspacing="8">
      <tr>
        <td width="32%" style="padding:16px;background:#0c0c0c;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:#444;margin:0 0 8px">Score</p>
          <p style="font-size:16px;font-weight:300;color:#C9A352;margin:0">${profile.score} / 200</p>
        </td>
        <td width="8px"></td>
        <td width="32%" style="padding:16px;background:#0c0c0c;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:#444;margin:0 0 8px">Target Rate</p>
          <p style="font-size:16px;font-weight:300;color:#C9A352;margin:0">${esc(profile.rate)}</p>
        </td>
        <td width="8px"></td>
        <td width="32%" style="padding:16px;background:#0c0c0c;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:#444;margin:0 0 8px">Strategy</p>
          <p style="font-size:13px;font-weight:300;color:#ddd;margin:0">${esc(profile.strategy)}</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="padding:24px 0;border-top:1px solid #161616;border-bottom:1px solid #161616">
    <p style="font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:#3a3a3a;margin:0 0 20px">Suggested Strategy Allocation</p>
    ${allocBars.map(b => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px">
      <tr>
        <td style="font-size:11px;color:#999;padding-bottom:6px">${b.label} <span style="color:#444;font-size:10px">(${b.rate})</span></td>
        <td style="font-size:11px;color:#C9A352;text-align:right;padding-bottom:6px">${b.val}%</td>
      </tr>
      <tr><td colspan="2">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="${b.val}%" style="height:4px;background:${b.color};border-radius:2px"></td>
          <td style="height:4px;background:#1a1a1a;border-radius:2px"></td>
        </tr></table>
      </td></tr>
    </table>`).join('')}
  </td></tr>

  <tr><td style="padding:36px 0;text-align:center">
    <p style="font-size:13px;color:#777;margin:0 0 24px;line-height:1.8">Your profile is the first step.</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr>
      <td style="padding-right:10px">
        <a href="${process.env.SITE_URL || 'https://arkaglobalinvestments.com'}/access"
          style="display:inline-block;background:#004C45;color:#fff;text-decoration:none;font-size:10px;letter-spacing:.22em;text-transform:uppercase;padding:14px 28px;border-radius:2px">
          Apply for Access
        </a>
      </td>
      <td>
        <a href="${process.env.SITE_URL || 'https://arkaglobalinvestments.com'}/simulator"
          style="display:inline-block;border:1px solid #2a2a2a;color:#888;text-decoration:none;font-size:10px;letter-spacing:.22em;text-transform:uppercase;padding:14px 28px;border-radius:2px">
          Run Simulation
        </a>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:24px 0;border-top:1px solid #111;text-align:center">
    <p style="font-size:9px;color:#2a2a2a;line-height:2;margin:0">
      ARKA Global Investments<br>
      This profile is for informational purposes only and does not constitute financial advice.<br>
      Please do not reply to this email.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ── PDF builder (pdf-lib) ─────────────────────────────────────────────────────
async function buildPDF({ firstName, profile }) {
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

  const M = 56
  const W = width - M * 2

  // ── Background ──
  page.drawRectangle({ x: 0, y: 0, width, height, color: BG })

  // ── Header bar ──
  page.drawRectangle({ x: 0, y: height - 70, width, height: 70, color: rgb(0.067, 0.067, 0.067) })
  page.drawText('ARKA GLOBAL INVESTMENTS', { x: M, y: height - 38, size: 8, font: bold, color: GOLD, characterSpacing: 3 })
  const rLabel = 'INVESTOR RISK PROFILE'
  const rW = bold.widthOfTextAtSize(rLabel, 8)
  page.drawText(rLabel, { x: width - M - rW, y: height - 38, size: 8, font: reg, color: GRAY, characterSpacing: 1.5 })

  let y = height - 100

  // ── Greeting ──
  page.drawText(`Hello, ${firstName}.`, { x: M, y, size: 22, font: obliq, color: WHITE })
  y -= 22
  page.drawText('Based on your responses, we have identified your investor profile.', { x: M, y, size: 10, font: reg, color: GRAY })
  y -= 22

  // ── Gold divider ──
  page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.5, color: GOLD })
  y -= 28

  // ── Profile name ──
  page.drawText('YOUR INVESTOR PROFILE', { x: M, y, size: 8, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 22
  page.drawText(profile.name || '', { x: M, y, size: 30, font: bold, color: GOLD })
  y -= 22

  // Wrap description
  const desc = profile.desc || ''
  const words = desc.split(' ')
  let line = ''
  const lineH = 16
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (reg.widthOfTextAtSize(test, 10) > W) {
      page.drawText(line, { x: M, y, size: 10, font: reg, color: LGRAY })
      y -= lineH
      line = word
    } else {
      line = test
    }
  }
  if (line) { page.drawText(line, { x: M, y, size: 10, font: reg, color: LGRAY }); y -= lineH }
  y -= 16

  // ── Stats row ──
  const statW = (W - 24) / 3
  const statH = 54
  const stats = [
    { label: 'PROFILE SCORE',  value: `${profile.score} / 200` },
    { label: 'REFERENCE RATE', value: profile.rate              },
    { label: 'STRATEGY',       value: profile.strategy          },
  ]
  stats.forEach(({ label, value }, i) => {
    const sx = M + i * (statW + 12)
    const sy = y - statH
    page.drawRectangle({ x: sx, y: sy, width: statW, height: statH, color: CARD })
    page.drawText(label, { x: sx + 10, y: sy + statH - 16, size: 7, font: bold, color: GRAY, characterSpacing: 1 })
    const vSize = i === 2 ? 9 : 14
    const vColor = i === 2 ? LGRAY : GOLD
    page.drawText(String(value || ''), { x: sx + 10, y: sy + 12, size: vSize, font: bold, color: vColor })
  })
  y -= statH + 28

  // ── Allocation bars ──
  page.drawText('SUGGESTED STRATEGY ALLOCATION', { x: M, y, size: 8, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 18

  const alloc = profile.alloc || {}
  const allocRows = [
    { label: 'Foundation (18%)',       pct: alloc.foundation || 0, color: GOLD },
    { label: 'Strategic Growth (24%)', pct: alloc.growth     || 0, color: rgb(0.627, 0.502, 0.251) },
    { label: 'Alpha Force (36%)',      pct: alloc.alpha      || 0, color: rgb(0.478, 0.376, 0.188) },
  ]

  allocRows.forEach(({ label, pct, color }) => {
    page.drawText(label, { x: M, y, size: 9, font: reg, color: LGRAY })
    const pW = bold.widthOfTextAtSize(`${pct}%`, 9)
    page.drawText(`${pct}%`, { x: M + W - pW, y, size: 9, font: bold, color: GOLD })
    y -= 14
    page.drawRectangle({ x: M, y: y - 2, width: W, height: 3, color: DGRAY })
    if (pct > 0) page.drawRectangle({ x: M, y: y - 2, width: W * (pct / 100), height: 3, color })
    y -= 22
  })

  // ── Disclaimer ──
  y -= 8
  const disc = 'This profiling is indicative only and does not constitute financial advice. Strategy assignment is subject to eligibility review, KYC/AML, and applicable legal documents.'
  const discWords = disc.split(' ')
  let dLine = ''
  for (const w of discWords) {
    const test = dLine ? `${dLine} ${w}` : w
    if (reg.widthOfTextAtSize(test, 7.5) > W) {
      page.drawText(dLine, { x: M, y, size: 7.5, font: reg, color: DGRAY })
      y -= 13
      dLine = w
    } else { dLine = test }
  }
  if (dLine) page.drawText(dLine, { x: M, y, size: 7.5, font: reg, color: DGRAY })

  // ── Footer ──
  const footY = 40
  page.drawLine({ start: { x: M, y: footY + 20 }, end: { x: M + W, y: footY + 20 }, thickness: 0.3, color: DGRAY })
  const footText = 'ARKA Global Investments  ·  Investor Profile Report  ·  For informational purposes only.'
  const ftW = reg.widthOfTextAtSize(footText, 7.5)
  page.drawText(footText, { x: (width - ftW) / 2, y: footY, size: 7.5, font: reg, color: rgb(0.2, 0.2, 0.2) })

  return pdfDoc.save()
}
