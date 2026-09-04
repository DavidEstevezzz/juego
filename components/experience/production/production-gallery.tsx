'use client';

import { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { productionChapterContent } from '@/content/chapters';
import { media } from '@/content/media';
import { useExperienceStore } from '@/lib/experience/store';
import { MediaSubject } from '../media-subject';

const content = productionChapterContent.gallery;

export function ProductionGallery() {
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  useEffect(() => {
    if (!api) return;
    const sync = () => setIndex(api.selectedScrollSnap());
    sync();
    api.on('select', sync);
    api.on('reInit', sync);
    return () => {
      api.off('select', sync);
      api.off('reInit', sync);
    };
  }, [api]);

  return (
    <div className="production-gallery">
      <header>
        <p className="production-label">{content.label}</p>
        <h3>{content.title}</h3>
        <p>{content.description}</p>
      </header>
      <Carousel
        className="production-gallery__carousel"
        aria-label="Original game captures"
        setApi={setApi}
        opts={{ align: 'start', loop: false, duration: reducedMotion ? 0 : 32 }}
      >
        <CarouselContent>
          {content.frames.map((frame, frameIndex) => (
            <CarouselItem
              key={frame.media}
              aria-label={`${frameIndex + 1} of ${content.frames.length}`}
            >
              <figure>
                <div className="production-gallery__image">
                  <MediaSubject
                    source={{
                      kind: 'image',
                      image: media.images[frame.media],
                      width: frame.width,
                      height: frame.height,
                    }}
                    sizes="(min-width: 1000px) 65vw, 100vw"
                  />
                </div>
                <figcaption>
                  <span>{frame.title}</span>
                  <span className="production-label">{frame.caption}</span>
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="production-gallery__controls">
          <p className="production-label" aria-live="polite" aria-atomic="true">
            {String(index + 1).padStart(2, '0')} /{' '}
            {String(content.frames.length).padStart(2, '0')}
          </p>
          <CarouselPrevious className="production-gallery__arrow" />
          <CarouselNext className="production-gallery__arrow" />
        </div>
      </Carousel>
    </div>
  );
}
