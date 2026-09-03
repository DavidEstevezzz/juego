import * as THREE from 'three';

/**
 * Material de transición entre dos texturas.
 *
 * Se compila una sola vez por instancia y todo el movimiento viaja por
 * uniforms: ni el material ni las texturas se recrean en ningún render.
 *
 * La máscara de la transición y el desplazamiento usan un campo de ruido de
 * baja frecuencia SIN tiempo, así que el estado depende solo de `uMix`: volver
 * a un punto del scroll devuelve exactamente la misma imagen. El tiempo solo
 * alimenta la deriva de la niebla, que no interviene en la mezcla.
 */

const VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D uTextureA;
uniform sampler2D uTextureB;
uniform float uAspectA;
uniform float uAspectB;
uniform vec2 uFocalA;
uniform vec2 uFocalB;
uniform float uPlaneAspect;

uniform float uMix;
uniform float uDisplacement;
uniform float uZoom;
uniform float uFog;
uniform float uLight;
uniform float uOpacity;
uniform float uTime;
uniform vec3 uFogColor;

varying vec2 vUv;

// Simplex 2D — Ashima Arts / Ian McEwan, dominio público.
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                          dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Encuadre «cover» alrededor del punto focal: la zona de interés nunca se sale
// del plano, sea cual sea la relación de aspecto del viewport.
vec2 coverUv(vec2 uv, float texAspect, vec2 focal, float zoom) {
  vec2 scale = uPlaneAspect > texAspect
    ? vec2(1.0, texAspect / uPlaneAspect)
    : vec2(uPlaneAspect / texAspect, 1.0);
  return (uv - focal) * scale / zoom + focal;
}

void main() {
  // Campo determinista: sin tiempo, solo posición.
  float low = snoise(vUv * 1.6);
  float lower = snoise(vUv * 0.7 + 4.31);
  float field = low * 0.62 + lower * 0.38;
  float normalized = clamp(field * 0.5 + 0.5, 0.0, 1.0);

  vec2 displace = vec2(field, lower) * uDisplacement;

  // Erosión de bordes: el umbral avanza con la mezcla y el ruido decide qué
  // regiones cambian antes, sin llegar nunca a un fundido plano.
  float threshold = uMix * 1.36 - 0.18;
  float mask = smoothstep(threshold - 0.17, threshold + 0.17, normalized);

  vec2 uvA = coverUv(vUv + displace * uMix, uAspectA, uFocalA, uZoom);
  vec2 uvB = coverUv(vUv - displace * (1.0 - uMix), uAspectB, uFocalB, uZoom);

  vec3 colorA = texture2D(uTextureA, clamp(uvA, 0.001, 0.999)).rgb;
  vec3 colorB = texture2D(uTextureB, clamp(uvB, 0.001, 0.999)).rgb;
  vec3 color = mix(colorA, colorB, mask);

  // Niebla: densa abajo y con una deriva lenta que no afecta a la mezcla.
  float drift = snoise(vUv * 2.4 + vec2(uTime * 0.015, uTime * 0.008)) * 0.5 + 0.5;
  float depth = smoothstep(0.85, 0.0, vUv.y);
  color = mix(color, uFogColor, clamp(uFog * (0.28 + 0.72 * depth) * (0.75 + 0.25 * drift), 0.0, 1.0));

  // Luz y viñeta: la masa oscura sigue dominando el encuadre.
  color *= uLight;
  float vignette = smoothstep(1.05, 0.32, length(vUv - 0.5));
  color *= mix(0.62, 1.0, vignette);

  gl_FragColor = vec4(color, uOpacity);

  #include <colorspace_fragment>
}
`;

export type TransitionUniforms = {
  uTextureA: { value: THREE.Texture | null };
  uTextureB: { value: THREE.Texture | null };
  uAspectA: { value: number };
  uAspectB: { value: number };
  uFocalA: { value: THREE.Vector2 };
  uFocalB: { value: THREE.Vector2 };
  uPlaneAspect: { value: number };
  uMix: { value: number };
  uDisplacement: { value: number };
  uZoom: { value: number };
  uFog: { value: number };
  uLight: { value: number };
  uOpacity: { value: number };
  uTime: { value: number };
  uFogColor: { value: THREE.Color };
};

export type TransitionMaterial = THREE.ShaderMaterial & {
  uniforms: TransitionUniforms;
};

export function createTransitionMaterial(fogColor: string): TransitionMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTextureA: { value: null },
      uTextureB: { value: null },
      uAspectA: { value: 16 / 9 },
      uAspectB: { value: 16 / 9 },
      uFocalA: { value: new THREE.Vector2(0.5, 0.45) },
      uFocalB: { value: new THREE.Vector2(0.5, 0.45) },
      uPlaneAspect: { value: 16 / 9 },
      uMix: { value: 0 },
      uDisplacement: { value: 0 },
      uZoom: { value: 1 },
      uFog: { value: 0 },
      uLight: { value: 1 },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uFogColor: { value: new THREE.Color(fogColor) },
    },
  }) as TransitionMaterial;
}
