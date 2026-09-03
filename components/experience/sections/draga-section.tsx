import { chapterMap } from '@/content/chapters';
import { ChapterSection } from './chapter-section';

/** Contenedor provisional del capítulo. Se desarrolla en su propio prompt. */
export function DragaSection() {
  return <ChapterSection chapter={chapterMap.draga} />;
}
