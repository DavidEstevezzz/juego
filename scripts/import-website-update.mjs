import sharp from 'sharp';
import path from 'node:path';
// Place the supplied originals here before regenerating web derivatives.
const source = process.argv[2] ?? 'source-assets/website-update';
const items = [
  ['GodsImageWebsite.png', 'gods-altar'],
  ['ormora.png', 'ormora-original'],
  ['ABSORB.png', 'gameplay-absorb'],
  ['CONFRONT.png', 'gameplay-confront'],
  ['EXPLORE.png', 'gameplay-explore'],
  ['Draga_MainHero.png', 'draga-main-hero'],
  ['ManinWallDraga.jpg', 'man-in-wall'],
  ['Sunday-service-Dominik-Diamond-701x770.png', 'dominik-diamond'],
  ['BlackTadesDragasWake_ENVLog_Before.png', 'production-before'],
  ['BlackTadesDragasWake_ENVLog_After.png', 'production-after'],
];
for (const [filename, slug] of items) {
  const input = path.isAbsolute(filename)
    ? filename
    : path.join(source, filename);
  for (const width of [960, 1920]) {
    const resized = sharp(input).resize({ width });
    await Promise.all([
      resized
        .clone()
        .webp({ quality: 87 })
        .toFile(`public/assets/media/images/${slug}-${width}.webp`),
      resized
        .clone()
        .avif({ quality: 58, effort: 3 })
        .toFile(`public/assets/media/images/${slug}-${width}.avif`),
    ]);
  }
  console.log(slug);
}
