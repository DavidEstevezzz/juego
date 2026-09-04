export const siteContent = {
  projectLabel: 'Black Tides: Draga’s Wake',
  /**
   * Marca corta para la barra de capítulos. Cuando los siete nombres de
   * capítulo son visibles, el título completo ya no cabe en el ancho de la
   * rejilla: la barra prefiere perder el subtítulo antes que recortar la
   * navegación o salirse del contenedor.
   */
  projectLabelShort: 'Black Tides',
  skipLinkLabel: 'Skip to main content',
  navLabel: 'Experience chapters',
  /** Etiqueta mostrada en los contenedores todavía sin dirección visual. */
  scaffoldLabel: 'Section in development',

  /**
   * Copy del hero.
   *
   * Fuente: la ficha pública del juego en Steam y el material de prensa del
   * estudio (ver docs/VISUAL-DIRECTION.md → «Fuentes visuales de referencia»).
   * `genre` y `synopsis` reproducen la promesa que ya comunica el equipo —
   * horror de acción en tercera persona, 1900 alternativo, la Ormora y su
   * tripulación— y no añaden mecánicas, plataformas ni fechas sin confirmar.
   */
  hero: {
    deckLabel: 'Deck 01',
    titlePrimary: 'Black Tides',
    titleSecondary: 'Draga’s Wake',
    genre: 'Third-person action horror',
    genreStatus: 'In development',
    synopsis:
      'An alternate 1900s, where ancient gods and vessels of steam and steel meet in the same black water. Stranded aboard the Ormora, Draga fights the horrors below deck to regroup his crew and find out what is waking inside the hull.',
    ctaPrimary: 'Watch teaser',
    ctaSecondary: 'View on Steam',
    steamUrl:
      'https://store.steampowered.com/app/4810650/Black_Tides_Dragas_Wake/',
    scrollHint: 'Descend',
    posterAlt:
      'A solitary figure walks toward a red light through organic remains suspended in darkness.',
    trailerTitle: 'Black Tides: Draga’s Wake teaser',
    trailerDescription:
      'Teaser video with native controls. Sound starts muted and only plays after your action.',
    soundOn: 'Enable sound',
    soundOff: 'Mute sound',
    closeTrailer: 'Close teaser',
  },
} as const;
