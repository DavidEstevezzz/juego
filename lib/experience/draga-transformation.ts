export const INFECTION_HOLD_MS = 2400;
export const INFECTION_RETURN_MS = 450;

export function advanceInfection(
  progress: number,
  elapsed: number,
  holding: boolean,
) {
  const delta = Math.max(0, Math.min(elapsed, 64));
  return Math.max(
    0,
    Math.min(
      1,
      progress +
        (holding ? delta / INFECTION_HOLD_MS : -delta / INFECTION_RETURN_MS),
    ),
  );
}

/** A fixed irregular reveal contour, growing from the arm. Reversible, without random frames. */
export function infectionContour(progress: number) {
  if (progress <= 0) return 'circle(0% at 24% 56%)';
  if (progress >= 1) return 'inset(0)';
  const radius = progress * 1.3;
  const points = Array.from({ length: 80 }, (_, index) => {
    const angle = (index / 80) * Math.PI * 2;
    const ripple =
      1 + 0.085 * Math.sin(angle * 7) + 0.04 * Math.cos(angle * 13);
    return `${(24 + Math.cos(angle) * radius * ripple * 100).toFixed(2)}% ${(56 + Math.sin(angle) * radius * ripple * 80).toFixed(2)}%`;
  });
  return `polygon(${points.join(',')})`;
}

/** Keep the imperative frame loop outside React’s render and memoization graph. */
export function runInfectionFrames(
  state: {
    progress: number;
    phase: 'idle' | 'holding' | 'returning' | 'infected';
    frame: number;
    last: number;
  },
  paint: (progress: number) => void,
  complete: () => void,
  reset: () => void,
) {
  cancelAnimationFrame(state.frame);
  state.last = performance.now();
  function tick(now: number) {
    state.progress = advanceInfection(
      state.progress,
      now - state.last,
      state.phase === 'holding',
    );
    state.last = now;
    paint(state.progress);
    if (state.progress >= 1) {
      complete();
      return;
    }
    if (state.progress <= 0 && state.phase !== 'holding') {
      reset();
      return;
    }
    state.frame = requestAnimationFrame(tick);
  }
  state.frame = requestAnimationFrame(tick);
}
