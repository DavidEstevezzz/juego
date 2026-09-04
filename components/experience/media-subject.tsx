import type { MediaSubjectSource } from '@/types/experience';

type MediaSubjectProps = {
  source: MediaSubjectSource;
  className?: string;
  sizes: string;
  decorative?: boolean;
  focal?: readonly [number, number];
};

/** Layout-independent subject slot; no speculative model loader or 3D request. */
export function MediaSubject({
  source,
  className = '',
  sizes,
  decorative = false,
  focal = source.image.focal,
}: MediaSubjectProps) {
  const { image, width, height } = source;

  return (
    <picture className={`media-subject ${className}`}>
      <source
        type="image/avif"
        srcSet={`${image.avif.small} 960w, ${image.avif.large} 1920w`}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={`${image.webp.small} 960w, ${image.webp.large} 1920w`}
        sizes={sizes}
      />
      {/* oxlint-disable-next-line next/no-img-element */}
      <img
        src={image.webp.large}
        srcSet={`${image.webp.small} 960w, ${image.webp.large} 1920w`}
        sizes={sizes}
        alt={decorative ? '' : image.alt}
        width={width}
        height={height}
        style={{ objectPosition: `${focal[0] * 100}% ${focal[1] * 100}%` }}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
