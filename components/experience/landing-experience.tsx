'use client';

import { useLayoutEffect, useRef } from 'react';
import { ArrowDown, MoveUpRight } from 'lucide-react';
import gsap from 'gsap';
import { chapters, siteContent } from '@/content/site-content';

export function LandingExperience() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.from('[data-intro]', {
        autoAlpha: 0,
        y: 28,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <main ref={root} className="min-h-screen overflow-hidden bg-background">
      <section className="relative flex min-h-screen flex-col px-5 pb-8 pt-5 sm:px-10 sm:pt-8 lg:px-16">
        <div aria-hidden="true" className="experience-grid absolute inset-0" />
        <div aria-hidden="true" className="stage-glow absolute inset-0" />

        <header data-intro className="relative z-10 flex items-center justify-between border-b pb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:text-xs">
          <a href="#inicio" className="text-foreground">{siteContent.projectLabel}</a>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Estructura activa
          </div>
        </header>

        <div id="inicio" className="relative z-10 flex flex-1 items-center py-20">
          <div className="grid w-full items-end gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
            <div>
              <p data-intro className="mb-7 font-mono text-[11px] uppercase tracking-[0.28em] text-accent">{siteContent.eyebrow}</p>
              <h1 data-intro className="max-w-5xl text-[clamp(3.4rem,10vw,9.5rem)] font-semibold leading-[0.82] tracking-[-0.075em]">{siteContent.headline}</h1>
            </div>

            <div data-intro className="border-l pl-5 sm:pl-8">
              <p className="max-w-md text-base leading-7 text-muted sm:text-lg">{siteContent.introduction}</p>
              <a href="#arquitectura" className="mt-9 inline-flex items-center gap-3 border-b border-accent pb-2 font-mono text-xs uppercase tracking-[0.18em] text-foreground">
                Ver arquitectura <MoveUpRight className="h-4 w-4 text-accent" />
              </a>
            </div>
          </div>
        </div>

        <div data-intro className="relative z-10 flex items-end justify-between border-t pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          <span>Web / React / Motion / WebGL</span>
          <a href="#arquitectura" aria-label="Bajar a la arquitectura"><ArrowDown className="h-5 w-5 text-accent" /></a>
        </div>
      </section>

      <section id="arquitectura" className="relative border-t px-5 py-24 sm:px-10 lg:px-16 lg:py-36">
        <div className="mb-16 grid gap-6 lg:grid-cols-2">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">Mapa de la experiencia</p>
          <h2 className="max-w-2xl text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-6xl">Una base web dividida en capítulos narrativos.</h2>
        </div>
        <div className="grid border-t md:grid-cols-2 xl:grid-cols-4">
          {chapters.map((chapter) => (
            <article key={chapter.id} className="group min-h-72 border-b p-6 transition-colors hover:bg-white/[0.035] md:border-r lg:p-8">
              <div className="flex items-start justify-between font-mono text-xs text-muted"><span>{chapter.id}</span><span className="text-accent">↗</span></div>
              <div className="mt-20">
                <h3 className="text-2xl font-medium tracking-[-0.03em]">{chapter.title}</h3>
                <p className="mt-3 max-w-xs leading-6 text-muted">{chapter.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
