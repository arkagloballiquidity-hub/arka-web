uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;

attribute vec3  aOffset;
attribute vec3  aTarget;
attribute float aDelay;
attribute float aSize;
attribute float aVariant;  // 0=gold 1=bright 2=dim

varying float vOpacity;
varying float vVariant;

float easeInOut(float t) {
  return t < 0.5 ? 2.0*t*t : -1.0 + (4.0 - 2.0*t)*t;
}

void main() {
  float d = aDelay * 0.38;
  float p = clamp((uProgress - d) / (1.0 - d + 0.001), 0.0, 1.0);
  p = easeInOut(p);

  vec3 pos = mix(aOffset, aTarget, p);

  // Slow, graceful ambient drift — luxury feels unhurried
  float t = uTime * 0.18 + aDelay * 6.2832;
  pos.x += sin(t)        * 0.007;
  pos.y += cos(t * 0.73) * 0.006;
  pos.z += sin(t * 0.51) * 0.004;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  float perspSize = aSize * uPixelRatio * (155.0 / -mvPos.z);
  gl_PointSize = clamp(perspSize, 0.4, 4.5);

  // Opacity by variant: bright=high, gold=mid, dim=low
  float bright = step(0.5, aVariant);
  float dim    = step(1.5, aVariant);
  float base   = mix(0.68, mix(0.92, 0.32, dim), bright);
  vOpacity  = p * base;
  vVariant  = aVariant;
}
