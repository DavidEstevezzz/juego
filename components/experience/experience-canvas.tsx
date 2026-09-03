'use client';

import { Suspense, lazy, useEffect, useState } from 'react';
import { subscribeScrollMetrics } from '@/lib/experience/scroll-metrics';
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
 * - Espera además a que el visitante inicie el descenso: el hero es puro DOM y
 *   vídeo, así que descargar Three.js antes solo competiría con el póster y el
 *   loop. Quien no baja del hero nunca paga ese chunk.
 */
export function ExperienceCanvas() {
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const webglAvailable = useExperienceStore((state) => state.webglAvailable);
  const chapter = useExperienceStore((state) => state.chapter);
  const [deferred, setDeferred] = useState(false);
  const [descentStarted, setDescentStarted] = useState(false);

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

  // Un único punto de escucha: el driver central de scroll, sin listeners nuevos.
  useEffect(() => {
    if (descentStarted) return;
    return subscribeScrollMetrics(({ progress }) => {
      if (progress > 0.005) setDescentStarted(true);
    });
  }, [descentStarted]);

  const started = descentStarted || chapter !== 'hero';
  const enabled =
    deferred &&
    started &&
    webglAvailable &&
    graphicsTier !== 'c' &&
    !reducedMotion;

  if (!enabled) return null;

  return (
    <div className="experience-canvas-layer" aria-hidden="true">
      <Suspense fallback={null}>
        <ExperienceScene />
      </Suspense>
    </div>
  );
}
