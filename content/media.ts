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
    world: image(
      'driftwood-outskirts',
      'Draga avanza por un asentamiento helado azotado por el viento.',
      [0.52, 0.48],
    ),
    village: image(
      'frozen-village',
      'Un pueblo costero abandonado bajo una tormenta de nieve.',
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
      'Primer plano de Draga iluminada por una luz azul y fría.',
    ),
    izzy: image(
      'izzy-protagonist',
      'Izzy observa una escena ritual iluminada por velas.',
    ),
    growth: image(
      'organic-growth',
      'Draga contempla una inmensa masa orgánica dentro del barco.',
    ),
    blubberRoom: image(
      'blubber-room',
      'Una estancia del barco invadida por tejido orgánico rojo.',
    ),
    vessel: image(
      'vessel-creature',
      'Una criatura de carne pálida observa con numerosos ojos azules.',
    ),
    dialogue: image(
      'bill-dialogue',
      'Dos personajes conversan en la penumbra.',
    ),
  },
} as const;
