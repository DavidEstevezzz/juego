'use client';

import { useRef } from 'react';
import { ArrowDown, MoveUpRight } from 'lucide-react';
import { chapterMap } from '@/content/chapters';
import { siteContent } from '@/content/site-content';
import { useExperienceTimeline } from '@/lib/experience/gsap';

const chapter = chapterMap.hero;

/**
 * Capítulo 01. Conserva el contenido y la composición actuales de la portada;
 * la dirección cinematográfica (vídeo, máscaras, parallax, modal de teaser)
 * llega en el Prompt 01.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);

  // Única timeline de entrada de la portada, creada por el registro central.
  // Con movimiento reducido no se ejecuta y el contenido queda estático.
  useExperienceTimeline(root, ({ gsap }) => {
    gsap.from('[data-intro]', {
      autoAlpha: 0,
      y: 24,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
    });
  });

  return (
    <section
      ref={root}
      id={chapter.id}
      data-chapter={chapter.id}
      aria-labelledby="hero-title"
      className="relative flex min-h-[calc(100svh-var(--chapter-bar-height))] flex-col px-5 pb-10 pt-8 sm:px-10 lg:px-16"
    >
      <div aria-hidden="true" className="experience-grid absolute inset-0" />
      <div aria-hidden="true" className="stage-glow absolute inset-0" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center py-16">
        <div className="grid w-full items-end gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div>
            <p
              data-intro
              className="font-system mb-6 text-[0.7rem] uppercase tracking-[0.28em] text-brass"
            >
              {siteContent.eyebrow}
            </p>
            <h1
              id="hero-title"
              data-intro
              className="font-display max-w-4xl text-[clamp(3rem,9vw,8rem)] leading-[0.9] tracking-[0.02em]"
            >
              {siteContent.headline}
            </h1>
          </div>

          <div
            data-intro
            className="border-l border-[var(--border-subtle)] pl-5 sm:pl-8"
          >
            <p className="max-w-md text-base leading-[1.65] text-steel sm:text-lg">
              {siteContent.introduction}
            </p>
            <a
              href="#world"
              className="font-system mt-8 inline-flex items-center gap-3 border-b border-brass pb-2 text-xs uppercase tracking-[0.18em] text-foreground"
            >
              Ver capítulos
              <MoveUpRight aria-hidden="true" className="h-4 w-4 text-brass" />
            </a>
          </div>
        </div>
      </div>

      <div
        data-intro
        className="font-system relative z-10 mx-auto flex w-full max-w-7xl items-end justify-between border-t border-[var(--border-subtle)] pt-5 text-[0.65rem] uppercase tracking-[0.2em] text-steel"
      >
        <span>Web / React / Motion / WebGL</span>
        <a href="#world" aria-label="Bajar al siguiente capítulo">
          <ArrowDown aria-hidden="true" className="h-5 w-5 text-brass" />
        </a>
      </div>
    </section>
  );
}
