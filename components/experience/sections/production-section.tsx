import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { chapterMap } from '@/content/chapters';
import { gameCredits, screenCredits } from '@/content/team';

/**
 * Teaser del Deck 06.
 *
 * La sección no muestra imágenes a propósito: queda entre Infección y la
 * Señal final, que sí las llevan, y una tercera seguida saturaría el cierre.
 * La prueba de "a history in games and film" la aporta el manifiesto de
 * créditos reales, no un par de cifras sueltas.
 */

/** Los cuatro primeros de cada lista; el resto se anuncia como recuento. */
const PREVIEW = 4;
const games = gameCredits.slice(0, PREVIEW);
const screen = screenCredits.slice(0, PREVIEW);
const remaining =
  gameCredits.length + screenCredits.length - games.length - screen.length;

export function ProductionSection() {
  const chapter = chapterMap.production;
  return (
    <section
      id={chapter.id}
      data-chapter={chapter.id}
      aria-labelledby="production-title"
      className="production-chapter team-teaser"
    >
      <div className="production-inner">
        <div className="production-masthead production-label">
          <span>Deck {chapter.index}</span>
          <span>Team / Production</span>
          <span>Strange Creature Factory</span>
        </div>
        <div className="team-teaser__body">
          <div>
            <p className="production-label team-eyebrow">
              Behind every shadow, a maker.
            </p>
            <h2 id="production-title">
              A shared
              <br />
              <em>obsession.</em>
            </h2>
            <p className="team-teaser__copy">
              18 contributors. A history in games and film. One unsettling world
              brought to life by Strange Creature Factory.
            </p>
            <Link className="team-portal focus-ring" href="/team-production">
              <span className="team-portal__label">
                <small>Enter the studio</small>Team &amp; Production
              </span>
              <span className="team-portal__arrow" aria-hidden="true">
                <ArrowUpRight size={24} />
              </span>
            </Link>
          </div>

          <div className="team-manifest">
            <p className="team-manifest__title production-label">
              Prior work of the crew
            </p>
            <dl>
              <dt className="production-label">Games</dt>
              <dd>
                <ul>
                  {games.map(([id, title]) => (
                    <li key={id}>{title}</li>
                  ))}
                </ul>
              </dd>
              <dt className="production-label">Screen</dt>
              <dd>
                <ul className="team-manifest__screen">
                  {screen.map(([id, title]) => (
                    <li key={id}>{title}</li>
                  ))}
                </ul>
              </dd>
            </dl>
            <p className="team-manifest__more production-label">
              + {remaining} more inside
            </p>
          </div>
        </div>
        <div className="team-teaser__foot production-label">
          <span>Independent minds. Shared purpose.</span>
          <span>Art · Gameplay · Cinematics</span>
        </div>
      </div>
    </section>
  );
}
