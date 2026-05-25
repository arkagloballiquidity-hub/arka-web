uniform vec3 uGold;
uniform vec3 uBright;
uniform vec3 uDim;

varying float vOpacity;
varying float vVariant;

void main() {
  vec2  uv   = gl_PointCoord - 0.5;
  float dist = length(uv);
  if (dist > 0.5) discard;

  // Soft disc with inner glow halo
  float edge  = 1.0 - smoothstep(0.22, 0.5, dist);
  float glow  = (1.0 - smoothstep(0.0, 0.22, dist)) * 0.5;
  float alpha = min(edge + glow, 1.0) * vOpacity;

  // Select colour by variant
  float bright = step(0.5, vVariant);
  float dim    = step(1.5, vVariant);
  vec3  col    = mix(uGold, mix(uBright, uDim, dim), bright);

  gl_FragColor = vec4(col, alpha);
}
