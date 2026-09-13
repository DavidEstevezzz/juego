/** Adapted from Saber_2026_DECK.pdf, pages 23–25. Credits refer to team members’ prior work. */
export const team = [
  { name: 'Tory Miles', role: 'Co-Founder / Art Director' },
  { name: 'Pablo Rueda', role: 'Co-Founder / Gameplay' },
  { name: 'Daniel Åström', role: 'Lighting & Cinematics' },
  { name: 'Alec Drake', role: 'Senior Environment Artist' },
  { name: 'Jimmy Di Nezza', role: 'Senior Animator' },
];
/**
 * El orden manda: el portal de la portada muestra los cuatro primeros de cada
 * lista, así que los títulos que el estudio quiere delante van arriba.
 */
export const gameCredits = [
  ['red-dead-redemption-2', 'Red Dead Redemption II'],
  ['gta-v', 'Grand Theft Auto V'],
  ['intergalactic', 'Intergalactic: The Heretic Prophet'],
  ['for-honor', 'For Honor'],
  ['hellblade-2', 'Senua’s Saga: Hellblade II'],
  ['max-payne-3', 'Max Payne 3'],
  ['modern-warfare-3', 'Call of Duty: Modern Warfare III'],
];
export const screenCredits = [
  ['scary-stories', 'Scary Stories to Tell in the Dark'],
  ['antlers', 'Antlers'],
  ['halo', 'Halo'],
  ['wednesday', 'Wednesday'],
  ['the-shape-of-water', 'The Shape of Water'],
  ['resident-evil-welcome', 'Resident Evil: Welcome to Raccoon City'],
  ['resident-evil-final', 'Resident Evil: The Final Chapter'],
];

/**
 * La voz de Draga.
 *
 * Fuente: Saber_2026_DECK.pdf, página 16. El texto reordena lo que el propio
 * estudio ya cuenta de Dominik Diamond —GamesMaster, radio y prensa— sin
 * añadir créditos, premios ni fechas que el deck no recoja.
 */
export const voiceOfDraga = {
  name: 'Dominik Diamond',
  role: 'The voice of Draga',
  biography: [
    'Scottish-born Dominik Diamond rose to fame as the iconic host of the ’90s UK television hit GamesMaster, and went on to become a leading voice in UK sports broadcasting and an award-winning Scottish radio presenter.',
    'He is the author of GamesMaster: The Oral History, a novelist, and a regular Guardian columnist, often writing about his lifelong passion for video games.',
  ],
  statement: [
    'A voice the players already know.',
    'A character they have never met.',
  ],
  portraitCaption: 'Draga / Voice: Dominik Diamond',
};

/**
 * Cierre del rollo de créditos. 18 contribuidores en total (deck, página 24),
 * de los que cinco están nombrados arriba: el resto se cuenta, no se inventa.
 */
export const creditRollTail = `+ ${18 - team.length} more contributors across five countries`;
