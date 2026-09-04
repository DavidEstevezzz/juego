'use client';

import { useEffect, useRef } from 'react';
import { ArrowUp, ArrowUpRight, MoveUpRight } from 'lucide-react';
import {
  chapterCountLabel,
  chapterMap,
  chapters,
  finalSignalContent,
} from '@/content/chapters';
import { siteContent } from '@/content/site-content';
import { media } from '@/content/media';
import { registerGsap } from '@/lib/experience/gsap';
import { prefersReducedMotion } from '@/lib/experience/motion-preferences';
import {
  isDocumentVisible,
  subscribeVisibility,
} from '@/lib/experience/visibility';
import { useExperienceStore } from '@/lib/experience/store';
import { SignalAccessibility } from '../signal/signal-accessibility';

const content = finalSignalContent;
const chapter = chapterMap.signal;

/** Quiet coda: native page flow, existing art and one finite lighting entrance. */
export function FinalSignalSection() {
  const stage = useRef<HTMLDivElement>(null);
  const artwork = useRef<HTMLDivElement>(null);
  const entered = useRef(false);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const tier = useExperienceStore((state) => state.graphicsTier);

  useEffect(() => {
    const element = stage.current;
    const art = artwork.current;
    if (
      !element ||
      !art ||
      reducedMotion ||
      prefersReducedMotion() ||
      tier === 'c' ||
      entered.current
    )
      return;
    const gsap = registerGsap();
    let inView = false;
    let visible = isDocumentVisible();
    let played = false;
    // The context exists before the observer; delayed work is added to it so
    // both Strict Mode and a live preference change can restore all styles.
    const context = gsap.context(() => {}, element);
    let entrance: ReturnType<typeof gsap.timeline> | undefined;
    const play = () => {
      if (!inView || !visible) return;
      if (!played) {
        played = true;
        entered.current = true;
        context.add(() => {
          entrance = gsap.timeline().fromTo(
            art,
            { opacity: 0.58, scale: 1.025 },
            {
              opacity: 1,
              scale: 1,
              duration: 1.8,
              ease: 'power3.out',
              clearProps: 'opacity,transform',
              onComplete: () => {
                observer.disconnect();
                stopVisibility();
              },
            },
          );
        });
      } else entrance?.resume();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) play();
        else if (played) entrance?.progress(1).pause();
      },
      { threshold: 0.08 },
    );
    const stopVisibility = subscribeVisibility((value) => {
      visible = value;
      if (value) play();
      else entrance?.pause();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      stopVisibility();
      context.revert();
    };
  }, [reducedMotion, tier]);

  return (
    <section
      id={chapter.id}
      data-chapter={chapter.id}
      aria-labelledby="signal-title"
      className="signal-chapter"
    >
      <div ref={stage} className="signal-stage">
        <div ref={artwork} className="signal-art" aria-hidden="true">
          {/* The already optimized, cached opening poster is reused here. */}
          {/* oxlint-disable-next-line next/no-img-element */}
          <img
            src={media.video.heroPoster}
            alt=""
            width={1920}
            height={1080}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="signal-shade" aria-hidden="true" />
        <div className="signal-stage__inner">
          <div className="signal-masthead signal-label">
            <span>Deck {chapter.index}</span>
            <span>{content.category}</span>
            <span aria-hidden="true">
              {chapter.index} / {chapterCountLabel}
            </span>
          </div>
          <div className="signal-copy">
            <p className="signal-eyebrow signal-label">{content.eyebrow}</p>
            <h2 id="signal-title">
              <span>{content.title[0]}</span>
              <span>{content.title[1]}</span>
            </h2>
            <p className="signal-invitation">{content.invitation}</p>
            <a
              href={siteContent.hero.steamUrl}
              className="signal-steam focus-ring"
              aria-describedby="signal-steam-note"
            >
              <span>{content.cta}</span>
              <MoveUpRight size={22} aria-hidden="true" />
            </a>
            <p id="signal-steam-note" className="signal-cta-note signal-label">
              {content.ctaNote}
            </p>
          </div>
          <div className="signal-signoff signal-label" aria-hidden="true">
            <span />
            <span>{content.endLabel}</span>
          </div>
        </div>
      </div>

      <footer className="signal-footer">
        <div className="signal-footer__inner">
          <div className="signal-footer__lead">
            <div>
              <p className="signal-label">{content.studioLabel}</p>
              <a className="signal-studio focus-ring" href={content.studioUrl}>
                {content.studioName}
                <ArrowUpRight size={21} aria-hidden="true" />
                <span className="sr-only"> — {content.studioCta}</span>
              </a>
            </div>
            <a href="#hero" className="signal-return signal-label focus-ring">
              {content.backToTop}
              <ArrowUp size={18} aria-hidden="true" />
            </a>
          </div>
          <nav aria-label={content.chapterNavLabel} className="signal-chapters">
            {chapters.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="signal-label focus-ring"
              >
                <span aria-hidden="true">{item.index}</span>
                {item.navLabel}
              </a>
            ))}
          </nav>
          <div className="signal-footer__bottom">
            <p>{content.credits}</p>
            <span>{content.privacyPending}</span>
            <SignalAccessibility />
          </div>
        </div>
      </footer>
    </section>
  );
}
