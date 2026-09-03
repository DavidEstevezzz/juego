import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Proyecto de videojuego — Presentación interactiva',
  description:
    'Base de la experiencia web cinematográfica para presentar el universo, la propuesta y la visión del videojuego.',
  openGraph: {
    title: 'Proyecto de videojuego',
    description: 'Presentación web interactiva del universo, la experiencia y la visión del videojuego.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Proyecto de videojuego — Presentación interactiva' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Proyecto de videojuego',
    description: 'Presentación web interactiva del universo, la experiencia y la visión del videojuego.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
