/**
 * Hero particle field — vertex pass
 * Uniforms drive cluster→spread (scroll) and pointer repulsion.
 */
export const particleVertexShader = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uPixelRatio;

attribute float aRandom;
attribute vec3 aTarget;

varying float vAlpha;
varying float vRandom;

void main() {
  // uScroll: 0 = particles at origin, 1 = at spread targets (dissolve outward)
  vec3 pos = mix(vec3(0.0), aTarget, uScroll);

  // Subtle idle drift — sine wave keyed by random attribute
  pos.x += sin(uTime * 0.35 + aRandom * 6.28) * 0.04 * (1.0 - uScroll * 0.5);
  pos.y += cos(uTime * 0.28 + aRandom * 12.56) * 0.04 * (1.0 - uScroll * 0.5);

  // uMouse repulsion — push particles away from cursor (screen-space approx)
  vec2 mouseWorld = uMouse * vec2(3.2, 1.8);
  vec2 delta = pos.xy - mouseWorld;
  float dist = length(delta);
  float repel = smoothstep(1.4, 0.0, dist) * 0.55;
  pos.xy += normalize(delta + 0.0001) * repel;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size attenuates with depth; uPixelRatio keeps retina crisp
  gl_PointSize = (1.5 + aRandom * 2.8) * uPixelRatio * (280.0 / -mvPosition.z);

  vRandom = aRandom;
  vAlpha = mix(0.85, 0.25, uScroll) * (0.35 + aRandom * 0.65);
}
`;

/**
 * Hero particle field — fragment pass
 * Soft circular point sprite with purple brand glow.
 */
export const particleFragmentShader = /* glsl */ `
varying float vAlpha;
varying float vRandom;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);

  if (dist > 0.5) {
    discard;
  }

  float core = smoothstep(0.5, 0.0, dist);
  float halo = smoothstep(0.5, 0.15, dist);

  // Brand purple #7c3aed with brighter core #9d5fff
  vec3 color = mix(vec3(0.486, 0.227, 0.929), vec3(0.616, 0.373, 1.0), halo);
  float alpha = core * vAlpha;

  gl_FragColor = vec4(color, alpha);
}
`;

/**
 * Hero displacement plane — vertex pass
 * Simplex-style noise displaces Z for liquid distortion behind headline.
 */
export const displacementVertexShader = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uNoiseScale;

varying vec2 vUv;
varying float vDisplacement;

// Compact 3D noise (Ashima / McEwan)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  vUv = uv;

  vec3 noisePos = vec3(
    position.x * uNoiseScale + uMouse.x * 0.4,
    position.y * uNoiseScale + uMouse.y * 0.4,
    uTime * 0.12
  );

  float noise = snoise(noisePos);
  vDisplacement = noise;

  // Displacement fades as user scrolls past hero
  float disp = noise * 0.18 * (1.0 - uScroll);
  vec3 transformed = vec3(position.x, position.y, position.z + disp);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

/**
 * Hero displacement plane — fragment pass
 * Purple wire-grid with noise-driven alpha falloff.
 */
export const displacementFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScroll;
varying vec2 vUv;
varying float vDisplacement;

void main() {
  float grid = smoothstep(0.98, 1.0, abs(sin(vUv.x * 80.0 + vDisplacement)) * abs(sin(vUv.y * 60.0 - uTime * 0.2)));

  float alpha = grid * 0.08 * (1.0 - uScroll) * (0.5 + vDisplacement * 0.5);
  vec3 color = vec3(0.616, 0.373, 1.0);

  gl_FragColor = vec4(color, alpha);
}
`;
