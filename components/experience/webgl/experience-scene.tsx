'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AdaptiveDpr } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { WebGLRenderer } from 'three';
import type { GraphicsTier } from '@/types/experience';
import { createFrameHealth } from '@/lib/experience/frame-health';
import { subscribeScrollMetrics } from '@/lib/experience/scroll-metrics';
import { useExperienceStore } from '@/lib/experience/store';
import { WorldScene } from './world-scene';
import { InfectionScene } from './infection-scene';

/**
 * Espera mínima entre degradaciones, por tier de salida.
 *
 * El primer escalón (A → B) solo baja el detalle del shader y el DPR: la
 * secuencia sigue siendo la misma y equivocarse cuesta poco. El segundo (B → C)
 * desmonta la capa WebGL y cambia el capítulo por su respaldo en CSS, que es un
 * salto visible y sin vuelta atrás en toda la sesión. Ese merece mucha más
 * evidencia: cinco veces más tiempo dibujando mal antes de decidirlo.
 */
const DECLINE_COOLDOWN_MS: Partial<Record<GraphicsTier, number>> = {
  a: 4000,
  b: 20000,
};

/**
 * Escena persistente de la experiencia.
 *
 * Sostiene el contrato de rendimiento común —frameloop bajo demanda, pausa por
 * visibilidad, DPR adaptativo y degradación de tier— y monta las escenas de
 * cada capítulo. Driftwood e Infection comparten el canvas; cada escena decide
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
    const tier = useExperienceStore.getState().graphicsTier;
    const cooldown = DECLINE_COOLDOWN_MS[tier];
    if (cooldown === undefined) return;
    if (now - lastDeclineRef.current < cooldown) return;
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
      <AdaptiveDpr pixelated />
      <FrameHealthWatch onDecline={handleDecline} />
      <SceneDriver />
      <WorldScene />
      <InfectionScene />
    </Canvas>
  );
}

/**
 * Vigilancia de rendimiento adaptada al bucle bajo demanda.
 *
 * Ver `frame-health.ts`: solo cuentan los fotogramas consecutivos, así que las
 * pausas del visitante —que con el monitor de drei se leían como 1 fps— ya no
 * degradan nada. El contador se reinicia al cambiar de tier, porque recargar
 * las texturas en la nueva resolución produce su propio tirón.
 */
function FrameHealthWatch({ onDecline }: { onDecline: () => void }) {
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const health = useRef(createFrameHealth());

  useEffect(() => {
    health.current.reset();
  }, [graphicsTier]);

  useFrame(() => {
    if (health.current.sample(performance.now())) onDecline();
  });

  return null;
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
    const restoreShaderDebug = attachShaderFallback(gl);
    /*
     * Perder el contexto no es un veredicto sobre el equipo: los navegadores
     * con limitador de memoria —Opera GX y su GX Control, por ejemplo— lo
     * retiran a mitad de sesión para liberar la GPU. `preventDefault` es lo que
     * le pide al navegador que lo restaure en vez de darlo por muerto; el
     * reintento acotado vive en `ExperienceCanvas`, que es quien monta la capa.
     */
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      useExperienceStore.getState().setWebglAvailable(false);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      restoreShaderDebug();
    };
  }, [gl]);

  return null;
}

/** Renderer integration stays outside React's immutable hook values. */
function attachShaderFallback(renderer: WebGLRenderer) {
  const debug = renderer.debug;
  const previous = debug.onShaderError;
  debug.onShaderError = (context, program, vertex, fragment) => {
    if (previous) previous(context, program, vertex, fragment);
    else
      console.error(
        'WebGL shader failed; restoring image fallback.',
        context.getProgramInfoLog(program),
        context.getShaderInfoLog(fragment),
      );
    queueMicrotask(() =>
      useExperienceStore.getState().setWebglAvailable(false),
    );
  };
  return () => {
    debug.onShaderError = previous;
  };
}
