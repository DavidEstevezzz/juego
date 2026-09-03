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
    navLabel: 'Promesa',
    title: 'La promesa jugable',
    summary:
      'La fantasía del jugador, las mecánicas esenciales y el ritmo de juego.',
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
