import { useState, useEffect } from 'react'

const FALLBACK_RATE = 17.5
const CACHE_KEY = 'arka_fx_rate'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h — matches the daily USDT/MXN reference

// Live USDT/MXN reference rate (≈ USD/MXN), used to show USD-equivalent
// amounts for the MXN-denominated plan minimums. Cached in sessionStorage
// so it's fetched at most once per day per visitor.
export function useFxRate() {
  const [rate, setRate] = useState(FALLBACK_RATE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS && Number.isFinite(cached.rate)) {
        setRate(cached.rate)
        setLoading(false)
        return
      }
    } catch {}

    fetch('/api/fx-rate')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        const r = Number(data?.rate)
        if (Number.isFinite(r) && r > 0) {
          setRate(r)
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ rate: r, ts: Date.now() })) } catch {}
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  return { rate, loading }
}
