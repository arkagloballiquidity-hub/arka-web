uniform float uProgress;
uniform float uTime;

attribute float aLineProgress; // which part of the line this vertex is [0–1]

varying float vAlpha;

void main() {
  // Lines draw themselves as progress increases
  float reveal = clamp((uProgress - aLineProgress * 0.6) / 0.4, 0.0, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vAlpha = reveal * 0.35;
}
