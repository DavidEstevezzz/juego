import * as THREE from 'three';

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform sampler2D uGrowth;
uniform sampler2D uRoom;
uniform sampler2D uVessel;
uniform vec3 uAspects;
uniform vec2 uFocalA;
uniform vec2 uFocalB;
uniform vec2 uFocalC;
uniform vec4 uBounds;
uniform vec2 uResolution;
uniform vec3 uPointer;
uniform float uRoomMix;
uniform float uVesselMix;
uniform float uTension;
uniform float uRed;
uniform float uDetail;
uniform vec3 uBlood;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float value = 0.0, amplitude = 0.5, weight = 0.0;
  for (int i = 0; i < 4; i++) {
    if (float(i) >= uDetail) break;
    value += noise(p) * amplitude;
    weight += amplitude;
    p = mat2(0.8, -0.6, 0.6, 0.8) * p * 2.03 + 8.37;
    amplitude *= 0.5;
  }
  return value / weight;
}
vec2 cover(vec2 uv, float aspect, vec2 focal) {
  float stageAspect = uBounds.z / uBounds.w;
  vec2 scale = stageAspect > aspect
    ? vec2(1.0, aspect / stageAspect) : vec2(stageAspect / aspect, 1.0);
  vec2 fitted = uv * scale + focal * (1.0 - scale);
  return clamp(0.5 + (fitted - 0.5) / 1.01, 0.002, 0.998);
}
float reveal(float field, float progress) {
  // The extended threshold makes both endpoints exact, independent of noise.
  return smoothstep(field - 0.045, field + 0.045, progress * 1.3 - 0.15);
}
void main() {
  vec2 screen = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 local = (screen - uBounds.xy) / uBounds.zw;
  if (local.x < 0.0 || local.x > 1.0 || local.y < 0.0 || local.y > 1.0) discard;
  vec2 uv = vec2(local.x, 1.0 - local.y);
  float aspect = uBounds.z / uBounds.w;
  vec2 domain = uv * vec2(aspect, 1.0);
  float organic = fbm(domain * 3.8);
  float fine = noise(domain * 24.0 + organic * 2.4);

  // Invasion starts in the tissue on the right and travels down/left.
  float fieldAB = clamp((1.0 - uv.x) * 0.59 + (1.0 - uv.y) * 0.17 + organic * 0.22, 0.0, 1.0);
  float mixAB = reveal(fieldAB, uRoomMix);

  vec2 vesselUv = cover(uv, uAspects.z, uFocalC);
  // Separate origins find eyes, mouth and shoulders in the original image.
  float eyes = min(length((vesselUv - vec2(0.42, 0.77)) * vec2(1.1, 1.0)),
                   length((vesselUv - vec2(0.50, 0.75)) * vec2(1.1, 1.0)));
  float mouth = length((vesselUv - vec2(0.46, 0.60)) * vec2(1.0, 0.9)) + 0.14;
  float shoulders = length((vesselUv - vec2(0.60, 0.45)) * vec2(0.9, 1.0)) + 0.30;
  float fieldBC = clamp(min(min(eyes * 1.4, mouth), shoulders) + organic * 0.17, 0.0, 1.0);
  float mixBC = reveal(fieldBC, uVesselMix);

  vec2 pointer = vec2(uPointer.x, 1.0 - uPointer.y);
  vec2 away = (uv - pointer) * vec2(aspect, 1.0);
  float proximity = (1.0 - smoothstep(0.02, 0.32, length(away))) * uPointer.z;
  vec2 flow = vec2(organic - 0.5, fbm(domain * 4.2 + 11.5) - 0.5) * 2.0;
  flow += away / max(length(away), 0.001) * proximity * 0.42;
  flow /= max(length(flow), 1.0);
  // Vector length is capped at 12 CSS pixels; no time-based drift or shaking.
  vec2 distortion = flow * (12.0 * uTension) / uBounds.zw;
  float faceProtection = 1.0 - smoothstep(0.09, 0.24, eyes);

  vec3 growth = texture2D(uGrowth, cover(uv + distortion, uAspects.x, uFocalA)).rgb;
  vec3 room = texture2D(uRoom, cover(uv - distortion * 0.7, uAspects.y, uFocalB)).rgb;
  vec3 vessel = texture2D(uVessel, cover(uv + distortion * (1.0 - faceProtection) * 0.6, uAspects.z, uFocalC)).rgb;
  vec3 interior = mix(growth, room, mixAB);
  interior *= mix(vec3(0.83, 0.94, 0.98), vec3(1.0), uRed);
  vec3 color = mix(interior, vessel, mixBC);

  // Fine non-representational filaments cling to the transition, not the face.
  float front = max(4.0 * mixAB * (1.0 - mixAB), 4.0 * mixBC * (1.0 - mixBC));
  float filament = 1.0 - smoothstep(0.005, 0.02, abs(fine - 0.5 - proximity * 0.08));
  color = mix(color, uBlood, filament * front * (0.11 + proximity * 0.1) * (uDetail / 4.0));
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

export function createInfectionMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uGrowth: { value: null as THREE.Texture | null },
      uRoom: { value: null as THREE.Texture | null },
      uVessel: { value: null as THREE.Texture | null },
      uAspects: {
        value: new THREE.Vector3(1920 / 1049, 1920 / 1049, 1920 / 935),
      },
      uFocalA: { value: new THREE.Vector2(0.66, 0.48) },
      uFocalB: { value: new THREE.Vector2(0.58, 0.5) },
      uFocalC: { value: new THREE.Vector2(0.47, 0.7) },
      uBounds: { value: new THREE.Vector4(0, 0, 1, 1) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector3(0.5, 0.5, 0) },
      uRoomMix: { value: 0 },
      uVesselMix: { value: 0 },
      uTension: { value: 0 },
      uRed: { value: 0 },
      uDetail: { value: 4 },
      uBlood: { value: new THREE.Color('#7a1515') },
    },
  });
}
