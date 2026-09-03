'use client';

import { useEffect, useRef } from 'react';
import { chapterMap, worldChapterContent } from '@/content/chapters';
import { media } from '@/content/media';
import {
  clearChapterProgress,
  setChapterProgress,
} from '@/lib/experience/chapter-progress';
import { useExperienceTimeline } from '@/lib/experience/gsap';
import { useExperienceStore } from '@/lib/experience/store';
import type { ResponsiveImage } from '@/types/experience';

const chapter = chapterMap.world;
const content = worldChapterContent;

/**
 * Capítulo 02 — Driftwood.
 *
 * La sección reserva la distancia de scroll y su escenario queda `sticky`: no
 * hay pinning de ScrollTrigger, así que no se recalcula el layout ni aparecen
 * saltos. La imagen vive en la capa WebGL persistente y el texto siempre está
 * en el DOM.
 *
 * Tres modos, decididos por el runtime y no por el user agent:
 * - WebGL: `MediaPlane` con displacement procedural (ver `world-scene.tsx`).
 * - CSS: dos `<picture>` superpuestas cuyo crossfade escribe la misma timeline.
 * - Estático: con movimiento reducido la hoja de estilos convierte el escenario
 *   en una composición editorial con las dos imágenes, sin scrubbing.
 */
export function WorldSection() {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const webglAvailable = useExperienceStore((state) => state.webglAvailable);

  const webglMode = webglAvailable && graphicsTier !== 'c' && !reducedMotion;

  useEffect(() => () => clearChapterProgress('world'), []);

  useExperienceTimeline(
    root,
    ({ gsap, ScrollTrigger, scope }) => {
      const stage = scope.querySelector<HTMLElement>('[data-world-stage]');

      // Presencia del capítulo en el viewport: alimenta la entrada y salida de
      // la capa WebGL sin que ninguna sección observe el scroll por su cuenta.
      ScrollTrigger.create({
        trigger: scope,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) =>
          setChapterProgress('world', { coverage: self.progress }),
      });

      // Ventana creativa: coincide con el tramo en que el escenario está fijo.
      // Todo el estado final depende de este progreso, así que subir devuelve
      // exactamente la misma imagen.
      ScrollTrigger.create({
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          setChapterProgress('world', { progress: self.progress });
          stage?.style.setProperty('--world-mix', self.progress.toFixed(4));
        },
      });

      gsap.from('[data-world-reveal]', {
        autoAlpha: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: scope,
          start: 'top 65%',
          toggleActions: 'play none none reverse',
        },
      });
    },
    [webglMode],
  );

  return (
    <section
      ref={root}
      id={chapter.id}
      data-chapter={chapter.id}
      aria-labelledby="world-title"
      className="world-chapter relative border-t border-[color:var(--border-subtle)]"
    >
      <div
        data-world-stage
        data-webgl={webglMode || undefined}
        className="world-stage"
      >
        {/*
          Fallback DOM: solo se monta cuando la capa WebGL no va a dibujar, de
          modo que las mismas imágenes no se descarguen dos veces.
        */}
        {!webglMode && (
          <div className="world-media" aria-hidden="true">
            <WorldPicture image={media.images.world} />
            <WorldPicture image={media.images.village} />
          </div>
        )}

        <div aria-hidden="true" className="world-veil" />

        <div className="world-copy">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <div data-world-reveal className="signal-rule" aria-hidden="true" />

            <p
              data-world-reveal
              className="font-system text-[0.68rem] uppercase tracking-[0.28em] text-brass"
            >
              {content.deckLabel}
            </p>

            <h2
              id="world-title"
              data-world-reveal
              className="font-display max-w-3xl text-[clamp(2.25rem,5.4vw,4.75rem)] leading-[1.02] tracking-[0.02em] text-ivory"
            >
              {chapter.title}
            </h2>

            <p
              data-world-reveal
              className="max-w-[56ch] text-base leading-[1.65] text-steel sm:text-lg"
            >
              {content.premise}
            </p>

            <ul
              data-world-reveal
              className="grid max-w-4xl gap-5 border-t border-[color:var(--border-subtle)] pt-6 sm:grid-cols-3"
            >
              {content.observations.map((observation) => (
                <li key={observation.index} className="flex flex-col gap-2">
                  <p className="font-system text-[0.64rem] uppercase tracking-[0.22em] text-steel">
                    <span className="text-brass">{observation.index}</span>{' '}
                    {observation.label}
                  </p>
                  <p className="max-w-[34ch] text-sm leading-[1.6] text-steel">
                    {observation.text}
                  </p>
                </li>
              ))}
            </ul>

            <p
              data-world-reveal
              className="font-system w-fit border border-[color:var(--border-brass)] px-2 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-brass"
            >
              {content.provisionalLabel}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** `<picture>` con AVIF y WebP y el punto focal del material aprobado. */
function WorldPicture({ image }: { image: ResponsiveImage }) {
  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`${image.avif.small} 960w, ${image.avif.large} 1920w`}
        sizes="100vw"
      />
      <source
        type="image/webp"
        srcSet={`${image.webp.small} 960w, ${image.webp.large} 1920w`}
        sizes="100vw"
      />
      {/* oxlint-disable-next-line next/no-img-element */}
      <img
        src={image.webp.large}
        alt={image.alt}
        width={1920}
        height={1080}
        loading="lazy"
        decoding="async"
        style={{
          objectPosition: `${image.focal[0] * 100}% ${image.focal[1] * 100}%`,
        }}
      />
    </picture>
  );
}
