'use client';

import { chapters } from '@/content/chapters';
import { siteContent } from '@/content/site-content';
import { useExperienceStore } from '@/lib/experience/store';

/**
 * Índice de cubierta: navegación accesible por capítulos.
 *
 * El estado activo se marca con marfil y una barra `scarlet` bajo la etiqueta:
 * el rojo entra como estructura, no como color de texto pequeño sobre negro
 * (scarlet sobre void rinde 2,75:1, por debajo del mínimo AA). La numeración se
 * queda en latón como detalle naval secundario.
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
          aria-label={siteContent.projectLabel}
          className="font-display hidden shrink-0 truncate text-[var(--font-system-label)] uppercase tracking-[var(--tracking-system)] text-foreground sm:block"
        >
          <span aria-hidden="true" className="xl:hidden">
            {siteContent.projectLabel}
          </span>
          {/* A partir de `xl` la barra muestra también los nombres de los
              capítulos y la marca cede el ancho que necesitan. */}
          <span aria-hidden="true" className="hidden xl:inline">
            {siteContent.projectLabelShort}
          </span>
        </a>

        <ul className="flex min-w-0 items-center gap-0.5 sm:gap-1.5">
          {chapters.map((chapter) => {
            const isActive = chapter.id === activeChapter;

            return (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  data-active={isActive || undefined}
                  className="font-system group relative flex items-center gap-1.5 border border-transparent px-1.5 py-1 text-[var(--font-system-compact)] uppercase tracking-[var(--tracking-system-tight)] text-steel transition-colors hover:text-foreground focus-visible:border-[color:var(--border-scarlet)] data-[active]:text-ivory sm:px-2"
                >
                  {/* La numeración se mantiene en latón como detalle naval;
                      el estado activo pasa a `ember`, legible sobre el negro. */}
                  <span
                    aria-hidden="true"
                    className="text-brass transition-colors group-data-[active]:text-ember"
                  >
                    {chapter.index}
                  </span>
                  {/* Dos nodos en vez de alternar `sr-only`/`not-sr-only`:
                      `not-sr-only` restablece `white-space: normal`, así que la
                      etiqueta visible se partía en dos líneas y desbordaba la
                      altura fija de la barra. */}
                  <span className="sr-only">{chapter.navLabel}</span>
                  <span
                    aria-hidden="true"
                    className="hidden whitespace-nowrap xl:inline"
                  >
                    {chapter.navLabel}
                  </span>
                  {/* Marca de estado: el rojo pesa como línea, no como texto. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-1.5 -bottom-px h-0.5 origin-left scale-x-0 bg-scarlet shadow-[var(--glow-red)] transition-transform duration-300 group-data-[active]:scale-x-100 sm:inset-x-2"
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
