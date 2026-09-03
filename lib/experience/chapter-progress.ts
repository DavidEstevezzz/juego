import type { ChapterId } from '@/types/experience';

/**
 * Progreso por capítulo, compartido entre las timelines de ScrollTrigger y la
 * capa WebGL.
 *
 * Es deliberadamente no reactivo: las timelines escriben aquí en cada tick de
 * scroll y la escena lo lee dentro de `useFrame`, de modo que un scrub a 60 fps
 * no provoca ningún render de React. El store global sigue guardando solo el
 * capítulo activo y las métricas generales.
 */
export type ChapterProgress = {
  /** Avance dentro de la ventana creativa del capítulo, 0..1. */
  progress: number;
  /** Presencia del capítulo en el viewport, 0..1. Fuera de pantalla es 0 o 1. */
  coverage: number;
};

const EMPTY: ChapterProgress = { progress: 0, coverage: 0 };

const state = new Map<ChapterId, ChapterProgress>();

export function setChapterProgress(
  chapter: ChapterId,
  patch: Partial<ChapterProgress>,
) {
  const current = state.get(chapter) ?? EMPTY;
  state.set(chapter, { ...current, ...patch });
}

export function getChapterProgress(chapter: ChapterId): ChapterProgress {
  return state.get(chapter) ?? EMPTY;
}

/** Limpia el registro de un capítulo al desmontarlo. */
export function clearChapterProgress(chapter: ChapterId) {
  state.delete(chapter);
}
