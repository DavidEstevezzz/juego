'use client';

import { useCallback, useEffect, useRef, type PointerEvent } from 'react';
import { chapterMap, dragaChapterContent } from '@/content/chapters';
import { media } from '@/content/media';
import { useExperienceTimeline } from '@/lib/experience/gsap';
import { prefersReducedMotion } from '@/lib/experience/motion-preferences';
import { useExperienceStore } from '@/lib/experience/store';
import type { MediaSubjectSource } from '@/types/experience';
import { MediaSubject } from '../media-subject';

const chapter = chapterMap.draga;
const content = dragaChapterContent;
const subject: MediaSubjectSource = {
  kind: 'image',
  image: media.images.draga,
  width: 1920,
  height: 1020,
};
const imageSizes = '(max-width: 759px) 100vw, (max-width: 1199px) 85vw, 75vw';
const FINE_POINTER =
  '(hover: hover) and (pointer: fine) and (min-width: 760px)';

/**
 * A quiet, natural-flow collage. Only the peripheral sheets move: the face,
 * typography and reading order never depend on scroll or pointer input.
 */
export function DragaSection() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pointerFrame = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const canMove = useRef(false);
  const hasEntered = useRef(false);
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);

  const resetDepth = useCallback(() => {
    // Cancel before resetting: an already queued frame must not undo the reset.
    if (pointerFrame.current !== null) {
      window.cancelAnimationFrame(pointerFrame.current);
      pointerFrame.current = null;
    }
    stage.current?.style.removeProperty('--draga-depth-x');
    stage.current?.style.removeProperty('--draga-depth-y');
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia(FINE_POINTER);
    const update = () => {
      const { reducedMotion, documentVisible, graphicsTier } =
        useExperienceStore.getState();
      canMove.current =
        finePointer.matches &&
        !prefersReducedMotion() &&
        !reducedMotion &&
        documentVisible &&
        graphicsTier !== 'c';
      if (!canMove.current) resetDepth();
    };
    update();
    finePointer.addEventListener('change', update);
    const unsubscribe = useExperienceStore.subscribe((state, previous) => {
      if (
        state.reducedMotion !== previous.reducedMotion ||
        state.documentVisible !== previous.documentVisible ||
        state.graphicsTier !== previous.graphicsTier
      ) {
        update();
      }
    });

    return () => {
      canMove.current = false;
      unsubscribe();
      finePointer.removeEventListener('change', update);
      resetDepth();
    };
  }, [resetDepth]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== 'mouse' || !canMove.current) return;
      pointer.current = { x: event.clientX, y: event.clientY };
      if (pointerFrame.current !== null) return;

      // One frame per input batch, not a permanent render loop or a React update.
      pointerFrame.current = window.requestAnimationFrame(() => {
        pointerFrame.current = null;
        const element = stage.current;
        if (!element || !canMove.current) return;
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = Math.max(
          -1,
          Math.min(1, ((pointer.current.x - rect.left) / rect.width - 0.5) * 2),
        );
        const y = Math.max(
          -1,
          Math.min(1, ((pointer.current.y - rect.top) / rect.height - 0.5) * 2),
        );
        element.style.setProperty('--draga-depth-x', `${x * 6}px`);
        element.style.setProperty('--draga-depth-y', `${y * 4}px`);
      });
    },
    [],
  );

  useExperienceTimeline(
    root,
    ({ gsap, ScrollTrigger, scope }) => {
      // The shared store is hydrated in an effect; respect the OS immediately.
      if (
        prefersReducedMotion() ||
        graphicsTier === 'c' ||
        hasEntered.current ||
        !window.matchMedia(FINE_POINTER).matches
      )
        return;

      const sheets = scope.querySelectorAll('[data-draga-settle]');
      const condensation = scope.querySelector('[data-draga-condensation]');
      const entrance = gsap
        .timeline({ paused: true })
        .fromTo(
          sheets,
          { y: 12 },
          {
            y: 0,
            duration: 1.15,
            stagger: 0.08,
            ease: 'power3.out',
            clearProps: 'transform',
          },
        )
        .fromTo(
          condensation,
          { opacity: 0.32 },
          { opacity: 0, duration: 1.1, ease: 'power2.out' },
          0,
        );

      ScrollTrigger.create({
        trigger: scope.querySelector('[data-draga-collage]'),
        start: 'top 80%',
        once: true,
        onEnter: () => {
          hasEntered.current = true;
          entrance.play();
        },
      });
    },
    [graphicsTier],
  );

  return (
    <section
      ref={root}
      id={chapter.id}
      data-chapter={chapter.id}
      aria-labelledby="draga-title"
      className="draga-chapter"
    >
      <div className="draga-study">
        <header className="draga-study__heading">
          <p>{content.deckLabel}</p>
          <span aria-hidden="true" />
          <p>{content.category}</p>
        </header>

        <div
          ref={stage}
          data-draga-collage
          className="draga-collage"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetDepth}
          onPointerCancel={resetDepth}
        >
          <figure className="draga-portrait">
            <div className="draga-portrait__stack">
              <div className="draga-layer draga-layer--ash" aria-hidden="true">
                <div data-draga-settle className="draga-layer__entrance">
                  <div className="draga-layer__depth">
                    <div className="draga-sheet draga-sheet--ash" />
                  </div>
                </div>
              </div>

              <div
                className="draga-layer draga-layer--water"
                aria-hidden="true"
              >
                <div data-draga-settle className="draga-layer__entrance">
                  <div className="draga-layer__depth">
                    <div className="draga-sheet draga-sheet--water">
                      <MediaSubject
                        source={subject}
                        sizes={imageSizes}
                        className="draga-environment"
                        focal={[1, 0.5]}
                        decorative
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="draga-layer draga-layer--portrait">
                <div className="draga-sheet draga-sheet--portrait">
                  <MediaSubject source={subject} sizes={imageSizes} />
                  <div className="draga-portrait__edge" aria-hidden="true" />
                  <div
                    data-draga-condensation
                    className="draga-portrait__condensation"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div
                className="draga-layer draga-layer--fragment"
                aria-hidden="true"
              >
                <div data-draga-settle className="draga-layer__entrance">
                  <div className="draga-layer__depth">
                    <div className="draga-sheet draga-sheet--fragment">
                      <MediaSubject
                        source={subject}
                        sizes={imageSizes}
                        className="draga-fabric"
                        focal={[0.26, 1]}
                        decorative
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <figcaption className="draga-portrait__caption">
              <span aria-hidden="true">{chapter.index} /</span>
              {content.imageCaption}
            </figcaption>
          </figure>

          <div className="draga-copy">
            <p className="draga-copy__role">{content.role}</p>
            <h2 id="draga-title">{content.name}</h2>
            <div className="draga-copy__biography">
              <span className="draga-copy__rule" aria-hidden="true" />
              <p
                className={
                  !content.biography ? 'draga-copy__pending' : undefined
                }
              >
                {content.biography ?? content.pendingBiography}
              </p>
            </div>
          </div>
        </div>

        <footer className="draga-study__footer">
          <span aria-hidden="true" />
          <p>{content.gameTitle}</p>
        </footer>
      </div>
    </section>
  );
}
