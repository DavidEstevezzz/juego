'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { subscribeScrollMetrics } from '@/lib/experience/scroll-metrics';
import { useExperienceStore } from '@/lib/experience/store';
import { WorldScene } from './world-scene';

/** Espera mínima entre degradaciones para no saltarse un escalón por un bache. */
const DECLINE_COOLDOWN_MS = 4000;

/**
 * Escena persistente de la experiencia.
 *
 * Sostiene el contrato de rendimiento común —frameloop bajo demanda, pausa por
 * visibilidad, DPR adaptativo y degradación de tier— y monta las escenas de
 * cada capítulo. Ahora mismo solo existe la del capítulo 02; cada escena decide
 * por sí misma cuándo es visible a partir de su progreso de scroll.
 */
export default function ExperienceScene() {
  const documentVisible = useExperienceStore((state) => state.documentVisible);
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const lastDeclineRef = useRef(0);

  /**
   * Cada caída sostenida baja un escalón: A → B → C. En C la capa WebGL se
   * desmonta (lo decide `ExperienceCanvas`) y solo queda el DOM. La espera
   * evita que dos avisos seguidos hagan colapsar la experiencia de A a C por
   * un bache puntual, y el tier nunca vuelve a subir en la misma sesión.
   */
  const handleDecline = useCallback(() => {
    const now = performance.now();
    if (now - lastDeclineRef.current < DECLINE_COOLDOWN_MS) return;
    lastDeclineRef.current = now;
    useExperienceStore.getState().degradeGraphicsTier();
  }, []);

  return (
    <Canvas
      // `never` detiene el bucle de render por completo mientras la pestaña
      // está oculta; `demand` solo dibuja cuando algo invalida el frame.
      frameloop={documentVisible ? 'demand' : 'never'}
      dpr={graphicsTier === 'a' ? [1, 1.5] : [1, 1.25]}
      gl={{
        antialias: graphicsTier === 'a',
        alpha: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      }}
      camera={{ position: [0, 0, 4], fov: 35 }}
      // La capa es `fixed` a pantalla completa: su caja no cambia al hacer
      // scroll, así que R3F no necesita su propio listener de scroll.
      resize={{ scroll: false }}
    >
      <PerformanceMonitor onDecline={handleDecline}>
        <AdaptiveDpr pixelated />
        <SceneDriver />
        <WorldScene />
      </PerformanceMonitor>
    </Canvas>
  );
}

/**
 * Puente entre el runtime y el canvas: pide frames cuando el scroll cambia y
 * retira la capa WebGL si el navegador pierde el contexto.
 */
function SceneDriver() {
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);

  useEffect(() => subscribeScrollMetrics(() => invalidate()), [invalidate]);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = () => {
      useExperienceStore.getState().setWebglAvailable(false);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    return () =>
      canvas.removeEventListener('webglcontextlost', handleContextLost);
  }, [gl]);

  return null;
}
