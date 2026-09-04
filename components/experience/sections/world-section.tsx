'use client';

import { useEffect, useRef } from 'react';
import {
  chapterCountLabel,
  chapterMap,
  worldChapterContent,
} from '@/content/chapters';
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

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

/** Curva determinista para que WebGL y el fallback CSS compartan el montaje. */
function smoothRamp(value: number, from: number, to: number) {
  const progress = clamp((value - from) / (to - from));
  return progress * progress * (3 - 2 * progress);
}

/**
 * Capítulo 02 — Driftwood.
 *
 * La tormenta funciona como montaje, no como decoración: la primera imagen se
 * abre dentro del negro, una masa de niebla oculta el cambio de plano y el
 * asentamiento aparece al retirarse. El progreso narrativo es reversible y se
 * comparte con el shader; no hay partículas DOM ni listeners por elemento.
 */
export function WorldSection() {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const webglAvailable = useExperienceStore((state) => state.webglAvailable);
  const worldSceneReady = useExperienceStore((state) => state.worldSceneReady);

  const webglEligible =
    webglAvailable && graphicsTier !== 'c' && !reducedMotion;
  const webglMode = webglEligible && worldSceneReady;

  useEffect(() => () => clearChapterProgress('world'), []);

  useExperienceTimeline(
    root,
    ({ gsap, ScrollTrigger, scope }) => {
      const stage = scope.querySelector<HTMLElement>('[data-world-stage]');
      const shutterTop = scope.querySelector<HTMLElement>(
        '[data-world-shutter="top"]',
      );
      const shutterBottom = scope.querySelector<HTMLElement>(
        '[data-world-shutter="bottom"]',
      );
      const seam = scope.querySelector<HTMLElement>('[data-world-seam]');
      const meta = scope.querySelector<HTMLElement>('[data-world-meta]');
      const lockup = scope.querySelector<HTMLElement>('[data-world-lockup]');
      const premise = scope.querySelector<HTMLElement>('[data-world-premise]');
      const outro = scope.querySelector<HTMLElement>('[data-world-outro]');
      const notes = Array.from(
        scope.querySelectorAll<HTMLElement>('[data-world-note]'),
      );

      // El capítulo entra y sale de la capa WebGL mediante la misma señal
      // compartida que usa el resto de la experiencia.
      ScrollTrigger.create({
        trigger: scope,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) =>
          setChapterProgress('world', { coverage: self.progress }),
      });

      gsap.set(meta, { autoAlpha: 0, y: -10 });
      gsap.set(lockup, { autoAlpha: 0, y: 28 });
      gsap.set(premise, { autoAlpha: 0, y: 20 });
      gsap.set(notes, { autoAlpha: 0, y: 24 });
      gsap.set(outro, { autoAlpha: 0 });
      gsap.set(seam, { scaleX: 0.08, transformOrigin: 'center center' });

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.45,
          onUpdate: (self) => {
            const progress = self.progress;
            const sceneMix = smoothRamp(progress, 0.47, 0.59);
            const whiteout = Math.min(
              smoothRamp(progress, 0.36, 0.51),
              1 - smoothRamp(progress, 0.56, 0.7),
            );

            setChapterProgress('world', { progress });
            stage?.style.setProperty('--world-progress', progress.toFixed(4));
            stage?.style.setProperty('--world-scene-mix', sceneMix.toFixed(4));
            stage?.style.setProperty('--world-whiteout', whiteout.toFixed(4));
          },
        },
      });

      // 01 — Una fisura escarlata convierte el negro del hero en una abertura.
      timeline
        .to(seam, { scaleX: 1, duration: 8, ease: 'power2.inOut' }, 0)
        .to(shutterTop, { yPercent: -100, duration: 14 }, 5)
        .to(shutterBottom, { yPercent: 100, duration: 14 }, 5)
        .to(seam, { autoAlpha: 0, duration: 5, ease: 'power2.out' }, 14)
        .to(meta, { autoAlpha: 1, y: 0, duration: 7 }, 11)

        // 02 — El nombre ocupa el encuadre; el material sigue siendo protagonista.
        .to(lockup, { autoAlpha: 1, y: 0, duration: 10 }, 15)
        .to(premise, { autoAlpha: 1, y: 0, duration: 8 }, 24)
        .to(lockup, { autoAlpha: 0, y: -22, duration: 8 }, 41)
        .to(premise, { autoAlpha: 0, y: -14, duration: 7 }, 43)

        // 03 — Después del whiteout, las reglas del lugar aparecen una a una.
        .to(notes[0], { autoAlpha: 1, y: 0, duration: 7 }, 59)
        .to(notes[0], { autoAlpha: 0, y: -18, duration: 6 }, 69)
        .to(notes[1], { autoAlpha: 1, y: 0, duration: 7 }, 70)
        .to(notes[1], { autoAlpha: 0, y: -18, duration: 6 }, 80)
        .to(notes[2], { autoAlpha: 1, y: 0, duration: 7 }, 81)
        .to(notes[2], { autoAlpha: 0, y: -18, duration: 6 }, 92)

        // 04 — Una sombra ascendente deja preparada la entrada al capítulo 03.
        .to(outro, { autoAlpha: 1, duration: 8, ease: 'power2.in' }, 92)
        .to(meta, { autoAlpha: 0, y: -8, duration: 5 }, 95);
    },
    [webglEligible],
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
        {/* El fallback solo se monta cuando WebGL no dibuja las mismas imágenes. */}
        {!webglMode && (
          <div className="world-media" aria-hidden="true">
            <WorldPicture image={media.images.world} />
            <WorldPicture image={media.images.village} />
          </div>
        )}

        <div aria-hidden="true" className="world-veil" />
        <div aria-hidden="true" className="world-css-whiteout" />

        <div
          data-world-shutter="top"
          aria-hidden="true"
          className="world-shutter world-shutter--top"
        />
        <div
          data-world-shutter="bottom"
          aria-hidden="true"
          className="world-shutter world-shutter--bottom"
        />
        <div data-world-seam aria-hidden="true" className="world-seam" />

        <div data-world-meta className="world-meta" aria-hidden="true">
          <span>{content.deckLabel}</span>
          <span className="world-meta__line" />
          <span>
            {chapter.index} / {chapterCountLabel}
          </span>
        </div>

        <div data-world-lockup className="world-lockup">
          <p className="world-kicker">The world</p>
          <h2 id="world-title" className="world-title">
            <span className="sr-only">The world: </span>
            Driftwood
          </h2>
        </div>

        <p data-world-premise className="world-premise">
          {content.premise}
        </p>

        <ol className="world-observations">
          {content.observations.map((observation) => (
            <li
              key={observation.index}
              data-world-note
              className="world-observation"
            >
              <p className="world-observation__label">
                <span aria-hidden="true">{observation.index}</span>
                {observation.label}
              </p>
              <p className="world-observation__copy">{observation.text}</p>
            </li>
          ))}
        </ol>

        <div className="world-progress" aria-hidden="true">
          <span />
        </div>

        <div data-world-outro aria-hidden="true" className="world-outro" />
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
