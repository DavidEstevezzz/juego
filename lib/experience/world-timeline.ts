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
 * Sobre con meseta: sube, se mantiene y baja, sin esquinas.
 *
 * Las dos rampas tienen derivada nula en sus extremos, así que el mínimo de
 * ambas no introduce ningún quiebro donde empieza o acaba la meseta. Es la
 * forma que ya tenía el whiteout del primer corte; aquí se nombra porque el
 * segundo la usa dos veces.
 */
function envelope(
  value: number,
  rise: readonly [number, number],
  fall: readonly [number, number],
) {
  return Math.min(
    smoothRamp(value, rise[0], rise[1]),
    1 - smoothRamp(value, fall[0], fall[1]),
  );
}

/** Gods → water → Ormora → fog → Driftwood. Shared by WebGL and CSS. */
export function sampleWorld(progress: number) {
  const p = clamp01(progress);
  return {
    progress: p,
    whiteout: envelope(p, [0.7, 0.78], [0.82, 0.89]),
    sceneMix: smoothRamp(p, 0.76, 0.84),
    rain: envelope(p, [0.3, 0.39], [0.49, 0.59]),
    squall: envelope(p, [0.35, 0.4], [0.48, 0.54]),
    shipMix: smoothRamp(p, 0.4, 0.48),
    lensMix: smoothRamp(p, 0.33, 0.42),
    firstDolly: smoothRamp(p, 0.08, 0.38),
    secondDolly: smoothRamp(p, 0.76, 1),
    shipDolly: smoothRamp(p, 0.39, 0.72),
    exitShadow: smoothRamp(p, 0.94, 1),
  };
}
