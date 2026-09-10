'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

/** One manually draggable shelf. Arrow keys provide the same navigation on focus. */
export function CreditCarousel({
  title,
  credits,
}: {
  title: string;
  credits: string[][];
}) {
  return (
    <div className="credit-shelf">
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
          loop: false,
          breakpoints: { '(prefers-reduced-motion: reduce)': { duration: 0 } },
        }}
        aria-label={`${title}: previous team credits. Drag or use the left and right arrow keys to explore.`}
        tabIndex={0}
        className="credit-shelf__carousel focus-ring"
      >
        <div className="credit-shelf__toolbar">
          <h3 className="production-label">
            {title} <span>/ {String(credits.length).padStart(2, '0')}</span>
          </h3>
          <span
            className="credit-shelf__hint production-label"
            aria-hidden="true"
          >
            Drag to explore ↔
          </span>
        </div>
        <CarouselContent className="credit-shelf__track">
          {credits.map(([image, name], index) => (
            <CarouselItem
              key={image}
              className="credit-shelf__slide"
              aria-label={`${index + 1} of ${credits.length}: ${name}`}
            >
              <figure>
                {/* oxlint-disable-next-line next/no-img-element */}
                <img
                  src={`/assets/team/${image}.webp`}
                  alt={`${name} cover`}
                  loading="lazy"
                  width={300}
                  height={420}
                  draggable={false}
                />
                <figcaption>
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {name}
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
