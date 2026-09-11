/**
 * Lectura de rendimiento para un canvas con `frameloop="demand"`.
 *
 * El `PerformanceMonitor` de drei mide fotogramas por segundo contra el reloj
 * de pared. Con el bucle bajo demanda eso no es una medida de rendimiento: el
 * canvas solo dibuja cuando el scroll lo invalida, así que cada pausa del
 * visitante aparece como una caída brutal de fps. Y la secuencia de Infection
 * está hecha de pausas —cada plano tiene su sostenido para que se lea el pie de
 * foto—, de modo que quedarse quieto mirando bastaba para degradar el tier de A
 * a C. En C la capa WebGL se desmonta entera y el capítulo cae a su respaldo en
 * CSS: el recorte poligonal y la elipse, sin shader.
 *
 * Aquí solo se miden fotogramas *consecutivos*. Un hueco mayor que
 * `IDLE_GAP_MS` es el bucle esperando trabajo, no un fotograma lento: corta la
 * ventana en curso y no cuenta. El umbral es absoluto en milisegundos, no
 * relativo a la frecuencia del monitor, porque en una pantalla de 144 Hz el
 * límite inferior de drei sube a 60 fps y cualquier equipo honesto a 59 pasaba
 * por dispositivo incapaz.
 */

/** Hueco a partir del cual el bucle estaba parado, no lento. */
export const IDLE_GAP_MS = 120;
/** Fotograma sostenido por encima de este coste: por debajo de ~29 fps. */
export const SLOW_FRAME_MS = 34;
/** Fotogramas seguidos que forman una ventana (~0,8 s dibujando sin parar). */
export const WINDOW_FRAMES = 48;
/** Ventanas malas seguidas antes de avisar. Un tirón aislado no cuenta. */
export const SLOW_WINDOWS_BEFORE_DECLINE = 2;
/** Ventanas iniciales que se descartan: compilar shaders y subir texturas. */
export const WARMUP_WINDOWS = 1;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export type FrameHealth = {
  /**
   * Registra el instante de un fotograma dibujado y devuelve `true` cuando hay
   * evidencia sostenida de que el equipo no llega. Solo devuelve `true` una vez
   * por episodio: el contador se reinicia al avisar.
   */
  sample: (now: number) => boolean;
  /** Vuelve al estado inicial, calentamiento incluido. */
  reset: () => void;
};

/** Monitor de fotogramas consecutivos. Sin estado global ni React. */
export function createFrameHealth(): FrameHealth {
  let previous = 0;
  let deltas: number[] = [];
  let slowWindows = 0;
  let windowsSeen = 0;

  return {
    sample(now: number) {
      const gap = previous === 0 ? Number.POSITIVE_INFINITY : now - previous;
      previous = now;
      if (gap > IDLE_GAP_MS) {
        // La ventana se descarta: sus fotogramas no fueron consecutivos.
        deltas = [];
        return false;
      }
      deltas.push(gap);
      if (deltas.length < WINDOW_FRAMES) return false;

      // La mediana ignora los picos sueltos —recolección de basura, una textura
      // que entra— y solo se mueve si el coste es realmente el habitual.
      const cost = median(deltas);
      deltas = [];
      windowsSeen += 1;
      if (windowsSeen <= WARMUP_WINDOWS) return false;

      slowWindows = cost > SLOW_FRAME_MS ? slowWindows + 1 : 0;
      if (slowWindows < SLOW_WINDOWS_BEFORE_DECLINE) return false;
      slowWindows = 0;
      return true;
    },
    reset() {
      previous = 0;
      deltas = [];
      slowWindows = 0;
      windowsSeen = 0;
    },
  };
}
