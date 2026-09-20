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
import { SCRUB_SECONDS, useExperienceTimeline } from '@/lib/experience/gsap';
import { useExperienceStore } from '@/lib/experience/store';
import { createStyleWriter } from '@/lib/experience/style-writer';
import {
  sampleWorld,
  WORLD_TIMELINE_LENGTH,
} from '@/lib/experience/world-timeline';
import type { ResponsiveImage } from '@/types/experience';

const chapter = chapterMap.world;
const content = worldChapterContent;

/** Total de observaciones, con el mismo formato de placa que la cubierta. */
const observationCountLabel = String(content.observations.length).padStart(
  2,
  '0',
);

/** Gods, then Ormora through water, then Driftwood through fog. */
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
      const outro = scope.querySelector<HTMLElement>('[data-world-outro]');
      const notes = Array.from(
        scope.querySelectorAll<HTMLElement>('[data-world-note]'),
      );

      // El capítulo entra y sale de la capa WebGL mediante la misma señal
      // compartida que usa el resto de la experiencia. Esta sí es la posición
      // cruda: solo decide presencia, no dibuja nada que se pueda ver saltar.
      ScrollTrigger.create({
        trigger: scope,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) =>
          setChapterProgress('world', { coverage: self.progress }),
      });

      // Se declara la composición antes del primer frame: si el navegador
      // decide promocionar la capa a mitad del fundido, ese frame se ve.
      const layers = [meta, outro, ...notes].filter(
        (element): element is HTMLElement => element !== null,
      );
      gsap.set(layers, { willChange: 'transform, opacity' });
      gsap.set(meta, { autoAlpha: 0, y: -10 });
      gsap.set(notes, { autoAlpha: 0, y: 24 });
      gsap.set(outro, { autoAlpha: 0 });
      gsap.set(seam, { scaleX: 0.08, transformOrigin: 'center center' });

      const writer = createStyleWriter(stage);
      const playhead = { progress: 0 };

      const publish = () => {
        const frame = sampleWorld(playhead.progress);

        setChapterProgress('world', { progress: frame.progress });
        writer.set('--world-progress', frame.progress);
        writer.set('--world-scene-mix', frame.sceneMix);
        writer.set('--world-ship-mix', frame.shipMix);
        writer.set('--world-whiteout', frame.whiteout);
        writer.set('--world-rain', frame.rain);
        writer.set('--world-squall', frame.squall);
      };

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB_SECONDS,
          // Con `svh` y medios diferidos, la altura de la sección cambia
          // después del primer cálculo; sin esto las marcas se quedan en la
          // posición vieja y la secuencia termina antes de tiempo.
          invalidateOnRefresh: true,
        },
      });

      // 00 — El reloj compartido. Va dentro de la timeline, así que lo que
      // escribe ya viene amortiguado por `scrub` igual que el resto de tweens.
      timeline
        .to(
          playhead,
          {
            progress: 1,
            duration: WORLD_TIMELINE_LENGTH,
            ease: 'none',
            onUpdate: publish,
          },
          0,
        )

        // 01 — Una fisura escarlata convierte el negro del hero en una abertura.
        .to(seam, { scaleX: 1, duration: 6, ease: 'power2.inOut' }, 0)
        .to(shutterTop, { yPercent: -100, duration: 10 }, 3)
        .to(shutterBottom, { yPercent: 100, duration: 10 }, 3)
        .to(seam, { autoAlpha: 0, duration: 4, ease: 'power2.out' }, 9)
        .to(meta, { autoAlpha: 1, y: 0, duration: 5 }, 8)

        // Each caption accompanies its own image, in the same lower-right slot.
        .to(notes[0], { autoAlpha: 1, y: 0, duration: 6 }, 13)
        .to(notes[0], { autoAlpha: 0, y: -18, duration: 5 }, 32)
        .to(notes[1], { autoAlpha: 1, y: 0, duration: 4 }, 49)
        .to(notes[1], { autoAlpha: 0, y: -18, duration: 3 }, 69)
        .to(notes[2], { autoAlpha: 1, y: 0, duration: 5 }, 86)

        // 04 — La tercera observación conserva su lectura completa (92–96) antes
        // de que una sombra ascendente se la lleve y deje preparada la entrada
        // al capítulo 03.
        .to(outro, { autoAlpha: 1, duration: 4, ease: 'power2.in' }, 96)
        .to(meta, { autoAlpha: 0, y: -8, duration: 4 }, 96);
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
        {!webglMode && (
          <>
            <div className="world-media" aria-hidden="true">
              <WorldPicture image={media.images.gods} />
              <WorldPicture image={media.images.ormora} />
              <WorldPicture image={media.images.world} />
            </div>
            <div aria-hidden="true" className="world-glass" />
          </>
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

        <h2 id="world-title" className="sr-only">The World</h2>

        <ol className="world-observations">
          {content.observations.map((observation) => (
            <li
              key={observation.index}
              data-world-note
              className="world-observation"
            >
              <p className="world-observation__index" aria-hidden="true">
                {observation.index} / {observationCountLabel}
              </p>
              <h3 className="world-observation__title">{observation.label}</h3>
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
