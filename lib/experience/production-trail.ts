export type TrailPoint = { x: number; y: number };
export type TrailStamp = TrailPoint & { time: number };
export const TRAIL_HOLD_MS = 2200;
export const TRAIL_FADE_MS = 1700;
export const TRAIL_LIFETIME_MS = TRAIL_HOLD_MS + TRAIL_FADE_MS;
export const MAX_TRAIL_STAMPS = 384;

/** Absolute age, never frame-count based. Smooth first derivatives at both ends. */
export function trailOpacity(age: number): number {
  const entrance = Math.max(0, Math.min(1, age / 140));
  const t = Math.max(0, Math.min(1, (age - TRAIL_HOLD_MS) / TRAIL_FADE_MS));
  return entrance * entrance * (3 - 2 * entrance) * (1 - t * t * (3 - 2 * t));
}

/** Normalized coordinates; aspect corrects Y to the same units as X. */
export function interpolateTrail(
  from: TrailPoint,
  to: TrailPoint,
  spacing: number,
  aspect: number,
): TrailPoint[] {
  const distance = Math.hypot(to.x - from.x, (to.y - from.y) / aspect);
  const steps = Math.min(
    64,
    Math.max(1, Math.ceil(distance / Math.max(0.001, spacing))),
  );
  return Array.from({ length: steps }, (_, index) => {
    const t = (index + 1) / steps;
    return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
  });
}

export function trimTrail(stamps: TrailStamp[], now: number): TrailStamp[] {
  return stamps
    .filter((stamp) => now - stamp.time < TRAIL_LIFETIME_MS)
    .slice(-MAX_TRAIL_STAMPS);
}

/** Emit by travelled distance, not refresh rate. Carry the unsampled remainder. */
export function sampleTrailMovement(
  from: TrailPoint,
  to: TrailPoint,
  spacing: number,
  aspect: number,
): TrailPoint[] {
  const distance = Math.hypot(to.x - from.x, (to.y - from.y) / aspect);
  const count = Math.min(64, Math.floor(distance / Math.max(0.001, spacing)));
  if (!count) return [];
  return Array.from({ length: count }, (_, index) => {
    const t = Math.min(1, ((index + 1) * spacing) / distance);
    return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
  });
}
