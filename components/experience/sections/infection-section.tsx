'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  chapterCountLabel,
  chapterMap,
  infectionChapterContent,
} from '@/content/chapters';
import { media } from '@/content/media';
import {
  FOLLOW_EASE,
  registerGsap,
  SCRUB_SECONDS,
} from '@/lib/experience/gsap';
import {
  getInfectionFrame,
  resetInfectionFrame,
  updateInfectionFrame,
} from '@/lib/experience/infection-frame';
import {
  measureInfectionProgress,
  sampleInfection,
} from '@/lib/experience/infection-timeline';
import {
  subscribeLayoutChange,
  subscribeScrollMetrics,
} from '@/lib/experience/scroll-metrics';
import { useExperienceStore } from '@/lib/experience/store';
import { createStyleWriter } from '@/lib/experience/style-writer';
import { MediaSubject } from '../media-subject';

const chapter = chapterMap.infection;
const content = infectionChapterContent;
// CSS uses the same query: no hydration height change and a complete no-JS layout.
const CINEMATIC_QUERY =
  '(prefers-reduced-motion: no-preference) and (scripting: enabled) and (min-height: 600px)';

/**
 * Salto de progreso a partir del cual la secuencia se coloca en vez de viajar.
 *
 * Un enlace del índice o el retorno con el botón atrás cambian el scroll de
 * golpe: interpolar ese salto haría recorrer toda la infección en medio segundo.
 * Un scroll normal, incluso rápido, se queda muy por debajo de este umbral.
 */
const SNAP_THRESHOLD = 0.28;

/** One continuous descent, with a complete editorial alternative. No new scroll listener. */
export function InfectionSection() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  // El primer fotograma marca el rectángulo que la capa WebGL debe cubrir. Se
  // guarda al montar: buscarlo en cada frame de scroll era una consulta al DOM
  // por frame para un elemento que no se mueve dentro del escenario.
  const anchorFrame = useRef<HTMLDivElement>(null);
  const pointerRaf = useRef<number | null>(null);
  const pointerPosition = useRef({ x: 0, y: 0 });
  const [cinematic, setCinematic] = useState(false);
  const ready = useExperienceStore((state) => state.infectionSceneReady);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const graphicsTier = useExperienceStore((state) => state.graphicsTier);
  const webglAvailable = useExperienceStore((state) => state.webglAvailable);
  const useWebgl =
    cinematic &&
    ready &&
    webglAvailable &&
    graphicsTier !== 'c' &&
    !reducedMotion;

  useEffect(() => {
    const query = window.matchMedia(CINEMATIC_QUERY);
    const sync = () => setCinematic(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const writer = useRef(createStyleWriter(null));
  useEffect(() => {
    writer.current = createStyleWriter(stage.current);
    return () => {
      writer.current = createStyleWriter(null);
    };
  }, [cinematic]);

  const writeProgress = useCallback((progress: number) => {
    const target = writer.current;
    const frame = sampleInfection(progress);
    // `clip-path` repinta el fotograma completo, así que se publica con una
    // décima de porcentaje: más precisión no se ve y sí cuesta repintados.
    target.set('--infection-room-edge', 115 - frame.room * 130, 1, '%');
    target.set('--infection-presence-radius', frame.presence * 150, 1, '%');
    target.set('--infection-red', frame.red * 0.2);
    target.set('--infection-progress', frame.progress);
    // Cambiar el atributo invalida el estilo de todo el subárbol: solo cuando
    // la fase cambia de verdad, no en cada frame de la fase.
    target.data('phase', String(frame.phase));
    updateInfectionFrame({ progress: frame.progress });
  }, []);

  const resetPointer = useCallback(() => {
    if (pointerRaf.current !== null) {
      window.cancelAnimationFrame(pointerRaf.current);
      pointerRaf.current = null;
    }
    updateInfectionFrame({ pointerActive: 0, pointerX: 0.5, pointerY: 0.5 });
  }, []);

  /*
   * Recorrido del capítulo.
   *
   * El escenario mide su propia posición porque necesita, además del progreso,
   * el rectángulo exacto del fotograma para que la capa WebGL se superponga al
   * DOM. Ese rectángulo se publica en crudo —debe coincidir con dónde está la
   * imagen ahora mismo—, pero el progreso pasa antes por un seguimiento
   * amortiguado de GSAP: la rueda del ratón entrega saltos discretos y, sin
   * amortiguar, el recorte del plano 02 y la elipse del 03 avanzaban a
   * escalones. El tween mantiene vivo el ticker hasta llegar al destino, así
   * que el movimiento continúa —y termina— aunque el scroll ya se haya parado.
   */
  useEffect(() => {
    if (!cinematic || reducedMotion) {
      resetInfectionFrame();
      return;
    }

    const playhead = { progress: 0 };
    const gsap = registerGsap();
    const follow = gsap.quickTo(playhead, 'progress', {
      duration: SCRUB_SECONDS,
      ease: FOLLOW_EASE,
      onUpdate: () => writeProgress(playhead.progress),
    });

    let placed = false;

    const sync = () => {
      if (!useExperienceStore.getState().documentVisible) return;
      const section = root.current;
      const element = stage.current;
      const image = anchorFrame.current;
      if (!section || !element) return;

      // Lecturas de layout agrupadas: nada escribe hasta tenerlas todas.
      const bounds = section.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      const imageRect = image?.getBoundingClientRect() ?? rect;

      const visible =
        imageRect.bottom > 0 && imageRect.top < window.innerHeight;
      const progress = measureInfectionProgress(
        bounds.top,
        bounds.height,
        rect.top,
        rect.height,
      );

      updateInfectionFrame({
        visible,
        left: imageRect.left,
        top: imageRect.top,
        width: imageRect.width,
        height: imageRect.height,
      });

      if (!visible) {
        // Fuera de pantalla no se interpola: al volver, la secuencia debe
        // aparecer ya colocada, no recorriendo el camino desde donde se quedó.
        placed = false;
        resetPointer();
        return;
      }

      const jumped =
        !placed || Math.abs(progress - playhead.progress) > SNAP_THRESHOLD;
      placed = true;
      // El segundo argumento reubica el origen del tween: con él, el salto se
      // resuelve en el mismo frame; sin él, se viaja hasta el destino.
      if (jumped) follow(progress, progress);
      else follow(progress);
    };

    const stopScroll = subscribeScrollMetrics(sync);
    const stopLayout = subscribeLayoutChange(sync);
    const stopState = useExperienceStore.subscribe((state, previous) => {
      if (state.documentVisible !== previous.documentVisible) {
        if (state.documentVisible) sync();
        else {
          placed = false;
          resetPointer();
          updateInfectionFrame({ visible: false });
        }
      }
      if (state.graphicsTier === 'c' && previous.graphicsTier !== 'c')
        resetPointer();
    });

    return () => {
      stopScroll();
      stopLayout();
      stopState();
      follow.tween?.kill();
      resetPointer();
      resetInfectionFrame();
    };
  }, [cinematic, reducedMotion, resetPointer, writeProgress]);

  const handlePointer = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const state = useExperienceStore.getState();
    if (
      event.pointerType !== 'mouse' ||
      !getInfectionFrame().visible ||
      state.reducedMotion ||
      !state.documentVisible ||
      state.graphicsTier === 'c'
    )
      return;
    pointerPosition.current = { x: event.clientX, y: event.clientY };
    if (pointerRaf.current !== null) return;
    pointerRaf.current = window.requestAnimationFrame(() => {
      pointerRaf.current = null;
      const rect = getInfectionFrame();
      if (!rect.width || !rect.height || !rect.visible) return;
      updateInfectionFrame({
        pointerX: Math.max(
          0,
          Math.min(1, (pointerPosition.current.x - rect.left) / rect.width),
        ),
        pointerY: Math.max(
          0,
          Math.min(1, (pointerPosition.current.y - rect.top) / rect.height),
        ),
        pointerActive: 1,
      });
    });
  }, []);

  return (
    <section
      ref={root}
      id={chapter.id}
      data-chapter={chapter.id}
      className="infection-chapter"
      aria-labelledby="infection-title"
    >
      <div
        ref={stage}
        className="infection-stage"
        data-webgl={useWebgl || undefined}
        data-phase="0"
        onPointerMove={handlePointer}
        onPointerLeave={resetPointer}
        onPointerCancel={resetPointer}
      >
        <header className="infection-heading">
          <div className="infection-heading__meta">
            <span>Deck {chapter.index}</span>
            <span aria-hidden="true" />
            <span>
              {chapter.index} / {chapterCountLabel}
            </span>
          </div>
          <p className="infection-heading__category">{content.category}</p>
          <h2 id="infection-title">
            <span>The</span> infection
          </h2>
        </header>

        <div className="infection-media">
          {content.phases.map((phase, index) => (
            <figure
              key={phase.id}
              className={`infection-frame infection-frame--${phase.id}`}
            >
              <div
                ref={index === 0 ? anchorFrame : undefined}
                className="infection-frame__image"
              >
                <MediaSubject
                  source={{
                    kind: 'image',
                    image: media.images[phase.media],
                    width: phase.width,
                    height: phase.height,
                  }}
                  sizes="100vw"
                />
              </div>
              <figcaption className="infection-frame__caption">
                <span>
                  {String(index + 1).padStart(2, '0')} / {phase.label}
                </span>
                <p>{phase.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="infection-atmosphere" aria-hidden="true" />
        <div className="infection-sequence" aria-hidden="true">
          <span className="infection-sequence__line" />
          <ol>
            {content.phases.map((phase, index) => (
              <li key={phase.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {phase.label}
              </li>
            ))}
          </ol>
        </div>
        <a href="#production" className="infection-continue">
          {content.continueLabel}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
