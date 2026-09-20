'use client';

import { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { media } from '@/content/media';
import { getChapterProgress } from '@/lib/experience/chapter-progress';
import { useExperienceStore } from '@/lib/experience/store';
import { sampleWorld } from '@/lib/experience/world-timeline';
import { MediaPlane } from './media-plane';
import {
  STORM_PHASE_PERIOD,
  type TransitionUniforms,
} from './transition-material';

/** Texturas del capítulo, en orden narrativo. Referencia estable. */
const SOURCES = [
  media.images.gods.webp.large,
  media.images.ormora.webp.large,
  media.images.world.webp.large,
] as const;

const SOURCES_SMALL = [
  media.images.gods.webp.small,
  media.images.ormora.webp.small,
  media.images.world.webp.small,
] as const;

const FOCALS = [
  media.images.gods.focal,
  media.images.ormora.focal,
  media.images.world.focal,
] as const;

const FOG_COLOR = '#0b1715';

/**
 * Vueltas de las rejillas de celdas antes de volver al origen.
 *
 * La fase se envuelve en un múltiplo exacto del periodo del campo, así que
 * gotas y copos no dan ningún salto al hacerlo. Envolverla evita que un
 * `float` de 32 bits pierda resolución durante una sesión larga, que es justo
 * donde el temblor aparecería: en el ciclo de cada gota, no en la niebla.
 */
const STORM_PHASE_WRAP = STORM_PHASE_PERIOD * 256;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function ramp(value: number, from: number, to: number) {
  return clamp((value - from) / (to - from), 0, 1);
}

/**
 * Capítulo 02 en WebGL: un único plano, tres texturas y dos cortes con materia
 * propia —el whiteout de la ventisca y el agua contra el cristal—. El material
 * reemplaza por completo al antiguo campo de quads de nieve; toda la atmósfera
 * se resuelve en una sola llamada de dibujo.
 */
export function WorldScene() {
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const invalidate = useThree((state) => state.invalidate);
  const viewportAspect = useThree(
    (state) => state.size.width / Math.max(state.size.height, 1),
  );

  const sources = graphicsTier === 'a' ? SOURCES : SOURCES_SMALL;

  // El recorrido del temporal es lo único del capítulo que avanza con el reloj
  // y no con el scroll: la nieve y la lluvia no se detienen porque el visitante
  // deje de mover la rueda. Se integra fotograma a fotograma —nunca se calcula
  // como tiempo por velocidad, que daría un salto cada vez que la velocidad
  // cambia— y vive en una ref para que ningún render de React lo reinicie.
  const drift = useRef(0);

  const handleReadyChange = useCallback((ready: boolean) => {
    useExperienceStore.getState().setWorldSceneReady(ready);
  }, []);

  const visibility = useCallback(() => {
    const { coverage } = getChapterProgress('world');
    return Math.min(ramp(coverage, 0, 0.16), 1 - ramp(coverage, 0.84, 1));
  }, []);

  const isVisible = useCallback(() => visibility() > 0.002, [visibility]);

  const handlePlaneFrame = useCallback(
    (uniforms: TransitionUniforms, delta: number) => {
      const { progress } = getChapterProgress('world');
      const opacity = visibility();
      const { velocity } = useExperienceStore.getState();

      // Mismo muestreo que el DOM: el shader no puede tener su propia versión
      // del montaje o la niebla se retiraría antes en una capa que en la otra.
      const {
        sceneMix,
        shipMix,
        lensMix,
        whiteout,
        rain,
        squall,
        firstDolly,
        secondDolly,
        shipDolly,
        exitShadow,
      } = sampleWorld(progress);
      const portrait = viewportAspect < 0.85;
      const speed = Math.abs(velocity);

      // El temporal corre más deprisa cuanto más deprisa se baja: es la misma
      // lectura que da la carretera desde un coche, donde la velocidad se mide
      // en el cristal antes que en el paisaje. El delta se acota porque una
      // pestaña que vuelve del segundo plano entrega saltos de varios segundos
      // y el campo se teletransportaría.
      const step = Math.min(delta, 0.05);
      drift.current +=
        step *
        ((graphicsTier === 'a' ? 0.72 : 0.5) +
          speed * 1.1 +
          whiteout * 0.35 +
          squall * 0.45);

      uniforms.uSceneMix.value = sceneMix;
      uniforms.uShipMix.value = shipMix;
      uniforms.uLensMix.value = lensMix;
      uniforms.uWhiteout.value = whiteout;
      uniforms.uRain.value = rain;
      uniforms.uSquall.value = squall;
      // Los campos de ruido leen el recorrido entero y las rejillas de celdas
      // su resto: ver el periodo en el material.
      uniforms.uDrift.value = drift.current;
      uniforms.uStormPhase.value = drift.current % STORM_PHASE_WRAP;
      // La segunda capa de gotas, la de copos, el halo de la ventisca y el
      // desenfoque completo solo en tier A: el gradiente del agua se evalúa
      // tres veces por fragmento y es el único punto del capítulo donde el
      // coste depende del detalle y no del tamaño de la ventana.
      uniforms.uDetail.value = graphicsTier === 'a' ? 1 : 0;

      uniforms.uZoomA.value = 1.015 + firstDolly * 0.06;
      uniforms.uZoomB.value = 1.075 - shipDolly * 0.05;
      // El barco entra cerrado, bajo el agua, y el encuadre se abre a medida
      // que el cristal se limpia: el plano se revela con la lente, no después.
      uniforms.uZoomC.value = 1.02 + secondDolly * 0.055;
      uniforms.uPanA.value.set(
        (portrait ? -0.038 : -0.018) + firstDolly * (portrait ? 0.045 : 0.03),
        portrait ? 0.012 : 0,
      );
      uniforms.uPanB.value.set(
        (portrait ? 0.018 : 0.01) - shipDolly * (portrait ? 0.025 : 0.018),
        portrait ? 0.012 : 0,
      );
      uniforms.uPanC.value.set(
        (portrait ? 0.03 : 0.016) - secondDolly * (portrait ? 0.03 : 0.02),
        portrait ? 0.016 : 0.004,
      );

      uniforms.uFog.value = 0.08 + sceneMix * 0.08 + rain * 0.04;
      uniforms.uLight.value =
        1 - sceneMix * 0.06 - squall * 0.05 - exitShadow * 0.13;
      uniforms.uOpacity.value = opacity;
      uniforms.uDisplacement.value = clamp(
        0.006 + whiteout * 0.017 + speed * 0.014,
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
