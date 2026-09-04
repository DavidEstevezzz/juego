/** Small non-React bridge between the DOM stage and the shared canvas. */
export type InfectionFrame = {
  progress: number;
  visible: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  pointerX: number;
  pointerY: number;
  pointerActive: number;
};

const initial: InfectionFrame = {
  progress: 0,
  visible: false,
  left: 0,
  top: 0,
  width: 1,
  height: 1,
  pointerX: 0.5,
  pointerY: 0.5,
  pointerActive: 0,
};
let frame = { ...initial };
const listeners = new Set<() => void>();

export function getInfectionFrame(): Readonly<InfectionFrame> {
  return frame;
}

export function updateInfectionFrame(patch: Partial<InfectionFrame>) {
  const keys = Object.keys(patch) as (keyof InfectionFrame)[];
  if (!keys.some((key) => patch[key] !== frame[key])) return;
  frame = { ...frame, ...patch };
  for (const listener of listeners) listener();
}

export function subscribeInfectionFrame(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetInfectionFrame() {
  updateInfectionFrame(initial);
}
