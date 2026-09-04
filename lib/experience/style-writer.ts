/**
 * Escritor de custom properties con memoria, para las secciones guiadas por
 * scroll.
 *
 * Estas secciones publican su estado en variables CSS y en `data-*` en cada
 * frame. Sin memoria, cada escritura invalida el estilo del subárbol aunque el
 * valor sea idéntico al anterior, y las secuencias largas tienen pausas de
 * cientos de píxeles en las que el valor no cambia: ahí el trabajo es puro
 * desperdicio y añade jitter justo donde la animación debería estar quieta.
 *
 * El escritor redondea a la precisión pedida —una décima de porcentaje ya es
 * más fina que un píxel en pantalla— y solo toca el DOM cuando el resultado
 * cambia de verdad. Todas las escrituras deben ir juntas y después de las
 * lecturas de layout del frame, para no provocar reflows intercalados.
 */
export type StyleWriter = {
  /** Escribe una custom property numérica, con unidad opcional. */
  set(property: string, value: number, decimals?: number, unit?: string): void;
  /** Escribe un `data-*` solo cuando cambia; los cambios recalculan estilo. */
  data(name: string, value: string): void;
  /** Olvida lo escrito, de modo que el siguiente frame vuelva a publicar. */
  reset(): void;
};

const NOOP: StyleWriter = {
  set() {},
  data() {},
  reset() {},
};

export function createStyleWriter(element: HTMLElement | null): StyleWriter {
  if (!element) return NOOP;

  const cache = new Map<string, string>();

  return {
    set(property, value, decimals = 3, unit = '') {
      const next = `${value.toFixed(decimals)}${unit}`;
      if (cache.get(property) === next) return;
      cache.set(property, next);
      element.style.setProperty(property, next);
    },
    data(name, value) {
      if (element.dataset[name] === value) return;
      element.dataset[name] = value;
    },
    reset() {
      cache.clear();
    },
  };
}
