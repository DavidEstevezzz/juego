'use client';

import { useRef } from 'react';
import { siteContent } from '@/content/site-content';
import { useChapterObserver } from '@/lib/experience/use-chapter-observer';
import { useExperienceRuntime } from '@/lib/experience/use-experience-runtime';
import { ChapterNavigation } from './chapter-navigation';
import { ExperienceCanvas } from './experience-canvas';
import { DragaSection } from './sections/draga-section';
import { FinalSignalSection } from './sections/final-signal-section';
import { GameplaySection } from './sections/gameplay-section';
import { HeroSection } from './sections/hero-section';
import { InfectionSection } from './sections/infection-section';
import { ProductionSection } from './sections/production-section';
import { WorldSection } from './sections/world-section';

/**
 * Raíz de la experiencia.
 *
 * Es el único lugar donde se arranca el runtime (métricas de scroll,
 * visibilidad, tier gráfico y movimiento reducido) y donde se monta la capa
 * WebGL, de modo que no puede existir un segundo juego de listeners.
 *
 * El orden de las secciones dentro del `main` define el orden narrativo, el
 * de la navegación y el cálculo del capítulo activo.
 */
export function ExperienceShell() {
  const main = useRef<HTMLElement>(null);

  useExperienceRuntime();
  useChapterObserver(main);

  return (
    <>
      <a
        href="#experience-main"
        className="font-system sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-scarlet focus:bg-void focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-[0.18em] focus:text-foreground"
      >
        {siteContent.skipLinkLabel}
      </a>

      <ExperienceCanvas />
      <ChapterNavigation />

      <main
        id="experience-main"
        ref={main}
        tabIndex={-1}
        className="relative z-10 focus:outline-none"
      >
        <HeroSection />
        <WorldSection />
        <GameplaySection />
        <DragaSection />
        <InfectionSection />
        <ProductionSection />
        <FinalSignalSection />
      </main>
    </>
  );
}
