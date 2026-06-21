import { Resend } from 'resend'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE   = process.env.SITE_URL || 'https://www.arkaglobalinvestments.com'
const CONTACT_EMAIL = 'contacto@arkaltd.io'

// Risk-tier accent colors (shared with the site + simulator email)
const RISK_COLORS = ['#5E97C2', '#46B58F', '#C9A352', '#E0705A', '#9B6FD4']
function riskColor(f, g, a) {
  const rate = (f * 0.18 + g * 0.24 + a * 0.36) / 100 * 100
  if (rate <= 20)   return RISK_COLORS[0]
  if (rate <= 23)   return RISK_COLORS[1]
  if (rate <= 27.5) return RISK_COLORS[2]
  if (rate <= 33)   return RISK_COLORS[3]
  return RISK_COLORS[4]
}

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
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).end()

  const { name, email, profile } = req.body || {}
  if (!email || !profile)
    return res.status(400).json({ error: 'Missing required fields' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))
    return res.status(400).json({ error: 'Invalid email' })

  const safeName  = String(name || 'Investor').replace(/[<>&"']/g, '')
  const firstName = safeName.split(' ')[0]

  const pdfBuffer = await buildPDF({ firstName, profile })

  const { error: mailErr } = await resend.emails.send({
    from:    process.env.RESEND_FROM || 'ARKA Global Investments <noreply@arkaglobalinvestments.com>',
    to:      email,
    subject: `ARKA — Your Investor Profile: ${esc(profile.name)}`,
    html:    buildEmail({ firstName, profile }),
    attachments: [{ filename: 'ARKA-Investor-Profile.pdf', content: Buffer.from(pdfBuffer).toString('base64') }],
  })

  if (mailErr) {
    console.error('Resend error:', mailErr)
    return res.status(400).json({ error: 'Error sending email', detail: mailErr.message || String(mailErr) })
  }

  await sendTelegram(
    `🎯 <b>Nuevo Perfil — ARKA</b>\n\n` +
    `👤 ${esc(name || '(sin nombre)')}\n📧 ${esc(email)}\n\n` +
    `📋 Perfil: <b>${esc(profile.name)}</b>\n` +
    `💹 Tasa referencia: <b>${esc(profile.rate)}</b>\n` +
    `📊 Estrategia: <b>${esc(profile.strategy)}</b>\n` +
    `🔢 Score: <b>${profile.score} / 200</b>\n` +
    `🔀 Asignación: Foundation ${profile.alloc?.foundation}% · Growth ${profile.alloc?.growth}% · Alpha ${profile.alloc?.alpha}%`
  )

  return res.status(200).json({ sent: true })
}

// ── Email template ────────────────────────────────────────────────────────────
function buildEmail({ firstName, profile }) {
  const alloc = profile.alloc || {}
  const accent = riskColor(alloc.foundation || 0, alloc.growth || 0, alloc.alpha || 0)
  const allocBars = [
    { label: 'Foundation',       val: alloc.foundation || 0, rate: '18%', color: accent },
    { label: 'Strategic Growth', val: alloc.growth     || 0, rate: '24%', color: accent },
    { label: 'Alpha Force',      val: alloc.alpha      || 0, rate: '36%', color: accent },
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ARKA Investor Profile</title></head>
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
    <p style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#444;margin:0 0 16px">Investor Risk Profile</p>
    <h1 style="font-size:22px;font-weight:300;margin:0 0 12px;color:#fff">Hello, ${esc(firstName)}.</h1>
    <p style="font-size:14px;color:#888;line-height:1.8;margin:0">
      Based on your responses, we have identified your investor profile within <strong style="color:#ccc">ARKA Global Investments</strong>.
    </p>
  </td></tr>

  <!-- Profile card -->
  <tr><td style="padding:0 0 20px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:28px 24px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:12px;text-align:center;border-left:3px solid ${accent}">
        <p style="font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:#444;margin:0 0 12px">Your Investor Profile</p>
        <p style="font-size:30px;font-weight:700;color:${accent};margin:0 0 14px;letter-spacing:.02em">${esc(profile.name)}</p>
        <p style="font-size:13px;color:#666;margin:0;line-height:1.7">${esc(profile.desc || '')}</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Stats -->
  <tr><td style="padding:0 0 24px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:32%;padding:16px 12px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:#555;margin:0 0 8px">Score</p>
          <p style="font-size:17px;font-weight:700;color:${accent};margin:0">${profile.score} / 200</p>
        </td>
        <td style="width:2%"></td>
        <td style="width:32%;padding:16px 12px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:#555;margin:0 0 8px">Target Rate</p>
          <p style="font-size:17px;font-weight:700;color:${accent};margin:0">${esc(profile.rate)}</p>
        </td>
        <td style="width:2%"></td>
        <td style="width:32%;padding:16px 12px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:#555;margin:0 0 8px">Strategy</p>
          <p style="font-size:11px;font-weight:400;color:#ccc;margin:0;line-height:1.4">${esc(profile.strategy)}</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Allocation -->
  <tr><td style="padding:24px 0;border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a">
    <p style="font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#3a3a3a;margin:0 0 20px">Suggested Strategy Allocation</p>
    ${allocBars.map(b => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
      <tr>
        <td style="font-size:11px;color:#999;padding-bottom:6px;width:70%">${b.label} <span style="color:#444;font-size:10px">(${b.rate})</span></td>
        <td style="font-size:11px;color:${accent};text-align:right;padding-bottom:6px;width:30%">${b.val}%</td>
      </tr>
      <tr><td colspan="2" style="padding:0">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          ${b.val > 0 ? `<td style="width:${b.val}%;height:4px;background:${b.color};border-radius:2px"></td>` : ''}
          ${b.val < 100 ? `<td style="height:4px;background:#1a1a1a;border-radius:2px"></td>` : ''}
        </tr></table>
      </td></tr>
    </table>`).join('')}
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:32px 0;text-align:center">
    <p style="font-size:13px;color:#666;margin:0 0 20px;line-height:1.8">Your profile is the first step toward institutional-grade returns.</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr>
      <td style="padding-right:10px">
        <a href="${SITE}/contact" style="display:inline-block;background:#004C45;color:#fff;text-decoration:none;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding:14px 28px;border-radius:2px">Contact Us</a>
      </td>
      <td>
        <a href="${SITE}/simulator?f=${alloc.foundation || 0}&g=${alloc.growth || 0}&a=${alloc.alpha || 0}" style="display:inline-block;border:1px solid #2a2a2a;color:#777;text-decoration:none;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding:14px 28px;border-radius:2px">Run Simulation</a>
      </td>
    </tr></table>
    <p style="font-size:11px;color:#666;margin:18px 0 0">Or email us at <a href="mailto:${CONTACT_EMAIL}" style="color:${accent};text-decoration:none">${CONTACT_EMAIL}</a></p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 0;border-top:1px solid #111;text-align:center">
    <p style="font-size:9px;color:#2a2a2a;line-height:1.9;margin:0">
      ARKA Global Investments &nbsp;·&nbsp; This profile is for informational purposes only and does not constitute financial advice.<br>
      Strategy assignment is subject to eligibility review and applicable legal procedures.
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

async function buildPDF({ firstName, profile }) {
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

  const page = pdfDoc.addPage([pageW, pageH])
  page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: BG })

  // Header
  page.drawRectangle({ x: 0, y: pageH - 70, width: pageW, height: 70, color: ROW })
  page.drawLine({ start: { x: 0, y: pageH - 70 }, end: { x: pageW, y: pageH - 70 }, thickness: 0.5, color: GOLD })
  if (logoPngBytes) {
    try {
      const img = await pdfDoc.embedPng(logoPngBytes)
      const logoH = 32, logoW = Math.round(logoH * img.width / img.height)
      page.drawImage(img, { x: M, y: pageH - 64, width: logoW, height: logoH })
      page.drawText('ARKA', { x: M + logoW + 10, y: pageH - 46, size: 13, font: bold, color: GOLD, characterSpacing: 3 })
      page.drawText('GLOBAL INVESTMENTS', { x: M + logoW + 10, y: pageH - 60, size: 6, font: reg, color: GRAY, characterSpacing: 2 })
    } catch {
      page.drawRectangle({ x: M, y: pageH - 62, width: 64, height: 28, color: GOLD })
      page.drawText('ARKA', { x: M + 7, y: pageH - 52, size: 13, font: bold, color: WHITE, characterSpacing: 3 })
      page.drawText('GLOBAL INVESTMENTS', { x: M + 74, y: pageH - 48, size: 6, font: reg, color: GRAY, characterSpacing: 2 })
    }
  } else {
    page.drawRectangle({ x: M, y: pageH - 62, width: 64, height: 28, color: GOLD })
    page.drawText('ARKA', { x: M + 7, y: pageH - 52, size: 13, font: bold, color: WHITE, characterSpacing: 3 })
    page.drawText('GLOBAL INVESTMENTS', { x: M + 74, y: pageH - 48, size: 6, font: reg, color: GRAY, characterSpacing: 2 })
  }
  const docTitle = 'INVESTOR RISK PROFILE'
  const dtW = reg.widthOfTextAtSize(docTitle, 7.5)
  page.drawText(docTitle, { x: pageW - M - dtW, y: pageH - 45, size: 7.5, font: reg, color: GRAY, characterSpacing: 1.5 })

  let y = pageH - 92

  // Greeting
  page.drawText(`Hello, ${firstName}.`, { x: M, y, size: 22, font: light, color: WHITE })
  y -= 22
  page.drawText('Based on your responses, we have identified your investor profile.', { x: M, y, size: 9.5, font: reg, color: GRAY })
  y -= 14
  page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.5, color: GOLD })
  y -= 26

  // Profile label
  page.drawText('YOUR INVESTOR PROFILE', { x: M, y, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 22

  // Profile name in large text with gold accent bar
  page.drawRectangle({ x: M, y: y - 50, width: W, height: 60, color: CARD })
  page.drawRectangle({ x: M, y: y - 50, width: 4, height: 60, color: GOLD })
  const nameStr = String(profile.name || '')
  // Scale font size down if name is long
  const nameSz = nameStr.length > 20 ? 20 : nameStr.length > 15 ? 24 : 28
  page.drawText(nameStr, { x: M + 18, y: y - 26, size: nameSz, font: bold, color: GOLD })
  y -= 50 + 14

  // Description (word-wrapped)
  const descLines = wrapText(String(profile.desc || ''), reg, 10, W)
  for (const ln of descLines) {
    page.drawText(ln, { x: M, y, size: 10, font: reg, color: LGRAY })
    y -= 16
  }
  y -= 14

  // Stats row
  const statW = (W - 24) / 3
  const statH = 66
  const stats = [
    { label: 'PROFILE SCORE',  value: `${profile.score} / 200`, isGold: true },
    { label: 'REFERENCE RATE', value: String(profile.rate),      isGold: true },
    { label: 'STRATEGY',       value: String(profile.strategy),  isGold: false },
  ]
  stats.forEach(({ label, value, isGold }, i) => {
    const sx = M + i * (statW + 12)
    const sy = y - statH
    page.drawRectangle({ x: sx, y: sy, width: statW, height: statH, color: CARD })
    page.drawText(label, { x: sx + 10, y: sy + statH - 16, size: 6.5, font: bold, color: GRAY, characterSpacing: 1 })
    const vSize  = isGold ? 14 : 9
    const vColor = isGold ? GOLD : LGRAY
    const vFont  = isGold ? bold : reg
    // Cap at 2 lines to stay within card bounds
    let vLines = wrapText(value, vFont, vSize, statW - 20)
    if (vLines.length > 2) vLines = [vLines[0], vLines[1].slice(0, -2) + '…']
    const lineH = vSize + 3
    const startY = sy + 24
    vLines.forEach((ln, li) => {
      page.drawText(ln, { x: sx + 10, y: startY - li * lineH, size: vSize, font: vFont, color: vColor })
    })
  })
  y -= statH + 24

  // Allocation
  page.drawText('SUGGESTED STRATEGY ALLOCATION', { x: M, y, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 18

  const alloc = profile.alloc || {}
  const allocRows = [
    { label: 'Foundation', rate: '18%', pct: alloc.foundation || 0, color: GOLD },
    { label: 'Strategic Growth', rate: '24%', pct: alloc.growth || 0, color: rgb(0.627, 0.502, 0.251) },
    { label: 'Alpha Force', rate: '36%', pct: alloc.alpha || 0, color: rgb(0.478, 0.376, 0.188) },
  ]

  for (const { label, rate, pct, color } of allocRows) {
    page.drawText(`${label} (${rate})`, { x: M, y, size: 9.5, font: reg, color: LGRAY })
    const pctStr = `${pct}%`
    const pctW = bold.widthOfTextAtSize(pctStr, 9.5)
    page.drawText(pctStr, { x: M + W - pctW, y, size: 9.5, font: bold, color: GOLD })
    y -= 15
    page.drawRectangle({ x: M, y: y - 4, width: W, height: 5, color: DARK })
    if (pct > 0) page.drawRectangle({ x: M, y: y - 4, width: W * (pct / 100), height: 5, color })
    y -= 24
  }

  y -= 10

  // Disclaimer
  const disc = 'This profiling is indicative only and does not constitute financial advice. Strategy assignment is subject to eligibility review, KYC/AML, and applicable legal documents. ARKA Global Investments — for qualified investors only.'
  const discLines = wrapText(disc, reg, 7.5, W)
  page.drawLine({ start: { x: M, y: y + 4 }, end: { x: M + W, y: y + 4 }, thickness: 0.3, color: DARK })
  y -= 12
  for (const ln of discLines) {
    page.drawText(ln, { x: M, y, size: 7.5, font: reg, color: DGRAY })
    y -= 12
  }

  // Footer
  const footY = 34
  page.drawLine({ start: { x: M, y: footY + 18 }, end: { x: M + W, y: footY + 18 }, thickness: 0.3, color: DARK })
  const ft = 'ARKA Global Investments  ·  Investor Profile Report  ·  For informational purposes only.'
  const ftW = reg.widthOfTextAtSize(ft, 7)
  page.drawText(ft, { x: (pageW - ftW) / 2, y: footY, size: 7, font: reg, color: DGRAY })

  return pdfDoc.save()
}
