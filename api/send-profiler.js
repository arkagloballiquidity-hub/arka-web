import { Resend } from 'resend'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE   = process.env.SITE_URL || 'https://arka-web-six.vercel.app'

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

  // Fetch logo for PDF
  let logoBytes = null
  try {
    const r = await fetch(`${SITE}/logo_arka.png`)
    if (r.ok) logoBytes = Buffer.from(await r.arrayBuffer())
  } catch { /* skip */ }

  const pdfBuffer = await buildPDF({ firstName, profile, logoBytes })

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
  const allocBars = [
    { label: 'Foundation',       val: alloc.foundation || 0, rate: '18%', color: '#C9A352' },
    { label: 'Strategic Growth', val: alloc.growth     || 0, rate: '24%', color: '#A08040' },
    { label: 'Alpha Force',      val: alloc.alpha      || 0, rate: '36%', color: '#7a6030' },
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ARKA Investor Profile</title></head>
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
    <p style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#444;margin:0 0 16px">Investor Risk Profile</p>
    <h1 style="font-size:22px;font-weight:300;margin:0 0 12px;color:#fff">Hello, ${esc(firstName)}.</h1>
    <p style="font-size:14px;color:#888;line-height:1.8;margin:0">
      Based on your responses, we have identified your investor profile within <strong style="color:#ccc">ARKA Global Investments</strong>.
    </p>
  </td></tr>

  <!-- Profile card -->
  <tr><td style="padding:0 0 20px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:28px 24px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:12px;text-align:center">
        <p style="font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:#444;margin:0 0 12px">Your Investor Profile</p>
        <p style="font-size:30px;font-weight:700;color:#C9A352;margin:0 0 14px;letter-spacing:.02em">${esc(profile.name)}</p>
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
          <p style="font-size:17px;font-weight:700;color:#C9A352;margin:0">${profile.score} / 200</p>
        </td>
        <td style="width:2%"></td>
        <td style="width:32%;padding:16px 12px;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:10px;text-align:center">
          <p style="font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:#555;margin:0 0 8px">Target Rate</p>
          <p style="font-size:17px;font-weight:700;color:#C9A352;margin:0">${esc(profile.rate)}</p>
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
        <td style="font-size:11px;color:#C9A352;text-align:right;padding-bottom:6px;width:30%">${b.val}%</td>
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
        <a href="${SITE}/access" style="display:inline-block;background:#004C45;color:#fff;text-decoration:none;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding:14px 28px;border-radius:2px">Apply for Access</a>
      </td>
      <td>
        <a href="${SITE}/simulator" style="display:inline-block;border:1px solid #2a2a2a;color:#777;text-decoration:none;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding:14px 28px;border-radius:2px">Run Simulation</a>
      </td>
    </tr></table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 0;border-top:1px solid #111;text-align:center">
    <p style="font-size:9px;color:#2a2a2a;line-height:1.9;margin:0">
      ARKA Global Investments &nbsp;·&nbsp; This profile is for informational purposes only and does not constitute financial advice.<br>
      Strategy assignment is subject to eligibility review and applicable legal procedures. &nbsp;·&nbsp; Please do not reply to this email.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ── PDF builder ───────────────────────────────────────────────────────────────
async function buildPDF({ firstName, profile, logoBytes }) {
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

  page.drawRectangle({ x: 0, y: 0, width, height, color: BG })
  page.drawRectangle({ x: 0, y: height - 68, width, height: 68, color: ROW })

  // Logo
  let logoDrawn = false
  if (logoBytes) {
    try {
      const logoImg  = await pdfDoc.embedPng(logoBytes)
      const logoDims = logoImg.scale(0.016)
      page.drawImage(logoImg, { x: M, y: height - 48, width: logoDims.width, height: logoDims.height })
      logoDrawn = true
    } catch { /* fall through */ }
  }
  const logoX = logoDrawn ? M + 54 : M
  page.drawText('ARKA GLOBAL INVESTMENTS', { x: logoX, y: height - 36, size: 8, font: bold, color: GOLD, characterSpacing: 3 })
  const rLabel = 'INVESTOR RISK PROFILE'
  page.drawText(rLabel, { x: width - M - bold.widthOfTextAtSize(rLabel, 7.5), y: height - 36, size: 7.5, font: reg, color: GRAY, characterSpacing: 1.5 })

  let y = height - 88

  // Greeting
  page.drawText(`Hello, ${firstName}.`, { x: M, y, size: 20, font: obliq, color: WHITE })
  y -= 20
  page.drawText('Based on your responses, we have identified your investor profile.', { x: M, y, size: 9.5, font: reg, color: GRAY })
  y -= 18
  page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.5, color: GOLD })
  y -= 22

  // Profile name
  page.drawText('YOUR INVESTOR PROFILE', { x: M, y, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 20
  page.drawText(String(profile.name || ''), { x: M, y, size: 28, font: bold, color: GOLD })
  y -= 18

  // Description (word-wrapped)
  const desc  = String(profile.desc || '')
  const words = desc.split(' ')
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (reg.widthOfTextAtSize(test, 10) > W) {
      page.drawText(line, { x: M, y, size: 10, font: reg, color: LGRAY })
      y -= 15
      line = word
    } else { line = test }
  }
  if (line) { page.drawText(line, { x: M, y, size: 10, font: reg, color: LGRAY }); y -= 15 }
  y -= 18

  // Stats row
  const statW = (W - 24) / 3
  const statH = 52
  const stats = [
    { label: 'PROFILE SCORE',  value: `${profile.score} / 200` },
    { label: 'REFERENCE RATE', value: String(profile.rate)      },
    { label: 'STRATEGY',       value: String(profile.strategy)  },
  ]
  stats.forEach(({ label, value }, i) => {
    const sx = M + i * (statW + 12)
    const sy = y - statH
    page.drawRectangle({ x: sx, y: sy, width: statW, height: statH, color: CARD })
    page.drawText(label, { x: sx + 10, y: sy + statH - 14, size: 7, font: bold, color: GRAY, characterSpacing: 1 })
    const vSize  = i === 2 ? 9 : 13
    const vColor = i === 2 ? LGRAY : GOLD
    // Truncate strategy text if too long
    let v = value
    while (v.length > 2 && reg.widthOfTextAtSize(v, vSize) > statW - 20) v = v.slice(0, -4) + '…'
    page.drawText(v, { x: sx + 10, y: sy + 13, size: vSize, font: bold, color: vColor })
  })
  y -= statH + 24

  // Allocation bars
  page.drawText('SUGGESTED STRATEGY ALLOCATION', { x: M, y, size: 7.5, font: bold, color: GRAY, characterSpacing: 2 })
  y -= 16

  const alloc = profile.alloc || {}
  const allocRows = [
    { label: 'Foundation (18%)',       pct: alloc.foundation || 0, color: GOLD                      },
    { label: 'Strategic Growth (24%)', pct: alloc.growth     || 0, color: rgb(0.627, 0.502, 0.251)  },
    { label: 'Alpha Force (36%)',      pct: alloc.alpha      || 0, color: rgb(0.478, 0.376, 0.188)  },
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

  // Disclaimer
  y -= 8
  const disc = 'This profiling is indicative only and does not constitute financial advice. Strategy assignment is subject to eligibility review, KYC/AML, and applicable legal documents.'
  const discWords = disc.split(' ')
  let dLine = ''
  for (const w of discWords) {
    const test = dLine ? `${dLine} ${w}` : w
    if (reg.widthOfTextAtSize(test, 7.5) > W) {
      page.drawText(dLine, { x: M, y, size: 7.5, font: reg, color: DGRAY })
      y -= 12
      dLine = w
    } else { dLine = test }
  }
  if (dLine) page.drawText(dLine, { x: M, y, size: 7.5, font: reg, color: DGRAY })

  // Footer
  const footY = 34
  page.drawLine({ start: { x: M, y: footY + 18 }, end: { x: M + W, y: footY + 18 }, thickness: 0.3, color: DGRAY })
  const ft = 'ARKA Global Investments  ·  Investor Profile Report  ·  For informational purposes only.'
  page.drawText(ft, { x: (width - reg.widthOfTextAtSize(ft, 7)) / 2, y: footY, size: 7, font: reg, color: rgb(0.2, 0.2, 0.2) })

  return pdfDoc.save()
}
