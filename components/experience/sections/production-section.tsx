import { chapterMap } from '@/content/chapters';
import { ChapterSection } from './chapter-section';

/** Contenedor provisional del capítulo. Se desarrolla en su propio prompt. */
export function ProductionSection() {
  return <ChapterSection chapter={chapterMap.production} />;
}
