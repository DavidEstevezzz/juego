/**
 * Visibilidad de la pestaña.
 *
 * Fuente única de verdad para pausar el canvas, el driver de scroll y, más
 * adelante, vídeo y audio. Un solo listener `visibilitychange` para toda la
 * aplicación.
 */

type Listener = (visible: boolean) => void;

const listeners = new Set<Listener>();

function handleVisibilityChange() {
  const visible = isDocumentVisible();
  for (const listener of listeners) listener(visible);
}

/** Lectura síncrona; en servidor se asume visible. */
export function isDocumentVisible(): boolean {
  if (typeof document === 'undefined') return true;
  return document.visibilityState === 'visible';
}

export function subscribeVisibility(listener: Listener): () => void {
  if (typeof document === 'undefined') return () => {};

  listeners.add(listener);
  if (listeners.size === 1) {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
}
