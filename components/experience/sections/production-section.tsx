import { ArrowUpRight } from 'lucide-react';
import { chapterMap, productionChapterContent } from '@/content/chapters';
import { TrailerDialog } from '../hero/trailer-dialog';
import { ProductionComparison } from '../production/production-comparison';
import { ProductionGallery } from '../production/production-gallery';

const content = productionChapterContent;
const chapter = chapterMap.production;

/** Natural-flow editorial interlude after Infection. No pinning or scroll reveal. */
export function ProductionSection() {
  return (
    <section
      id={chapter.id}
      data-chapter={chapter.id}
      aria-labelledby="production-title"
      className="production-chapter"
    >
      <div className="production-inner">
        <div className="production-masthead production-label">
          <span>Deck {chapter.index}</span>
          <span>{content.category}</span>
          <span aria-hidden="true">SCF / Black Tides</span>
        </div>
        <header className="production-heading">
          <h2 id="production-title">
            <span>{content.title[0]}</span>
            {content.title[1]}
          </h2>
          <div>
            <p className="production-introduction">{content.introduction}</p>
            <p className="production-label production-draft">
              {content.draftLabel}
            </p>
          </div>
        </header>
        <ProductionComparison />
        <ol className="production-notes">
          {content.notes.map((note) => (
            <li key={note.index}>
              <span className="production-notes__number" aria-hidden="true">
                {note.index}
              </span>
              <p className="production-label">{note.subtitle}</p>
              <h3>{note.title}</h3>
              <p className="production-notes__text">{note.text}</p>
            </li>
          ))}
        </ol>
        <ProductionGallery />
        <footer className="production-studio">
          <div>
            <p className="production-label">{content.studio.label}</p>
            <h3>{content.studio.name}</h3>
            <p className="production-studio__copy">{content.studio.text}</p>
            <div className="production-studio__actions">
              <a
                href={content.studio.url}
                className="production-studio__link focus-ring"
              >
                {content.studio.cta}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <TrailerDialog />
            </div>
          </div>
          <dl>
            {content.studio.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="production-label">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </footer>
      </div>
    </section>
  );
}
