'use client';

import { useEffect } from 'react';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { subscribeScrollMetrics } from '@/lib/experience/scroll-metrics';
import { useExperienceStore } from '@/lib/experience/store';

/**
 * Escena persistente de la experiencia.
 *
 * En esta fase está deliberadamente vacía: no hay shaders, modelos ni
 * postprocesado. Lo que sí queda montado es el contrato de rendimiento —
 * frameloop bajo demanda, pausa por visibilidad, DPR adaptativo y degradación
 * de tier — para que cada capítulo posterior solo añada contenido.
 */
export default function ExperienceScene() {
  const documentVisible = useExperienceStore((state) => state.documentVisible);
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);

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
      <PerformanceMonitor
        onDecline={() =>
          useExperienceStore.getState().downgradeGraphicsTier('b')
        }
      >
        <AdaptiveDpr pixelated />
        <SceneDriver />
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
