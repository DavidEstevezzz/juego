/**
 * Montaje del capítulo 02, compartido por el DOM y por el shader.
 *
 * Antes cada lado repetía los mismos números —el cruce de planos, la tormenta,
 * los avances de cámara— en su propio archivo. Bastaba tocar uno para que el
 * fallback CSS y la escena WebGL contaran cosas distintas en el mismo punto del
 * scroll. Aquí viven una sola vez, junto a las posiciones de la timeline que
 * los rodean, para que el ritmo se lea completo de un vistazo.
 *
 * Igual que en `infection-timeline.ts`, el muestreo es una función pura del
 * progreso: la misma posición de scroll siempre devuelve el mismo fotograma, y
 * el recorrido inverso es exacto.
 */

/**
 * Posiciones de la timeline, en unidades de tiempo de GSAP sobre un total de
 * `WORLD_TIMELINE_LENGTH`.
 *
 * Los cuatro tiempos no se solapan: cada observación termina de salir antes de
 * que entre la siguiente. Cuando se cruzaban, las tres ocupaban la misma caja
 * y durante unos cientos de píxeles se leían dos textos superpuestos.
 */
export const WORLD_TIMELINE_LENGTH = 100;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothRamp(value: number, from: number, to: number) {
  const progress = clamp01((value - from) / (to - from));
  return progress * progress * (3 - 2 * progress);
}

/**
 * Estado visual del capítulo en un punto del recorrido.
 *
 * - `sceneMix` cruza de la primera imagen a la segunda, siempre dentro de la
 *   meseta de la tormenta: el cambio de plano nunca se ve a plena luz.
 * - `whiteout` sube, se mantiene y baja; su meseta es lo que oculta el corte.
 * - Los dos `dolly` son avances de cámara lentos y continuos, uno por plano.
 * - `exitShadow` prepara la entrada al capítulo 03.
 */
export function sampleWorld(progress: number) {
  const p = clamp01(progress);
  const whiteout = Math.min(
    smoothRamp(p, 0.31, 0.42),
    1 - smoothRamp(p, 0.44, 0.53),
  );

  return {
    progress: p,
    whiteout,
    // El cruce vive dentro de la meseta 0.42–0.44, donde la niebla es opaca.
    sceneMix: smoothRamp(p, 0.4, 0.48),
    firstDolly: smoothRamp(p, 0.08, 0.38),
    secondDolly: smoothRamp(p, 0.5, 0.9),
    exitShadow: smoothRamp(p, 0.9, 1),
  };
}
