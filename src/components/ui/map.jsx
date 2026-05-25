import { useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DottedMap from 'dotted-map'

export function WorldMap({
  dots = [],
  lineColor = '#C9A352',
  showLabels = true,
  animationDuration = 2,
  loop = true,
}) {
  const svgRef = useRef(null)
  const [hoveredLocation, setHoveredLocation] = useState(null)

  const map = useMemo(() => new DottedMap({ height: 100, grid: 'diagonal' }), [])

  const svgMap = useMemo(() => {
    const raw = map.getSVG({
      radius: 0.22,
      color: lineColor,
      shape: 'circle',
      backgroundColor: 'transparent',
    })
    // Force SVG to fill its container
    return raw.replace('<svg ', '<svg width="100%" height="100%" ')
  }, [map])

  const projectPoint = (lat, lng) => ({
    x: (lng + 180) * (800 / 360),
    y: (90 - lat) * (400 / 180),
  })

  const createCurvedPath = (start, end) => {
    const midX = (start.x + end.x) / 2
    const midY = Math.min(start.y, end.y) - 50
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`
  }

  const staggerDelay       = 0.4
  const totalAnimationTime = dots.length * staggerDelay + animationDuration
  const pauseTime          = 2
  const fullCycleDuration  = totalAnimationTime + pauseTime

  return (
    <div className="w-full aspect-[2/1] relative overflow-hidden rounded-xl">
      {/* Dotted base map — inline SVG */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none select-none
          [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
        dangerouslySetInnerHTML={{ __html: svgMap }}
        style={{ lineHeight: 0, opacity: 0.72 }}
      />

      {/* Animated SVG overlay */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-auto select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="white"   stopOpacity="0" />
            <stop offset="5%"   stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%"  stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white"   stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Paths */}
        {dots.map((dot, i) => {
          const sp = projectPoint(dot.start.lat, dot.start.lng)
          const ep = projectPoint(dot.end.lat, dot.end.lng)
          const pathD = createCurvedPath(sp, ep)

          const startTime = (i * staggerDelay) / fullCycleDuration
          const endTime   = (i * staggerDelay + animationDuration) / fullCycleDuration
          const resetTime = totalAnimationTime / fullCycleDuration

          return (
            <g key={`path-${i}`}>
              <motion.path
                d={pathD}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.2"
                initial={{ pathLength: 0 }}
                animate={loop
                  ? { pathLength: [0, 0, 1, 1, 0] }
                  : { pathLength: 1 }}
                transition={loop
                  ? { duration: fullCycleDuration, times: [0, startTime, endTime, resetTime, 1], ease: 'easeInOut', repeat: Infinity }
                  : { duration: animationDuration, delay: i * staggerDelay, ease: 'easeInOut' }}
              />
              {loop && (
                <motion.circle
                  r="3"
                  fill={lineColor}
                  filter="url(#glow)"
                  initial={{ offsetDistance: '0%', opacity: 0 }}
                  animate={{ offsetDistance: [null, '0%', '100%', '100%', '100%'], opacity: [0, 0, 1, 0, 0] }}
                  transition={{ duration: fullCycleDuration, times: [0, startTime, endTime, resetTime, 1], ease: 'easeInOut', repeat: Infinity }}
                  style={{ offsetPath: `path('${pathD}')` }}
                />
              )}
            </g>
          )
        })}

        {/* Location dots + labels — deduplicated, collision-aware */}
        {(() => {
          const seen = new Set()
          const cities = []
          dots.forEach(dot => {
            ;[dot.start, dot.end].forEach(city => {
              const key = `${city.lat},${city.lng}`
              if (!seen.has(key)) { seen.add(key); cities.push(city) }
            })
          })

          // Compute projected positions
          const positions = cities.map(c => projectPoint(c.lat, c.lng))

          // Smart label side: if two cities are horizontally close,
          // the one lower on screen gets its label placed BELOW the dot
          const labelSide = positions.map((pt, i) => {
            for (let j = 0; j < positions.length; j++) {
              if (i === j) continue
              const other = positions[j]
              if (Math.abs(pt.x - other.x) < 90 && Math.abs(pt.y - other.y) < 40) {
                // The city with higher y (lower on screen) goes below
                if (pt.y >= other.y) return 'below'
              }
            }
            return 'above'
          })

          return cities.map((city, ci) => {
            const pt   = positions[ci]
            const lbl  = (city.label || '').toUpperCase()
            const rW   = Math.max(lbl.length * 5.8 + 16, 48)
            const side = labelSide[ci]

            // above: label sits above the dot; below: label sits below
            const rectY = side === 'above' ? pt.y - 26 : pt.y + 12
            const textY = side === 'above' ? pt.y - 16  : pt.y + 22

            return (
              <g key={`city-${ci}`}>
                <motion.g
                  onHoverStart={() => setHoveredLocation(city.label)}
                  onHoverEnd={() => setHoveredLocation(null)}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <circle cx={pt.x} cy={pt.y} r="3.5" fill={lineColor} filter="url(#glow)" />
                  <circle cx={pt.x} cy={pt.y} r="3.5" fill={lineColor} opacity="0.4">
                    <animate attributeName="r"       from="3.5" to="11" dur="2.5s" begin="0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5"  to="0"  dur="2.5s" begin="0s" repeatCount="indefinite" />
                  </circle>
                </motion.g>

                {showLabels && lbl && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: ci * 0.1 + 0.4, duration: 0.5 }}
                    className="pointer-events-none select-none"
                  >
                    <rect
                      x={pt.x - rW / 2}
                      y={rectY}
                      width={rW}
                      height={14}
                      rx={3}
                      fill="rgba(0,0,0,0.82)"
                      stroke={lineColor}
                      strokeWidth={0.6}
                      strokeOpacity={0.7}
                    />
                    <text
                      x={pt.x}
                      y={textY}
                      textAnchor="middle"
                      fontSize="7"
                      fill="#FFFFFF"
                      fontFamily="system-ui, sans-serif"
                      letterSpacing="0.08em"
                      fontWeight="600"
                    >
                      {lbl}
                    </text>
                  </motion.g>
                )}
              </g>
            )
          })
        })()}
      </svg>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-4 left-4 bg-black/85 text-[#C9A352] px-3 py-1.5 rounded-lg
              text-xs font-medium backdrop-blur-sm border border-[#C9A352]/20 sm:hidden"
          >
            {hoveredLocation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
