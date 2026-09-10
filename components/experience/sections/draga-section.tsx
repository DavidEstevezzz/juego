import { chapterMap, dragaChapterContent } from '@/content/chapters';
import { DragaTransformation } from '../draga/draga-transformation';

const chapter = chapterMap.draga;
const content = dragaChapterContent;

export function DragaSection() {
  return (
    <section
      id={chapter.id}
      data-chapter={chapter.id}
      aria-labelledby="draga-title"
      className="draga-chapter"
    >
      <div className="draga-study">
        <header className="draga-study__heading">
          <p>{content.deckLabel}</p>
          <span aria-hidden="true" />
          <p>{content.category}</p>
        </header>
        <div className="draga-transformation-layout">
          <DragaTransformation />
          <div className="draga-copy">
            <p className="draga-copy__role">{content.role}</p>
            <h2 id="draga-title">{content.name}</h2>
            <div className="draga-copy__biography">
              <span className="draga-copy__rule" aria-hidden="true" />
              <p>{content.biography ?? content.pendingBiography}</p>
            </div>
            <p className="draga-transformation-note">
              The man. The vessel.
              <br />
              <span>How much of him remains?</span>
            </p>
          </div>
        </div>
        <footer className="draga-study__footer">
          <span aria-hidden="true" />
          <p>{content.gameTitle}</p>
        </footer>
      </div>
    </section>
  );
}
