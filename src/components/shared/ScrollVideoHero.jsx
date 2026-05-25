import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import { SITE } from '@/config/site'

gsap.registerPlugin(ScrollTrigger)

const VIDEOS = [
  '/videos/video1.mp4',
  '/videos/video2.mp4',
  '/videos/video3.mp4',
  '/videos/video4.mp4',
  '/videos/video5.mp4',
]

// Total scroll height that drives the 5-video sequence
const SCROLL_HEIGHT = '600vh'

export default function ScrollVideoHero() {
  const wrapperRef = useRef(null)
  const stickyRef = useRef(null)
  const videoRefs = useRef([])
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  const [activeVideo, setActiveVideo] = useState(0)

  useEffect(() => {
    // Preload all videos
    videoRefs.current.forEach((v) => { if (v) v.load() })

    const ctx = gsap.context(() => {
      // ── Step 1: fade in content on load ──────────────────────────────────
      gsap.from(contentRef.current, {
        opacity: 0,
        y: 40,
        duration: 1.4,
        ease: 'power3.out',
        delay: 0.3,
      })

      // ── Step 2: Cross-fade between videos driven by scroll ────────────────
      //   Each video occupies 1/5 of the total scroll budget.
      const totalVideos = VIDEOS.length

      VIDEOS.forEach((_, i) => {
        const el = videoRefs.current[i]
        if (!el) return

        const segStart = i / totalVideos
        const segEnd   = (i + 1) / totalVideos

        ScrollTrigger.create({
          trigger: wrapperRef.current,
          start: 'top top',
          end:   'bottom bottom',
          onUpdate(self) {
            const p = self.progress

            // Determine if this segment is active
            const inSegment = p >= segStart && p < segEnd
            const isLast    = i === totalVideos - 1 && p >= segEnd

            if (inSegment || isLast) {
              if (el.paused) el.play().catch(() => {})
              gsap.to(el, { opacity: 1, duration: 0.6 })

              // Pause & hide others
              videoRefs.current.forEach((other, j) => {
                if (j !== i && other) {
                  gsap.to(other, { opacity: 0, duration: 0.4 })
                  other.pause()
                }
              })

              setActiveVideo(i)
            }
          },
        })
      })

      // ── Step 3: Fade overlay darker as user scrolls away from hero ────────
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: 'top top',
        end: '20% top',
        onUpdate(self) {
          gsap.to(overlayRef.current, {
            opacity: 0.3 + self.progress * 0.5,
            duration: 0.1,
          })
        },
      })

      // ── Step 4: Content fades out as scroll progresses ────────────────────
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: '5% top',
        end: '25% top',
        onUpdate(self) {
          gsap.to(contentRef.current, {
            opacity: 1 - self.progress,
            y: -self.progress * 60,
            duration: 0.1,
          })
        },
      })
    }, wrapperRef)

    // Autoplay first video
    if (videoRefs.current[0]) {
      videoRefs.current[0].play().catch(() => {})
    }

    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapperRef} style={{ height: SCROLL_HEIGHT }} className="relative">
      {/* Sticky container */}
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Videos stacked */}
        {VIDEOS.map((src, i) => (
          <video
            key={src}
            ref={(el) => (videoRefs.current[i] = el)}
            src={src}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: i === 0 ? 1 : 0 }}
          />
        ))}

        {/* Gradient overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-gradient-to-b from-[#050505]/30 via-[#050505]/60 to-[#050505]"
          style={{ opacity: 0.55 }}
        />

        {/* Hero content */}
        <div
          ref={contentRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          {/* Eyebrow */}
          <p className="text-[10px] tracking-[0.5em] uppercase text-[#94A3B8] mb-6 font-light">
            {SITE.tagline}
          </p>

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-white leading-[1.05] tracking-tight max-w-5xl mb-6">
            Disciplined Strategies.
            <br />
            <span className="font-extralight text-[#D8DEE9]">Long-Term Capital Growth.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-[#94A3B8] text-base md:text-lg max-w-2xl leading-relaxed mb-10">
            ARKA Global Investments is a private quantitative investment platform built for
            qualified investors, family offices, and institutional capital seeking disciplined
            exposure to global financial markets through systematic strategies, defined risk
            architecture, and long-term capital stewardship.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/access"
              className="px-8 py-4 bg-white text-[#050505] text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#D8DEE9] transition-colors duration-300 rounded"
            >
              Apply for Access
            </Link>
            <Link
              to="/strategies"
              className="px-8 py-4 border border-[#1E293B] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#0B1F3A]/60 hover:border-[#334155] transition-all duration-300 rounded backdrop-blur-sm"
            >
              Explore Strategies
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#94A3B8]">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-[#94A3B8] to-transparent" />
          </div>
        </div>

        {/* Video progress indicators */}
        <div className="absolute bottom-10 right-8 flex gap-2">
          {VIDEOS.map((_, i) => (
            <div
              key={i}
              className="w-1 h-6 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i === activeVideo ? '#ffffff' : '#1E293B',
                opacity: i === activeVideo ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
