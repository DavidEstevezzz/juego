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

  setChapter: (chapter: ChapterId) => void;
  setScrollMetrics: (metrics: ScrollMetrics) => void;
  setGraphicsTier: (tier: GraphicsTier) => void;
  /** Baja el tier sin subirlo nunca; lo usa la monitorización de rendimiento. */
  downgradeGraphicsTier: (tier: GraphicsTier) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setDocumentVisible: (documentVisible: boolean) => void;
  setWebglAvailable: (webglAvailable: boolean) => void;
};

const TIER_ORDER: Record<GraphicsTier, number> = { a: 0, b: 1, c: 2 };

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
    if (get().graphicsTier === graphicsTier) return;
    set({ graphicsTier });
  },

  downgradeGraphicsTier: (tier) => {
    const current = get().graphicsTier;
    if (TIER_ORDER[tier] <= TIER_ORDER[current]) return;
    set({ graphicsTier: tier });
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
