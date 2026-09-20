/** Shared source windows for the DOM and pointer reveal; originals stay intact.
 * Draga's head and shoulder strap anchor the match. The common frame removes
 * the editor header and only the margins needed to align the two cameras.
 */
export const productionFrame = { width: 2470, height: 1216 };
export type SourceWindow = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export const productionWindows = {
  before: { x: 0, y: 120 / 1336, width: 1, height: 1216 / 1336 },
  after: {
    x: 101 / 2576,
    y: 0,
    width: 2372 / 2576,
    height: (2372 * 1216) / 2470 / 1408,
  },
} satisfies Record<string, SourceWindow>;

export function sourceWindowStyle(crop: SourceWindow) {
  return {
    position: 'absolute' as const,
    width: `${100 / crop.width}%`,
    height: `${100 / crop.height}%`,
    maxWidth: 'none',
    left: `${(-100 * crop.x) / crop.width}%`,
    top: `${(-100 * crop.y) / crop.height}%`,
  };
}
