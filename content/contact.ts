/**
 * Canal de contacto del estudio.
 *
 * Procedencia de cada dato:
 * - Correo: facilitado directamente por el estudio.
 * - Steam: misma ficha que ya usa el hero (`site-content.ts`), app 4810650.
 * - Instagram y X: cuentas oficiales enlazadas desde la ficha de Steam y el
 *   sitio del estudio.
 * - LinkedIn: la página de empresa se deduce del identificador con el que el
 *   estudio publica (`strange-creature-factory`). Es el único enlace sin
 *   confirmar contra la propia página, que exige sesión iniciada; queda
 *   marcado para revisión y se cambia en una línea si el estudio da otro.
 * - Sitio del estudio: el mismo que ya enlaza el capítulo 07.
 *
 * Aquí no se inventan cargos, plazos ni promesas de respuesta: la tarjeta dice
 * a dónde escribir y quién hay al otro lado, nada más.
 */

export type ContactChannelId = 'steam' | 'linkedin' | 'x' | 'instagram';

export type ContactChannel = {
  id: ContactChannelId;
  /** Nombre de la red, para la etiqueta visible y el lector de pantalla. */
  name: string;
  /** Identificador público de la cuenta. Se muestra dentro de la tarjeta. */
  handle: string;
  url: string;
  /** Destino del enlace, leído en voz alta tras el nombre. */
  description: string;
  /** Queda por confirmar con el estudio. Solo afecta a notas internas. */
  unverified?: true;
};

export const contactChannels: readonly ContactChannel[] = [
  {
    id: 'steam',
    name: 'Steam',
    handle: 'Draga’s Wake',
    url: 'https://store.steampowered.com/app/4810650/Black_Tides_Dragas_Wake/',
    description: 'Game page on Steam',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'Strange Creature Factory',
    url: 'https://www.linkedin.com/company/strange-creature-factory/',
    description: 'Studio page on LinkedIn',
    unverified: true,
  },
  {
    id: 'x',
    name: 'X',
    handle: '@SCF_Games',
    url: 'https://x.com/SCF_Games',
    description: 'Studio account on X',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@strangecreaturefactory',
    url: 'https://www.instagram.com/strangecreaturefactory/',
    description: 'Studio account on Instagram',
  },
] as const;

export const contactContent = {
  /** Rótulo vertical de la pestaña, y nombre accesible del conjunto. */
  railLabel: 'Contact',
  railDescription: 'Studio channels and contact details',
  openLabel: 'Open the contact card',
  eyebrow: 'Open channel',
  title: ['Hail', 'the crew.'],
  introduction:
    'Strange Creature Factory is a small studio: the people who make Black Tides read this inbox themselves.',
  emailLabel: 'Write to the studio',
  email: 'strangecreaturefactory@gmail.com',
  copyLabel: 'Copy address',
  copiedLabel: 'Address copied',
  copyFailedLabel: 'Copy it by hand',
  channelsLabel: 'Follow the wake',
  studioLabel: 'A game by',
  studioName: 'Strange Creature Factory',
  studioUrl: 'https://strangecreaturefactory.com/',
  studioCta: 'Studio site',
  close: 'Close the channel',
} as const;
