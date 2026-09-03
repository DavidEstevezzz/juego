'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';
import { chapterIds } from '@/content/chapters';
import type { ChapterId } from '@/types/experience';
import { useExperienceStore } from './store';

const CHAPTER_IDS = new Set<string>(chapterIds);

/**
 * Determina el capítulo activo con un único `IntersectionObserver`.
 *
 * El margen recorta el viewport a una banda central: solo la sección que cruza
 * el centro de la pantalla se considera activa, lo que evita parpadeos en los
 * límites y no necesita ningún listener de scroll adicional.
 */
export function useChapterObserver(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const sections = element.querySelectorAll<HTMLElement>('[data-chapter]');
    if (sections.length === 0) return;

    const { setChapter } = useExperienceStore.getState();

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { id: ChapterId; ratio: number } | null = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.chapter;
          if (!id || !CHAPTER_IDS.has(id)) continue;
          if (best && entry.intersectionRatio <= best.ratio) continue;
          best = { id: id as ChapterId, ratio: entry.intersectionRatio };
        }

        if (best) setChapter(best.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    for (const section of sections) observer.observe(section);

    return () => observer.disconnect();
  }, [root]);
}
