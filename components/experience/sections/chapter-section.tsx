import type { ReactNode } from 'react';
import { siteContent } from '@/content/site-content';
import type { ExperienceChapter } from '@/types/experience';
import { cn } from '@/lib/utils';

type ChapterSectionProps = {
  chapter: ExperienceChapter;
  /** Contenido real del capítulo; mientras no exista se muestra el resumen. */
  children?: ReactNode;
  className?: string;
};

/**
 * Contenedor común de capítulo.
 *
 * Aporta el marcado semántico y los ganchos que necesita el runtime
 * (`id` para anchors y `data-chapter` para el observador). No fija la sección
 * ni impone alturas de viewport, de modo que en móvil no hay pinning.
 */
export function ChapterSection({
  chapter,
  children,
  className,
}: ChapterSectionProps) {
  const titleId = `${chapter.id}-title`;

  return (
    <section
      id={chapter.id}
      data-chapter={chapter.id}
      aria-labelledby={titleId}
      className={cn(
        'relative border-t border-[var(--border-subtle)] px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <p className="font-system text-[0.7rem] uppercase tracking-[0.24em] text-brass">
          <span aria-hidden="true">{chapter.index} / </span>
          {chapter.navLabel}
        </p>

        <h2
          id={titleId}
          className="font-display max-w-3xl text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05] tracking-[0.01em]"
        >
          {chapter.title}
        </h2>

        {children ?? (
          <>
            <p className="max-w-[60ch] text-base leading-[1.65] text-steel sm:text-lg">
              {chapter.summary}
            </p>
            <p className="font-system text-[0.68rem] uppercase tracking-[0.2em] text-steel/60">
              {siteContent.scaffoldLabel}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
