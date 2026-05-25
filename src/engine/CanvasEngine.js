/**
 * CanvasEngine — "Descending through a golden nebula"
 * One continuous 3D particle field; camera drifts downward as the user scrolls.
 * No scene morphing, no formation cuts — pure fluid motion.
 */
import * as THREE from 'three'

// ── Palette ───────────────────────────────────────────────────────────────
const C_BG     = new THREE.Color('#020407')
const C_GOLD   = new THREE.Color('#C9A352')
const C_BRIGHT = new THREE.Color('#F0DFA8')
const C_DIM    = new THREE.Color('#8A6D2E')

// ── Volume ────────────────────────────────────────────────────────────────
// Camera travels from Y_TOP to Y_BOT as progress 0 → 1
const Y_TOP      =  3.2   // camera y at scroll=0
const Y_BOT      = -3.2   // camera y at scroll=1
const FIELD_Y    = 10     // total height of the particle column (± 5 units)
const FIELD_R    =  3.2   // radial spread of particles

const N_DESKTOP = 2200
const N_MOBILE  =  700
const CONN_DIST =  0.55   // max connection distance
const CONN_MAX  =  500    // max constellation lines desktop

// ── Shaders (inline to avoid extra files) ─────────────────────────────────
const VERT = /* glsl */`
  attribute float aVariant;   // 0=gold 1=bright 2=dim
  attribute vec3  aRandOff;   // per-particle random offset for drift

  uniform float uTime;
  uniform float uCamY;        // current camera world-Y (for depth fade)

  varying float vOpacity;
  varying float vVariant;

  void main() {
    // Gentle ambient drift — each particle moves in a unique Lissajous path
    vec3 pos = position;
    float seed = aRandOff.x * 6.2832;
    pos.x += sin(uTime * 0.11 + seed)           * 0.018;
    pos.z += cos(uTime * 0.09 + seed * 1.3)     * 0.016;
    pos.y += sin(uTime * 0.07 + seed * 0.7)     * 0.012;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    // Perspective size
    float dist     = max(-mv.z, 0.3);
    float baseSize = mix(1.4, 0.6, aVariant * 0.5);   // gold=1.4 dim=0.6
    gl_PointSize   = clamp(baseSize * 200.0 / dist, 0.4, 5.5);

    gl_Position = projectionMatrix * mv;

    // Base opacity by variant
    float bright  = step(0.5, aVariant);
    float dim     = step(1.5, aVariant);
    float baseOp  = mix(0.72, mix(0.95, 0.30, dim), bright);

    // Fade particles far in world-Y from the camera (±3 units window)
    float dy      = abs(pos.y - uCamY);
    float depthOp = 1.0 - smoothstep(1.5, 4.5, dy);

    vOpacity = baseOp * depthOp;
    vVariant = aVariant;
  }
`

const FRAG = /* glsl */`
  uniform vec3 uGold;
  uniform vec3 uBright;
  uniform vec3 uDim;

  varying float vOpacity;
  varying float vVariant;

  void main() {
    // Soft circular sprite
    vec2  uv   = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    float alpha  = 1.0 - smoothstep(0.18, 0.50, dist);
    float glow   = (1.0 - smoothstep(0.0,  0.22, dist)) * 0.45;
    float bright = step(0.5, vVariant);
    float dim    = step(1.5, vVariant);
    vec3  col    = mix(uGold, mix(uBright, uDim, dim), bright);

    gl_FragColor = vec4(col, vOpacity * (alpha + glow));
  }
`

const LINE_VERT = /* glsl */`
  attribute float aAlpha;
  varying   float vAlpha;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vAlpha = aAlpha;
  }
`

const LINE_FRAG = /* glsl */`
  uniform vec3  uColor;
  varying float vAlpha;
  void main() { gl_FragColor = vec4(uColor, vAlpha); }
`

// ── Engine ────────────────────────────────────────────────────────────────
export default class CanvasEngine {
  constructor(canvas) {
    this._canvas   = canvas
    this._progress = 0
    this._smooth   = 0       // lerped progress for camera
    this._time     = 0
    this._disposed = false

    this._initRenderer()
    this._buildField()
    this._buildLines()
    this._startLoop()
    this._onResize = this._resize.bind(this)
    window.addEventListener('resize', this._onResize)
  }

  // ── Renderer + camera ────────────────────────────────────────────────────
  _initRenderer() {
    const w = window.innerWidth, h = window.innerHeight
    this._renderer = new THREE.WebGLRenderer({
      canvas:          this._canvas,
      antialias:       false,
      alpha:           false,
      powerPreference: 'high-performance',
    })
    this._renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    this._renderer.setSize(w, h)
    this._renderer.setClearColor(C_BG, 1)

    this._scene  = new THREE.Scene()
    // Soft exponential fog — fades distant particles naturally
    this._scene.fog = new THREE.FogExp2(C_BG, 0.10)

    this._camera = new THREE.PerspectiveCamera(58, w / h, 0.1, 60)
    this._camera.position.set(0, Y_TOP, 4.2)
    this._camera.lookAt(0, Y_TOP, 0)
  }

  // ── Particle field ───────────────────────────────────────────────────────
  _buildField() {
    const mobile = window.innerWidth < 768
    const N      = mobile ? N_MOBILE : N_DESKTOP
    this._N      = N

    const pos     = new Float32Array(N * 3)
    const rand    = new Float32Array(N * 3)
    const variant = new Float32Array(N)

    // Seeded clusters to break up uniform randomness
    const CLUSTERS = 14
    const clCx = Array.from({ length: CLUSTERS }, () => (Math.random() - 0.5) * FIELD_R * 1.4)
    const clCy = Array.from({ length: CLUSTERS }, () => (Math.random() - 0.5) * FIELD_Y)
    const clCz = Array.from({ length: CLUSTERS }, () => (Math.random() - 0.5) * FIELD_R * 0.8)

    for (let i = 0; i < N; i++) {
      // 45% cluster particles, 55% volumetric haze
      if (Math.random() < 0.45) {
        const c  = Math.floor(Math.random() * CLUSTERS)
        const r  = Math.pow(Math.random(), 0.5) * 0.9
        const th = Math.random() * Math.PI * 2
        const ph = Math.random() * Math.PI
        pos[i*3]   = clCx[c] + r * Math.sin(ph) * Math.cos(th)
        pos[i*3+1] = clCy[c] + r * Math.sin(ph) * Math.sin(th) * 0.6
        pos[i*3+2] = clCz[c] + r * Math.cos(ph) * 0.5
      } else {
        // Cylindrical haze — denser near center
        const th = Math.random() * Math.PI * 2
        const r  = Math.pow(Math.random(), 0.6) * FIELD_R
        pos[i*3]   = Math.cos(th) * r
        pos[i*3+1] = (Math.random() - 0.5) * FIELD_Y
        pos[i*3+2] = Math.sin(th) * r * 0.55   // slightly flatter in z
      }

      // Random seed for drift animation (stored as vec3 but only x is used)
      rand[i*3]   = Math.random()
      rand[i*3+1] = Math.random()
      rand[i*3+2] = Math.random()

      const rv    = Math.random()
      variant[i]  = rv < 0.60 ? 0 : rv < 0.85 ? 1 : 2
    }

    this._positions = pos    // keep for constellation CPU calcs

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos,     3))
    geo.setAttribute('aRandOff', new THREE.BufferAttribute(rand,    3))
    geo.setAttribute('aVariant', new THREE.BufferAttribute(variant, 1))

    this._uniforms = {
      uTime:   { value: 0 },
      uCamY:   { value: Y_TOP },
      uGold:   { value: C_GOLD   },
      uBright: { value: C_BRIGHT },
      uDim:    { value: C_DIM    },
    }

    this._points = new THREE.Points(
      geo,
      new THREE.ShaderMaterial({
        vertexShader:   VERT,
        fragmentShader: FRAG,
        uniforms:       this._uniforms,
        transparent:    true,
        depthWrite:     false,
        blending:       THREE.AdditiveBlending,
      })
    )
    this._scene.add(this._points)
  }

  // ── Constellation lines ──────────────────────────────────────────────────
  _buildLines() {
    const N   = this._N
    const pos = this._positions
    const MAX = window.innerWidth < 768 ? 120 : CONN_MAX
    const D2  = CONN_DIST * CONN_DIST

    // Find pairs: sort by Y then scan a window
    const idx = Array.from({ length: N }, (_, i) => i)
    idx.sort((a, b) => pos[a*3+1] - pos[b*3+1])

    const pairsA = [], pairsB = []
    const WIN = 40  // neighbor window after sort

    for (let ii = 0; ii < idx.length - 1 && pairsA.length < MAX; ii++) {
      const a = idx[ii]
      for (let jj = ii + 1; jj < Math.min(ii + WIN, idx.length); jj++) {
        const b  = idx[jj]
        const dx = pos[a*3]   - pos[b*3]
        const dy = pos[a*3+1] - pos[b*3+1]
        const dz = pos[a*3+2] - pos[b*3+2]
        if (dx*dx + dy*dy + dz*dz < D2) {
          pairsA.push(a); pairsB.push(b)
          if (pairsA.length >= MAX) break
        }
      }
    }

    this._pA  = pairsA
    this._pB  = pairsB
    const cnt = pairsA.length

    this._linePos   = new Float32Array(cnt * 6)
    this._lineAlpha = new Float32Array(cnt * 2)

    const geo = new THREE.BufferGeometry()
    const posA = new THREE.BufferAttribute(this._linePos,   3); posA.setUsage(THREE.DynamicDrawUsage)
    const alpA = new THREE.BufferAttribute(this._lineAlpha, 1); alpA.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('position', posA)
    geo.setAttribute('aAlpha',   alpA)

    this._lineGeo = geo
    this._lines   = new THREE.LineSegments(
      geo,
      new THREE.ShaderMaterial({
        vertexShader:   LINE_VERT,
        fragmentShader: LINE_FRAG,
        uniforms:       { uColor: { value: C_DIM } },
        transparent:    true,
        depthWrite:     false,
        blending:       THREE.AdditiveBlending,
      })
    )
    this._scene.add(this._lines)
  }

  _updateLines(camY) {
    const pos = this._positions
    const lp  = this._linePos
    const la  = this._lineAlpha
    const pA  = this._pA
    const pB  = this._pB
    const cnt = pA.length

    for (let i = 0; i < cnt; i++) {
      const a = pA[i], b = pB[i]

      lp[i*6]   = pos[a*3];   lp[i*6+1] = pos[a*3+1]; lp[i*6+2] = pos[a*3+2]
      lp[i*6+3] = pos[b*3];   lp[i*6+4] = pos[b*3+1]; lp[i*6+5] = pos[b*3+2]

      // Lines only glow near the camera's y position
      const midY  = (pos[a*3+1] + pos[b*3+1]) * 0.5
      const dy    = Math.abs(midY - camY)
      const alpha = Math.max(0, 1 - dy / 2.2) * 0.11

      la[i*2] = la[i*2+1] = alpha
    }

    this._lineGeo.getAttribute('position').needsUpdate = true
    this._lineGeo.getAttribute('aAlpha').needsUpdate   = true
    this._lineGeo.setDrawRange(0, cnt * 2)
  }

  // ── Render loop ──────────────────────────────────────────────────────────
  _startLoop() {
    let prev = 0
    const tick = (ts) => {
      if (this._disposed) return
      this._raf = requestAnimationFrame(tick)

      const dt   = Math.min((ts - prev) / 1000, 0.05)
      prev       = ts
      this._time += dt

      // Smooth-lerp progress → camera Y
      this._smooth += (this._progress - this._smooth) * 0.06
      const camY   = Y_TOP + (Y_BOT - Y_TOP) * this._smooth

      // Camera: descend and breathe gently
      this._camera.position.y = camY
      this._camera.position.z = 4.2 - this._smooth * 0.3
      this._camera.position.x = Math.sin(this._time * 0.04) * 0.06  // subtle sway
      this._camera.lookAt(0, camY, 0)

      // Update uniforms
      this._uniforms.uTime.value = this._time
      this._uniforms.uCamY.value = camY

      // Constellation lines
      this._updateLines(camY)

      this._renderer.render(this._scene, this._camera)
    }
    requestAnimationFrame(tick)
  }

  setProgress(p) {
    this._progress = Math.max(0, Math.min(1, p))
  }

  _resize() {
    const w = window.innerWidth, h = window.innerHeight
    this._camera.aspect = w / h
    this._camera.updateProjectionMatrix()
    this._renderer.setSize(w, h)
  }

  dispose() {
    this._disposed = true
    cancelAnimationFrame(this._raf)
    window.removeEventListener('resize', this._onResize)
    this._renderer.dispose()
    this._points.geometry.dispose()
    this._points.material.dispose()
    this._lines.geometry.dispose()
    this._lines.material.dispose()
  }
}
