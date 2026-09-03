'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { chapterMap, gameplayChapterContent } from '@/content/chapters';
import { media } from '@/content/media';
import { useExperienceTimeline } from '@/lib/experience/gsap';
import type { ResponsiveImage } from '@/types/experience';

const chapter = chapterMap.gameplay;
const content = gameplayChapterContent;

const gameplayMedia = {
  corridor: { image: media.images.corridor, width: 1920, height: 1049 },
  frozenDeck: { image: media.images.frozenDeck, width: 1920, height: 1049 },
  atrium: { image: media.images.atrium, width: 1920, height: 1080 },
} as const;

type PointerPosition = { x: number; y: number };

/**
 * Chapter 03 — The gameplay promise.
 *
 * Driftwood already owns the long, scroll-led sequence. Gameplay changes the
 * interaction grammar: three apertures remain in the natural document flow and
 * respond directly to pointer, focus and touch. The selected capture expands
 * without cropping its HUD; GSAP is limited to one short entrance reveal.
 */
export function GameplaySection() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pointerFrame = useRef<number | null>(null);
  const pointerPosition = useRef<PointerPosition>({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(0);

  const activatePillar = useCallback((index: number) => {
    setActiveIndex((current) => (current === index ? current : index));
  }, []);

  const renderPointerPosition = useCallback(() => {
    pointerFrame.current = null;

    const element = stage.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const normalizedX = Math.min(
      Math.max((pointerPosition.current.x - rect.left) / rect.width, 0),
      1,
    );
    const normalizedY = Math.min(
      Math.max((pointerPosition.current.y - rect.top) / rect.height, 0),
      1,
    );

    element.style.setProperty('--gameplay-pointer-x', `${normalizedX * 100}%`);
    element.style.setProperty('--gameplay-pointer-y', `${normalizedY * 100}%`);
    element.style.setProperty(
      '--gameplay-shift-x',
      `${(normalizedX - 0.5) * -10}px`,
    );
    element.style.setProperty(
      '--gameplay-shift-y',
      `${(normalizedY - 0.5) * -6}px`,
    );
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'touch') return;

      pointerPosition.current = { x: event.clientX, y: event.clientY };
      if (pointerFrame.current !== null) return;

      pointerFrame.current = window.requestAnimationFrame(
        renderPointerPosition,
      );
    },
    [renderPointerPosition],
  );

  const resetPointerLight = useCallback(() => {
    const element = stage.current;
    if (!element) return;

    element.style.setProperty('--gameplay-pointer-x', '50%');
    element.style.setProperty('--gameplay-pointer-y', '42%');
    element.style.setProperty('--gameplay-shift-x', '0px');
    element.style.setProperty('--gameplay-shift-y', '0px');
  }, []);

  useEffect(
    () => () => {
      if (pointerFrame.current !== null) {
        window.cancelAnimationFrame(pointerFrame.current);
      }
    },
    [],
  );

  useExperienceTimeline(root, ({ gsap, ScrollTrigger, scope }) => {
    const intro = scope.querySelector<HTMLElement>('[data-gameplay-intro]');
    const panels = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-gameplay-panel]'),
    );
    const footer = scope.querySelector<HTMLElement>('[data-gameplay-footer]');

    gsap.set(intro, { opacity: 0, y: 22 });
    gsap.set(panels, {
      opacity: 0,
      y: 28,
      clipPath: 'inset(100% 0 0 0)',
    });
    gsap.set(footer, { opacity: 0, y: 14 });

    const entrance = gsap
      .timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
      })
      .to(intro, { opacity: 1, y: 0, duration: 0.8 })
      .to(
        panels,
        {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.05,
          stagger: 0.09,
        },
        0.14,
      )
      .to(footer, { opacity: 1, y: 0, duration: 0.65 }, 0.55);

    ScrollTrigger.create({
      trigger: scope,
      start: 'top 78%',
      once: true,
      onEnter: () => entrance.play(),
    });
  });

  const activePillar = content.pillars[activeIndex];

  return (
    <section
      ref={root}
      id={chapter.id}
      data-chapter={chapter.id}
      aria-labelledby="gameplay-title"
      lang="en"
      className="gameplay-chapter relative border-t border-[color:var(--border-subtle)]"
    >
      <div className="gameplay-lab">
        <header data-gameplay-intro className="gameplay-lab__intro">
          <div className="gameplay-lab__meta">
            <p>{content.deckLabel}</p>
            <span aria-hidden="true" />
            <p>{content.category}</p>
          </div>

          <div className="gameplay-lab__lockup">
            <h2 id="gameplay-title">{content.heading}</h2>
            <p>{chapter.summary}</p>
          </div>

          <p className="gameplay-lab__evidence">{content.evidenceLabel}</p>
        </header>

        <div
          ref={stage}
          data-gameplay-stage
          data-active-index={activeIndex}
          className="gameplay-lab__stage"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetPointerLight}
        >
          <div className="gameplay-lab__pointer-light" aria-hidden="true" />
          <div className="gameplay-lab__signal" aria-hidden="true">
            <span />
          </div>

          <ol aria-label="Gameplay pillars" className="gameplay-lab__apertures">
            {content.pillars.map((pillar, index) => {
              const isActive = activeIndex === index;
              const mediaEntry = gameplayMedia[pillar.media];
              const titleId = `gameplay-${pillar.id}-title`;
              const descriptionId = `gameplay-${pillar.id}-description`;

              return (
                <li
                  key={pillar.id}
                  data-gameplay-panel
                  data-active={isActive || undefined}
                  className="gameplay-aperture"
                  onPointerEnter={(event) => {
                    if (event.pointerType !== 'touch') activatePillar(index);
                  }}
                >
                  <article
                    id={`gameplay-${pillar.id}`}
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    className="gameplay-aperture__surface"
                  >
                    <div className="gameplay-aperture__media">
                      <GameplayPicture {...mediaEntry} />
                    </div>

                    <div
                      className="gameplay-aperture__atmosphere"
                      aria-hidden="true"
                    />
                    <div
                      className="gameplay-aperture__scan"
                      aria-hidden="true"
                    />

                    <div className="gameplay-aperture__copy">
                      <p className="gameplay-aperture__directive">
                        <span aria-hidden="true">{pillar.index} / 03</span>
                        {pillar.directive}
                      </p>
                      <h3 id={titleId}>{pillar.title}</h3>
                      <p id={descriptionId}>{pillar.description}</p>
                    </div>

                    <div
                      className="gameplay-aperture__closed-label"
                      aria-hidden="true"
                    >
                      <span>{pillar.index}</span>
                      <strong>{pillar.title}</strong>
                    </div>

                    <button
                      type="button"
                      className="gameplay-aperture__trigger"
                      aria-label={`Select ${pillar.title}`}
                      aria-describedby={descriptionId}
                      aria-pressed={isActive}
                      onFocus={() => activatePillar(index)}
                      onClick={() => activatePillar(index)}
                    />
                  </article>
                </li>
              );
            })}
          </ol>
        </div>

        <footer data-gameplay-footer className="gameplay-lab__footer">
          <div>
            <p>{content.interactionLabel}</p>
            <span>{content.inputLabel}</span>
          </div>
          <p aria-hidden="true">
            <span>{activePillar.index} / 03</span>
            {activePillar.title}
          </p>
        </footer>
      </div>
    </section>
  );
}

function GameplayPicture({
  image,
  width,
  height,
}: {
  image: ResponsiveImage;
  width: number;
  height: number;
}) {
  const objectPosition = `${image.focal[0] * 100}% ${image.focal[1] * 100}%`;

  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`${image.avif.small} 960w, ${image.avif.large} 1920w`}
        sizes="(max-width: 899px) calc(100vw - 2.5rem), 70vw"
      />
      <source
        type="image/webp"
        srcSet={`${image.webp.small} 960w, ${image.webp.large} 1920w`}
        sizes="(max-width: 899px) calc(100vw - 2.5rem), 70vw"
      />
      {/* oxlint-disable-next-line next/no-img-element */}
      <img
        src={image.webp.large}
        alt={image.alt}
        width={width}
        height={height}
        style={{ objectPosition }}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
