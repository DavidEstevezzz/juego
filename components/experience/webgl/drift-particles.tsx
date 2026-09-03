'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Campo de nieve y agua en deriva.
 *
 * Una sola llamada de dibujo con `InstancedBufferGeometry`: cada partícula es
 * una instancia con su semilla y toda la animación ocurre en el vertex shader a
 * partir de `uTime`. No hay bucles en JavaScript ni asignaciones por frame, y el
 * presupuesto de instancias queda fijado en el montaje.
 */

const VERTEX = /* glsl */ `
attribute vec4 aSeed; // x, y iniciales · z velocidad · w tamaño

uniform float uTime;
uniform float uOpacity;
uniform vec2 uArea;
uniform float uDrift;

varying float vAlpha;

void main() {
  float fall = fract(aSeed.y - uTime * aSeed.z * 0.06);
  float sway = sin(uTime * 0.5 + aSeed.x * 12.0) * 0.035 * uDrift;

  vec3 offset = vec3(
    (aSeed.x - 0.5) * uArea.x + sway,
    (fall - 0.5) * uArea.y,
    0.0
  );

  // Se desvanece al entrar y al salir del área para que nada aparezca de golpe.
  vAlpha = uOpacity
    * (0.35 + 0.65 * clamp(aSeed.w * 40.0, 0.0, 1.0))
    * smoothstep(0.0, 0.12, fall)
    * smoothstep(1.0, 0.88, fall);

  gl_Position = projectionMatrix * modelViewMatrix
    * vec4(position * aSeed.w + offset, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  gl_FragColor = vec4(uColor, clamp(vAlpha, 0.0, 1.0));

  #include <colorspace_fragment>
}
`;

export type DriftUniforms = {
  uOpacity: { value: number };
  uDrift: { value: number };
};

type DriftParticlesProps = {
  /** Presupuesto fijo de instancias. */
  count: number;
  /** Color de la partícula. */
  color: string;
  /** Escribe opacidad y deriva en cada frame. */
  onFrame: (uniforms: DriftUniforms) => void;
};

/** Quad unitario centrado, sin depender de otra geometría que haya que liberar. */
function createQuad(count: number) {
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.instanceCount = count;

  const positions = new Float32Array([
    -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0,
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);

  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i += 1) {
    seeds[i * 4] = Math.random();
    seeds[i * 4 + 1] = Math.random();
    seeds[i * 4 + 2] = 0.5 + Math.random() * 1.6;
    seeds[i * 4 + 3] = 0.006 + Math.random() * 0.016;
  }
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));

  return geometry;
}

export function DriftParticles({ count, color, onFrame }: DriftParticlesProps) {
  const viewport = useThree((state) => state.viewport);
  const meshRef = useRef<THREE.Mesh>(null);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onFrameRef.current = onFrame;
  });

  // Presupuesto y material fijos durante toda la vida del componente: un cambio
  // de tier remonta la escena en lugar de reconstruir buffers en caliente.
  const [geometry] = useState(() => createQuad(count));

  const [material] = useState(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uDrift: { value: 1 },
          uArea: { value: new THREE.Vector2(1, 1) },
          uColor: { value: new THREE.Color(color) },
        },
      }),
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  // Igual que en `MediaPlane`: se escribe sobre la instancia montada.
  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { uniforms } = mesh.material as THREE.ShaderMaterial;
    uniforms.uTime.value += delta;
    (uniforms.uArea.value as THREE.Vector2).set(
      viewport.width * 1.15,
      viewport.height * 1.15,
    );
    onFrameRef.current(uniforms as unknown as DriftUniforms);
  });

  return (
    <mesh
      ref={meshRef}
      frustumCulled={false}
      geometry={geometry}
      material={material}
    />
  );
}
