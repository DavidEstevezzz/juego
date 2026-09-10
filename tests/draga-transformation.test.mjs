import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  advanceInfection,
  infectionContour,
  INFECTION_HOLD_MS,
} from '../lib/experience/draga-transformation.ts';

await test('hold completes at the same duration across refresh rates', () => {
  for (const hz of [30, 60, 120, 144]) {
    let p = 0;
    for (let t = 0; t < INFECTION_HOLD_MS + 100; t += 1000 / hz)
      p = advanceInfection(p, 1000 / hz, true);
    assert.equal(p, 1);
  }
});
await test('early release fully retreats and a new hold can finish', () => {
  let p = 0;
  for (let i = 0; i < 40; i++) p = advanceInfection(p, 16, true);
  assert.ok(p > 0 && p < 1);
  for (let i = 0; i < 40; i++) p = advanceInfection(p, 16, false);
  assert.equal(p, 0);
  for (let i = 0; i < 160; i++) p = advanceInfection(p, 16, true);
  assert.equal(p, 1);
  assert.equal(advanceInfection(0, 100, false), 0);
  assert.equal(advanceInfection(0.1, -100, true), 0.1);
  assert.ok(
    advanceInfection(0, 100000, true) < 0.03,
    'background stalls must not finish the hold',
  );
});
await test('reveal fully covers the frame before latching and stays deterministic', () => {
  assert.equal(infectionContour(1), 'inset(0)');
  assert.equal(infectionContour(0), 'circle(0% at 24% 56%)');
  for (const p of [0.1, 0.25, 0.5, 0.75, 0.99]) {
    const shape = infectionContour(p);
    assert.equal(shape, infectionContour(p));
    assert.equal(shape.includes('NaN'), false);
    assert.ok(shape.startsWith('polygon('));
  }
});

await test('frame loop latches completion, cancels its previous frame and retreats on release', async () => {
  const { runInfectionFrames } =
    await import('../lib/experience/draga-transformation.ts');
  const originalRaf = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;
  const frames = new Map();
  let nextId = 0;
  globalThis.requestAnimationFrame = (callback) => {
    const id = ++nextId;
    frames.set(id, callback);
    return id;
  };
  globalThis.cancelAnimationFrame = (id) => frames.delete(id);
  try {
    const state = { progress: 0, phase: 'holding', frame: 0, last: 0 };
    let completions = 0,
      resets = 0,
      painted = 0;
    const complete = () => {
      state.phase = 'infected';
      completions++;
    };
    const reset = () => {
      state.phase = 'idle';
      resets++;
    };
    const start = () =>
      runInfectionFrames(
        state,
        (p) => {
          painted = p;
        },
        complete,
        reset,
      );
    const step = () => {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((cb) => cb(state.last + 16));
    };
    start();
    start();
    assert.equal(frames.size, 1);
    for (let i = 0; i < 35; i++) step();
    assert.ok(painted > 0 && painted < 1);
    state.phase = 'returning';
    start();
    for (let i = 0; i < 35; i++) step();
    assert.equal(resets, 1);
    assert.equal(painted, 0);
    assert.equal(frames.size, 0);
    state.phase = 'holding';
    start();
    for (let i = 0; i < 160; i++) step();
    assert.equal(completions, 1);
    assert.equal(painted, 1);
    assert.equal(state.phase, 'infected');
    assert.equal(frames.size, 0);
  } finally {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCancel;
  }
});
