import type { ResponsiveImage } from '@/types/experience';

const IMAGES = '/assets/media/images';

/**
 * Material optimizado para web. Cada imagen ofrece AVIF y WebP en 960 y 1920.
 *
 * Las texturas WebGL usan la variante WebP porque `TextureLoader` decodifica a
 * través de `<img>` y WebP está disponible en todos los navegadores objetivo;
 * el `<picture>` del DOM sí aprovecha AVIF cuando el navegador lo soporta.
 */
function image(
  name: string,
  alt: string,
  focal: readonly [number, number] = [0.5, 0.45],
): ResponsiveImage {
  return {
    avif: {
      small: `${IMAGES}/${name}-960.avif`,
      large: `${IMAGES}/${name}-1920.avif`,
    },
    webp: {
      small: `${IMAGES}/${name}-960.webp`,
      large: `${IMAGES}/${name}-1920.webp`,
    },
    alt,
    focal,
  };
}

export const media = {
  video: {
    heroLoop: '/assets/media/video/hero-loop.mp4',
    heroPoster: '/assets/media/video/hero-poster.webp',
    teaser: '/assets/media/video/teaser-1080p.mp4',
  },
  images: {
    storage: image(
      'submarine-storage',
      'Original game capture: a lamp lights timber shelves, nets and barrels inside a ship’s storage compartment.',
      [0.5, 0.5],
    ),
    cabin: image(
      'captains-cabin',
      'Original game capture: Draga stands in a lantern-lit cabin.',
      [0.5, 0.5],
    ),
    productionBlockout: {
      avif: {
        small: '/assets/production/storage-blockout-v1-960.avif',
        large: '/assets/production/storage-blockout-v1-1920.avif',
      },
      webp: {
        small: '/assets/production/storage-blockout-v1-960.webp',
        large: '/assets/production/storage-blockout-v1-1920.webp',
      },
      alt: 'AI-recreated blockout of the storage compartment: grey clay surfaces and fine wireframe edges. Not an original development capture.',
      focal: [0.5, 0.5],
    },
    world: image(
      'driftwood-outskirts',
      'Draga moves through a frozen settlement battered by the wind.',
      [0.52, 0.48],
    ),
    village: image(
      'frozen-village',
      'Timber houses in Driftwood, a few windows still lit under a low storm sky.',
      [0.5, 0.5],
    ),
    corridor: image(
      'ship-corridor',
      'In-game capture of a survivor moving through a dark ship corridor.',
      [0.45, 0.52],
    ),
    frozenDeck: image(
      'frozen-deck',
      'In-game capture of a survivor crossing an exposed frozen deck.',
      [0.43, 0.52],
    ),
    atrium: image(
      'ship-atrium',
      'In-game capture of a survivor entering the ship’s towering atrium.',
      [0.46, 0.5],
    ),
    draga: image(
      'draga-profile',
      'Close portrait of Draga under cold blue light.',
      [0.34, 0.36],
    ),
    izzy: image(
      'izzy-protagonist',
      'Izzy watches a ritual scene lit by candles.',
    ),
    growth: image(
      'organic-growth',
      'Draga faces an immense organic mass inside the ship.',
      [0.66, 0.52],
    ),
    blubberRoom: image(
      'blubber-room',
      'A ship compartment overtaken by red organic tissue.',
      [0.58, 0.5],
    ),
    vessel: image(
      'vessel-creature',
      'A pale-fleshed creature watches through numerous blue eyes.',
      [0.47, 0.3],
    ),
    dialogue: image('bill-dialogue', 'Two characters speak in the shadows.'),
  },
} as const;
