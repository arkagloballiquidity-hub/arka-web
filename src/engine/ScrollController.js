import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default class ScrollController {
  constructor(engine, containerEl) {
    this.engine = engine

    this._st = ScrollTrigger.create({
      trigger:   containerEl,
      start:     'top top',
      end:       'bottom bottom',
      scrub:     false,
      onUpdate:  (self) => engine.setProgress(self.progress),
    })
  }

  dispose() {
    this._st.kill()
  }
}
