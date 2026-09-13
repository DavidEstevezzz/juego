'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { ArrowUpRight, Check, Copy, X as CloseMark } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { contactChannels, contactContent } from '@/content/contact';
import { SignalMark, SocialMark } from './social-marks';

const content = contactContent;

/** Tiempo que el acuse de copiado permanece antes de volver a su etiqueta. */
const COPY_FEEDBACK_MS = 2600;

/**
 * Pestaña de contacto: la placa remachada al casco que acompaña el descenso.
 *
 * Vive fuera del `main` y es `fixed`, así que no entra en el flujo de ningún
 * capítulo ni desplaza nada: la experiencia sigue midiendo su scroll igual que
 * antes. No crea listeners propios —el sitio tiene un único driver de scroll—
 * porque no necesita saber dónde está: acompaña siempre.
 *
 * Los cuatro enlaces son anchors nativos y funcionan sin JavaScript. La tarjeta
 * es el `Dialog` de Base UI que ya usan el teaser y el panel de accesibilidad,
 * de modo que el foco atrapado, `Escape`, el bloqueo del fondo y la devolución
 * del foco al abridor son los mismos de siempre y no se reimplementan.
 */
export function ContactRail() {
  const heading = useRef<HTMLHeadingElement>(null);

  return (
    <div className="contact-rail">
      <nav className="contact-rail__plate" aria-label={content.railDescription}>
        <ul className="contact-rail__channels">
          {contactChannels.map((channel) => (
            <li key={channel.id}>
              <a
                href={channel.url}
                target="_blank"
                rel="noreferrer noopener"
                className="contact-rail__link"
                data-channel={channel.id}
              >
                <SocialMark
                  channel={channel.id}
                  className="contact-rail__mark"
                />
                <span className="sr-only">
                  {channel.name} — {channel.description}
                </span>
                {/* Placa auxiliar: aparece al apuntar o al tabular, nunca al
                    tocar, donde solo estorbaría al dedo que ya ha pulsado. */}
                <span aria-hidden="true" className="contact-rail__tip">
                  {channel.name}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <Dialog>
          <DialogTrigger
            render={
              <button
                type="button"
                className="contact-rail__trigger"
                aria-label={content.openLabel}
              />
            }
          >
            <SignalMark className="contact-rail__mark" />
            <span aria-hidden="true" className="contact-rail__word">
              {content.railLabel}
            </span>
          </DialogTrigger>

          <DialogContent
            showCloseButton={false}
            initialFocus={heading}
            /* Los diálogos del sitio comparten chapa: sin redondeo, filo
               `scarlet` y fondo `void`, no la superficie por defecto. */
            /* La tarjeta puede pasar de alto la pantalla —móvil apaisado, un
               viewport corto— y el popup no reserva desplazamiento propio: sin
               el tope, el pie quedaba fuera y sin manera de llegar a él. */
            className="max-h-[calc(100dvh-2rem)] max-w-[min(94vw,560px)] gap-0 overflow-y-auto overscroll-contain rounded-none border border-[color:var(--border-scarlet)] bg-void p-0 text-foreground ring-0 sm:max-w-[min(94vw,560px)]"
          >
            <ContactCard heading={heading} />
          </DialogContent>
        </Dialog>
      </nav>
    </div>
  );
}

/**
 * Tarjeta de contacto.
 *
 * Se monta con el diálogo, así que el portapapeles y su temporizador solo
 * existen mientras está abierta.
 */
function ContactCard({
  heading,
}: {
  heading: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');
  const timeout = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeout.current !== null) window.clearTimeout(timeout.current);
    },
    [],
  );

  const copy = useCallback(async () => {
    // Sin portapapeles —contexto no seguro, permiso denegado— la dirección
    // sigue visible y enlazada: el acuse lo dice en vez de fallar en silencio.
    try {
      await navigator.clipboard.writeText(content.email);
      setCopied('done');
    } catch {
      setCopied('failed');
    }
    if (timeout.current !== null) window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(
      () => setCopied('idle'),
      COPY_FEEDBACK_MS,
    );
  }, []);

  return (
    <div className="contact-card">
      <p className="contact-card__eyebrow">{content.eyebrow}</p>
      <DialogTitle ref={heading} tabIndex={-1} className="contact-card__title">
        {content.title[0]}
        <span>{content.title[1]}</span>
      </DialogTitle>
      <DialogDescription className="contact-card__introduction">
        {content.introduction}
      </DialogDescription>

      <div className="contact-card__address">
        <p className="contact-card__label">{content.emailLabel}</p>
        <div className="contact-card__address-row">
          <a href={`mailto:${content.email}`} className="contact-card__email">
            {content.email}
          </a>
          <button
            type="button"
            onClick={copy}
            className="contact-card__copy"
            data-state={copied}
          >
            {copied === 'done' ? (
              <Check size={15} aria-hidden="true" />
            ) : (
              <Copy size={15} aria-hidden="true" />
            )}
            {copied === 'done'
              ? content.copiedLabel
              : copied === 'failed'
                ? content.copyFailedLabel
                : content.copyLabel}
          </button>
        </div>
        {/* El acuse se anuncia una vez; la etiqueta del botón ya lo repite en
            texto, así que la región solo cubre a quien no lo está enfocando. */}
        <p className="sr-only" aria-live="polite">
          {copied === 'done'
            ? content.copiedLabel
            : copied === 'failed'
              ? content.copyFailedLabel
              : ''}
        </p>
      </div>

      <div className="contact-card__channels">
        <p className="contact-card__label">{content.channelsLabel}</p>
        <ul>
          {contactChannels.map((channel) => (
            <li key={channel.id}>
              <a
                href={channel.url}
                target="_blank"
                rel="noreferrer noopener"
                data-channel={channel.id}
              >
                <SocialMark
                  channel={channel.id}
                  className="contact-card__mark"
                />
                <span className="contact-card__channel-name">
                  {channel.name}
                </span>
                <span className="contact-card__handle">{channel.handle}</span>
                <ArrowUpRight
                  size={15}
                  aria-hidden="true"
                  className="contact-card__arrow"
                />
                <span className="sr-only">{channel.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="contact-card__footer">
        <p>
          <span className="contact-card__label">{content.studioLabel}</span>
          {/* El estudio ya no tiene sitio propio: el nombre se queda como
              firma, sin enlace ni flecha que prometa un destino. */}
          <span className="contact-card__studio">{content.studioName}</span>
        </p>
        <DialogClose
          render={
            /* El nombre accesible sale del propio texto del botón; se declara
               además porque el linter no ve a través de `render`. */
            <button
              type="button"
              aria-label={content.close}
              className="contact-card__close"
            />
          }
        >
          <CloseMark size={15} aria-hidden="true" />
          {content.close}
        </DialogClose>
      </footer>
    </div>
  );
}
