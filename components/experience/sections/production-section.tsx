import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { chapterMap } from '@/content/chapters';

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
              <span>
                <small>Enter the studio</small>Team & Production
              </span>
              <ArrowUpRight size={28} aria-hidden="true" />
            </Link>
          </div>
          <dl className="team-teaser__numbers">
            <div>
              <dt>Contributors</dt>
              <dd>18</dd>
            </div>
            <div>
              <dt>Months to first demo</dt>
              <dd>12</dd>
            </div>
          </dl>
        </div>
        <div className="team-teaser__foot production-label">
          <span>Independent minds. Shared purpose.</span>
          <span>Art · Gameplay · Cinematics</span>
        </div>
      </div>
    </section>
  );
}
