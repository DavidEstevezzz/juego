/**
 * Preferencia de movimiento reducido.
 *
 * Un único `MediaQueryList` con un único listener alimenta a todos los
 * suscriptores; el listener nativo se añade con el primer suscriptor y se
 * retira con el último.
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type Listener = (reducedMotion: boolean) => void;

const listeners = new Set<Listener>();
let mediaQuery: MediaQueryList | null = null;

function getMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;
  mediaQuery ??= window.matchMedia(REDUCED_MOTION_QUERY);
  return mediaQuery;
}

function handleChange(event: MediaQueryListEvent) {
  for (const listener of listeners) listener(event.matches);
}

/** Lectura síncrona; en servidor devuelve `false`. */
export function prefersReducedMotion(): boolean {
  return getMediaQuery()?.matches ?? false;
}

export function subscribeReducedMotion(listener: Listener): () => void {
  const query = getMediaQuery();
  if (!query) return () => {};

  listeners.add(listener);
  if (listeners.size === 1) query.addEventListener('change', handleChange);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) query.removeEventListener('change', handleChange);
  };
}
