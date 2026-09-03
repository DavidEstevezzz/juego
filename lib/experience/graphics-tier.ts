import type { GraphicsTier } from '@/types/experience';

/**
 * Detección de capacidad gráfica sin user-agent sniffing.
 *
 * Solo se usan señales declaradas por el navegador: soporte real de WebGL,
 * memoria y núcleos disponibles, tipo de puntero y preferencias de ahorro de
 * datos. El resultado se puede degradar más tarde con la monitorización de
 * rendimiento, pero nunca se sube automáticamente.
 */

type DataSaverNavigator = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

let webglSupport: boolean | null = null;

/**
 * Comprueba una sola vez si el navegador puede crear un contexto WebGL.
 * El contexto de prueba se libera de inmediato con `WEBGL_lose_context`.
 */
export function detectWebglSupport(): boolean {
  if (webglSupport !== null) return webglSupport;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');

    if (context && 'getExtension' in context) {
      const lose = (context as WebGLRenderingContext).getExtension(
        'WEBGL_lose_context',
      );
      lose?.loseContext();
    }

    webglSupport = context !== null;
  } catch {
    webglSupport = false;
  }

  return webglSupport;
}

/** `true` si el usuario o el sistema piden ahorrar datos. */
export function prefersReducedData(): boolean {
  if (typeof window === 'undefined') return false;

  const navigatorWithHints = window.navigator as DataSaverNavigator;
  if (navigatorWithHints.connection?.saveData === true) return true;

  // `prefers-reduced-data` todavía no está en todos los navegadores; una
  // consulta no soportada devuelve `matches: false`, que es el valor seguro.
  return window.matchMedia('(prefers-reduced-data: reduce)').matches;
}

/** Detecta el tier gráfico inicial. Debe llamarse en el cliente. */
export function detectGraphicsTier(): GraphicsTier {
  if (typeof window === 'undefined') return 'c';

  if (!detectWebglSupport() || prefersReducedData()) return 'c';

  const navigatorWithHints = window.navigator as DataSaverNavigator;
  const cores = navigatorWithHints.hardwareConcurrency ?? 4;
  // `deviceMemory` solo existe en Chromium; su ausencia no debe penalizar.
  const memory = navigatorWithHints.deviceMemory ?? 8;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const smallViewport = window.matchMedia('(max-width: 900px)').matches;

  if (cores <= 2 || memory <= 2) return 'c';
  if (coarsePointer || smallViewport || cores <= 4 || memory <= 4) return 'b';

  return 'a';
}
