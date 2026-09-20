import sharp from 'sharp';
import path from 'node:path';
// Place the supplied originals here before regenerating web derivatives.
const source = process.argv[2] ?? 'source-assets/website-update';
/**
 * Each entry is a source filename, its output slug and, optionally, the
 * encoder settings that override the shared defaults below.
 *
 * @type {[string, string, { webp?: object, avif?: object }?][]}
 */
const items = [
  ['BelugaGrab.png', 'beluga-grab'],
  ['GodsImageWebsite.png', 'gods-altar'],
  // The Ormora exterior is a dark, low-contrast frame: the default AVIF
  // settings soften its storm detail well below the WebP variant, so it is
  // encoded with a higher quality and full chroma.
  [
    'ormora.png',
    'ormora-original',
    { avif: { quality: 76, effort: 5, chromaSubsampling: '4:4:4' } },
  ],
  ['ABSORB.png', 'gameplay-absorb'],
  ['CONFRONT.png', 'gameplay-confront'],
  ['EXPLORE.png', 'gameplay-explore'],
  ['Draga_MainHero.png', 'draga-main-hero'],
  ['ManinWallDraga.jpg', 'man-in-wall'],
  ['Sunday-service-Dominik-Diamond-701x770.png', 'dominik-diamond'],
  ['BlackTadesDragasWake_ENVLog_Before.png', 'production-before'],
  ['BlackTadesDragasWake_ENVLog_After.png', 'production-after'],
];
const WEBP = { quality: 87 };
const AVIF = { quality: 58, effort: 3 };

for (const [filename, slug, overrides = {}] of items) {
  const input = path.isAbsolute(filename)
    ? filename
    : path.join(source, filename);
  for (const width of [960, 1920]) {
    const resized = sharp(input).resize({ width });
    await Promise.all([
      resized
        .clone()
        .webp({ ...WEBP, ...overrides.webp })
        .toFile(`public/assets/media/images/${slug}-${width}.webp`),
      resized
        .clone()
        .avif({ ...AVIF, ...overrides.avif })
        .toFile(`public/assets/media/images/${slug}-${width}.avif`),
    ]);
  }
  console.log(slug);
}
