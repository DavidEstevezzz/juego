import type { ChapterId, ExperienceChapter } from '@/types/experience';

/**
 * Registro único de capítulos de la experiencia.
 *
 * El orden de este array define el orden del documento, la navegación y el
 * cálculo del capítulo activo. Los textos son provisionales: proceden de los
 * objetivos de docs/EXPERIENCE-BLUEPRINT.md y del contenido ya presente en la
 * maqueta, nunca de lore inventado. Se sustituirán por copy aprobado en los
 * prompts de sección.
 */
export const chapters: readonly ExperienceChapter[] = [
  {
    id: 'hero',
    index: '01',
    navLabel: 'The Wake',
    title: 'The Wake',
    summary:
      'Presentar título, tono y primera decisión del visitante sin competir con el título.',
  },
  {
    id: 'world',
    index: '02',
    navLabel: 'Driftwood',
    title: 'El mundo: Driftwood',
    summary:
      'El tono, las reglas del mundo y la premisa que hacen reconocible al proyecto.',
  },
  {
    id: 'gameplay',
    index: '03',
    navLabel: 'Gameplay',
    title: 'The gameplay promise',
    summary:
      'The player fantasy, its essential pillars and the rhythm of play.',
  },
  {
    id: 'draga',
    index: '04',
    navLabel: 'Draga',
    title: 'Draga',
    summary:
      'Convertir a la protagonista en el centro emocional de la experiencia.',
  },
  {
    id: 'crew',
    index: '05',
    navLabel: 'Tripulación',
    title: 'Ecos humanos',
    summary:
      'Modelos, facciones y figuras clave presentados como piezas interactivas.',
  },
  {
    id: 'infection',
    index: '06',
    navLabel: 'Infección',
    title: 'La infección',
    summary:
      'Realizar el gran giro visual de la página como una secuencia, no como una galería.',
  },
  {
    id: 'production',
    index: '07',
    navLabel: 'Producción',
    title: 'Evidencia de producción',
    summary:
      'Equipo, hoja de ruta, oportunidad y una vía directa para continuar la conversación.',
  },
  {
    id: 'signal',
    index: '08',
    navLabel: 'Señal',
    title: 'Señal final',
    summary: 'Cerrar con una imagen memorable y una acción clara.',
  },
] as const;

/** Primer capítulo del documento; estado inicial del store. */
export const firstChapterId: ChapterId = chapters[0].id;

/** Ids en orden de documento, útil para observadores y navegación. */
export const chapterIds: readonly ChapterId[] = chapters.map(
  (chapter) => chapter.id,
);

export function getChapter(id: ChapterId): ExperienceChapter | undefined {
  return chapters.find((chapter) => chapter.id === id);
}

/** Acceso por id sin búsquedas ni aserciones en los componentes. */
export const chapterMap = Object.fromEntries(
  chapters.map((chapter) => [chapter.id, chapter]),
) as Record<ChapterId, ExperienceChapter>;

/**
 * Contenido del capítulo 02 — Driftwood.
 *
 * Copy provisional: describe aislamiento, clima y localización siguiendo el
 * objetivo de docs/EXPERIENCE-BLUEPRINT.md, sin inventar lore, nombres ni
 * datos de producción. Se sustituye cuando el equipo apruebe el texto.
 */
export const worldChapterContent = {
  deckLabel: 'Cubierta 02',
  premise:
    'Un asentamiento helado al borde del mapa. La tormenta borra las rutas, el rastro y cualquier promesa de regreso.',
  observations: [
    {
      index: '01',
      label: 'Aislamiento',
      text: 'No hay ruta de vuelta a la vista. Lo único que continúa es el camino hacia el interior.',
    },
    {
      index: '02',
      label: 'Clima',
      text: 'El viento no decora el paisaje: lo oculta, lo transforma y decide cuánto puedes ver.',
    },
    {
      index: '03',
      label: 'Localización',
      text: 'Driftwood se sostiene sobre madera, hielo y restos varados por la marea.',
    },
  ],
} as const;

/**
 * Replaceable copy for chapter 03. The three pillars are approved concepts;
 * the supporting lines stay deliberately qualitative and avoid unconfirmed
 * mechanics, systems or production claims.
 */
export const gameplayChapterContent = {
  deckLabel: 'Deck 03',
  category: 'Gameplay',
  heading: 'The gameplay promise',
  evidenceLabel: 'In-game captures · Original UI visible',
  interactionLabel: 'Select a pillar',
  inputLabel: 'Pointer · keyboard · touch',
  pillars: [
    {
      id: 'explore',
      index: '01',
      title: 'Explore',
      directive: 'Read the space',
      description:
        'Enter hostile spaces, read their shape and uncover what the darkness keeps out of sight.',
      media: 'corridor',
    },
    {
      id: 'endure',
      index: '02',
      title: 'Endure',
      directive: 'Withstand the pressure',
      description:
        'Cold, darkness and limited visibility turn every step forward into sustained pressure.',
      media: 'frozenDeck',
    },
    {
      id: 'confront',
      index: '03',
      title: 'Confront',
      directive: 'Face the threat',
      description:
        'When distance collapses, the experience shifts from observation to direct confrontation.',
      media: 'atrium',
    },
  ],
} as const;
