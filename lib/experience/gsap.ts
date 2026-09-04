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

  // Todo lo que se anima aquí es transformación u opacidad. Forzar la capa 3D
  // evita que GSAP decida caso por caso y que un tween arranque en el hilo
  // principal y salte al compositor a mitad de recorrido.
  gsap.config({ force3D: true });

  // El ticker recupera hasta 500 ms de retraso (pestaña ocupada, GC, carga de
  // texturas) sin dar un salto: por encima de 33 ms de frame, GSAP hace como si
  // solo hubiera pasado un frame. Es el valor por defecto, declarado aquí para
  // que quede claro que la experiencia depende de él.
  gsap.ticker.lagSmoothing(500, 33);

  ScrollTrigger.config({
    // `resize` sale de la lista de GSAP a propósito: el refresco lo dispara el
    // runtime desde `subscribeLayoutChange`, que además de redimensionar la
    // ventana cubre los cambios de altura del documento (fuentes, medios,
    // orientación) y llega agrupado. Ver `use-experience-runtime.ts`.
    autoRefreshEvents: 'DOMContentLoaded,load,refreshInit',
    // La barra de direcciones de móvil cambia `100vh` al desplazarse y provoca
    // un refresco a media secuencia: el escenario da un salto justo mientras se
    // lee. Las alturas del sitio son `svh`, así que ese refresco no aporta nada.
    ignoreMobileResize: true,
  });
  registered = true;

  return gsap;
}

export { gsap, ScrollTrigger };

/**
 * Retardo de `scrub` compartido por las secuencias largas (capítulos 02 y 05).
 *
 * Es el tiempo, en segundos, que la animación tarda en alcanzar la posición de
 * scroll. Convierte los escalones de la rueda del ratón —que llegan como saltos
 * discretos de decenas de píxeles— en un recorrido continuo. Por debajo de
 * ~0.6 s los escalones se siguen notando; por encima de ~1.2 s la imagen deja
 * de responder al gesto.
 */
export const SCRUB_SECONDS = 0.85;

/**
 * Easing del seguimiento amortiguado del capítulo 05, que calcula su propio
 * progreso porque además necesita el rectángulo del fotograma para la capa
 * WebGL. Es el mismo que ScrollTrigger usa internamente para un `scrub`
 * numérico, de modo que las dos secuencias largas del sitio comparten inercia
 * y no se sienten como dos webs distintas al desplazarse.
 */
export const FOLLOW_EASE = 'expo';

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
