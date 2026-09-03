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
 * La marca se acorta a «Black Tides» para dejar aire a los ocho capítulos: con
 * el nombre completo, los rótulos no caben en una sola línea a este tamaño.
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
          className="font-display hidden shrink-0 whitespace-nowrap text-[1rem] uppercase tracking-[0.16em] text-foreground sm:block"
        >
          {siteContent.navBrand}
        </a>

        <ul className="flex min-w-0 items-center gap-1 sm:gap-2.5">
          {chapters.map((chapter) => {
            const isActive = chapter.id === activeChapter;

            return (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  data-active={isActive || undefined}
                  className="font-system group flex shrink-0 items-center gap-2.5 whitespace-nowrap border border-transparent px-1.5 py-1.5 text-[0.95rem] uppercase tracking-[0.12em] text-steel transition-colors hover:text-foreground focus-visible:border-[color:var(--border-scarlet)] data-[active]:text-scarlet sm:px-2"
                >
                  {/* La numeración se mantiene en latón como detalle naval;
                      el estado activo pasa a `scarlet`. */}
                  <span
                    aria-hidden="true"
                    className="text-brass transition-colors group-data-[active]:text-scarlet"
                  >
                    {chapter.index}
                  </span>
                  {/* `not-sr-only` restaura `white-space: normal`, así que el
                      nowrap debe repetirse en el mismo breakpoint o los
                      rótulos de dos palabras caen a dos líneas. */}
                  <span className="sr-only whitespace-nowrap xl:not-sr-only xl:whitespace-nowrap">
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
