'use client';

import { useEffect, useRef, useState, type Ref } from 'react';
import { Button } from '@/components/ui/button';
import { productionChapterContent } from '@/content/chapters';
import { media } from '@/content/media';
import { createProductionReveal } from '@/lib/experience/production-reveal';
import { useExperienceStore } from '@/lib/experience/store';
import type { ResponsiveImage } from '@/types/experience';

const content = productionChapterContent.comparison;
type Mode = keyof typeof content.modes;

function SceneImage({
  image,
  imageRef,
  onLoad,
  onError,
  className,
}: {
  image: ResponsiveImage;
  imageRef?: Ref<HTMLImageElement>;
  onLoad: () => void;
  onError: () => void;
  className: string;
}) {
  return (
    <picture className={className}>
      <source
        type="image/avif"
        srcSet={`${image.avif.small} 960w, ${image.avif.large} 1920w`}
        sizes="(min-width: 1800px) 1680px, 100vw"
      />
      <img
        ref={imageRef}
        src={image.webp.large}
        srcSet={`${image.webp.small} 960w, ${image.webp.large} 1920w`}
        sizes="(min-width: 1800px) 1680px, 100vw"
        width={1920}
        height={996}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        onLoad={onLoad}
        onError={onError}
      />
    </picture>
  );
}

export function ProductionComparison() {
  const surface = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const blockout = useRef<HTMLImageElement>(null);
  const finished = useRef<HTMLImageElement>(null);
  const [requestedMode, setMode] = useState<Mode>('explore');
  const [finePointer, setFinePointer] = useState(false);
  const [baseReady, setBaseReady] = useState(false);
  const [finalReady, setFinalReady] = useState(false);
  const [finalDecoded, setFinalDecoded] = useState(false);
  const [baseFailed, setBaseFailed] = useState(false);
  const [finalFailed, setFinalFailed] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const tier = useExperienceStore((state) => state.graphicsTier);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const canExplore =
    finePointer &&
    !reducedMotion &&
    tier !== 'c' &&
    !canvasFailed &&
    !baseFailed &&
    !finalFailed;
  const mode: Mode = finalFailed
    ? 'blockout'
    : baseFailed
      ? 'final'
      : requestedMode === 'explore' && !canExplore
        ? 'blockout'
        : requestedMode;
  const ready = baseReady && finalReady;

  useEffect(() => {
    // Cached images can complete before hydration attaches React's load events.
    if (blockout.current?.complete) {
      if (blockout.current.naturalWidth) setBaseReady(true);
      else setBaseFailed(true);
    }
    if (finished.current?.complete) {
      if (finished.current.naturalWidth) setFinalReady(true);
      else setFinalFailed(true);
    }
  }, []);

  useEffect(() => {
    if (!finalReady || !finished.current) return;
    let disposed = false;
    finished.current
      .decode()
      .then(() => {
        if (!disposed) setFinalDecoded(true);
      })
      .catch(() => {
        // DOM can still show the image; only disable the animated enhancement.
        if (!disposed) setCanvasFailed(true);
      });
    return () => {
      disposed = true;
    };
  }, [finalReady]);

  useEffect(() => {
    const query = window.matchMedia(
      '(any-hover: hover) and (any-pointer: fine)',
    );
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (
      mode !== 'explore' ||
      !canExplore ||
      !ready ||
      !finalDecoded ||
      !surface.current ||
      !canvas.current ||
      !finished.current
    )
      return;
    return createProductionReveal(
      surface.current,
      canvas.current,
      finished.current,
      tier === 'a' ? 1600 : 1100,
      () => setCanvasFailed(true),
    );
  }, [mode, canExplore, ready, finalDecoded, tier]);

  return (
    <figure
      className="production-comparison"
      aria-labelledby="production-comparison-title"
    >
      <div className="production-comparison__toolbar">
        <div>
          <p className="production-label">{content.label}</p>
          <h3 id="production-comparison-title">{content.title}</h3>
        </div>
        <fieldset
          className="production-modes"
          aria-label="Scene comparison view"
        >
          {(Object.entries(content.modes) as [Mode, string][]).map(
            ([value, label]) => (
              <Button
                key={value}
                variant="ghost"
                className="production-mode"
                aria-pressed={mode === value}
                aria-controls="production-scene"
                disabled={
                  (value === 'explore' && (!canExplore || !ready)) ||
                  (value === 'blockout' && baseFailed) ||
                  (value === 'final' && finalFailed)
                }
                onClick={() => setMode(value)}
              >
                {label}
              </Button>
            ),
          )}
        </fieldset>
      </div>

      <div
        ref={surface}
        id="production-scene"
        className="production-scene"
        data-mode={mode}
        data-base-failed={baseFailed || undefined}
        aria-describedby="production-comparison-help"
      >
        <SceneImage
          image={media.images.productionBlockout}
          imageRef={blockout}
          className="production-scene__base"
          onLoad={() => setBaseReady(true)}
          onError={() => setBaseFailed(true)}
        />
        <SceneImage
          image={media.images.storage}
          imageRef={finished}
          className="production-scene__final"
          onLoad={() => setFinalReady(true)}
          onError={() => setFinalFailed(true)}
        />
        <canvas
          ref={canvas}
          className="production-scene__reveal"
          aria-hidden="true"
        />
        <div className="production-scene__corners" aria-hidden="true" />
        <span className="production-scene__identifier" aria-hidden="true">
          BT / ENV — 01
        </span>
      </div>

      <figcaption className="production-comparison__caption">
        <p id="production-comparison-help" aria-live="polite">
          {baseFailed || finalFailed
            ? content.error
            : !ready
              ? content.loading
              : mode === 'explore'
                ? content.instruction
                : content.staticInstruction}
        </p>
        <span className="production-label">{content.provenance}</span>
      </figcaption>
      <p className="production-disclaimer">{content.disclaimer}</p>
      <noscript>
        <p className="production-disclaimer">
          <a href={media.images.storage.webp.large}>
            View the original game capture
          </a>
        </p>
      </noscript>
    </figure>
  );
}
