import { Resend } from 'resend'
import PDFDocument from 'pdfkit'

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

  const safeName  = esc(name || 'Investor')
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
      content:  pdfBuffer.toString('base64'),
    }],
  })

  if (mailErr) {
    console.error('Resend error:', mailErr)
    return res.status(400).json({ error: 'Error sending email', detail: mailErr.message || String(mailErr) })
  }

  // ── Telegram notification to Gabriel ────────────────────────────────────────
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
    { label: 'Foundation', key: 'foundation', val: alloc.foundation || 0, rate: '18%', color: '#C9A352' },
    { label: 'Strategic Growth', key: 'growth', val: alloc.growth || 0, rate: '24%', color: '#A08040' },
    { label: 'Alpha Force', key: 'alpha', val: alloc.alpha || 0, rate: '36%', color: '#7a6030' },
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ARKA Investor Profile</title></head>
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
      Investor Risk Profile
    </p>
    <h1 style="font-size:22px;font-weight:300;margin:0 0 16px;line-height:1.4;color:#fff">
      Hello, ${firstName}.
    </h1>
    <p style="font-size:14px;color:#888;line-height:1.9;margin:0">
      Based on your responses, we have identified your investor profile within
      <strong style="color:#ddd">ARKA Global Investments</strong>.
    </p>
  </td></tr>

  <!-- Profile name -->
  <tr><td style="padding:8px 0 24px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:28px;background:#0c0c0c;border:1px solid #1e1e1e;border-radius:12px;text-align:center">
        <p style="font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:#444;margin:0 0 12px">
          Your Investor Profile
        </p>
        <p style="font-size:28px;font-weight:300;color:#C9A352;margin:0;letter-spacing:.02em">
          ${esc(profile.name)}
        </p>
        <p style="font-size:12px;color:#666;margin:12px 0 0;line-height:1.7;max-width:380px;margin-left:auto;margin-right:auto">
          ${esc(profile.desc || '')}
        </p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Stats -->
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

  <!-- Allocation -->
  <tr><td style="padding:24px 0;border-top:1px solid #161616;border-bottom:1px solid #161616">
    <p style="font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:#3a3a3a;margin:0 0 20px">
      Suggested Strategy Allocation
    </p>
    ${allocBars.map(b => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px">
      <tr>
        <td style="font-size:11px;color:#999;padding-bottom:6px">${b.label}
          <span style="color:#444;font-size:10px;margin-left:6px">(${b.rate})</span>
        </td>
        <td style="font-size:11px;color:#C9A352;text-align:right;padding-bottom:6px">${b.val}%</td>
      </tr>
      <tr><td colspan="2">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="${b.val}%" style="height:4px;background:${b.color};border-radius:2px"></td>
            <td style="height:4px;background:#1a1a1a;border-radius:2px"></td>
          </tr>
        </table>
      </td></tr>
    </table>`).join('')}
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:36px 0;text-align:center">
    <p style="font-size:13px;color:#777;margin:0 0 24px;line-height:1.8;max-width:380px;margin-left:auto;margin-right:auto">
      Your profile is the first step. Apply to access the ARKA platform and start building your portfolio.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto">
      <tr>
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
      </tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 0;border-top:1px solid #111;text-align:center">
    <p style="font-size:9px;color:#2a2a2a;line-height:2;margin:0">
      ARKA Global Investments<br>
      This profile is based on your questionnaire responses and is for informational purposes only.<br>
      It does not constitute financial advice or guarantee investment returns.<br>
      Please do not reply to this email.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ── PDF builder ───────────────────────────────────────────────────────────────
function buildPDF({ firstName, profile }) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margin: 56, info: { Title: 'ARKA Investor Profile Report' } })
    const chunks = []
    doc.on('data',  c => chunks.push(c))
    doc.on('end',   () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const GOLD  = '#C9A352'
    const DARK  = '#0A0A0A'
    const GRAY  = '#888888'
    const LIGHT = '#CCCCCC'
    const W     = doc.page.width - 112

    // ── Background ──
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK)

    // ── Header bar ──
    doc.rect(0, 0, doc.page.width, 80).fill('#111111')
    doc.fontSize(8).fillColor(GOLD).font('Helvetica-Bold')
       .text('ARKA GLOBAL INVESTMENTS', 56, 34, { characterSpacing: 4 })
    doc.fontSize(8).fillColor(GRAY).font('Helvetica')
       .text('INVESTOR RISK PROFILE', { align: 'right', characterSpacing: 2 })

    // ── Greeting ──
    doc.moveDown(2)
    doc.fontSize(22).fillColor('#FFFFFF').font('Helvetica-Oblique')
       .text(`Hello, ${firstName}.`, 56)
    doc.fontSize(10).fillColor(GRAY).font('Helvetica').moveDown(0.4)
       .text('Based on your responses, we have identified your investor profile.', 56)

    // ── Gold divider ──
    const y1 = doc.y + 18
    doc.moveTo(56, y1).lineTo(56 + W, y1).lineWidth(0.5).strokeColor(GOLD).stroke()

    // ── Profile name ──
    doc.moveDown(2)
    doc.fontSize(9).fillColor(GRAY).font('Helvetica').characterSpacing(2)
       .text('YOUR INVESTOR PROFILE', 56)
    doc.fontSize(34).fillColor(GOLD).font('Helvetica-Bold').characterSpacing(0).moveDown(0.3)
       .text(profile.name, 56)
    doc.fontSize(11).fillColor(LIGHT).font('Helvetica').moveDown(0.4)
       .text(profile.desc || '', 56, doc.y, { width: W, lineGap: 4 })

    // ── Stats row ──
    doc.moveDown(1.4)
    const statsY = doc.y
    const statW  = (W - 32) / 3

    ;[
      { label: 'PROFILE SCORE',      value: `${profile.score} / 200` },
      { label: 'REFERENCE RATE',     value: profile.rate            },
      { label: 'STRATEGY',           value: profile.strategy        },
    ].forEach((s, i) => {
      const x = 56 + i * (statW + 16)
      doc.rect(x, statsY, statW, 56).fill('#161616')
      doc.fontSize(7.5).fillColor(GRAY).font('Helvetica').characterSpacing(1.5)
         .text(s.label, x + 12, statsY + 10, { width: statW - 24 })
      doc.fontSize(i === 2 ? 10 : 15).fillColor(i === 2 ? LIGHT : GOLD).font('Helvetica-Bold').characterSpacing(0)
         .text(s.value, x + 12, statsY + 28, { width: statW - 24 })
    })

    // ── Allocation bars ──
    doc.y = statsY + 76
    doc.fontSize(8).fillColor(GRAY).font('Helvetica').characterSpacing(2)
       .text('SUGGESTED STRATEGY ALLOCATION', 56)
    doc.moveDown(0.6)

    const alloc = profile.alloc || {}
    const allocRows = [
      { label: 'Foundation',       rate: '18%', pct: alloc.foundation || 0, color: '#C9A352' },
      { label: 'Strategic Growth', rate: '24%', pct: alloc.growth     || 0, color: '#A08040' },
      { label: 'Alpha Force',      rate: '36%', pct: alloc.alpha      || 0, color: '#7a6030' },
    ]

    allocRows.forEach(({ label, rate, pct, color }) => {
      const barY = doc.y
      doc.fontSize(9).fillColor(LIGHT).font('Helvetica').characterSpacing(0)
         .text(`${label}  `, 56, barY)
      doc.fontSize(9).fillColor(GRAY)
         .text(`(${rate})`, { continued: false })
      doc.fontSize(9).fillColor(GOLD)
         .text(`${pct}%`, 56, barY, { width: W, align: 'right' })
      doc.moveDown(0.3)
      const trackY = doc.y
      doc.rect(56, trackY, W, 3).fill('#1e1e1e')
      if (pct > 0) doc.rect(56, trackY, W * (pct / 100), 3).fill(color)
      doc.moveDown(1)
    })

    // ── Disclaimer ──
    doc.moveDown(0.5)
    doc.fontSize(8).fillColor('#444444').font('Helvetica')
       .text('⚠  This profiling is indicative only and does not constitute financial advice. Strategy assignment is subject to eligibility review, KYC/AML procedures, and execution of applicable legal documents.', 56, doc.y, { width: W, lineGap: 3 })

    // ── Footer ──
    const footY = doc.page.height - 60
    doc.moveTo(56, footY).lineTo(56 + W, footY).lineWidth(0.3).strokeColor('#222222').stroke()
    doc.fontSize(7.5).fillColor('#333333').font('Helvetica')
       .text('ARKA Global Investments  ·  Investor Profile Report  ·  For informational purposes only.',
         56, footY + 10, { width: W, align: 'center' })

    doc.end()
  })
}
