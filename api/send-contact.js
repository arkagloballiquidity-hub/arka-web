import { Resend } from 'resend'

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).end()

  const { name, email, entity, country, investor_type, message } = req.body || {}

  if (!name || !email || !message)
    return res.status(400).json({ error: 'Missing required fields' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))
    return res.status(400).json({ error: 'Invalid email' })

  const safeName = esc(name)

  const { error: mailErr } = await resend.emails.send({
    from:    process.env.RESEND_FROM || 'ARKA Global Investments <noreply@arkaglobalinvestments.com>',
    to:      'contacto@arkaltd.io',
    replyTo: email,
    subject: `Investor Inquiry — ${safeName}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Investor Inquiry</title></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#fff">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505">
<tr><td align="center" style="padding:48px 16px">
<table width="100%" style="max-width:560px">

  <tr><td style="padding-bottom:28px;border-bottom:1px solid #161616;text-align:center">
    <p style="font-size:10px;letter-spacing:.55em;text-transform:uppercase;color:#C9A352;margin:0;font-weight:600">
      ARKA GLOBAL INVESTMENTS
    </p>
  </td></tr>

  <tr><td style="padding:32px 0 20px">
    <p style="font-size:10px;letter-spacing:.35em;text-transform:uppercase;color:#444;margin:0 0 16px">New Investor Inquiry</p>
    <h1 style="font-size:20px;font-weight:300;margin:0 0 8px;color:#fff">${safeName}</h1>
    <a href="mailto:${esc(email)}" style="font-size:13px;color:#C9A352;text-decoration:none">${esc(email)}</a>
  </td></tr>

  <tr><td style="padding:0 0 24px">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${entity ? `<tr>
        <td style="padding:8px 0;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#444;width:40%">Entity</td>
        <td style="padding:8px 0;font-size:13px;color:#bbb;text-align:right">${esc(entity)}</td>
      </tr>` : ''}
      ${country ? `<tr>
        <td style="padding:8px 0;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#444">Country</td>
        <td style="padding:8px 0;font-size:13px;color:#bbb;text-align:right">${esc(country)}</td>
      </tr>` : ''}
      ${investor_type ? `<tr>
        <td style="padding:8px 0;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#444">Investor Type</td>
        <td style="padding:8px 0;font-size:13px;color:#bbb;text-align:right">${esc(investor_type)}</td>
      </tr>` : ''}
    </table>
  </td></tr>

  <tr><td style="padding:20px;background:#0c0c0c;border:1px solid #1e1e1e;border-radius:10px">
    <p style="font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:#444;margin:0 0 12px">Message</p>
    <p style="font-size:14px;color:#ccc;line-height:1.8;margin:0;white-space:pre-wrap">${esc(message)}</p>
  </td></tr>

  <tr><td style="padding:28px 0 0;text-align:center;border-top:1px solid #111;margin-top:28px">
    <p style="font-size:9px;color:#2a2a2a;line-height:2;margin:0">
      ARKA Global Investments — Investor Relations<br>
      Reply directly to this email to respond to the inquiry.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`,
  })

  if (mailErr) {
    console.error('Resend error:', mailErr)
    return res.status(400).json({ error: 'Error sending message', detail: mailErr.message || String(mailErr) })
  }

  await sendTelegram(
    `📩 <b>Nuevo Contacto — ARKA</b>\n\n` +
    `👤 ${esc(name)}\n` +
    `📧 ${esc(email)}\n` +
    (entity       ? `🏢 ${esc(entity)}\n`        : '') +
    (country      ? `🌍 ${esc(country)}\n`        : '') +
    (investor_type ? `🏷 ${esc(investor_type)}\n` : '') +
    `\n💬 ${esc(message).slice(0, 300)}${message.length > 300 ? '…' : ''}`
  )

  return res.status(200).json({ sent: true })
}
