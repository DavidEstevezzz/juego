'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { media } from '@/content/media';
import { siteContent } from '@/content/site-content';
import { prefersReducedData } from '@/lib/experience/graphics-tier';
import { useExperienceStore } from '@/lib/experience/store';

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

type HeroMediaProps = {
  /** Capa que escala y desplaza la timeline de salida por scroll. */
  scrollLayer: RefObject<HTMLDivElement | null>;
  /** Capa interna que mueve el parallax de puntero. */
  parallaxLayer: RefObject<HTMLDivElement | null>;
  /** Pausa externa (por ejemplo, mientras el modal del teaser está abierto). */
  paused: boolean;
};

/**
 * Fondo del hero: póster inmediato y loop ambiental que entra por crossfade.
 *
 * El póster es el primer render y el fallback permanente: si el loop no se
 * carga, se rechaza el autoplay o el usuario pide movimiento reducido o ahorro
 * de datos, la composición sigue completa con la imagen estática.
 *
 * Ambas capas son absolutas dentro del mismo contenedor, así que montar o
 * descartar el vídeo nunca mueve el layout.
 */
export function HeroMedia({
  scrollLayer,
  parallaxLayer,
  paused,
}: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const documentVisible = useExperienceStore((state) => state.documentVisible);
  const chapter = useExperienceStore((state) => state.chapter);

  // Conservador hasta comprobarlo en el cliente: sin vídeo mientras no se sepa.
  const [videoDeferred, setVideoDeferred] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // El loop se monta después del primer render para no competir con el póster.
  // Ni el ahorro de datos ni el movimiento reducido llegan a programarlo.
  useEffect(() => {
    if (reducedMotion || prefersReducedData()) return;

    const idleWindow = window as IdleWindow;
    if (typeof idleWindow.requestIdleCallback === 'function') {
      const handle = idleWindow.requestIdleCallback(
        () => setVideoDeferred(true),
        { timeout: 1500 },
      );
      return () => idleWindow.cancelIdleCallback?.(handle);
    }

    const timeout = window.setTimeout(() => setVideoDeferred(true), 400);
    return () => window.clearTimeout(timeout);
  }, [reducedMotion]);

  // Derivado, no un estado más: si el movimiento reducido se activa en caliente
  // el vídeo se desmonta solo y queda el póster.
  const videoAllowed = videoDeferred && !reducedMotion;

  const shouldPlay =
    videoAllowed && documentVisible && chapter === 'hero' && !paused;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!shouldPlay) {
      video.pause();
      return;
    }

    const attempt = video.play();
    if (!attempt) return;

    void attempt.then(
      () => setAutoplayBlocked(false),
      // Autoplay rechazado: el póster se queda visible y se reintenta con el
      // primer gesto del usuario.
      () => setAutoplayBlocked(true),
    );
  }, [shouldPlay]);

  useEffect(() => {
    if (!autoplayBlocked) return;

    const retry = () => {
      const video = videoRef.current;
      if (!video) return;
      void video.play().then(
        () => setAutoplayBlocked(false),
        () => {},
      );
    };

    window.addEventListener('pointerdown', retry, { once: true });
    window.addEventListener('keydown', retry, { once: true });

    return () => {
      window.removeEventListener('pointerdown', retry);
      window.removeEventListener('keydown', retry);
    };
  }, [autoplayBlocked]);

  const showVideo = videoAllowed && videoReady && !autoplayBlocked;

  return (
    <div ref={scrollLayer} className="absolute inset-0 z-0 overflow-hidden">
      {/* Margen extra para que el parallax y la escala nunca dejen ver el borde. */}
      <div ref={parallaxLayer} className="absolute -inset-6">
        {/* oxlint-disable-next-line next/no-img-element -- El póster es un
            asset estático ya optimizado (WebP, 27 KB) por
            `npm run assets:optimize`; no necesita el pipeline de next/image y
            un `<img>` absoluto evita cualquier caja extra en la capa de fondo. */}
        <img
          src={media.video.heroPoster}
          alt={siteContent.hero.posterAlt}
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[62%_42%]"
        />

        {videoAllowed && (
          <video
            ref={videoRef}
            src={media.video.heroLoop}
            poster={media.video.heroPoster}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            onCanPlay={() => setVideoReady(true)}
            style={{ opacity: showVideo ? 1 : 0 }}
            className="absolute inset-0 h-full w-full object-cover object-[62%_42%] transition-opacity duration-[900ms] ease-out"
          />
        )}
      </div>

      {/* Veladuras: el negro domina la superficie y el rojo entra como luz. */}
      <div aria-hidden="true" className="hero-veil absolute inset-0" />
      <div aria-hidden="true" className="hero-signal absolute inset-0" />
    </div>
  );
}
