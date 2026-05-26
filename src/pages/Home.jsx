import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WorldMap } from '@/components/ui/map'
import { SITE, RISK_METRICS as SITE_RISK_METRICS } from '@/config/site'
import { useLang } from '@/context/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

// ─── Reveal on scroll ─────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '', from = 'bottom' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const fromY = from === 'bottom' ? 32 : from === 'top' ? -32 : 0
  const fromX = from === 'left' ? -32 : from === 'right' ? 32 : 0

  return (
    <div ref={ref} className={className} style={{
      opacity:         visible ? 1 : 0,
      transform:       visible ? 'none' : `translate(${fromX}px, ${fromY}px)`,
      transition:      `opacity 0.9s ease, transform 0.9s ease`,
      transitionDelay: visible ? `${delay}s` : '0s',
    }}>
      {children}
    </div>
  )
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function Label({ children }) {
  return <p className="text-[11px] tracking-[0.5em] uppercase text-white/65 font-light mb-4">{children}</p>
}

function SectionNum({ n }) {
  return <span className="text-[9px] tracking-[0.4em] uppercase text-white/18 font-mono select-none">{n}</span>
}

function Rule() {
  return <div className="w-full h-px bg-white/[0.07] my-20 md:my-28" />
}

function CTAButton({ to, children, outline = false }) {
  const base = 'inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-medium transition-all duration-300 px-8 py-4 rounded-sm'
  if (outline) return (
    <Link to={to} className={`${base} border border-white/25 text-white hover:border-white/55 hover:text-white`}>
      {children}
    </Link>
  )
  return (
    <Link to={to} className={`${base} bg-[#004C45] text-white/90 hover:bg-[#005c54] hover:shadow-lg hover:shadow-[#004C45]/25`}>
      {children}
    </Link>
  )
}

function StrategyCard({ s, applyLabel, refLabel, subLabel }) {
  return (
    <div className="flex flex-col p-7 rounded-xl border border-white/12 bg-black/55 backdrop-blur-md hover:border-white/22 hover:bg-black/65 transition-all duration-500 h-full">
      {/* Top section grows to fill — keeps divider anchored at same height */}
      <div className="flex-1 flex flex-col gap-5 mb-5">
        <span className="self-start text-[8px] tracking-[0.3em] uppercase px-3 py-1 border border-white/20 rounded-full text-white/75">
          {s.profile}
        </span>
        <div>
          <h3 className="text-white font-light text-lg mb-2 leading-snug">{s.name}</h3>
          <p className="text-white/85 text-sm leading-relaxed">{s.objective}</p>
        </div>
      </div>
      {/* Divider — always at same distance from bottom */}
      <div className="border-t border-white/10 pt-5 mb-5">
        <p className="text-[8px] tracking-[0.25em] uppercase text-white/60 mb-2">{refLabel}</p>
        <p className="text-4xl font-extralight text-white tracking-tight">{s.targetRef}</p>
        <p className="text-[9px] text-white/55 mt-1.5">{subLabel}</p>
      </div>
      <p className="text-xs text-white/78 leading-relaxed mb-5">{s.idealFor}</p>
      <Link to="/access" className="text-[9px] tracking-[0.2em] uppercase text-white/70 border border-white/18 hover:border-[#004C45]/60 hover:text-white px-5 py-3 text-center transition-all duration-300 rounded-sm">
        {applyLabel}
      </Link>
    </div>
  )
}

function GlassCard({ label, value }) {
  return (
    <div className="p-5 rounded-lg border border-white/10 bg-black/50 backdrop-blur-md">
      <p className="text-[8px] tracking-[0.28em] uppercase text-white/62 mb-2.5">{label}</p>
      <p className="text-white text-sm font-light leading-relaxed">{value}</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const { lang, t } = useLang()
  const videoRef = useRef(null)
  const pageRef  = useRef(null)

  // ── Video scrubs across entire page scroll ────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    const page  = pageRef.current
    if (!video || !page) return

    let ctx

    const init = () => {
      if (!video.duration || isNaN(video.duration)) return
      const dur = video.duration

      // Keep decoder warm in Chrome: play at rate=0 so seeks are instant
      video.playbackRate = 0
      video.play().catch(() => {})

      // Non-linear keyframe mapping: [scrollProgress, videoSeconds]
      const keyframes = [
        [0.00, 0.0],
        [0.09, 0.8],
        [0.26, 3.0],
        [0.49, 5.0],
        [0.63, 6.8],
        [0.66, 8.0],
        [0.68, 8.5],
        [0.90, 9.5],
        [1.00, dur],
      ]

      const scrubToTime = (progress) => {
        for (let i = 0; i < keyframes.length - 1; i++) {
          const [s0, t0] = keyframes[i]
          const [s1, t1] = keyframes[i + 1]
          if (progress >= s0 && progress <= s1) {
            const ratio = (progress - s0) / (s1 - s0)
            return t0 + ratio * (t1 - t0)
          }
        }
        return dur
      }

      // One seek per animation frame — prevents redundant decode calls
      let rafId = null
      let pendingTime = 0
      const seekTo = (t) => {
        pendingTime = t
        if (rafId) return
        rafId = requestAnimationFrame(() => {
          video.currentTime = pendingTime
          rafId = null
        })
      }

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          onUpdate: (self) => seekTo(scrubToTime(self.progress)),
        })
      })
    }

    if (video.readyState >= 1) {
      init()
    } else {
      video.addEventListener('loadedmetadata', init, { once: true })
      video.load()
    }

    return () => ctx?.revert()
  }, [])

  const STRATEGIES = [
    { id: 'foundation', profile: t('strategies','foundation_profile'), name: t('strategies','foundation_name'), objective: t('strategies','foundation_obj'), targetRef: t('strategies','foundation_target'), idealFor: t('strategies','foundation_ideal') },
    { id: 'growth',     profile: t('strategies','growth_profile'),     name: t('strategies','growth_name'),     objective: t('strategies','growth_obj'),     targetRef: t('strategies','growth_target'),     idealFor: t('strategies','growth_ideal') },
    { id: 'alpha',      profile: t('strategies','alpha_profile'),      name: t('strategies','alpha_name'),      objective: t('strategies','alpha_obj'),      targetRef: t('strategies','alpha_target'),      idealFor: t('strategies','alpha_ideal') },
  ]
  const isEs = lang === 'es'
  const RISK_METRICS = SITE_RISK_METRICS.map(m => ({
    label: isEs ? m.labelEs : m.labelEn,
    value: isEs ? m.valueEs : m.value,
  }))
  const INFRA = [
    { label: t('infra','segregated'), detail: t('infra','segregated_d') },
    { label: t('infra','liquidity'),  detail: t('infra','liquidity_d') },
    { label: t('infra','equinix'),    detail: t('infra','equinix_d') },
    { label: t('infra','b2broker'),   detail: t('infra','b2broker_d') },
    { label: t('infra','banking'),    detail: t('infra','banking_d') },
    { label: t('infra','portal'),     detail: t('infra','portal_d') },
  ]
  const PILLARS = [
    { title: t('home','pillar_1_title'), body: t('home','pillar_1_body') },
    { title: t('home','pillar_2_title'), body: t('home','pillar_2_body') },
    { title: t('home','pillar_3_title'), body: t('home','pillar_3_body') },
    { title: t('home','pillar_4_title'), body: t('home','pillar_4_body') },
  ]

  return (
    <div ref={pageRef} className="relative">

      {/* ── Fixed video — persists behind every section ──────────────────── */}
      <video
        ref={videoRef}
        src="/videos/hero.mp4"
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Fixed dark overlays — ensure text readability throughout */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.65) 100%)' }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1, background: 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 60%)' }}
      />

      {/* Fallback bg behind video (shows while video loads) */}
      <div className="fixed inset-0 bg-[#050505]" style={{ zIndex: -1 }} />

      {/* ── All content scrolls above video ─────────────────────────────── */}
      <div className="relative" style={{ zIndex: 10 }}>

        {/* ── HERO — full screen, text bottom-left ─────────────────────── */}
        <section className="min-h-screen flex flex-col justify-end px-5 sm:px-8 md:px-16 lg:px-28 xl:px-36 pb-20 md:pb-32 pt-24">
          <div className="max-w-3xl">
            <Label>{t('home','tagline')}</Label>
            <h1 className="text-[clamp(2.6rem,7vw,6.5rem)] font-light text-white leading-[1.04] tracking-tight mb-3">
              {t('home','hero_h1')}
            </h1>
            <h2 className="text-[clamp(2.6rem,7vw,6.5rem)] font-extralight text-white/55 leading-[1.04] tracking-tight mb-8 md:mb-10">
              {t('home','hero_h2')}
            </h2>
            <p className="text-white/82 text-base md:text-lg leading-relaxed max-w-xl mb-10">
              {t('home','hero_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <CTAButton to="/access">{t('home','apply_cta')}</CTAButton>
              <CTAButton to="/strategies" outline>{t('home','explore_cta')}</CTAButton>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 pointer-events-none">
            <span className="text-[8px] tracking-[0.45em] uppercase text-white/35">{t('home','scroll')}</span>
            <motion.div
              className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent"
              animate={{ scaleY: [1, 0.4, 1], opacity: [0.7, 0.2, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </section>

        {/* ── SECTION 01 — WHAT IS ARKA ────────────────────────────────── */}
        <section className="px-5 sm:px-8 md:px-16 lg:px-28 xl:px-36 py-24 md:py-36">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <SectionNum n="01" />
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
              <div>
                <Reveal>
                  <Label>{t('home','about_eyebrow')}</Label>
                  <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-light text-white leading-tight tracking-tight">
                    {t('home','about_h2')}
                  </h2>
                </Reveal>
              </div>
              <div className="space-y-5">
                <Reveal delay={0.1}>
                  <p className="text-white/88 text-base leading-[1.8]">{t('home','about_p1')}</p>
                </Reveal>
                <Reveal delay={0.18}>
                  <p className="text-white/88 text-base leading-[1.8]">{t('home','about_p2')}</p>
                </Reveal>
              </div>
            </div>

            {/* Philosophy pillars */}
            <div className="mt-20 md:mt-28">
              <Reveal>
                <Label>{t('home','philosophy_eyebrow')}</Label>
                <h3 className="text-xl md:text-2xl font-light text-white mb-10 max-w-xl">
                  {t('home','philosophy_h3')}
                </h3>
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {PILLARS.map((p, i) => (
                  <Reveal key={p.title} delay={i * 0.07}>
                    <div className="p-6 rounded-lg border border-white/10 bg-black/40 backdrop-blur-md h-full">
                      <div className="w-5 h-px bg-[#004C45]/60 mb-5" />
                      <h4 className="text-white font-medium text-sm mb-3">{p.title}</h4>
                      <p className="text-white/80 text-xs leading-relaxed">{p.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="px-5 sm:px-8 md:px-16 lg:px-28 xl:px-36">
          <Rule />
        </div>

        {/* ── SECTION 02 — STRATEGIES ──────────────────────────────────── */}
        <section className="px-5 sm:px-8 md:px-16 lg:px-28 xl:px-36 py-24 md:py-36">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <SectionNum n="02" />
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-14 items-end">
              <div>
                <Reveal>
                  <Label>{t('home','strategies_eyebrow')}</Label>
                  <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-light text-white leading-tight tracking-tight">
                    {t('home','strategies_h2')}
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <p className="text-white/88 text-base leading-relaxed">{t('home','strategies_desc')}</p>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 items-stretch">
              {STRATEGIES.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.09} className="h-full">
                  <StrategyCard
                    s={s}
                    applyLabel={t('home','strategy_apply')}
                    refLabel={t('home','strategy_label')}
                    subLabel={t('home','strategy_sublabel')}
                  />
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <p className="text-[9px] text-white/22 leading-relaxed max-w-3xl mb-5">
                ⚠ {t('home','strategy_disclaimer')}
              </p>
              <Link to="/strategies" className="text-[10px] tracking-[0.22em] uppercase text-white/40 hover:text-white border-b border-white/15 hover:border-white/55 pb-0.5 transition-all">
                {t('home','strategies_cta')}
              </Link>
            </Reveal>
          </div>
        </section>

        <div className="px-5 sm:px-8 md:px-16 lg:px-28 xl:px-36">
          <Rule />
        </div>

        {/* ── SECTION 03 — RISK FRAMEWORK ──────────────────────────────── */}
        <section className="px-5 sm:px-8 md:px-16 lg:px-28 xl:px-36 py-24 md:py-36">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <SectionNum n="03" />
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-14 items-end">
              <div>
                <Reveal>
                  <Label>{t('home','risk_eyebrow')}</Label>
                  <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-light text-white leading-tight tracking-tight">
                    {t('home','risk_h2')}
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <p className="text-white/88 text-base leading-relaxed">{t('home','risk_desc')}</p>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {RISK_METRICS.map((m, i) => (
                <Reveal key={m.label} delay={i * 0.07}>
                  <GlassCard label={m.label} value={m.value} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15}>
              <p className="text-[9px] text-white/22 max-w-2xl mb-5">
                ⚠ {t('home','risk_disclaimer')}
              </p>
              <Link to="/risk" className="text-[10px] tracking-[0.22em] uppercase text-white/40 hover:text-white border-b border-white/15 hover:border-white/55 pb-0.5 transition-all">
                {t('home','risk_cta')}
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── SECTION 04 — WORLD MAP ───────────────────────────────────── */}
        <section className="py-24 md:py-36">
          <div className="px-5 sm:px-8 md:px-16 lg:px-28 xl:px-36 mb-10">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-6 mb-16">
                <SectionNum n="04" />
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>
              <div className="grid md:grid-cols-2 gap-10 items-end">
                <div>
                  <Reveal>
                    <Label>{t('home','map_eyebrow')}</Label>
                    <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-light text-white leading-tight tracking-tight">
                      {t('home','map_h2')}
                    </h2>
                  </Reveal>
                </div>
                <Reveal delay={0.1}>
                  <p className="text-white/88 text-base leading-relaxed">{t('home','map_desc')}</p>
                </Reveal>
              </div>
            </div>
          </div>

          <Reveal>
            <div className="px-5 sm:px-8 md:px-12 lg:px-20">
              <WorldMap
                lineColor="#FFFFFF"
                animationDuration={2.5}
                loop
                dots={[
                  { start: { lat: 40.7128,  lng: -74.006,  label: 'New York'  }, end: { lat: 51.5074,  lng: -0.1278,  label: 'London'    } },
                  { start: { lat: 51.5074,  lng: -0.1278,  label: 'London'    }, end: { lat: 50.1109,  lng: 8.6821,   label: 'Frankfurt'  } },
                  { start: { lat: 51.5074,  lng: -0.1278,  label: 'London'    }, end: { lat: 25.2048,  lng: 55.2708,  label: 'Dubai'      } },
                  { start: { lat: 25.2048,  lng: 55.2708,  label: 'Dubai'     }, end: { lat: 1.3521,   lng: 103.8198, label: 'Singapore'  } },
                  { start: { lat: 1.3521,   lng: 103.8198, label: 'Singapore' }, end: { lat: 35.6762,  lng: 139.6503, label: 'Tokyo'      } },
                  { start: { lat: 40.7128,  lng: -74.006,  label: 'New York'  }, end: { lat: -23.5505, lng: -46.6333, label: 'São Paulo'  } },
                ]}
              />
            </div>
          </Reveal>
        </section>

        <div className="px-5 sm:px-8 md:px-16 lg:px-28 xl:px-36">
          <Rule />
        </div>

        {/* ── SECTION 05 — INFRASTRUCTURE ──────────────────────────────── */}
        <section className="px-5 sm:px-8 md:px-16 lg:px-28 xl:px-36 py-24 md:py-36">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <SectionNum n="05" />
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-14 items-end">
              <div>
                <Reveal>
                  <Label>{t('home','infra_eyebrow')}</Label>
                  <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-light text-white leading-tight tracking-tight">
                    {t('home','infra_h2')}
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <p className="text-white/88 text-base leading-relaxed">{t('home','infra_desc')}</p>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
              {INFRA.map((item, i) => (
                <Reveal key={item.label} delay={i * 0.07}>
                  <div className="p-5 rounded-lg border border-white/10 bg-black/40 backdrop-blur-md space-y-1.5">
                    <p className="text-white font-light text-sm">{item.label}</p>
                    <p className="text-white/80 text-xs leading-relaxed">{item.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* CTA final */}
            <Reveal>
              <div className="border border-white/10 rounded-xl p-8 md:p-12 bg-black/45 backdrop-blur-md">
                <Label>{t('home','access_eyebrow')}</Label>
                <h2 className="text-[clamp(1.6rem,3.5vw,2.8rem)] font-light text-white mb-4 max-w-xl">
                  {t('home','access_h3')}
                </h2>

                <div className="flex flex-wrap gap-2 mb-10">
                  {t('home','access_steps').map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-white/22">0{i + 1}</span>
                      <span className="text-white/75 text-[10px] tracking-wider uppercase">{step}</span>
                      {i < 4 && <span className="text-white/18 mx-1">→</span>}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <CTAButton to="/access">{t('home','apply_cta')}</CTAButton>
                  <a
                    href={SITE.investorPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-medium border border-white/18 text-white/62 hover:border-white/40 hover:text-white transition-all duration-300 px-8 py-4 rounded-sm"
                  >
                    {t('home','portal_cta')} ↗
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-[9px] text-white/18 leading-relaxed max-w-4xl mt-10">
                {t('home','footer_disclaimer')} <strong className="text-white/25">ARKA Global Investments</strong>
              </p>
            </Reveal>
          </div>
        </section>

      </div>
    </div>
  )
}
