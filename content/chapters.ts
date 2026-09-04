import type {
  ActiveChapterId,
  ChapterId,
  ExperienceChapter,
} from '@/types/experience';

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
      'Introduce the title, tone and first visitor decision without competing with the key art.',
  },
  {
    id: 'world',
    index: '02',
    navLabel: 'Driftwood',
    title: 'The world: Driftwood',
    summary:
      'The tone, world rules and premise that give the project its identity.',
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
    summary: 'Place the protagonist at the emotional center of the experience.',
  },
  {
    id: 'infection',
    index: '05',
    navLabel: 'Infection',
    title: 'The infection',
    summary:
      'Deliver the site’s major visual turn as a continuous sequence, not a gallery.',
  },
  {
    id: 'production',
    index: '06',
    navLabel: 'Production',
    title: 'Production evidence',
    summary:
      'Team, roadmap, opportunity and a direct path to continue the conversation.',
  },
  {
    id: 'signal',
    index: '07',
    navLabel: 'Signal',
    title: 'Final signal',
    summary: 'Close with a memorable image and one clear action.',
  },
] as const;

/** Crew stays out of the active route; its draft can be restored later. */
export const deferredCrewChapter: ExperienceChapter = {
  id: 'crew',
  index: '—',
  navLabel: 'Crew',
  title: 'Human echoes',
  summary:
    'Models, factions and key figures presented as interactive narrative pieces.',
};

export const chapterCountLabel = String(chapters.length).padStart(2, '0');

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
) as Record<ActiveChapterId, ExperienceChapter>;

/**
 * Contenido del capítulo 02 — Driftwood.
 *
 * Copy provisional: describe aislamiento, clima y localización siguiendo el
 * objetivo de docs/EXPERIENCE-BLUEPRINT.md, sin inventar lore, nombres ni
 * datos de producción. Se sustituye cuando el equipo apruebe el texto.
 */
export const worldChapterContent = {
  deckLabel: 'Deck 02',
  premise:
    'A frozen settlement at the edge of the map. The storm erases every route, every trail and any promise of return.',
  observations: [
    {
      index: '01',
      label: 'Isolation',
      text: 'No route back remains in sight. The only path still open leads further inland.',
    },
    {
      index: '02',
      label: 'Weather',
      text: 'The wind does not decorate the landscape: it conceals it, reshapes it and decides how far you can see.',
    },
    {
      index: '03',
      label: 'Location',
      text: 'Driftwood stands on timber, ice and wreckage stranded by the tide.',
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

/** No approved biography has been supplied. Do not substitute invented lore. */
export const dragaChapterContent = {
  deckLabel: 'Deck 04',
  category: 'Character study',
  name: 'Draga',
  role: 'The protagonist',
  biography: null as string | null,
  pendingBiography: 'Biography pending approval.',
  imageCaption: 'Original game portrait',
  gameTitle: 'Black Tides: Draga’s Wake',
} as const;

/** Descriptions of the supplied images, not new lore or gameplay claims. */
export const infectionChapterContent = {
  category: 'Horror within',
  title: 'The infection',
  continueLabel: 'Beyond the infection',
  phases: [
    {
      id: 'growth',
      label: 'Growth',
      description: 'Steel gives way to flesh.',
      media: 'growth',
      width: 1920,
      height: 1049,
    },
    {
      id: 'room',
      label: 'Overtaken',
      description: 'Organic matter overtakes the room.',
      media: 'blubberRoom',
      width: 1920,
      height: 1049,
    },
    {
      id: 'presence',
      label: 'Presence',
      description: 'A shape emerges from the dark.',
      media: 'vessel',
      width: 1920,
      height: 935,
    },
  ],
} as const;
