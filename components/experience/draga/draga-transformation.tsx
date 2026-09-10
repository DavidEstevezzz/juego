'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Fingerprint, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  prefersReducedMotion,
  subscribeReducedMotion,
} from '@/lib/experience/motion-preferences';
import {
  advanceInfection,
  infectionContour,
} from '@/lib/experience/draga-transformation';

type Phase = 'idle' | 'holding' | 'returning' | 'infected';

export function DragaTransformation() {
  const stage = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const human = useRef<HTMLImageElement>(null);
  const infected = useRef<HTMLImageElement>(null);
  const runtime = useRef({
    progress: 0,
    phase: 'idle' as Phase,
    frame: 0,
    last: 0,
  });
  const keyHandled = useRef(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [loaded, setLoaded] = useState({ human: false, infected: false });
  const [failed, setFailed] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => true,
  );
  const ready = loaded.human && loaded.infected && !failed;

  const paint = useCallback((progress: number) => {
    if (overlay.current)
      overlay.current.style.clipPath = infectionContour(progress);
    if (fill.current) fill.current.style.transform = `scaleX(${progress})`;
    stage.current?.style.setProperty(
      '--infection-pressure',
      String(Math.sin(progress * Math.PI)),
    );
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(runtime.current.frame);
    runtime.current = { progress: 0, phase: 'idle', frame: 0, last: 0 };
    paint(0);
    setPhase('idle');
  }, [paint]);

  const complete = useCallback(() => {
    cancelAnimationFrame(runtime.current.frame);
    runtime.current.progress = 1;
    runtime.current.phase = 'infected';
    runtime.current.frame = 0;
    paint(1);
    setPhase('infected');
  }, [paint]);

  const animate = useCallback(() => {
    cancelAnimationFrame(runtime.current.frame);
    runtime.current.last = performance.now();
    function tick(now: number) {
      const state = runtime.current;
      state.progress = advanceInfection(
        state.progress,
        now - state.last,
        state.phase === 'holding',
      );
      state.last = now;
      paint(state.progress);
      if (state.progress >= 1) {
        complete();
        return;
      }
      if (state.progress <= 0 && state.phase !== 'holding') {
        reset();
        return;
      }
      state.frame = requestAnimationFrame(tick);
    }
    runtime.current.frame = requestAnimationFrame(tick);
  }, [paint, complete, reset]);

  const start = () => {
    if (
      !ready ||
      runtime.current.phase === 'infected' ||
      runtime.current.phase === 'holding'
    )
      return;
    if (reduced) {
      complete();
      return;
    }
    runtime.current.phase = 'holding';
    setPhase('holding');
    animate();
  };

  const release = useCallback(() => {
    if (runtime.current.phase !== 'holding') return;
    runtime.current.phase = 'returning';
    setPhase('returning');
    animate();
  }, [animate]);

  useEffect(() => {
    const check = () => {
      setLoaded({
        human: !!human.current?.naturalWidth,
        infected: !!infected.current?.naturalWidth,
      });
    };
    // Handle cache hits that predate hydration, without depending on the homepage runtime.
    queueMicrotask(check);
    const hide = () => {
      if (document.hidden && runtime.current.phase !== 'infected') reset();
    };
    const blur = () => {
      if (runtime.current.phase !== 'infected') reset();
    };
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('blur', blur);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && runtime.current.phase !== 'infected')
        reset();
    });
    if (stage.current) observer.observe(stage.current);
    return () => {
      cancelAnimationFrame(runtime.current.frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('blur', blur);
    };
  }, [reset]);

  useEffect(() => {
    return subscribeReducedMotion(() => {
      if (runtime.current.phase !== 'infected') reset();
    });
  }, [reset]);

  return (
    <figure className="draga-transform" data-phase={phase}>
      <div className="draga-transform__stage" ref={stage}>
        <picture>
          <source
            type="image/avif"
            srcSet="/assets/media/images/draga-human-expanded-960.avif 960w, /assets/media/images/draga-human-expanded-1600.avif 1600w"
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          {/* oxlint-disable-next-line next/no-img-element */}
          <img
            ref={human}
            src="/assets/media/images/draga-human-expanded-1600.webp"
            alt="Draga in his human form, wearing his weathered sailor’s clothes."
            width={1280}
            height={1600}
            loading="lazy"
            onLoad={() => setLoaded((s) => ({ ...s, human: true }))}
            onError={() => setFailed(true)}
          />
        </picture>
        <div
          ref={overlay}
          className="draga-transform__infected"
          aria-hidden={phase !== 'infected'}
        >
          <picture>
            <source
              type="image/avif"
              srcSet="/assets/media/images/draga-infected-expanded-960.avif 960w, /assets/media/images/draga-infected-expanded-1600.avif 1600w"
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            {/* oxlint-disable-next-line next/no-img-element */}
            <img
              ref={infected}
              src="/assets/media/images/draga-infected-expanded-1600.webp"
              alt="Draga transformed: fleshy tentacles extend from his infected arm."
              width={1280}
              height={1600}
              loading="lazy"
              onLoad={() => setLoaded((s) => ({ ...s, infected: true }))}
              onError={() => setFailed(true)}
            />
          </picture>
        </div>
        <div className="draga-transform__vignette" aria-hidden="true" />
        <div
          className="draga-transform__state production-label"
          aria-hidden="true"
        >
          <span>04 / Character study</span>
          <span>{phase === 'infected' ? 'The vessel' : 'The man'}</span>
        </div>
      </div>
      <figcaption className="draga-transform__controls">
        <div className="draga-transform__instruction">
          <p className="production-label">
            {phase === 'infected'
              ? 'The infection takes hold.'
              : 'Something beneath the skin.'}
          </p>
          <p id="draga-hold-help">
            {failed
              ? 'The portraits could not load. Reload the page to try again.'
              : !ready
                ? 'Preparing the transformation…'
                : phase === 'infected'
                  ? 'The man is still in there.'
                  : reduced
                    ? 'Reveal the other side of Draga.'
                    : 'Hold to let it in. Release to resist.'}
          </p>
        </div>
        <div className="draga-transform__actions">
          {phase === 'infected' ? (
            <Button variant="ghost" className="draga-hold" onClick={reset}>
              <RotateCcw aria-hidden="true" />
              Return to human
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="draga-hold"
              disabled={!ready}
              aria-describedby="draga-hold-help"
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                start();
              }}
              onPointerUp={release}
              onPointerCancel={release}
              onLostPointerCapture={release}
              onBlur={release}
              onContextMenu={(event) => event.preventDefault()}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  reset();
                  return;
                }
                if (event.key === ' ' || event.key === 'Enter') {
                  event.preventDefault();
                  keyHandled.current = true;
                  if (!event.repeat) start();
                }
              }}
              onKeyUp={(event) => {
                if (event.key === ' ' || event.key === 'Enter') {
                  event.preventDefault();
                  release();
                  keyHandled.current = false;
                }
              }}
              onClick={(event) => {
                if (event.detail === 0 && !keyHandled.current && ready)
                  complete();
              }}
            >
              <Fingerprint aria-hidden="true" />
              <span>{reduced ? 'Reveal infection' : 'Hold to unleash'}</span>
              <span
                ref={fill}
                className="draga-hold__fill"
                aria-hidden="true"
              />
            </Button>
          )}
        </div>
        <output className="sr-only">
          {phase === 'infected'
            ? 'Transformation complete. Draga is infected.'
            : phase === 'idle'
              ? 'Draga is human.'
              : ''}
        </output>
        <p className="draga-transform__credit">
          AI-expanded portraits from original game imagery
        </p>
      </figcaption>
    </figure>
  );
}
