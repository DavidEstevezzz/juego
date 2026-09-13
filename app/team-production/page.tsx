import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { CreditCarousel } from '@/components/experience/production/credit-carousel';
import { contactContent } from '@/content/contact';
import { media } from '@/content/media';
import {
  team,
  gameCredits,
  screenCredits,
  voiceOfDraga,
  creditRollTail,
} from '@/content/team';
import { ProductionComparison } from '@/components/experience/production/production-comparison';

export const metadata: Metadata = {
  title: 'Team / Production — Black Tides: Draga’s Wake',
  description:
    'Meet Strange Creature Factory, the team and the production craft behind Black Tides: Draga’s Wake.',
};

export default function TeamProductionPage() {
  return (
    <div className="team-page">
      <a href="#team-main" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <nav className="team-nav" aria-label="Team page navigation">
        <Link href="/" className="font-display focus-ring">
          Black Tides
        </Link>
        <Link href="/#production" className="focus-ring">
          <ArrowLeft size={16} aria-hidden="true" /> Back to the experience
        </Link>
      </nav>
      <main id="team-main" className="team-main">
        <header className="team-hero">
          <div className="team-hero__image" aria-hidden="true">
            {/* oxlint-disable-next-line next/no-img-element */}
            <img
              src={media.images.cabin.webp.large}
              alt=""
              width={1920}
              height={1049}
              fetchPriority="high"
            />
          </div>
          <div className="team-hero__content">
            <p className="production-label team-eyebrow">
              Strange Creature Factory Ltd / The studio
            </p>
            <h1>
              Strange minds.
              <br />
              <em>Shared vision.</em>
            </h1>
            <p className="team-hero__copy">
              We build worlds
              <br />
              that stay with you.
            </p>
          </div>
          <div className="team-hero__bottom">
            <span className="production-label">
              The people & the process
              <br />
              Behind Black Tides: Draga’s Wake
            </span>
            <a href="#founder-title" className="team-text-link focus-ring">
              Meet the makers <span aria-hidden="true">↓</span>
            </a>
          </div>
        </header>
        <section className="team-founder" aria-labelledby="founder-title">
          <div className="team-founder__eyebrow production-label">
            <span>01 / Creative leadership</span>
            <span>Built on reputation.</span>
          </div>
          <figure className="team-founder__portrait">
            {/* oxlint-disable-next-line next/no-img-element */}
            <img
              src="/assets/team/greg-strangis.webp"
              alt="Greg Strangis, CEO and Creative Director"
              width={685}
              height={900}
            />
            <figcaption className="production-label">
              Greg Strangis / Founder
            </figcaption>
          </figure>
          <div className="team-founder__bio">
            <p className="production-label">CEO / Creative Director</p>
            <h2 id="founder-title">Greg Strangis</h2>
            <p>
              Self-taught, Greg came to the industry through construction. His
              career took him to Rockstar Games, Naughty Dog and Turtle Rock
              Studios, and into creature work alongside Guillermo del Toro and
              Carlos Huante.
            </p>
            <p>
              He assembled Strange Creature Factory around a shared vision and a
              clear production plan. The first playable demo was built in twelve
              months, with no external funding.
            </p>
            <p className="team-founder__statement">
              A world worth building.
              <br />A team that believes in it.
            </p>
          </div>
        </section>
        <section
          className="team-founder team-founder--voice"
          aria-labelledby="voice-title"
        >
          <div className="team-founder__eyebrow production-label">
            <span>02 / {voiceOfDraga.role}</span>
            <span>A voice you already know.</span>
          </div>
          <figure className="team-founder__portrait">
            {/* oxlint-disable-next-line next/no-img-element */}
            <img
              src={media.images.draga.webp.large}
              alt={media.images.draga.alt}
              width={1920}
              height={1049}
              loading="lazy"
            />
            <figcaption className="production-label">
              {voiceOfDraga.portraitCaption}
            </figcaption>
          </figure>
          <div className="team-founder__bio">
            <p className="production-label">{voiceOfDraga.role}</p>
            <h2 id="voice-title">{voiceOfDraga.name}</h2>
            {voiceOfDraga.biography.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="team-founder__statement">
              {voiceOfDraga.statement[0]}
              <br />
              {voiceOfDraga.statement[1]}
            </p>
          </div>
        </section>
        <section className="team-roster" aria-labelledby="roster-title">
          <div className="team-section-heading">
            <p className="production-label">03 / The people</p>
            <h2 id="roster-title">
              Many disciplines.
              <br />
              <em>One world.</em>
            </h2>
          </div>
          <p className="team-section-copy">
            18 contributors across art, gameplay, animation, lighting,
            cinematics and technical production.
          </p>
          {/*
            Rollo de créditos: los nombres pasan como al final de una película,
            presentes pero sin reclamar el foco. Sin animación —o sin JS— la
            lista se lee entera, quieta, y la copia duplicada se oculta.
          */}
          <div className="team-roll">
            <div className="team-roll__viewport">
              <ul className="team-roll__track">
                {team.map((person) => (
                  <li key={person.name}>
                    <span className="team-roll__name">{person.name}</span>
                    <span className="production-label">{person.role}</span>
                  </li>
                ))}
                <li className="team-roll__tail">
                  <span className="production-label">{creditRollTail}</span>
                </li>
              </ul>
              <ul className="team-roll__track" aria-hidden="true">
                {team.map((person) => (
                  <li key={person.name}>
                    <span className="team-roll__name">{person.name}</span>
                    <span className="production-label">{person.role}</span>
                  </li>
                ))}
                <li className="team-roll__tail">
                  <span className="production-label">{creditRollTail}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section className="team-credits" aria-labelledby="credits-title">
          <div className="team-section-heading">
            <p className="production-label">04 / Previous work</p>
            <h2 id="credits-title">
              You’ve seen
              <br />
              <em>our work before.</em>
            </h2>
          </div>
          <p className="team-section-copy">
            Selected projects from our team members’ previous careers in games,
            film and television.
          </p>
          <CreditCarousel
            title="Games, film & television"
            credits={[...gameCredits, ...screenCredits]}
          />
        </section>
        <section className="team-production" aria-labelledby="craft-title">
          <div className="team-section-heading">
            <p className="production-label">05 / Production</p>
            <h2 id="craft-title">From vision to vessel.</h2>
          </div>
          <div className="team-method">
            <article>
              <h3>Built together before</h3>
              <p>
                The core team has worked together for over a decade across VFX
                and film, with more than eight years of collaboration with
                senior rigging and technical animation leads.
              </p>
            </article>
            <article>
              <h3>Plan before building</h3>
              <p>
                Dependencies shape the schedule: blockout before art, systems
                proven in a slice before they scale. An international team works
                asynchronously, with handoffs planned across disciplines.
              </p>
            </article>
            <article>
              <h3>The next stage</h3>
              <p>
                The vertical slice is the next major deliverable. Funding is
                intended to expand combat and AI programming, performance
                capture, animation, sound design and optimization. The
                production schedule depends on the funding path.
              </p>
            </article>
          </div>
          <ProductionComparison />
        </section>
        <footer className="team-footer">
          <div>
            <p className="production-label">Strange Creature Factory Ltd</p>
            <h2>Let’s talk Black Tides.</h2>
          </div>
          <a
            href={`mailto:${contactContent.email}`}
            className="team-link focus-ring"
          >
            {contactContent.email} <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <Link href="/#production" className="team-link focus-ring">
            <ArrowLeft size={18} aria-hidden="true" /> Return to Black Tides
          </Link>
        </footer>
      </main>
    </div>
  );
}
