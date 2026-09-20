import type {
  ActiveChapterId,
  ChapterId,
  ExperienceChapter,
} from '@/types/experience';

/**
 * Registro único de capítulos de la experiencia.
 *
 * El orden de este array define el orden del documento, la navegación y el
 * cálculo del capítulo activo. Los textos combinan los objetivos de
 * docs/EXPERIENCE-BLUEPRINT.md con la información pública del juego (ficha de
 * Steam y material del estudio). Nada procede de lore inventado: los capítulos
 * sin dirección visual siguen mostrando solo su resumen.
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
    navLabel: 'The World',
    title: 'The World: Old Gods, the Ormora & Driftwood Bay',
    summary:
      'The era, the ice and the ship: the rules of the world Draga is trapped in.',
  },
  {
    id: 'gameplay',
    index: '03',
    navLabel: 'Gameplay',
    title: 'The gameplay promise',
    summary:
      'The player fantasy, its three pillars and the rhythm of close-quarters horror.',
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
    navLabel: 'Vessels',
    title: 'The vessels',
    summary:
      'Deliver the site’s major visual turn as a continuous sequence, not a gallery.',
  },
  {
    id: 'production',
    index: '06',
    navLabel: 'Team / Production',
    title: 'Team / Production',
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
 * El lugar (Driftwood) procede del guion del proyecto en
 * docs/EXPERIENCE-BLUEPRINT.md; la época, la Ormora y el culto proceden de la
 * ficha pública del juego. Las tres observaciones cubren el objetivo del
 * capítulo —aislamiento, clima y localización— sin inventar lore ni datos de
 * producción.
 */
export const worldChapterContent = {
  deckLabel: 'Deck 02',
  observations: [
    {
      index: '01',
      label: 'The Old Gods',
      text: 'The year is 1909. Beyond the reach of the known world, the old gods are very much alive.',
    },
    {
      index: '02',
      label: 'The Ormora',
      text: 'A colossal whaling steamship waits in the ice, taken by a doomsday cult and something older than the cult itself.',
    },
    {
      index: '03',
      label: 'Driftwood Bay',
      text: 'At the edge of the known world, Draga crosses a frozen settlement swallowed by wind and fog.',
    },
  ],
} as const;

/**
 * Copy del capítulo 03. Los tres pilares son conceptos aprobados en
 * docs/EXPERIENCE-BLUEPRINT.md; las líneas de apoyo reformulan la promesa de
 * combate que el estudio ya comunica públicamente —cuerpo a cuerpo brutal,
 * sin distancia, medido en tiempo, posición y agresividad— sin prometer
 * sistemas, armas ni progresión sin confirmar.
 */
export const gameplayChapterContent = {
  deckLabel: 'Deck 03',
  category: 'Gameplay',
  heading: 'The gameplay promise',
  evidenceLabel: 'Original in-game captures',
  interactionLabel: 'Select a pillar',
  inputLabel: 'Pointer · keyboard · touch',
  pillars: [
    {
      id: 'absorb',
      index: '01',
      title: 'Absorb',
      directive: 'Take what remains',
      description:
        'Draga absorbs the dead. Flesh gives way to something ancient, and the boundary between man and vessel begins to disappear.',
      media: 'absorb',
    },
    {
      id: 'confront',
      index: '02',
      title: 'Confront',
      directive: 'No distance left',
      description:
        'Face the horrors aboard the Ormora in brutal close-quarters combat. Timing, position and aggression are all that stand between you and the next vessel.',
      media: 'confront',
    },
    {
      id: 'explore',
      index: '03',
      title: 'Explore',
      directive: 'Go deeper',
      description:
        'Climb through towering timber interiors and descend into the ship’s dark compartments. Every passage reveals another trace of what the Ormora has become.',
      media: 'explore',
    },
  ],
} as const;

/**
 * Capítulo 04. La biografía resume el retrato del personaje que el estudio ya
 * ha hecho público: marinero curtido y ladrón de oficio, leal a Caleb, ni
 * héroe ni villano. No añade sucesos, relaciones ni finales no confirmados.
 */
export const dragaChapterContent = {
  deckLabel: 'Deck 04',
  category: 'Character study',
  name: 'Draga',
  role: 'Smuggler · Ormora survivor',
  biography:
    'A hardened sailor and career thief who has spent his life following Caleb’s orders without question. Not a hero: a survivor, a loyalist, a man whose moral code was built for a simpler world. As the ship takes his crew one by one and an ancient god takes root in his body, Draga has to choose between the man he was and the thing he is becoming.' as
      | string
      | null,
  imageCaption: 'Original game portrait',
  gameTitle: 'Black Tides: Draga’s Wake',
} as const;

/** Descriptions of the supplied images, not new lore or gameplay claims. */
export const infectionChapterContent = {
  category: 'Horror within',
  title: 'The vessels',
  continueLabel: 'Beyond the vessels',
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
      description: 'Living matter takes the compartment.',
      media: 'blubberRoom',
      width: 3843,
      height: 2063,
    },
    {
      id: 'presence',
      label: 'Presence',
      description: 'Something is waking inside the hull.',
      media: 'vessel',
      width: 1920,
      height: 935,
    },
  ],
} as const;

/** Layout copy only, pending studio approval. No milestones or results implied. */
export const productionChapterContent = {
  category: 'Production / Field notes',
  title: ['Before the', 'dark takes shape.'],
  introduction:
    'First, a space. Then the weight of its surfaces, the trace of a life, the light that makes you hesitate. A world becomes believable one decision at a time.',
  comparison: {
    label: 'Study 01 / The Ormora corridor',
    title: 'From structure to atmosphere',
    instruction: 'Move across the scene. Let the finished world linger.',
    staticInstruction:
      'Choose a view to compare the structure and the finished scene.',
    loading: 'Preparing the comparison. You can also choose a full view.',
    error:
      'One comparison image could not load. The available view remains below.',
    modes: {
      explore: 'Explore',
      blockout: 'Before',
      final: 'After',
    },
    provenance: 'Original development captures · Before / After',
    disclaimer:
      'Two stages of the same environment, aligned around Draga to reveal the evolution of the ship.',
  },
  notes: [
    {
      index: '01',
      title: 'Space',
      subtitle: 'Before the detail',
      text: 'A passage. A blind corner. A room that asks you to step inside. Even without its surfaces, a place should carry a feeling.',
    },
    {
      index: '02',
      title: 'Surface',
      subtitle: 'The evidence of use',
      text: 'Timber, rope and steel give the room its weight. Wear turns a collection of objects into somewhere that feels inhabited.',
    },
    {
      index: '03',
      title: 'Light',
      subtitle: 'What remains unseen',
      text: 'A pool of warmth draws the eye. The darkness around it leaves a question. Atmosphere lives in the distance between the two.',
    },
  ],
  studio: {
    label: 'The people behind the world',
    name: 'Strange Creature Factory Ltd',
    text: 'A closer look at Black Tides: Draga’s Wake starts here. For a conversation about the project, meet the studio behind it.',
  },
} as const;

/** Draft closing line; links reuse the approved destinations in site content. */
export const finalSignalContent = {
  category: 'Final signal',
  eyebrow: 'Black Tides: Draga’s Wake',
  title: ['The deep', 'is calling.'],
  invitation:
    'Keep Black Tides on your horizon. Follow the game and add it to your wishlist on Steam.',
  cta: 'Wishlist on Steam',
  ctaNote: 'Opens the game’s Steam page',
  studioLabel: 'A game by',
  studioName: 'Strange Creature Factory Ltd',
  backToTop: 'Return to the surface',
  endLabel: 'End of transmission',
  credits: 'Black Tides: Draga’s Wake · Strange Creature Factory Ltd',
  accessibility: {
    trigger: 'Accessibility',
    title: 'Your pace. Your way.',
    description:
      'The experience follows your device’s motion preference. The content remains available without visual effects.',
    reduced: 'Reduced motion is active on this device.',
    standard: 'Standard motion is active on this device.',
    motion:
      'To reduce motion throughout the experience, enable Reduce motion in your device or browser accessibility settings. The page responds automatically.',
    keyboard:
      'Use Tab to move between links and controls, Enter to activate them, and Escape to close dialogs. The chapter links use ordinary page navigation.',
    sound:
      'There is no background audio. The teaser starts muted and only opens when you choose to watch it.',
    close: 'Back to the signal',
  },
} as const;
