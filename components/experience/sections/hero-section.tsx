'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, MoveUpRight } from 'lucide-react';
import { chapterMap } from '@/content/chapters';
import { siteContent } from '@/content/site-content';
import { registerGsap, useExperienceTimeline } from '@/lib/experience/gsap';
import { subscribeLayoutChange } from '@/lib/experience/scroll-metrics';
import { useExperienceStore } from '@/lib/experience/store';
import { HeroMedia } from '../hero/hero-media';
import { TrailerDialog } from '../hero/trailer-dialog';

const chapter = chapterMap.hero;
const { hero } = siteContent;

/** Desplazamiento máximo del parallax de puntero, en píxeles. */
const PARALLAX_MAX = 12;

/**
 * Capítulo 01 — The Wake.
 *
 * Composición editorial sobre el material del juego: el negro conserva la mayor
 * masa, el rojo entra como estructura (regla, placa del subtítulo, CTA y luz
 * del propio vídeo) y el marfil sostiene la lectura. `scarlet` nunca se usa
 * como color de texto sobre negro (2,75:1); aparece como relleno o borde, donde
 * el marfil encima rinde 5,86:1.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  const mediaScrollLayer = useRef<HTMLDivElement>(null);
  const mediaParallaxLayer = useRef<HTMLDivElement>(null);

  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const [trailerOpen, setTrailerOpen] = useState(false);

  /*
   * Timelines del capítulo, creadas por el sistema central de GSAP dentro de un
   * `gsap.context` que se revierte al desmontar. Con movimiento reducido el
   * setup no llega a ejecutarse: no hay entrada ni scrubbing y el hero queda en
   * su estado final.
   */
  useExperienceTimeline(root, ({ gsap, scope }) => {
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .from('[data-hero-rule]', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.7,
      })
      .from('[data-hero-deck]', { autoAlpha: 0, y: 12, duration: 0.7 }, 0.1)
      // Revelado por máscara vertical: el contenedor recorta y la línea sube.
      .from(
        '[data-hero-line="primary"]',
        { yPercent: 118, letterSpacing: '0em', duration: 1.1 },
        0.15,
      )
      .from(
        '[data-hero-line="secondary"]',
        { yPercent: 118, letterSpacing: '0em', duration: 1 },
        0.38,
      )
      .from('[data-hero-genre]', { autoAlpha: 0, y: 14, duration: 0.8 }, 0.74)
      .from(
        '[data-hero-cta]',
        { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.09 },
        0.84,
      )
      .from('[data-hero-meta]', { autoAlpha: 0, y: 12, duration: 0.7 }, 1);

    // Salida por scroll: primer 20 % del hero, scrubbed y reversible.
    // No fija la sección ni hace un fade-out global; apaga la luz, hunde el
    // texto y empuja la imagen para insinuar el descenso.
    gsap
      .timeline({
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: '20% top',
          scrub: true,
        },
        defaults: { ease: 'none' },
      })
      .to('[data-hero-descent]', { opacity: 1 }, 0)
      .to('[data-hero-copy]', { y: 34, opacity: 0.55 }, 0)
      .to(mediaScrollLayer.current, { yPercent: -5, scale: 1.05 }, 0);
  });

  /*
   * Parallax de puntero. Solo con ratón, fuera de tier C y sin movimiento
   * reducido. Mueve la capa de imagen, nunca el texto, para que el título no
   * pierda nitidez. La actualización va agrupada en el ticker de GSAP (un único
   * requestAnimationFrame compartido) y el rectángulo se recalcula con la señal
   * central de layout, sin añadir listeners de scroll ni de resize.
   */
  const parallaxEnabled =
    !reducedMotion && graphicsTier !== 'c' && !trailerOpen;

  useEffect(() => {
    const section = root.current;
    const layer = mediaParallaxLayer.current;
    if (!parallaxEnabled || !section || !layer) return;

    // Solo con ratón: en táctil no hay puntero que seguir.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches)
      return;

    const gsap = registerGsap();
    const moveX = gsap.quickTo(layer, 'x', { duration: 0.7, ease: 'power3' });
    const moveY = gsap.quickTo(layer, 'y', { duration: 0.7, ease: 'power3' });

    let bounds = section.getBoundingClientRect();
    const remeasure = () => {
      bounds = section.getBoundingClientRect();
    };
    const stopLayoutWatch = subscribeLayoutChange(remeasure);

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
      moveX(-offsetX * PARALLAX_MAX);
      moveY(-offsetY * PARALLAX_MAX);
    };

    const handleLeave = () => {
      moveX(0);
      moveY(0);
    };

    section.addEventListener('pointermove', handleMove);
    section.addEventListener('pointerleave', handleLeave);

    return () => {
      section.removeEventListener('pointermove', handleMove);
      section.removeEventListener('pointerleave', handleLeave);
      stopLayoutWatch();
      moveX.tween?.kill();
      moveY.tween?.kill();
      gsap.set(layer, { x: 0, y: 0 });
    };
  }, [parallaxEnabled]);

  return (
    <section
      ref={root}
      id={chapter.id}
      data-chapter={chapter.id}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[calc(100svh-var(--chapter-bar-height))] flex-col overflow-hidden"
    >
      <HeroMedia
        scrollLayer={mediaScrollLayer}
        parallaxLayer={mediaParallaxLayer}
        paused={trailerOpen}
      />

      {/* Apagado progresivo durante la salida por scroll. */}
      <div
        data-hero-descent
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-void opacity-0"
      />

      <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-6 pt-10 sm:px-10 sm:pb-8 lg:px-16">
        <div data-hero-copy>
          <div data-hero-rule aria-hidden="true" className="signal-rule mb-5" />

          <p
            data-hero-deck
            className="font-system mb-6 text-[var(--font-system-label)] uppercase tracking-[0.24em] text-brass"
          >
            {hero.deckLabel}
          </p>

          <h1 id="hero-title" className="mb-6">
            <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
              <span
                data-hero-line="primary"
                className="font-display block whitespace-nowrap text-[clamp(2.4rem,9.2vw,8rem)] leading-[0.92] tracking-[0.05em] text-ivory uppercase"
              >
                {hero.titlePrimary}
              </span>
            </span>

            {/* Placa roja: el rojo pesa en el título sin llevarse el texto a un
                contraste insuficiente (marfil sobre scarlet = 5,86:1). */}
            <span className="mt-4 block overflow-hidden pb-[0.1em]">
              <span
                data-hero-line="secondary"
                className="font-system inline-block bg-scarlet px-3 py-1.5 text-[clamp(0.8rem,2.6vw,1.35rem)] leading-none tracking-[0.3em] text-ivory uppercase shadow-[var(--glow-red)]"
              >
                {hero.titleSecondary}
              </span>
            </span>
          </h1>

          <p
            data-hero-genre
            className="font-system mb-8 flex max-w-[46rem] flex-wrap items-center gap-x-3 gap-y-2 text-[var(--font-system-label)] uppercase tracking-[0.18em] text-steel"
          >
            {hero.genre}
            <span className="border border-[color:var(--border-brass)] px-2 py-1 text-[var(--font-system-compact)] tracking-[0.14em] text-brass">
              {hero.genreStatus}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <TrailerDialog onOpenChange={setTrailerOpen} />

            <a
              data-hero-cta
              href={hero.steamUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-system inline-flex min-h-12 items-center gap-3 border border-[color:var(--border-brass)] px-6 text-[var(--font-system-action)] uppercase tracking-[0.18em] text-steel transition-colors duration-200 hover:border-brass hover:text-foreground focus-ring"
            >
              {hero.ctaSecondary}
              <MoveUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div
          data-hero-meta
          className="font-system mt-10 flex items-end justify-between gap-4 border-t border-[color:var(--border-subtle)] pt-4 text-[var(--font-system-compact)] uppercase tracking-[0.18em] text-steel"
        >
          <span>
            <span className="text-brass">{chapter.index}</span> —{' '}
            {chapter.navLabel}
          </span>
          <a
            href="#world"
            className="inline-flex items-center gap-2 transition-colors hover:text-foreground focus-ring"
          >
            <span className="hidden sm:inline">{hero.scrollHint}</span>
            <ArrowDown aria-hidden="true" className="h-5 w-5 text-scarlet" />
          </a>
        </div>
      </div>
    </section>
  );
}
