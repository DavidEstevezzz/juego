'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useExperienceStore } from './store';

/**
 * Punto único de integración con GSAP.
 *
 * Nadie más registra plugins ni crea `ScrollTrigger` a mano: así solo existe
 * una instancia del plugin y un único conjunto de listeners de scroll propios
 * de GSAP, que conviven con el driver de métricas sin duplicarse.
 */

let registered = false;

export function registerGsap(): typeof gsap {
  if (registered || typeof window === 'undefined') return gsap;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    // `resize` sale de la lista de GSAP a propósito: el refresco lo dispara el
    // runtime desde `subscribeLayoutChange`, que además de redimensionar la
    // ventana cubre los cambios de altura del documento (fuentes, medios,
    // orientación) y llega agrupado. Ver `use-experience-runtime.ts`.
    autoRefreshEvents: 'DOMContentLoaded,load,refreshInit',
  });
  registered = true;

  return gsap;
}

export { gsap, ScrollTrigger };

/** `useLayoutEffect` seguro en SSR. */
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export type ExperienceTimelineSetup = (context: {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
  scope: HTMLElement;
}) => void;

/**
 * Crea timelines dentro de un `gsap.context` acotado a `scope` y las revierte
 * por completo al desmontar o al cambiar las dependencias.
 *
 * Con `prefers-reduced-motion: reduce` el setup no llega a ejecutarse, de modo
 * que no se crea ninguna timeline ligada al scroll: el contenido se queda en su
 * estado final por CSS.
 */
export function useExperienceTimeline(
  scope: RefObject<HTMLElement | null>,
  setup: ExperienceTimelineSetup,
  dependencies: readonly unknown[] = [],
) {
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const setupRef = useRef(setup);

  useIsomorphicLayoutEffect(() => {
    setupRef.current = setup;
  });

  useIsomorphicLayoutEffect(() => {
    const element = scope.current;
    if (!element || reducedMotion) return;

    const instance = registerGsap();
    const context = instance.context(() => {
      setupRef.current({ gsap: instance, ScrollTrigger, scope: element });
    }, element);

    return () => {
      // `revert()` mata tweens, ScrollTriggers y restaura los estilos inline.
      context.revert();
    };
  }, [reducedMotion, scope, ...dependencies]);
}

/** Recalcula posiciones de ScrollTrigger tras un cambio de altura del documento. */
export function refreshScrollTriggers() {
  if (!registered) return;
  ScrollTrigger.refresh();
}
