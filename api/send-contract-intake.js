import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const NOTIFY_EMAIL = process.env.CONTRACTS_NOTIFY_EMAIL || 'contacto@arkaltd.io'

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  }).catch(() => {})
}

function row(label, value) {
  if (value === undefined || value === null || value === '') return ''
  return `<tr>
    <td style="padding:7px 0;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#444;width:42%;vertical-align:top">${esc(label)}</td>
    <td style="padding:7px 0;font-size:13px;color:#ccc;text-align:right;vertical-align:top">${esc(value)}</td>
  </tr>`
}

function section(title, rowsHtml) {
  if (!rowsHtml.trim()) return ''
  return `<tr><td style="padding:0 0 24px">
    <p style="font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:#3a3a3a;margin:0 0 10px">${esc(title)}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c0c;border:1px solid #1e1e1e;border-radius:10px;padding:4px 16px">
      ${rowsHtml}
    </table>
  </td></tr>`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { mandante, beneficiaries } = req.body || {}
  if (!mandante || !mandante.email || !mandante.fullName)
    return res.status(400).json({ error: 'Missing required fields' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(mandante.email)))
    return res.status(400).json({ error: 'Invalid email' })
  if (!Array.isArray(beneficiaries) || beneficiaries.length === 0)
    return res.status(400).json({ error: 'Missing beneficiaries' })

  const m = mandante
  const idType = m.idType === 'Otro' ? m.idTypeOther : m.idType
  const economicActivity = m.economicActivity === 'Otro' ? m.economicActivityOther : m.economicActivity
  const fundsOrigin = m.fundsOrigin === 'Otro' ? m.fundsOriginOther : m.fundsOrigin
  const currency = m.currency === 'Otro' ? m.currencyOther : m.currency

  const beneficiariesHtml = beneficiaries.map((b, i) => `
    <tr><td colspan="2" style="padding:${i === 0 ? '4' : '14'}px 0 4px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#C9A352">Beneficiario ${i + 1}</td></tr>
    ${row('Nombre', b.fullName)}
    ${row('Parentesco', b.relationship)}
    ${row('Porcentaje', `${b.percentage}%`)}
    ${row('Teléfono', b.phone)}
    ${row('Correo', b.email)}
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>Cuestionario Contrato de Mandato</title></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#fff">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505">
<tr><td align="center" style="padding:48px 16px">
<table width="100%" style="max-width:580px">

  <tr><td style="padding-bottom:28px;border-bottom:1px solid #161616;text-align:center">
    <p style="font-size:10px;letter-spacing:.55em;text-transform:uppercase;color:#C9A352;margin:0;font-weight:600">
      ARKA GLOBAL LIQUIDITY
    </p>
  </td></tr>

  <tr><td style="padding:32px 0 20px">
    <p style="font-size:10px;letter-spacing:.35em;text-transform:uppercase;color:#444;margin:0 0 16px">Nuevo Cuestionario — Contrato de Mandato</p>
    <h1 style="font-size:20px;font-weight:300;margin:0 0 8px;color:#fff">${esc(m.fullName)}</h1>
    <a href="mailto:${esc(m.email)}" style="font-size:13px;color:#C9A352;text-decoration:none">${esc(m.email)}</a>
  </td></tr>

  ${section('1. Datos generales del Mandante', [
    row('Nacionalidad', m.nationality),
    row('RFC / Tax ID', m.taxId),
    row('Teléfono', m.phone),
    row('Domicilio', m.address),
  ].join(''))}

  ${section('2. Identificación oficial', [
    row('Tipo', idType),
  ].join(''))}

  ${section('3. Actividad económica y origen de fondos', [
    row('Actividad económica', economicActivity),
    row('Origen de los recursos', fundsOrigin),
  ].join(''))}

  ${section('4. Plan de Ahorro', [
    row('Tipo de plan', m.planType),
    row('Rendimiento', m.planReturnRate),
    row('Plazo fijo', m.planTerm),
    row('Riesgo máximo de pérdida', m.planMaxLoss),
    row('Entrega de rendimiento', m.planPayout),
    row('Penalización por retiro anticipado', m.planPenalty),
    row('Aportación inicial', m.initialAmountNumber),
    row('Divisa / activo', currency),
    row('Equivalente USD (aprox.)', m.usdEquivalent ? `${m.usdEquivalent} *` : ''),
    row('Tipo de cambio', m.exchangeRate),
  ].join(''))}
  ${m.exchangeRate ? `<tr><td style="padding:0 0 24px"><p style="font-size:9px;color:#444;margin:0">* El monto final depende del día de la transferencia y puede variar según el tipo de cambio vigente ese día.</p></td></tr>` : ''}

  ${section('5. Beneficiarios', beneficiariesHtml)}

  <tr><td style="padding:20px 0 0;text-align:center;border-top:1px solid #111;margin-top:8px">
    <p style="font-size:9px;color:#2a2a2a;line-height:2;margin:0">
      ARKA Global Liquidity — Preparación de Contrato de Mandato<br>
      Responde directamente a este correo para contactar al Mandante.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`

  const { error: mailErr } = await resend.emails.send({
    from: process.env.RESEND_FROM || 'ARKA Global Investments <noreply@arkaglobalinvestments.com>',
    to: NOTIFY_EMAIL,
    replyTo: m.email,
    subject: `Cuestionario Contrato de Mandato — ${m.fullName}`,
    html,
  })

  if (mailErr) {
    console.error('Resend error:', mailErr)
    return res.status(400).json({ error: 'Error sending email', detail: mailErr.message || String(mailErr) })
  }

  await sendTelegram(
    `📝 <b>Nuevo Cuestionario — Contrato de Mandato</b>\n\n` +
    `👤 ${esc(m.fullName)}\n📧 ${esc(m.email)}\n📱 ${esc(m.phone)}\n\n` +
    `📋 Plan: <b>${esc(m.planType)}</b>\n` +
    `💰 Aportación: <b>${esc(m.initialAmountNumber)} ${esc(currency)}</b>\n` +
    `👥 Beneficiarios: ${beneficiaries.length}\n\n` +
    `Revisa el correo para el detalle completo.`
  )

  return res.status(200).json({ sent: true })
}
