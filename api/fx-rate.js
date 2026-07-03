// Daily USDT/MXN reference rate, used to display USD-equivalent minimums
// for MXN-denominated plan amounts. USDT tracks USD ~1:1, so this doubles
// as a USD/MXN spot reference. Cached at the edge for 24h — Bitso is only
// hit once per day per Vercel's CDN, not on every request.
const FALLBACK_RATE = 17.5

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600')

  try {
    const r = await fetch('https://api.bitso.com/v3/ticker/?book=usdt_mxn')
    if (!r.ok) throw new Error(`Bitso responded ${r.status}`)
    const data = await r.json()
    const rate = Number(data?.payload?.last)
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('Invalid rate in Bitso response')

    return res.status(200).json({
      rate,
      source: 'bitso:usdt_mxn',
      updatedAt: data.payload.created_at || new Date().toISOString(),
    })
  } catch (err) {
    console.error('fx-rate error:', err)
    return res.status(200).json({
      rate: FALLBACK_RATE,
      source: 'fallback',
      updatedAt: new Date().toISOString(),
    })
  }
}
