'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import type { gsap } from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import {
  chapterCountLabel,
  chapterMap,
  infectionChapterContent,
} from '@/content/chapters';
import { media } from '@/content/media';
import { useExperienceTimeline } from '@/lib/experience/gsap';
import {
  getInfectionFrame,
  resetInfectionFrame,
  updateInfectionFrame,
} from '@/lib/experience/infection-frame';
import {
  measureInfectionProgress,
  sampleInfection,
} from '@/lib/experience/infection-timeline';
import {
  subscribeLayoutChange,
  subscribeScrollMetrics,
} from '@/lib/experience/scroll-metrics';
import { useExperienceStore } from '@/lib/experience/store';
import { MediaSubject } from '../media-subject';

const chapter = chapterMap.infection;
const content = infectionChapterContent;
// CSS uses the same query: no hydration height change and a complete no-JS layout.
const CINEMATIC_QUERY =
  '(prefers-reduced-motion: no-preference) and (scripting: enabled) and (min-height: 600px)';

/** One continuous descent, with a complete editorial alternative. No new scroll listener. */
export function InfectionSection() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const pointerRaf = useRef<number | null>(null);
  const pointerPosition = useRef({ x: 0, y: 0 });
  const [cinematic, setCinematic] = useState(false);
  const ready = useExperienceStore((state) => state.infectionSceneReady);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const webglAvailable = useExperienceStore((state) => state.webglAvailable);
  const useWebgl =
    cinematic &&
    ready &&
    webglAvailable &&
    graphicsTier !== 'c' &&
    !reducedMotion;

  useEffect(() => {
    const query = window.matchMedia(CINEMATIC_QUERY);
    const sync = () => setCinematic(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const writeProgress = useCallback((progress: number) => {
    const element = stage.current;
    if (!element) return;
    const frame = sampleInfection(progress);
    element.style.setProperty(
      '--infection-room-edge',
      `${115 - frame.room * 130}%`,
    );
    element.style.setProperty(
      '--infection-presence-radius',
      `${frame.presence * 150}%`,
    );
    element.style.setProperty('--infection-red', `${frame.red * 0.2}`);
    element.style.setProperty('--infection-progress', String(frame.progress));
    element.dataset.phase = String(frame.phase);
    updateInfectionFrame({ progress: frame.progress });
  }, []);

  useExperienceTimeline(
    root,
    ({ gsap }) => {
      if (!cinematic || !window.matchMedia(CINEMATIC_QUERY).matches) return;
      const playhead = { progress: 0 };
      timeline.current = gsap.timeline({ paused: true }).to(playhead, {
        progress: 1,
        duration: 1,
        ease: 'none',
        onUpdate: () => writeProgress(playhead.progress),
      });
    },
    [cinematic],
  );

  const resetPointer = useCallback(() => {
    if (pointerRaf.current !== null) {
      window.cancelAnimationFrame(pointerRaf.current);
      pointerRaf.current = null;
    }
    updateInfectionFrame({ pointerActive: 0, pointerX: 0.5, pointerY: 0.5 });
  }, []);

  useEffect(() => {
    if (!cinematic || reducedMotion) {
      resetInfectionFrame();
      return;
    }
    const ownedTimeline = timeline.current;
    const sync = () => {
      if (!useExperienceStore.getState().documentVisible) return;
      const section = root.current;
      const element = stage.current;
      if (!section || !element) return;
      const bounds = section.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      const imageRect =
        element
          .querySelector('.infection-frame__image')
          ?.getBoundingClientRect() ?? rect;
      const visible =
        imageRect.bottom > 0 && imageRect.top < window.innerHeight;
      const progress = measureInfectionProgress(
        bounds.top,
        bounds.height,
        rect.top,
        rect.height,
      );
      updateInfectionFrame({
        visible,
        left: imageRect.left,
        top: imageRect.top,
        width: imageRect.width,
        height: imageRect.height,
      });
      if (!visible) {
        resetPointer();
        return;
      }
      // Explicitly allow callbacks: GSAP progress() suppresses them by default.
      ownedTimeline?.progress(progress, false);
      writeProgress(progress);
    };
    const stopScroll = subscribeScrollMetrics(sync);
    const stopLayout = subscribeLayoutChange(sync);
    const stopState = useExperienceStore.subscribe((state, previous) => {
      if (state.documentVisible !== previous.documentVisible) {
        if (state.documentVisible) sync();
        else {
          resetPointer();
          updateInfectionFrame({ visible: false });
        }
      }
      if (state.graphicsTier === 'c' && previous.graphicsTier !== 'c')
        resetPointer();
    });
    return () => {
      stopScroll();
      stopLayout();
      stopState();
      resetPointer();
      resetInfectionFrame();
      if (timeline.current === ownedTimeline) timeline.current = null;
    };
  }, [cinematic, reducedMotion, resetPointer, writeProgress]);

  const handlePointer = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const state = useExperienceStore.getState();
    if (
      event.pointerType !== 'mouse' ||
      !getInfectionFrame().visible ||
      state.reducedMotion ||
      !state.documentVisible ||
      state.graphicsTier === 'c'
    )
      return;
    pointerPosition.current = { x: event.clientX, y: event.clientY };
    if (pointerRaf.current !== null) return;
    pointerRaf.current = window.requestAnimationFrame(() => {
      pointerRaf.current = null;
      const rect = getInfectionFrame();
      if (!rect.width || !rect.height || !rect.visible) return;
      updateInfectionFrame({
        pointerX: Math.max(
          0,
          Math.min(1, (pointerPosition.current.x - rect.left) / rect.width),
        ),
        pointerY: Math.max(
          0,
          Math.min(1, (pointerPosition.current.y - rect.top) / rect.height),
        ),
        pointerActive: 1,
      });
    });
  }, []);

  return (
    <section
      ref={root}
      id={chapter.id}
      data-chapter={chapter.id}
      className="infection-chapter"
      aria-labelledby="infection-title"
    >
      <div
        ref={stage}
        className="infection-stage"
        data-webgl={useWebgl || undefined}
        data-phase="0"
        onPointerMove={handlePointer}
        onPointerLeave={resetPointer}
        onPointerCancel={resetPointer}
      >
        <header className="infection-heading">
          <div className="infection-heading__meta">
            <span>Deck {chapter.index}</span>
            <span aria-hidden="true" />
            <span>
              {chapter.index} / {chapterCountLabel}
            </span>
          </div>
          <p className="infection-heading__category">{content.category}</p>
          <h2 id="infection-title">
            <span>The</span> infection
          </h2>
        </header>

        <div className="infection-media">
          {content.phases.map((phase, index) => (
            <figure
              key={phase.id}
              className={`infection-frame infection-frame--${phase.id}`}
            >
              <div className="infection-frame__image">
                <MediaSubject
                  source={{
                    kind: 'image',
                    image: media.images[phase.media],
                    width: phase.width,
                    height: phase.height,
                  }}
                  sizes="100vw"
                />
              </div>
              <figcaption className="infection-frame__caption">
                <span>
                  {String(index + 1).padStart(2, '0')} / {phase.label}
                </span>
                <p>{phase.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="infection-atmosphere" aria-hidden="true" />
        <div className="infection-sequence" aria-hidden="true">
          <span className="infection-sequence__line" />
          <ol>
            {content.phases.map((phase, index) => (
              <li key={phase.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {phase.label}
              </li>
            ))}
          </ol>
        </div>
        <a href="#production" className="infection-continue">
          {content.continueLabel}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
