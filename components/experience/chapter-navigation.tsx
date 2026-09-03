'use client';

import { chapters } from '@/content/chapters';
import { siteContent } from '@/content/site-content';
import { useExperienceStore } from '@/lib/experience/store';

/**
 * Índice de cubierta: navegación accesible por capítulos.
 *
 * El estado activo usa `scarlet`; la numeración se queda en latón como detalle
 * naval secundario.
 *
 * Son anchors nativos, así que funcionan sin JavaScript y respetan el
 * historial. En móvil solo se muestra el número de cubierta (el nombre queda
 * para lectores de pantalla) para que la barra quepa en una sola línea y no
 * aparezca scroll horizontal; el nombre corto aparece a partir de `xl`. El menú
 * completo llega en el Prompt 08.
 */
export function ChapterNavigation() {
  const activeChapter = useExperienceStore((state) => state.chapter);

  return (
    <nav
      aria-label={siteContent.navLabel}
      className="sticky top-0 z-30 h-[var(--chapter-bar-height)] border-b border-[color:var(--border-subtle)] bg-[var(--surface-glass)] backdrop-blur-[2px]"
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-10 lg:px-16">
        <a
          href="#hero"
          className="font-display hidden shrink-0 truncate text-[0.8rem] uppercase tracking-[0.18em] text-foreground sm:block"
        >
          {siteContent.projectLabel}
        </a>

        <ul className="flex min-w-0 items-center gap-0.5 sm:gap-2">
          {chapters.map((chapter) => {
            const isActive = chapter.id === activeChapter;

            return (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  data-active={isActive || undefined}
                  className="font-system group flex items-center gap-2 border border-transparent px-1.5 py-1 text-[var(--font-system-compact)] uppercase tracking-[0.14em] text-steel transition-colors hover:text-foreground focus-visible:border-[color:var(--border-scarlet)] data-[active]:text-scarlet sm:px-2"
                >
                  {/* La numeración se mantiene en latón como detalle naval;
                      el estado activo pasa a `scarlet`. */}
                  <span
                    aria-hidden="true"
                    className="text-brass transition-colors group-data-[active]:text-scarlet"
                  >
                    {chapter.index}
                  </span>
                  <span className="sr-only whitespace-nowrap xl:not-sr-only">
                    {chapter.navLabel}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
