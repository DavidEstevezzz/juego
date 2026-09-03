import { mkdir, rm, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const sourceImages = path.join(projectRoot, "source-assets", "images");
const sourceVideo = path.join(projectRoot, "source-assets", "video");
const outputRoot = path.join(projectRoot, "public", "assets", "media");
const outputImages = path.join(outputRoot, "images");
const outputVideo = path.join(outputRoot, "video");

const images = [
  ["BillScreenSaturday2.png", "bill-dialogue"],
  ["BlackTadesDragasWake_ENVLog_After.png", "ship-corridor"],
  ["BlubberRoomSteam.png", "blubber-room"],
  ["DriftwoodOutskirt.png", "driftwood-outskirts"],
  ["Growth.png", "organic-growth"],
  ["Izzy_Protag - frame at 0m2s.jpg", "izzy-protagonist"],
  ["MQ_Village.png", "frozen-village"],
  ["Screenshot 2026-06-03 102608.png", "ship-atrium"],
  ["ScreenShot00047.png", "captains-cabin"],
  ["ScreenShot00068.png", "frozen-deck"],
  ["ScreenShot00350.png", "draga-profile"],
  ["ScreenShot00616.png", "bearded-survivor"],
  ["ScreenShot00661.png", "bearded-survivor-closeup"],
  ["Sub2Storage.png", "submarine-storage"],
  ["verticalcapsule_DragaHeader_V2.png", "draga-capsule-v2"],
  ["verticalcapsule_DragaHeader.png", "draga-capsule"],
  ["VesselMale_Socials.png", "vessel-creature"],
];

const formatBytes = (bytes) => {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = units[0];

  for (const candidate of units) {
    unit = candidate;
    if (value < 1024 || candidate === units.at(-1)) break;
    value /= 1024;
  }

  return `${value.toFixed(value >= 10 ? 1 : 2)} ${unit}`;
};

const runFfmpeg = (args) =>
  new Promise((resolve, reject) => {
    const process = spawn(ffmpegPath, args, { stdio: "inherit" });
    process.once("error", reject);
    process.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });

async function optimizeImage(filename, slug) {
  const input = path.join(sourceImages, filename);
  const metadata = await sharp(input).metadata();
  const maximumWidth = Math.min(metadata.width ?? 1920, 1920);
  const widths = [...new Set([Math.min(960, maximumWidth), maximumWidth])];

  for (const width of widths) {
    const resized = sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true });

    await Promise.all([
      resized
        .clone()
        .webp({ quality: 80, effort: 5, smartSubsample: true })
        .toFile(path.join(outputImages, `${slug}-${width}.webp`)),
      resized
        .clone()
        .avif({ quality: 52, effort: 5, chromaSubsampling: "4:2:0" })
        .toFile(path.join(outputImages, `${slug}-${width}.avif`)),
    ]);
  }

  console.log(`Optimized image: ${slug}`);
}

async function reportOutputs(directory) {
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(directory, { recursive: true });
  let total = 0;

  for (const file of files) {
    const filePath = path.join(directory, file);
    const details = await stat(filePath);
    if (details.isFile()) total += details.size;
  }

  console.log(`Generated ${files.length} files (${formatBytes(total)}).`);
}

async function main() {
  if (!ffmpegPath) throw new Error("ffmpeg-static did not provide a binary.");

  await rm(outputRoot, { recursive: true, force: true });
  await Promise.all([
    mkdir(outputImages, { recursive: true }),
    mkdir(outputVideo, { recursive: true }),
  ]);

  for (const [filename, slug] of images) {
    await optimizeImage(filename, slug);
  }

  const teaserSource = path.join(
    sourceVideo,
    "what-lurks-inside-teaser-master.mp4",
  );

  await runFfmpeg([
    "-y",
    "-ss",
    "2.5",
    "-t",
    "18",
    "-i",
    teaserSource,
    "-an",
    "-vf",
    "scale=1600:-2,fps=24,fade=t=in:st=0:d=0.75,fade=t=out:st=17.25:d=0.75",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "27",
    "-maxrate",
    "3000k",
    "-bufsize",
    "6000k",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    path.join(outputVideo, "hero-loop.mp4"),
  ]);

  await runFfmpeg([
    "-y",
    "-i",
    teaserSource,
    "-vf",
    "scale=1920:-2,fps=24",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "25",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    path.join(outputVideo, "teaser-1080p.mp4"),
  ]);

  await runFfmpeg([
    "-y",
    "-ss",
    "25",
    "-i",
    teaserSource,
    "-frames:v",
    "1",
    "-vf",
    "scale=1920:-2",
    "-c:v",
    "libwebp",
    "-quality",
    "82",
    path.join(outputVideo, "hero-poster.webp"),
  ]);

  await reportOutputs(outputRoot);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
