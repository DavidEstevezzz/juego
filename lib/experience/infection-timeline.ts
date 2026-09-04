/** Deterministic montage: the same scroll position always reveals the same art. */
export function clampInfectionProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** Sticky-stage travel, including direct anchors and reverse scroll. */
export function measureInfectionProgress(
  sectionTop: number,
  sectionHeight: number,
  stageTop: number,
  stageHeight: number,
) {
  return clampInfectionProgress(
    (stageTop - sectionTop) / Math.max(sectionHeight - stageHeight, 1),
  );
}

function ramp(value: number, from: number, to: number) {
  const t = clampInfectionProgress((value - from) / (to - from));
  return t * t * (3 - 2 * t);
}

export function sampleInfection(progress: number) {
  const p = clampInfectionProgress(progress);
  const room = ramp(p, 0.26, 0.47);
  const presence = ramp(p, 0.62, 0.84);
  return {
    progress: p,
    room,
    presence,
    // Distortion vanishes during the holds and cannot accumulate over time.
    tension: Math.max(4 * room * (1 - room), 4 * presence * (1 - presence)),
    red: ramp(p, 0.05, 0.48) * (1 - presence * 0.3),
    phase: p < 0.38 ? 0 : p < 0.74 ? 1 : 2,
  };
}
