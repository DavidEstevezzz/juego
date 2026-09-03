import * as THREE from 'three';

/**
 * Material cinematográfico de Driftwood.
 *
 * El cambio de imagen ocurre dentro de una masa de whiteout anisotrópica. No
 * existen sprites ni geometría de nieve: niebla, refracción, filamentos y
 * condensación se resuelven en una sola pasada de fragmento. La escena y el
 * montaje dependen del scroll; el tiempo solo añade una deriva atmosférica muy
 * lenta que nunca altera qué imagen corresponde a cada punto del recorrido.
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
uniform vec2 uPanA;
uniform vec2 uPanB;
uniform float uPlaneAspect;

uniform float uSceneMix;
uniform float uWhiteout;
uniform float uDisplacement;
uniform float uZoomA;
uniform float uZoomB;
uniform float uFog;
uniform float uLight;
uniform float uOpacity;
uniform float uTime;
uniform float uWind;
uniform vec3 uFogColor;
uniform vec3 uWhiteColor;

varying vec2 vUv;

float hash21(vec2 point) {
  point = fract(point * vec2(123.34, 456.21));
  point += dot(point, point + 45.32);
  return fract(point.x * point.y);
}

float noise21(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  local = local * local * (3.0 - 2.0 * local);

  float a = hash21(cell);
  float b = hash21(cell + vec2(1.0, 0.0));
  float c = hash21(cell + vec2(0.0, 1.0));
  float d = hash21(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
}

float fbm(vec2 point) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 turn = mat2(0.84, -0.54, 0.54, 0.84);

  for (int octave = 0; octave < 4; octave++) {
    value += noise21(point) * amplitude;
    point = turn * point * 2.03 + 17.17;
    amplitude *= 0.5;
  }

  return value / 0.9375;
}

// Encuadre cover alrededor de un punto focal, con dolly y deriva independientes.
vec2 coverUv(
  vec2 uv,
  float textureAspect,
  vec2 focal,
  vec2 pan,
  float zoom
) {
  vec2 scale = uPlaneAspect > textureAspect
    ? vec2(1.0, textureAspect / uPlaneAspect)
    : vec2(uPlaneAspect / textureAspect, 1.0);
  return (uv - focal) * scale / zoom + focal + pan;
}

void main() {
  float atmosphereTime = uTime * uWind;

  // El dominio está muy comprimido en X y estirado en Y: aparecen lenguas de
  // niebla arrastradas lateralmente, no una nube isotrópica ni copos repetidos.
  vec2 windDomain = vec2(
    vUv.x * 1.18 - atmosphereTime * 0.045,
    vUv.y * 6.4 + vUv.x * 0.42
  );
  float warp = fbm(windDomain * 0.58 + vec2(8.2, -3.4));
  float bands = fbm(windDomain + vec2(warp * 0.82, atmosphereTime * 0.012));
  float fineWind = fbm(vec2(
    vUv.x * 2.6 - atmosphereTime * 0.085,
    (vUv.y + vUv.x * 0.075) * 21.0
  ));

  // La máscara A → B queda corregida: 0 siempre es Driftwood y 1 el pueblo.
  // El campo se deforma en la dirección del viento y el corte se esconde bajo
  // el punto de máxima densidad del whiteout.
  float transitionField = fbm(vec2(
    vUv.x * 1.15 + warp * 0.18,
    vUv.y * 2.35 - bands * 0.11
  ));
  float threshold = mix(1.15, -0.15, uSceneMix);
  float sceneMask = smoothstep(
    threshold - 0.14,
    threshold + 0.14,
    transitionField
  );

  vec2 refraction = vec2(bands - 0.5, warp - 0.5)
    * uDisplacement
    * (0.42 + uWhiteout * 1.35);

  vec2 uvA = coverUv(
    vUv + refraction * (0.35 + uSceneMix),
    uAspectA,
    uFocalA,
    uPanA,
    uZoomA
  );
  vec2 uvB = coverUv(
    vUv - refraction * (1.35 - uSceneMix),
    uAspectB,
    uFocalB,
    uPanB,
    uZoomB
  );

  vec3 colorA = texture2D(uTextureA, clamp(uvA, 0.002, 0.998)).rgb;
  vec3 colorB = texture2D(uTextureB, clamp(uvB, 0.002, 0.998)).rgb;
  vec3 color = mix(colorA, colorB, sceneMask);

  // Una niebla baja y oscura integra ambas fotografías sin teñirlas de forma
  // plana. Aumenta ligeramente al avanzar hacia el asentamiento.
  float ground = smoothstep(0.92, 0.04, vUv.y);
  float lowFog = uFog
    * (0.18 + ground * 0.48)
    * (0.78 + bands * 0.22);
  color = mix(color, uFogColor, clamp(lowFog, 0.0, 0.52));

  // El whiteout es una masa con vacíos, refracción y filamentos. En su punto
  // máximo oculta casi por completo el cambio de textura, como un corte de cine.
  float gustCore = smoothstep(0.18, 0.94, bands + warp * 0.28);
  float whiteDensity = uWhiteout * (0.68 + gustCore * 0.34);
  whiteDensity += uWhiteout * smoothstep(0.7, 0.97, fineWind) * 0.13;
  color = mix(color, uWhiteColor, clamp(whiteDensity, 0.0, 0.97));

  // Condensación irregular en los bordes de la lente durante el whiteout.
  float edge = smoothstep(0.34, 0.76, length((vUv - 0.5) * vec2(0.82, 1.0)));
  float condensation = edge
    * smoothstep(0.4, 0.92, fbm(vUv * 4.2 + vec2(13.7, -5.1)))
    * uWhiteout;
  color = mix(color, uWhiteColor, condensation * 0.3);

  color *= uLight;

  // Viñeta amplia y grano de luminancia: textura óptica, no ruido protagonista.
  float vignette = smoothstep(0.88, 0.28, length((vUv - 0.5) * vec2(0.9, 1.0)));
  color *= mix(0.68, 1.0, vignette);
  float grain = hash21(gl_FragCoord.xy + floor(uTime * 12.0)) - 0.5;
  color += grain * (0.008 + uWhiteout * 0.009);

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
  uPanA: { value: THREE.Vector2 };
  uPanB: { value: THREE.Vector2 };
  uPlaneAspect: { value: number };
  uSceneMix: { value: number };
  uWhiteout: { value: number };
  uDisplacement: { value: number };
  uZoomA: { value: number };
  uZoomB: { value: number };
  uFog: { value: number };
  uLight: { value: number };
  uOpacity: { value: number };
  uTime: { value: number };
  uWind: { value: number };
  uFogColor: { value: THREE.Color };
  uWhiteColor: { value: THREE.Color };
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
      uFocalA: { value: new THREE.Vector2(0.5, 0.48) },
      uFocalB: { value: new THREE.Vector2(0.5, 0.5) },
      uPanA: { value: new THREE.Vector2(0, 0) },
      uPanB: { value: new THREE.Vector2(0, 0) },
      uPlaneAspect: { value: 16 / 9 },
      uSceneMix: { value: 0 },
      uWhiteout: { value: 0 },
      uDisplacement: { value: 0.008 },
      uZoomA: { value: 1.015 },
      uZoomB: { value: 1.02 },
      uFog: { value: 0.08 },
      uLight: { value: 1 },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uWind: { value: 0.7 },
      uFogColor: { value: new THREE.Color(fogColor) },
      uWhiteColor: { value: new THREE.Color('#d7e0dd') },
    },
  }) as TransitionMaterial;
}
