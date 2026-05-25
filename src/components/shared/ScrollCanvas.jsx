import { useEffect, useRef } from 'react'
import CanvasEngine from '../../engine/CanvasEngine'
import ScrollController from '../../engine/ScrollController'

/**
 * Full-screen fixed WebGL canvas — scroll-driven procedural animation.
 * CanvasEngine creates its own <canvas> element and appends it to the
 * wrapper div so StrictMode double-mount doesn't hit a stale context.
 */
export default function ScrollCanvas({ containerRef }) {
  const wrapperRef = useRef(null)

  useEffect(() => {
    const wrapper   = wrapperRef.current
    const container = containerRef?.current
    if (!wrapper || !container) return

    // Create a fresh canvas owned by the engine lifecycle
    const canvas = document.createElement('canvas')
    Object.assign(canvas.style, {
      position:      'absolute',
      inset:         '0',
      width:         '100%',
      height:        '100%',
      display:       'block',
      pointerEvents: 'none',
    })
    wrapper.appendChild(canvas)

    const engine     = new CanvasEngine(canvas)
    const controller = new ScrollController(engine, container)

    return () => {
      controller.dispose()
      engine.dispose()
      canvas.remove()
    }
  }, [containerRef])

  return (
    <div
      ref={wrapperRef}
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        0,
        pointerEvents: 'none',
      }}
    />
  )
}
