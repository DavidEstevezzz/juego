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
  title: 'Black Tides: Draga’s Wake — Interactive presentation',
  // Declarado explícitamente: sin esto el navegador sondea `/favicon.ico` y
  // devuelve un 404, ya que solo existe la versión SVG.
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
  description:
    'A cinematic web presentation of the world, gameplay promise and production vision behind Black Tides: Draga’s Wake.',
  openGraph: {
    title: 'Black Tides: Draga’s Wake',
    description:
      'An interactive web presentation of the world, experience and vision behind Black Tides: Draga’s Wake.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Black Tides: Draga’s Wake — Interactive presentation',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Black Tides: Draga’s Wake',
    description:
      'An interactive web presentation of the world, experience and vision behind Black Tides: Draga’s Wake.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Las variables de fuente van en `<html>`, no en `<body>`: los tokens
    // `--font-display/body/system` se declaran en `:root` y `var()` dentro de
    // una custom property se resuelve en el elemento que la declara. Si las
    // clases vivieran en `<body>`, `:root` no vería `--font-cinzel` y todos los
    // tokens tipográficos caerían al fallback del sistema.
    <html
      lang="en"
      className={`${cinzel.variable} ${plexSans.variable} ${shareTechMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
