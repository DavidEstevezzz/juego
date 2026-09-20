import type { ReactElement } from 'react';
import type { ContactChannelId } from '@/content/contact';

/**
 * Marcas de las redes, grabadas.
 *
 * No se usa una librería de logos: `lucide` retiró las marcas comerciales y
 * traer un paquete entero por cuatro glifos no se paga. Cada una se dibuja
 * aquí, con la geometría reconocible de la red —una marca irreconocible no
 * sirve de enlace— y el tratamiento del sitio encima: trazo de placa naval,
 * latón sobre negro y calor `ember` al acercarse. El color lo pone el CSS con
 * `currentColor`, así que el mismo glifo vale para la pestaña y para la
 * tarjeta sin duplicarse.
 *
 * Todas comparten lienzo de 24×24 salvo la X, que conserva el suyo para no
 * deformar el único glifo que no es geometría elemental.
 */

type MarkProps = { className?: string };

const common = {
  'aria-hidden': true,
  focusable: false,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** Válvula de vapor: el círculo mayor, la carga y su varilla. */
function SteamMark({ className }: MarkProps) {
  return (
    <svg {...common} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="9.1" />
      <circle cx="9.1" cy="15.3" r="3.1" />
      <circle cx="9.1" cy="15.3" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="16.2" cy="8.9" r="2.7" />
      <path d="M11.5 13 14.1 10.4" />
    </svg>
  );
}

/** Placa remachada con las iniciales de la red. */
function LinkedInMark({ className }: MarkProps) {
  return (
    <svg {...common} viewBox="0 0 24 24" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2.2" />
      <circle cx="7.7" cy="7.6" r="1.35" fill="currentColor" stroke="none" />
      <path d="M7.7 10.9v6.6" />
      <path d="M11.9 17.5v-6.6" />
      <path d="M11.9 13.6a2.4 2.4 0 0 1 4.8 0v3.9" />
    </svg>
  );
}

/**
 * La X conserva su trazo original —el asta fina y el remate grueso—, que un
 * aspa de dos líneas iguales pierde: dibujada así se confunde con un cierre.
 */
function XMark({ className }: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1200 1227"
      className={className}
    >
      <path
        fill="currentColor"
        d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.163 519.284Zm-144.998 168.5-47.468-67.894L144.011 79.694h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.816Z"
      />
    </svg>
  );
}

/** Escotilla: marco, lente y el punto del visor. */
function InstagramMark({ className }: MarkProps) {
  return (
    <svg {...common} viewBox="0 0 24 24" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.1" cy="6.9" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeMark({ className }: MarkProps) {
  return (
    <svg {...common} viewBox="0 0 24 24" className={className}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const marks: Record<ContactChannelId, (props: MarkProps) => ReactElement> = {
  steam: SteamMark,
  linkedin: LinkedInMark,
  x: XMark,
  instagram: InstagramMark,
  youtube: YouTubeMark,
};

export function SocialMark({
  channel,
  className,
}: {
  channel: ContactChannelId;
  className?: string;
}) {
  const Mark = marks[channel];
  return <Mark className={className} />;
}

/**
 * Marca de la propia pestaña: una señal saliendo del casco. Es la única que no
 * pertenece a nadie, así que aquí sí manda el juego —placa, ondas y remache.
 */
export function SignalMark({ className }: MarkProps) {
  return (
    <svg {...common} viewBox="0 0 24 24" className={className}>
      <path d="M3.6 8.4a1.8 1.8 0 0 1 1.8-1.8h13.2a1.8 1.8 0 0 1 1.8 1.8v7.2a1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8Z" />
      <path d="m4.4 7.6 6.5 5a1.8 1.8 0 0 0 2.2 0l6.5-5" />
      <path d="M8.6 20.4h6.8" />
    </svg>
  );
}
