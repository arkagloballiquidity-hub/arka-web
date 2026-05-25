import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const VIDEOS = [
  '/videos/video1.mp4',
  '/videos/video2.mp4',
  '/videos/video3.mp4',
  '/videos/video4.mp4',
  '/videos/video5.mp4',
]

// Context so child sections can register themselves
export const VideoSectionContext = createContext(null)

export function useVideoSection(index) {
  const ctx = useContext(VideoSectionContext)
  const ref = useRef(null)

  useEffect(() => {
    if (!ctx || !ref.current) return
    ctx.register(index, ref.current)
    return () => ctx.unregister(index)
  }, [ctx, index])

  return ref
}

export default function VideoBackground({ children }) {
  const videoRefs = useRef([])
  const [active, setActive] = useState(0)
  const sections = useRef(new Map())

  const register = (index, el) => sections.current.set(index, el)
  const unregister = (index) => sections.current.delete(index)

  useEffect(() => {
    // Preload
    videoRefs.current.forEach((v) => { if (v) v.load() })

    // Play first
    videoRefs.current[0]?.play().catch(() => {})

    // For each registered section, create a ScrollTrigger
    const triggers = []

    const setup = () => {
      sections.current.forEach((el, videoIndex) => {
        const t = ScrollTrigger.create({
          trigger: el,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => switchVideo(videoIndex),
          onEnterBack: () => switchVideo(videoIndex),
        })
        triggers.push(t)
      })
    }

    // Wait a tick for DOM to settle
    const tid = setTimeout(setup, 200)

    return () => {
      clearTimeout(tid)
      triggers.forEach((t) => t.kill())
    }
  }, [])

  const switchVideo = (index) => {
    setActive(index)
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === index) {
        gsap.to(v, { opacity: 1, duration: 0.8, ease: 'power2.out' })
        v.play().catch(() => {})
      } else {
        gsap.to(v, { opacity: 0, duration: 0.6, ease: 'power2.in' })
        v.pause()
      }
    })
  }

  return (
    <VideoSectionContext.Provider value={{ register, unregister }}>
      {/* Sticky video layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {VIDEOS.map((src, i) => (
          <video
            key={src}
            ref={(el) => (videoRefs.current[i] = el)}
            src={src}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: i === 0 ? 1 : 0 }}
          />
        ))}
        {/* Master overlay — dark gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-[#050505]/65 to-[#050505]/80" />
        {/* Vignette edges */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,5,0.7) 100%)' }} />
      </div>

      {/* Scrollable content layer */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Video index dots — bottom right */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = sections.current.get(i)
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className="w-1.5 rounded-full transition-all duration-500"
            style={{
              height: i === active ? '24px' : '6px',
              backgroundColor: i === active ? '#ffffff' : 'rgba(255,255,255,0.25)',
            }}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>
    </VideoSectionContext.Provider>
  )
}
