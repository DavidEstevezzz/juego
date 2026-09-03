import type { Metadata } from 'next';
import { Cinzel, IBM_Plex_Sans, Share_Tech_Mono } from 'next/font/google';
import './globals.css';

// Tipografías definidas en docs/VISUAL-DIRECTION.md. `next/font` las
// autoaloja y reserva métricas, de modo que no hay salto al cargarlas.
const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
});

const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const shareTechMono = Share_Tech_Mono({
  variable: '--font-share-tech-mono',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: 'Black Tides: Draga’s Wake — Presentación interactiva',
  description:
    'Presentación web cinematográfica del universo, la propuesta jugable y la visión de producción de Black Tides: Draga’s Wake.',
  openGraph: {
    title: 'Black Tides: Draga’s Wake',
    description:
      'Presentación web interactiva del universo, la experiencia y la visión de Black Tides: Draga’s Wake.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Black Tides: Draga’s Wake — Presentación interactiva',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Black Tides: Draga’s Wake',
    description:
      'Presentación web interactiva del universo, la experiencia y la visión de Black Tides: Draga’s Wake.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={`${cinzel.variable} ${plexSans.variable} ${shareTechMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
