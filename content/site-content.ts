export const siteContent = {
  projectLabel: 'Black Tides: Draga’s Wake',
  /** Marca corta de la barra de capítulos; el nombre completo vive en el hero. */
  navBrand: 'Black Tides',
  skipLinkLabel: 'Skip to main content',
  navLabel: 'Experience chapters',
  /** Etiqueta mostrada en los contenedores todavía sin dirección visual. */
  scaffoldLabel: 'Section in development',

  /**
   * Copy del hero.
   *
   * Todo el texto procede de material del propio estudio: el logotipo, la
   * fórmula «presents», la llamada a Steam y la línea de posicionamiento son
   * los que Strange Creature Factory ya usaba en su web. No hay etiquetas de
   * género ni datos de producción sin confirmar.
   */
  hero: {
    studio: 'Strange Creature Factory',
    studioLogo: '/assets/media/brand/strange-creature-factory.png',
    presents: 'Presents',
    titlePrimary: 'Black Tides',
    titleSecondary: 'Draga’s Wake',
    positioning: 'Seeking a publishing partner.',
    ctaPrimary: 'Watch teaser',
    ctaSecondary: 'Wishlist on Steam',
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
