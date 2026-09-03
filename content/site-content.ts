export const siteContent = {
  projectLabel: 'Black Tides: Draga’s Wake',
  skipLinkLabel: 'Saltar al contenido principal',
  navLabel: 'Capítulos de la experiencia',
  /** Etiqueta mostrada en los contenedores todavía sin dirección visual. */
  scaffoldLabel: 'Contenedor provisional',

  /**
   * Copy del hero.
   *
   * `genre` es una etiqueta provisional derivada de docs/EXPERIENCE-BLUEPRINT.md
   * y docs/VISUAL-DIRECTION.md (horror marítimo, explorar y sobrevivir). No
   * describe perspectiva, plataformas ni mecánicas no confirmadas y se muestra
   * junto a `genreStatus` hasta que el equipo apruebe el copy definitivo.
   */
  hero: {
    deckLabel: 'Cubierta 01',
    titlePrimary: 'Black Tides',
    titleSecondary: 'Draga’s Wake',
    genre: 'Horror marítimo de supervivencia',
    genreStatus: 'Copy provisional',
    ctaPrimary: 'Ver teaser',
    ctaSecondary: 'Ver en Steam',
    steamUrl:
      'https://store.steampowered.com/app/4810650/Black_Tides_Dragas_Wake/',
    scrollHint: 'Descender',
    posterAlt:
      'Una figura solitaria avanza hacia una luz roja entre restos orgánicos suspendidos en la penumbra.',
    trailerTitle: 'Teaser de Black Tides: Draga’s Wake',
    trailerDescription:
      'Vídeo del teaser con controles nativos. El sonido empieza silenciado y solo se activa si lo pides.',
    soundOn: 'Activar sonido',
    soundOff: 'Silenciar',
    closeTrailer: 'Cerrar teaser',
  },
} as const;
