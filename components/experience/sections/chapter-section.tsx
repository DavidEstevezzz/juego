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
        'relative border-t border-[color:var(--border-subtle)] px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {/* Marca roja de dirección; la numeración se queda en latón. */}
        <div className="signal-rule" aria-hidden="true" />

        <p className="font-system text-[var(--font-system-label)] uppercase tracking-[var(--tracking-system-wide)] text-steel">
          <span aria-hidden="true" className="text-brass">
            {chapter.index} /{' '}
          </span>
          {chapter.navLabel}
        </p>

        <h2
          id={titleId}
          className="font-display max-w-[18ch] text-[length:var(--text-display-scaffold)] leading-[1.05] tracking-[0.01em] uppercase"
        >
          {chapter.title}
        </h2>

        {children ?? (
          <>
            <p className="max-w-[var(--measure)] text-[length:var(--text-lead)] leading-[var(--leading-lead)] text-steel">
              {chapter.summary}
            </p>
            <p className="font-system text-[var(--font-system-compact)] uppercase tracking-[var(--tracking-system)] text-steel/70">
              {siteContent.scaffoldLabel}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
