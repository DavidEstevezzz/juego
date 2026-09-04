import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Separate output: the general media optimizer must not erase this recreation.
const source = fileURLToPath(
  new URL(
    '../source-assets/images/production-storage-blockout-v1.png',
    import.meta.url,
  ),
);
const output = fileURLToPath(
  new URL('../public/assets/production/', import.meta.url),
);
await mkdir(output, { recursive: true });
for (const width of [960, 1920]) {
  const height = (width * 996) / 1920;
  // The generated source is not pixel-registered. Normalize both comparison
  // layers to the original frame, without introducing an additional cover crop.
  const pipeline = sharp(source).resize(width, height, { fit: 'fill' });
  await Promise.all([
    pipeline
      .clone()
      .avif({ quality: 58, effort: 6 })
      .toFile(`${output}/storage-blockout-v1-${width}.avif`),
    pipeline
      .clone()
      .webp({ quality: 86, effort: 6 })
      .toFile(`${output}/storage-blockout-v1-${width}.webp`),
  ]);
}
