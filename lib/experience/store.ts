'use client';

import { create } from 'zustand';
import { firstChapterId } from '@/content/chapters';
import type {
  ChapterId,
  GraphicsTier,
  ScrollDirection,
  ScrollMetrics,
} from '@/types/experience';

/**
 * Estado global mínimo de la experiencia.
 *
 * Regla: aquí solo vive lo que varias capas necesitan compartir (capítulo,
 * métricas de scroll, tier gráfico y condiciones de entorno). Cualquier estado
 * local de una sección se queda en su componente.
 *
 * Las métricas de scroll se escriben una vez por frame. Ningún componente de
 * React debe suscribirse a `progress` o `velocity` con un selector: la capa
 * WebGL las lee con `useExperienceStore.getState()` dentro de su bucle de
 * render, de modo que un scroll a 60 fps no provoca renders de React.
 */
type ExperienceState = {
  /** Capítulo visible actualmente. */
  chapter: ChapterId;
  /** Progreso normalizado del documento, 0..1. */
  progress: number;
  /** Dirección del desplazamiento. */
  direction: ScrollDirection;
  /** Velocidad suavizada y normalizada, -1..1. */
  velocity: number;
  /** Tier gráfico efectivo. */
  graphicsTier: GraphicsTier;
  /** `prefers-reduced-motion: reduce` activo. */
  reducedMotion: boolean;
  /** La pestaña está visible; si es `false` todo bucle debe detenerse. */
  documentVisible: boolean;
  /** El navegador pudo crear un contexto WebGL. */
  webglAvailable: boolean;
  /** El tier ya se degradó en esta sesión; la detección deja de aplicarse. */
  graphicsTierDegraded: boolean;

  setChapter: (chapter: ChapterId) => void;
  setScrollMetrics: (metrics: ScrollMetrics) => void;
  /** Fija el tier detectado al arrancar. Se ignora si ya hubo degradación. */
  setGraphicsTier: (tier: GraphicsTier) => void;
  /**
   * Baja un escalón: A → B → C. Nunca sube y en C ya no hace nada, así que el
   * tier no puede recuperarse automáticamente durante la sesión.
   */
  degradeGraphicsTier: () => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setDocumentVisible: (documentVisible: boolean) => void;
  setWebglAvailable: (webglAvailable: boolean) => void;
};

/** Escalones de degradación. `c` es terminal. */
const NEXT_TIER: Record<GraphicsTier, GraphicsTier | null> = {
  a: 'b',
  b: 'c',
  c: null,
};

/** Umbral para no notificar cambios imperceptibles de progreso o velocidad. */
const EPSILON = 0.0005;

export const useExperienceStore = create<ExperienceState>((set, get) => ({
  chapter: firstChapterId,
  progress: 0,
  direction: 0,
  velocity: 0,
  // Arranque conservador: la detección real ocurre en el cliente tras montar.
  graphicsTier: 'c',
  reducedMotion: false,
  documentVisible: true,
  webglAvailable: false,
  graphicsTierDegraded: false,

  setChapter: (chapter) => {
    if (get().chapter === chapter) return;
    set({ chapter });
  },

  setScrollMetrics: ({ progress, direction, velocity }) => {
    const state = get();
    if (
      Math.abs(state.progress - progress) < EPSILON &&
      Math.abs(state.velocity - velocity) < EPSILON &&
      state.direction === direction
    ) {
      return;
    }
    set({ progress, direction, velocity });
  },

  setGraphicsTier: (graphicsTier) => {
    const state = get();
    // Una degradación por rendimiento gana siempre a la detección inicial.
    if (state.graphicsTierDegraded) return;
    if (state.graphicsTier === graphicsTier) return;
    set({ graphicsTier });
  },

  degradeGraphicsTier: () => {
    const next = NEXT_TIER[get().graphicsTier];
    if (!next) return;
    set({ graphicsTier: next, graphicsTierDegraded: true });
  },

  setReducedMotion: (reducedMotion) => {
    if (get().reducedMotion === reducedMotion) return;
    set({ reducedMotion });
  },

  setDocumentVisible: (documentVisible) => {
    if (get().documentVisible === documentVisible) return;
    set({ documentVisible });
  },

  setWebglAvailable: (webglAvailable) => {
    if (get().webglAvailable === webglAvailable) return;
    set({ webglAvailable });
  },
}));

/** Lectura no reactiva de las métricas de scroll para bucles de animación. */
export function readScrollMetrics(): ScrollMetrics {
  const { progress, direction, velocity } = useExperienceStore.getState();
  return { progress, direction, velocity };
}
