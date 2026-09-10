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

/**
 * Estado visual del capítulo en un punto del recorrido.
 *
 * Hay dos cortes y ninguno es un fundido a secas: cada uno tiene su propia
 * materia.
 *
 * - Primer corte (0.31–0.53). `whiteout` sube, se mantiene y baja; su meseta
 *   es lo que oculta el cambio de `sceneMix`, de Driftwood al asentamiento.
 * - Segundo corte (0.60–0.99). El temporal alcanza la lente: `rain` es el agua
 *   que se agarra al cristal y `squall` la racha corta que la barre. El cambio
 *   a la Ormora (`shipMix`) vive dentro de esa racha, y `lensMix` va por
 *   delante —las gotas enseñan el barco antes que el propio plano, porque cada
 *   una es una lente—.
 * - Los tres `dolly` son avances de cámara lentos y continuos, uno por plano.
 * - `exitShadow` prepara la entrada al capítulo 03.
 */
export function sampleWorld(progress: number) {
  const p = clamp01(progress);

  return {
    progress: p,
    whiteout: envelope(p, [0.31, 0.42], [0.44, 0.53]),
    // El cruce vive dentro de la meseta 0.42–0.44, donde la niebla es opaca.
    sceneMix: smoothRamp(p, 0.4, 0.48),

    // El agua tarda en llegar y tarda en escurrirse: 0.15 de recorrido para
    // mojar el cristal y 0.11 para dejarlo casi limpio. Un sobre más corto
    // convierte el temporal en un parpadeo y se pierde el relieve de las gotas.
    rain: envelope(p, [0.6, 0.75], [0.88, 0.99]),
    // La racha: el golpe de espuma que tapa el corte. A diferencia del primero,
    // este cruce es un fundido liso y no una disolución por umbral, así que
    // tiene que caber entero dentro de la racha —de punta a punta, no solo por
    // el centro—: cualquier tramo que asome fuera es una doble exposición.
    squall: envelope(p, [0.71, 0.79], [0.85, 0.92]),
    shipMix: smoothRamp(p, 0.775, 0.855),
    // Adelanta al plano en ~0.07: cuando el cristal aún enseña el asentamiento,
    // dentro de cada gota ya se ve la silueta del barco.
    lensMix: smoothRamp(p, 0.655, 0.79),

    firstDolly: smoothRamp(p, 0.08, 0.38),
    secondDolly: smoothRamp(p, 0.5, 0.9),
    shipDolly: smoothRamp(p, 0.76, 1),
    exitShadow: smoothRamp(p, 0.9, 1),
  };
}
