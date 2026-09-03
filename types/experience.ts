/**
 * Contratos compartidos de la experiencia Black Tides: Draga's Wake.
 * Los tipos de runtime viven aquí para que `lib/experience` y los componentes
 * hablen el mismo idioma sin dependencias cruzadas.
 */

/** Identificador estable de cada capítulo narrativo (ver content/chapters.ts). */
export type ChapterId =
  | 'hero'
  | 'world'
  | 'gameplay'
  | 'draga'
  | 'crew'
  | 'infection'
  | 'production'
  | 'signal';

/**
 * Tier gráfico según el presupuesto de calidad del blueprint.
 * - `a`: escritorio capaz, WebGL completo.
 * - `b`: portátil o móvil moderno, efectos reducidos.
 * - `c`: sin WebGL, ahorro de datos o dispositivo limitado; solo DOM y medios.
 */
export type GraphicsTier = 'a' | 'b' | 'c';

/** Dirección del scroll: 1 hacia abajo, -1 hacia arriba, 0 en reposo. */
export type ScrollDirection = -1 | 0 | 1;

/** Métricas publicadas por el único driver de scroll de la experiencia. */
export type ScrollMetrics = {
  /** Progreso normalizado del documento completo, 0..1. */
  progress: number;
  /** Dirección actual del desplazamiento. */
  direction: ScrollDirection;
  /** Velocidad suavizada y normalizada a -1..1. */
  velocity: number;
};

export type ExperienceChapter = {
  id: ChapterId;
  /** Número de cubierta mostrado en la interfaz ("01"…"08"). */
  index: string;
  /** Etiqueta corta para la navegación. */
  navLabel: string;
  /** Título editorial del capítulo. */
  title: string;
  /** Objetivo narrativo provisional mientras no exista copy aprobado. */
  summary: string;
};
