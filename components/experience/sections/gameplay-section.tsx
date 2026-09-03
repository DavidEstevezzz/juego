'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { chapterMap, gameplayChapterContent } from '@/content/chapters';
import { media } from '@/content/media';
import {
  clearChapterProgress,
  setChapterProgress,
} from '@/lib/experience/chapter-progress';
import { useExperienceTimeline } from '@/lib/experience/gsap';
import { useExperienceStore } from '@/lib/experience/store';
import type { ResponsiveImage } from '@/types/experience';

const chapter = chapterMap.gameplay;
const content = gameplayChapterContent;
const stateScrollPoints = [0.17, 0.52, 0.82] as const;

const gameplayMedia = {
  corridor: { image: media.images.corridor, width: 1920, height: 1049 },
  frozenDeck: { image: media.images.frozenDeck, width: 1920, height: 1049 },
  atrium: { image: media.images.atrium, width: 1920, height: 1080 },
} as const;

/**
 * Chapter 03 — The gameplay promise.
 *
 * Desktop behaves as one continuous observation window. Black bulkheads close
 * over each capture, the image swaps while fully covered, and the next state
 * opens without a crossfade. Mobile and reduced motion keep the same semantic
 * order as three static editorial chapters with the complete gameplay frame.
 */
export function GameplaySection() {
  const root = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);

  const updateActiveIndex = useCallback((nextIndex: number) => {
    if (activeIndexRef.current === nextIndex) return;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  }, []);

  useEffect(() => () => clearChapterProgress('gameplay'), []);

  useExperienceTimeline(root, ({ gsap, ScrollTrigger, scope }) => {
    const stage = scope.querySelector<HTMLElement>('[data-gameplay-stage]');
    const heading = scope.querySelector<HTMLElement>('[data-gameplay-heading]');
    const evidence = scope.querySelector<HTMLElement>(
      '[data-gameplay-evidence]',
    );
    const mediaLayers = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-gameplay-media]'),
    );
    const copies = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-gameplay-copy]'),
    );
    const titles = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-gameplay-title]'),
    );
    const bodies = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-gameplay-body]'),
    );
    const shutterTop = scope.querySelector<HTMLElement>(
      '[data-gameplay-shutter="top"]',
    );
    const shutterBottom = scope.querySelector<HTMLElement>(
      '[data-gameplay-shutter="bottom"]',
    );
    const seam = scope.querySelector<HTMLElement>('[data-gameplay-seam]');
    const exitLeft = scope.querySelector<HTMLElement>(
      '[data-gameplay-exit="left"]',
    );
    const exitRight = scope.querySelector<HTMLElement>(
      '[data-gameplay-exit="right"]',
    );
    const exitSeam = scope.querySelector<HTMLElement>(
      '[data-gameplay-exit-seam]',
    );
    ScrollTrigger.create({
      trigger: scope,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) =>
        setChapterProgress('gameplay', { coverage: self.progress }),
    });

    gsap.set(mediaLayers, { opacity: 0, scale: 1.065 });
    gsap.set(mediaLayers[0], { opacity: 1 });
    gsap.set(copies, { opacity: 0 });
    gsap.set(titles, { yPercent: 118 });
    gsap.set(bodies, { opacity: 0, y: 16 });
    gsap.set([heading, evidence], { opacity: 0, y: -10 });
    gsap.set([shutterTop, shutterBottom], { yPercent: 0 });
    gsap.set(seam, {
      autoAlpha: 1,
      scaleX: 0.08,
      transformOrigin: 'center center',
    });
    gsap.set(exitLeft, { xPercent: -100 });
    gsap.set(exitRight, { xPercent: 100 });
    gsap.set(exitSeam, {
      autoAlpha: 0,
      scaleY: 0.08,
      transformOrigin: 'center center',
    });

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.45,
        onUpdate: (self) => {
          const progress = self.progress;
          const nextIndex = progress < 0.4 ? 0 : progress < 0.72 ? 1 : 2;
          updateActiveIndex(nextIndex);
          setChapterProgress('gameplay', { progress });
          stage?.style.setProperty('--gameplay-progress', progress.toFixed(4));
        },
      },
    });

    timeline
      // Entry — Driftwood collapses into a scarlet seam, then the ship opens.
      .to(seam, { scaleX: 1, duration: 6, ease: 'power2.inOut' }, 0)
      .to(shutterTop, { yPercent: -100, duration: 11 }, 4)
      .to(shutterBottom, { yPercent: 100, duration: 11 }, 4)
      .to(seam, { autoAlpha: 0, duration: 4, ease: 'power2.out' }, 11)
      .to(
        [heading, evidence],
        {
          opacity: 1,
          y: 0,
          duration: 7,
          stagger: 0.6,
        },
        7,
      )

      // Explore.
      .set(copies[0], { opacity: 1 }, 9)
      .to(titles[0], { yPercent: 0, duration: 8 }, 9)
      .to(bodies[0], { opacity: 1, y: 0, duration: 6 }, 12)
      .to(mediaLayers[0], { scale: 1.025, duration: 31, ease: 'none' }, 7)
      .to(copies[0], { opacity: 0, y: -18, duration: 5 }, 30)

      // First bulkhead closure and concealed swap to Endure.
      .to(shutterTop, { yPercent: 0, duration: 7 }, 31)
      .to(shutterBottom, { yPercent: 0, duration: 7 }, 31)
      .to(seam, { autoAlpha: 1, scaleX: 1, duration: 3 }, 35)
      .set(mediaLayers[0], { opacity: 0 }, 38)
      .set(mediaLayers[1], { opacity: 1 }, 38)
      .to(shutterTop, { yPercent: -100, duration: 9 }, 38)
      .to(shutterBottom, { yPercent: 100, duration: 9 }, 38)
      .to(seam, { autoAlpha: 0, duration: 4 }, 42)

      // Endure.
      .set(copies[1], { opacity: 1 }, 42)
      .to(titles[1], { yPercent: 0, duration: 8 }, 42)
      .to(bodies[1], { opacity: 1, y: 0, duration: 6 }, 45)
      .to(mediaLayers[1], { scale: 1.025, duration: 29, ease: 'none' }, 38)
      .to(copies[1], { opacity: 0, y: -18, duration: 5 }, 62)

      // Second bulkhead closure and concealed swap to Confront.
      .to(shutterTop, { yPercent: 0, duration: 7 }, 63)
      .to(shutterBottom, { yPercent: 0, duration: 7 }, 63)
      .to(seam, { autoAlpha: 1, scaleX: 1, duration: 3 }, 67)
      .set(mediaLayers[1], { opacity: 0 }, 70)
      .set(mediaLayers[2], { opacity: 1 }, 70)
      .to(shutterTop, { yPercent: -100, duration: 9 }, 70)
      .to(shutterBottom, { yPercent: 100, duration: 9 }, 70)
      .to(seam, { autoAlpha: 0, duration: 4 }, 74)

      // Confront.
      .set(copies[2], { opacity: 1 }, 74)
      .to(titles[2], { yPercent: 0, duration: 8 }, 74)
      .to(bodies[2], { opacity: 1, y: 0, duration: 6 }, 77)
      .to(mediaLayers[2], { scale: 1.02, duration: 27, ease: 'none' }, 70)
      .to(copies[2], { opacity: 0, y: -18, duration: 5 }, 91)

      // Exit — the horizontal observation window becomes a vertical cut.
      .to(
        [heading, evidence],
        {
          opacity: 0,
          y: -8,
          duration: 5,
        },
        93,
      )
      .to(exitLeft, { xPercent: 0, duration: 8, ease: 'power2.inOut' }, 92)
      .to(exitRight, { xPercent: 0, duration: 8, ease: 'power2.inOut' }, 92)
      .to(exitSeam, { autoAlpha: 1, scaleY: 1, duration: 5 }, 95);
  });

  const jumpToPillar = useCallback(
    (index: number) => {
      const section = root.current;
      const pillar = section?.querySelector<HTMLElement>(
        `[data-gameplay-pillar="${index}"]`,
      );
      if (!section || !pillar) return;

      updateActiveIndex(index);

      if (
        reducedMotion ||
        window.innerWidth < 900 ||
        window.innerHeight < 600
      ) {
        pillar.scrollIntoView({ block: 'start' });
        return;
      }

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(section.offsetHeight - window.innerHeight, 0);
      window.scrollTo({
        top: sectionTop + travel * stateScrollPoints[index],
        behavior: 'auto',
      });
    },
    [reducedMotion, updateActiveIndex],
  );

  return (
    <section
      ref={root}
      id={chapter.id}
      data-chapter={chapter.id}
      aria-labelledby="gameplay-title"
      lang="en"
      className="gameplay-chapter relative border-t border-[color:var(--border-subtle)]"
    >
      <div data-gameplay-stage className="gameplay-stage">
        <ol className="gameplay-pillars">
          {content.pillars.map((pillar, index) => {
            const mediaEntry = gameplayMedia[pillar.media];
            const titleId = `gameplay-${pillar.id}-title`;

            return (
              <li
                key={pillar.id}
                id={`gameplay-${pillar.id}`}
                data-gameplay-pillar={index}
                className="gameplay-pillar"
                aria-labelledby={titleId}
              >
                <div
                  data-gameplay-media
                  data-gameplay-id={pillar.id}
                  className="gameplay-pillar__media"
                >
                  <GameplayPicture {...mediaEntry} />
                </div>

                <article data-gameplay-copy className="gameplay-pillar__copy">
                  <p className="gameplay-pillar__directive">
                    <span aria-hidden="true">{pillar.index} / 03</span>
                    {pillar.directive}
                  </p>
                  <div className="gameplay-pillar__title-mask">
                    <h3
                      id={titleId}
                      data-gameplay-title
                      className="gameplay-pillar__title"
                    >
                      {pillar.title}
                    </h3>
                  </div>
                  <p
                    data-gameplay-body
                    className="gameplay-pillar__description"
                  >
                    {pillar.description}
                  </p>
                </article>
              </li>
            );
          })}
        </ol>

        <div className="gameplay-veil" aria-hidden="true" />

        <div
          data-gameplay-shutter="top"
          className="gameplay-shutter gameplay-shutter--top"
          aria-hidden="true"
        />
        <div
          data-gameplay-shutter="bottom"
          className="gameplay-shutter gameplay-shutter--bottom"
          aria-hidden="true"
        />
        <div data-gameplay-seam className="gameplay-seam" aria-hidden="true" />

        <header data-gameplay-heading className="gameplay-heading">
          <p>{content.deckLabel}</p>
          <span aria-hidden="true" />
          <div>
            <p>{content.category}</p>
            <h2 id="gameplay-title">{content.heading}</h2>
          </div>
        </header>

        <p data-gameplay-evidence className="gameplay-evidence">
          {content.evidenceLabel}
        </p>

        <nav
          data-gameplay-navigation
          className="gameplay-state-nav"
          aria-label="Gameplay pillars"
        >
          {content.pillars.map((pillar, index) => (
            <button
              key={pillar.id}
              type="button"
              aria-label={`${pillar.title}, ${Number(pillar.index)} of ${content.pillars.length}`}
              aria-current={activeIndex === index ? 'step' : undefined}
              aria-controls={`gameplay-${pillar.id}`}
              onClick={() => jumpToPillar(index)}
              className="gameplay-state-nav__item focus-ring"
            >
              <span aria-hidden="true" className="gameplay-state-nav__rule" />
              <span aria-hidden="true">{pillar.index} / 03</span>
              <span className="gameplay-state-nav__label">{pillar.title}</span>
            </button>
          ))}
        </nav>

        <div className="gameplay-progress" aria-hidden="true">
          <span />
        </div>

        <div
          data-gameplay-exit="left"
          className="gameplay-exit gameplay-exit--left"
          aria-hidden="true"
        />
        <div
          data-gameplay-exit="right"
          className="gameplay-exit gameplay-exit--right"
          aria-hidden="true"
        />
        <div
          data-gameplay-exit-seam
          className="gameplay-exit-seam"
          aria-hidden="true"
        />
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
  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`${image.avif.small} 960w, ${image.avif.large} 1920w`}
        sizes="(max-width: 767px) calc(100vw - 2.5rem), 100vw"
      />
      <source
        type="image/webp"
        srcSet={`${image.webp.small} 960w, ${image.webp.large} 1920w`}
        sizes="(max-width: 767px) calc(100vw - 2.5rem), 100vw"
      />
      {/* oxlint-disable-next-line next/no-img-element */}
      <img
        src={image.webp.large}
        alt={image.alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
