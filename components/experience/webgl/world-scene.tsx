'use client';

import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { media } from '@/content/media';
import { getChapterProgress } from '@/lib/experience/chapter-progress';
import { useExperienceStore } from '@/lib/experience/store';
import { DriftParticles, type DriftUniforms } from './drift-particles';
import { MediaPlane } from './media-plane';
import type { TransitionUniforms } from './transition-material';

/** Texturas del capítulo, en orden narrativo. Referencia estable. */
const SOURCES = [
  media.images.world.webp.large,
  media.images.village.webp.large,
] as const;

const SOURCES_SMALL = [
  media.images.world.webp.small,
  media.images.village.webp.small,
] as const;

const FOCALS = [media.images.world.focal, media.images.village.focal] as const;

const FOG_COLOR = '#0e1a17';
const PARTICLE_COLOR = '#c6d2ce';

/** Presupuesto fijo de partículas. Tier B recorta un 73 % sobre tier A. */
const PARTICLE_BUDGET = { a: 900, b: 240, c: 0 } as const;

/** Límites del lenguaje de movimiento del blueprint. */
const MAX_ZOOM = 1.08;
const BASE_DISPLACEMENT = 0.018;
const MAX_DISPLACEMENT = 0.055;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Rampa suave 0..1 entre dos límites. */
function ramp(value: number, from: number, to: number) {
  return clamp((value - from) / (to - from), 0, 1);
}

/**
 * Capítulo 02 en WebGL: una sola toma que evoluciona de Driftwood al pueblo
 * helado.
 *
 * `uMix`, cámara, niebla y luz salen exclusivamente del progreso de scroll, así
 * que el recorrido es reversible sin saltos. La velocidad solo modula la
 * amplitud del desplazamiento dentro de un límite, nunca el estado final.
 */
export function WorldScene() {
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const invalidate = useThree((state) => state.invalidate);

  const sources = graphicsTier === 'a' ? SOURCES : SOURCES_SMALL;
  const particleCount = PARTICLE_BUDGET[graphicsTier];

  const visibility = useCallback(() => {
    const { coverage } = getChapterProgress('world');
    // Entra y sale con el capítulo; fuera de su tramo no pinta nada.
    return Math.min(ramp(coverage, 0, 0.16), 1 - ramp(coverage, 0.84, 1));
  }, []);

  const handlePlaneFrame = useCallback(
    (uniforms: TransitionUniforms) => {
      const { progress } = getChapterProgress('world');
      const opacity = visibility();
      const { velocity } = useExperienceStore.getState();

      uniforms.uMix.value = progress;
      uniforms.uZoom.value = 1 + (MAX_ZOOM - 1) * progress;
      uniforms.uFog.value = 0.14 + 0.3 * progress;
      uniforms.uLight.value = 1 - 0.16 * progress;
      uniforms.uOpacity.value = opacity;
      uniforms.uDisplacement.value = clamp(
        BASE_DISPLACEMENT + Math.abs(velocity) * 0.04,
        BASE_DISPLACEMENT,
        MAX_DISPLACEMENT,
      );

      // Mientras el capítulo está en pantalla mantenemos el bucle vivo; en
      // cuanto sale, `frameloop="demand"` vuelve a dejar la GPU en reposo.
      if (opacity > 0.002) invalidate();
    },
    [invalidate, visibility],
  );

  const handleParticleFrame = useCallback(
    (uniforms: DriftUniforms) => {
      const { progress } = getChapterProgress('world');
      const { velocity } = useExperienceStore.getState();
      uniforms.uOpacity.value = visibility() * (0.25 + 0.55 * progress);
      uniforms.uDrift.value = 1 + clamp(Math.abs(velocity) * 2, 0, 1.4);
    },
    [visibility],
  );

  return (
    <>
      <MediaPlane
        sources={sources}
        focals={FOCALS}
        fogColor={FOG_COLOR}
        onFrame={handlePlaneFrame}
      />
      {particleCount > 0 && (
        <group position={[0, 0, 0.5]}>
          <DriftParticles
            count={particleCount}
            color={PARTICLE_COLOR}
            onFrame={handleParticleFrame}
          />
        </group>
      )}
    </>
  );
}
