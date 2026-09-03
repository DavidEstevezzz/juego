export const siteContent = {
  projectLabel: 'Black Tides: Draga’s Wake',
  skipLinkLabel: 'Skip to main content',
  navLabel: 'Experience chapters',
  /** Etiqueta mostrada en los contenedores todavía sin dirección visual. */
  scaffoldLabel: 'Section in development',

  /**
   * Copy del hero.
   *
   * `genre` es una etiqueta provisional derivada de docs/EXPERIENCE-BLUEPRINT.md
   * y docs/VISUAL-DIRECTION.md (horror marítimo, explorar y sobrevivir). No
   * describe perspectiva, plataformas ni mecánicas no confirmadas y se muestra
   * junto a `genreStatus` hasta que el equipo apruebe el copy definitivo.
   */
  hero: {
    deckLabel: 'Deck 01',
    titlePrimary: 'Black Tides',
    titleSecondary: 'Draga’s Wake',
    genre: 'Maritime survival horror',
    genreStatus: 'Provisional copy',
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
