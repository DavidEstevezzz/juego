'use client';

import { useRef, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { media } from '@/content/media';
import { siteContent } from '@/content/site-content';

const { hero } = siteContent;

type TrailerDialogProps = {
  /** Avisa al hero para pausar el loop mientras el teaser está abierto. */
  onOpenChange?: (open: boolean) => void;
};

/**
 * Modal del teaser.
 *
 * El `<video>` solo existe mientras el diálogo está abierto, así que el teaser
 * completo (5,7 MB) no entra en la carga inicial. Al cerrar se pausa, se retira
 * la fuente y el primitive devuelve el foco al botón que lo abrió.
 *
 * El foco atrapado, `Escape` y el bloqueo del scroll de fondo los aporta el
 * Dialog de Base UI que ya existe en `components/ui`.
 */
export function TrailerDialog({ onOpenChange }: TrailerDialogProps) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      setMuted(true);
    }

    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  // El sonido solo se activa con una acción explícita del usuario.
  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label={hero.ctaPrimary}
            data-hero-cta
            className="font-system inline-flex min-h-12 items-center gap-3 border border-[color:var(--border-scarlet)] bg-transparent px-6 text-[var(--font-system-action)] uppercase tracking-[var(--tracking-system)] text-foreground transition-colors duration-200 hover:bg-scarlet focus-visible:bg-scarlet focus-ring"
          />
        }
      >
        <Play aria-hidden="true" className="h-4 w-4" />
        {hero.ctaPrimary}
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="max-w-[min(96vw,1180px)] gap-0 rounded-none border border-[color:var(--border-scarlet)] bg-void p-0 text-foreground ring-0 sm:max-w-[min(96vw,1180px)]"
      >
        <DialogTitle className="font-system border-b border-[color:var(--border-subtle)] px-4 py-3 text-[var(--font-system-label)] uppercase tracking-[var(--tracking-system)] text-steel">
          {hero.trailerTitle}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {hero.trailerDescription}
        </DialogDescription>

        <div className="relative aspect-video w-full bg-charcoal">
          {/* Sin subtítulos todavía: no existe un archivo aprobado para el
              teaser. Se añadirá un <track kind="captions"> en cuanto el equipo
              lo entregue; queda anotado como limitación de esta entrega. */}
          {open && (
            // oxlint-disable-next-line jsx-a11y/media-has-caption
            <video
              ref={videoRef}
              src={media.video.teaser}
              poster={media.video.heroPoster}
              controls
              autoPlay
              muted={muted}
              playsInline
              preload="auto"
              className="h-full w-full"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[color:var(--border-subtle)] px-4 py-3">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={!muted}
            className="font-system inline-flex min-h-11 items-center gap-2 border border-[color:var(--border-brass)] px-4 text-[var(--font-system-label)] uppercase tracking-[var(--tracking-system)] text-steel transition-colors hover:border-brass hover:text-foreground focus-ring"
          >
            {muted ? (
              <VolumeX aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Volume2 aria-hidden="true" className="h-4 w-4" />
            )}
            {muted ? hero.soundOn : hero.soundOff}
          </button>

          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="font-system inline-flex min-h-11 items-center gap-2 border border-[color:var(--border-scarlet)] px-4 text-[var(--font-system-label)] uppercase tracking-[var(--tracking-system)] text-foreground transition-colors hover:bg-scarlet focus-ring"
          >
            {hero.closeTrailer}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
