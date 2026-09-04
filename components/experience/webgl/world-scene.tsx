'use client';

import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { media } from '@/content/media';
import { getChapterProgress } from '@/lib/experience/chapter-progress';
import { useExperienceStore } from '@/lib/experience/store';
import { sampleWorld } from '@/lib/experience/world-timeline';
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

const FOG_COLOR = '#0b1715';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function ramp(value: number, from: number, to: number) {
  return clamp((value - from) / (to - from), 0, 1);
}

/**
 * Capítulo 02 en WebGL: un único plano, dos texturas y una transición por
 * whiteout. El material reemplaza por completo al antiguo campo de quads de
 * nieve; toda la atmósfera se resuelve en una sola llamada de dibujo.
 */
export function WorldScene() {
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const invalidate = useThree((state) => state.invalidate);
  const viewportAspect = useThree(
    (state) => state.size.width / Math.max(state.size.height, 1),
  );

  const sources = graphicsTier === 'a' ? SOURCES : SOURCES_SMALL;

  const handleReadyChange = useCallback((ready: boolean) => {
    useExperienceStore.getState().setWorldSceneReady(ready);
  }, []);

  const visibility = useCallback(() => {
    const { coverage } = getChapterProgress('world');
    return Math.min(ramp(coverage, 0, 0.16), 1 - ramp(coverage, 0.84, 1));
  }, []);

  const isVisible = useCallback(() => visibility() > 0.002, [visibility]);

  const handlePlaneFrame = useCallback(
    (uniforms: TransitionUniforms) => {
      const { progress } = getChapterProgress('world');
      const opacity = visibility();
      const { velocity } = useExperienceStore.getState();

      // Mismo muestreo que el DOM: el shader no puede tener su propia versión
      // del montaje o la niebla se retiraría antes en una capa que en la otra.
      const { sceneMix, whiteout, firstDolly, secondDolly, exitShadow } =
        sampleWorld(progress);
      const portrait = viewportAspect < 0.85;

      uniforms.uSceneMix.value = sceneMix;
      uniforms.uWhiteout.value = whiteout;
      uniforms.uZoomA.value = 1.015 + firstDolly * 0.06;
      uniforms.uZoomB.value = 1.02 + secondDolly * 0.055;
      uniforms.uPanA.value.set(
        (portrait ? -0.038 : -0.018) + firstDolly * (portrait ? 0.045 : 0.03),
        portrait ? 0.012 : 0,
      );
      uniforms.uPanB.value.set(
        (portrait ? 0.018 : 0.01) - secondDolly * (portrait ? 0.025 : 0.018),
        portrait ? 0.012 : 0,
      );
      uniforms.uFog.value = 0.08 + sceneMix * 0.08;
      uniforms.uLight.value = 1 - sceneMix * 0.06 - exitShadow * 0.13;
      uniforms.uOpacity.value = opacity;
      uniforms.uWind.value =
        (graphicsTier === 'a' ? 0.72 : 0.4) + Math.abs(velocity) * 0.3;
      uniforms.uDisplacement.value = clamp(
        0.006 + whiteout * 0.017 + Math.abs(velocity) * 0.014,
        0.006,
        0.038,
      );

      // La deriva atmosférica continúa solo mientras el capítulo es visible;
      // fuera de él, frameloop="demand" devuelve la GPU al reposo.
      if (opacity > 0.002) invalidate();
    },
    [graphicsTier, invalidate, viewportAspect, visibility],
  );

  return (
    <MediaPlane
      key={graphicsTier}
      sources={sources}
      focals={FOCALS}
      fogColor={FOG_COLOR}
      onFrame={handlePlaneFrame}
      onReadyChange={handleReadyChange}
      isVisible={isVisible}
    />
  );
}
