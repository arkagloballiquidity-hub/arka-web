/**
 * VideoScrollEngine — draws 5 videos as a single scroll-driven sequence.
 * Scroll progress 0→1 maps to: video1 (0–0.2) → video2 (0.2–0.4) → … → video5 (0.8–1.0)
 * video.currentTime is set each RAF frame based on scroll position.
 */

const SCENE_COUNT = 5
const LERP_SPEED  = 0.07   // smoothing — lower = more cinematic lag

export default class VideoScrollEngine {
  constructor(canvas) {
    this.canvas   = canvas
    this.ctx      = canvas.getContext('2d')
    this.progress = 0
    this._prog    = 0   // smoothed
    this.disposed = false
    this._raf     = null
    this._sceneIdx = -1

    this._resize()
    this._onResize = () => this._resize()
    window.addEventListener('resize', this._onResize)

    this._loadVideos()
    this._startLoop()
  }

  // ── Size canvas to full viewport (CSS pixels × DPR, max 2) ──────────────
  _resize() {
    const dpr = Math.min(window.devicePixelRatio, 2)
    const w   = window.innerWidth
    const h   = window.innerHeight
    this.canvas.width  = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
    this.canvas.style.width  = w + 'px'
    this.canvas.style.height = h + 'px'
    this.ctx.scale(dpr, dpr)
    this._dpr = dpr
    this._cssW = w
    this._cssH = h
  }

  // ── Create and preload all 5 video elements ──────────────────────────────
  _loadVideos() {
    this.videos  = []
    this._loaded = []   // true when video has enough data to draw

    for (let i = 0; i < SCENE_COUNT; i++) {
      const v = document.createElement('video')
      v.src         = `/videos/video${i + 1}.mp4`
      v.muted       = true
      v.playsInline = true
      v.preload     = 'auto'
      v.crossOrigin = 'anonymous'

      this._loaded.push(false)
      const idx = i;
      const mark = () => { this._loaded[idx] = true }
      v.addEventListener('loadeddata',  mark, { once: true })
      v.addEventListener('canplaythrough', mark, { once: true })

      v.load()
      this.videos.push(v)
    }
  }

  // ── Main RAF loop ────────────────────────────────────────────────────────
  _startLoop() {
    const tick = () => {
      if (this.disposed) return
      this._raf = requestAnimationFrame(tick)

      // Smooth lerp toward target progress
      this._prog += (this.progress - this._prog) * LERP_SPEED

      const sceneF   = this._prog * SCENE_COUNT
      const sceneIdx = Math.min(Math.floor(sceneF), SCENE_COUNT - 1)
      const sceneProg = Math.min(sceneF - sceneIdx, 1)   // 0–1 within scene

      const video = this.videos[sceneIdx]

      // Seek video to the right frame for this scroll position
      if (video.duration > 0) {
        const target = sceneProg * video.duration
        if (Math.abs(video.currentTime - target) > 0.033) {
          video.currentTime = target
        }
      }

      this._drawFrame(video, sceneIdx)
    }

    tick()
  }

  // ── Draw current video frame, object-fit: cover ──────────────────────────
  _drawFrame(video, sceneIdx) {
    const ctx = this.ctx
    const W   = this._cssW
    const H   = this._cssH

    // Fill background black while video loads
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, W, H)

    if (!this._loaded[sceneIdx] || !video.videoWidth) return

    const vw = video.videoWidth
    const vh = video.videoHeight
    const scale = Math.max(W / vw, H / vh)
    const dw = vw * scale
    const dh = vh * scale
    const dx = (W - dw) / 2
    const dy = (H - dh) / 2

    ctx.drawImage(video, dx, dy, dw, dh)
  }

  /** Called by ScrollController with 0–1 progress */
  setProgress(p) {
    this.progress = Math.max(0, Math.min(1, p))

    // Eagerly trigger load of next scene video
    const nextIdx = Math.min(Math.floor(p * SCENE_COUNT) + 1, SCENE_COUNT - 1)
    const next = this.videos[nextIdx]
    if (next && next.readyState === 0) next.load()
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this._raf)
    window.removeEventListener('resize', this._onResize)
    this.videos.forEach(v => { v.pause(); v.src = ''; v.load() })
  }
}
