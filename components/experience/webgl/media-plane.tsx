'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createTransitionMaterial,
  type TransitionMaterial,
  type TransitionUniforms,
} from './transition-material';

export type MediaPlaneFrame = (
  uniforms: TransitionUniforms,
  delta: number,
) => void;

type MediaPlaneProps = {
  /** Las dos texturas de la transición, en orden narrativo. */
  sources: readonly [string, string];
  /** Punto focal normalizado de cada imagen. */
  focals: readonly [readonly [number, number], readonly [number, number]];
  /** Color de la niebla del capítulo. */
  fogColor: string;
  /** Escribe los uniforms en cada frame. Debe ser estable entre renders. */
  onFrame: MediaPlaneFrame;
};

/**
 * Plano de medios reutilizable: mezcla dos texturas con el material de
 * transición y cubre siempre el viewport completo.
 *
 * El material y las texturas se crean una sola vez y se liberan al desmontar;
 * nada se instancia dentro del bucle de render. El plano es una unidad y se
 * escala con el viewport, así que un cambio de tamaño no recrea geometría.
 */
export function MediaPlane({
  sources,
  focals,
  fogColor,
  onFrame,
}: MediaPlaneProps) {
  const viewport = useThree((state) => state.viewport);
  const meshRef = useRef<THREE.Mesh>(null);
  const [ready, setReady] = useState(false);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onFrameRef.current = onFrame;
  });

  // El material se crea una sola vez para la vida del componente: compilar el
  // shader es caro y el color de niebla es una constante del capítulo.
  const [material] = useState(() => createTransitionMaterial(fogColor));

  useEffect(() => () => material.dispose(), [material]);

  // Carga y liberación explícita de las texturas: no usamos caché global para
  // poder devolver la memoria de GPU cuando el capítulo se desmonta.
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const loaded: THREE.Texture[] = [];

    const load = (url: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });

    void Promise.all(sources.map(load)).then(
      (textures) => {
        if (cancelled) {
          for (const texture of textures) texture.dispose();
          return;
        }

        textures.forEach((texture, index) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          loaded.push(texture);

          const source = texture.image as
            | { width?: number; height?: number }
            | undefined;
          const aspect =
            source?.width && source?.height
              ? source.width / source.height
              : 16 / 9;
          const focal = focals[index] ?? [0.5, 0.5];

          if (index === 0) {
            material.uniforms.uTextureA.value = texture;
            material.uniforms.uAspectA.value = aspect;
            material.uniforms.uFocalA.value.set(focal[0], focal[1]);
          } else {
            material.uniforms.uTextureB.value = texture;
            material.uniforms.uAspectB.value = aspect;
            material.uniforms.uFocalB.value.set(focal[0], focal[1]);
          }
        });

        setReady(true);
      },
      () => {
        // Si una textura falla, el capítulo se queda con su fallback DOM.
        if (!cancelled) setReady(false);
      },
    );

    return () => {
      cancelled = true;
      material.uniforms.uTextureA.value = null;
      material.uniforms.uTextureB.value = null;
      for (const texture of loaded) texture.dispose();
    };
  }, [sources, focals, material]);

  // Los uniforms se leen desde la malla montada: el bucle de render escribe
  // sobre la instancia viva, nunca sobre valores que React considere inmutables.
  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { uniforms } = mesh.material as TransitionMaterial;
    uniforms.uTime.value += delta;
    uniforms.uPlaneAspect.value = viewport.width / viewport.height;
    onFrameRef.current(uniforms, delta);
  });

  if (!ready) return null;

  return (
    <mesh
      ref={meshRef}
      scale={[viewport.width, viewport.height, 1]}
      material={material}
    >
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}
