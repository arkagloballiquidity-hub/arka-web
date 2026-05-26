import { Resend } from 'resend'

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

  // ── Send email ─────────────────────────────────────────────────────────────
  const { error: mailErr } = await resend.emails.send({
    from:    process.env.RESEND_FROM || 'ARKA Global Investments <noreply@arkaglobal.io>',
    to:      email,
    subject: 'ARKA — Your Investment Simulation Results',
    html:    buildEmail({ firstName, params, results }),
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
