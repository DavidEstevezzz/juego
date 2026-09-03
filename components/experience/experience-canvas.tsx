'use client';

import { Suspense, lazy, useEffect, useState } from 'react';
import { useExperienceStore } from '@/lib/experience/store';

// La escena y todo Three.js se cargan en un chunk aparte: nunca entran en el
// paquete crítico ni bloquean el primer render del contenido.
const ExperienceScene = lazy(() => import('./webgl/experience-scene'));

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * Capa WebGL persistente de la experiencia.
 *
 * - Se monta una sola vez y sobrevive a todos los capítulos.
 * - Es `fixed`, decorativa y `aria-hidden`: montarla no mueve nada del
 *   documento, así que no introduce CLS, y el DOM sigue siendo completo si
 *   nunca llega a cargarse.
 * - No se monta sin WebGL, en tier C ni con movimiento reducido.
 */
export function ExperienceCanvas() {
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const webglAvailable = useExperienceStore((state) => state.webglAvailable);
  const [deferred, setDeferred] = useState(false);

  useEffect(() => {
    const idleWindow = window as IdleWindow;

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const handle = idleWindow.requestIdleCallback(() => setDeferred(true), {
        timeout: 2000,
      });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }

    const timeout = window.setTimeout(() => setDeferred(true), 600);
    return () => window.clearTimeout(timeout);
  }, []);

  const enabled =
    deferred && webglAvailable && graphicsTier !== 'c' && !reducedMotion;

  if (!enabled) return null;

  return (
    <div className="experience-canvas-layer" aria-hidden="true">
      <Suspense fallback={null}>
        <ExperienceScene />
      </Suspense>
    </div>
  );
}
