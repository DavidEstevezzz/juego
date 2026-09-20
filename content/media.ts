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
    gods: image(
      'gods-altar',
      'A candlelit altar to the old gods inside a weathered wooden shrine.',
      [0.5, 0.5],
    ),
    absorb: image(
      'gameplay-absorb',
      'Draga absorbs a corpse, his arm overtaken by violet tendrils.',
      [0.38, 0.5],
    ),
    confront: image(
      'gameplay-confront',
      'Draga confronts a transformed crew member at close quarters.',
      [0.5, 0.5],
    ),
    explore: image(
      'gameplay-explore',
      'Draga explores the towering timber interior of the Ormora.',
      [0.4, 0.5],
    ),
    dragaHero: image(
      'draga-main-hero',
      'Draga stands in the doorway of the Ormora.',
      [0.42, 0.48],
    ),
    dominik: image(
      'dominik-diamond',
      'Dominik Diamond, the voice of Draga.',
      [0.5, 0.5],
    ),
    productionBefore: image(
      'production-before',
      'Original development capture: Draga in an early version of the ship corridor.',
      [0.5, 0.5],
    ),
    productionAfter: image(
      'production-after',
      'Original development capture: Draga in the detailed, atmospheric ship corridor.',
      [0.5, 0.5],
    ),
    ormora: image(
      'ormora-original',
      'The Ormora looms through a storm above a frozen shore.',
      [0.5, 0.45],
    ),
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
      'man-in-wall',
      'Draga faces a man embedded in the living walls of the ship.',
      [0.5, 0.5],
    ),
    blubberRoom: image(
      'beluga-grab',
      'Draga struggles in the grasp of a monstrous vessel aboard the Ormora.',
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
