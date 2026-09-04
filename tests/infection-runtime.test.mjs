import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  measureInfectionProgress,
  sampleInfection,
} from '../lib/experience/infection-timeline.ts';
import {
  getInfectionFrame,
  resetInfectionFrame,
  subscribeInfectionFrame,
  updateInfectionFrame,
} from '../lib/experience/infection-frame.ts';

await test('montage has exact endpoints and a still final hold', () => {
  assert.deepEqual(sampleInfection(-1), sampleInfection(0));
  assert.deepEqual(sampleInfection(2), sampleInfection(1));
  assert.equal(sampleInfection(0).room, 0);
  assert.equal(sampleInfection(0).presence, 0);
  assert.equal(sampleInfection(1).room, 1);
  assert.equal(sampleInfection(1).presence, 1);
  for (const p of [0, 0.2, 0.5, 0.6, 0.85, 0.95, 1])
    assert.equal(sampleInfection(p).tension, 0);
});

await test('all uniforms stay bounded, phases ordered, transitions reversible', () => {
  const forward = Array.from({ length: 1001 }, (_, i) =>
    sampleInfection(i / 1000),
  );
  const backward = Array.from({ length: 1001 }, (_, i) =>
    sampleInfection((1000 - i) / 1000),
  ).reverse();
  assert.deepEqual(forward, backward);
  forward.forEach((frame, i) => {
    for (const key of ['progress', 'room', 'presence', 'tension', 'red'])
      assert.ok(frame[key] >= 0 && frame[key] <= 1, `${key} at ${i}`);
    if (i) {
      assert.ok(frame.room >= forward[i - 1].room);
      assert.ok(frame.presence >= forward[i - 1].presence);
      assert.ok(frame.phase >= forward[i - 1].phase);
    }
    if (frame.presence > 0) assert.equal(frame.room, 1);
  });
});

await test('sticky progress follows the stage, not document length or scroll velocity', () => {
  assert.equal(measureInfectionProgress(1200, 2400, 1200, 800), 0);
  assert.equal(measureInfectionProgress(52, 2400, 52, 800), 0);
  assert.equal(measureInfectionProgress(-748, 2400, 52, 800), 0.5);
  assert.equal(measureInfectionProgress(-1548, 2400, 52, 800), 1);
  assert.equal(measureInfectionProgress(-2000, 2400, -400, 800), 1);
  assert.equal(measureInfectionProgress(0, 800, 0, 800), 0);
});

await test('frame subscriptions are quiet for unchanged state and release cleanly', () => {
  resetInfectionFrame();
  let calls = 0;
  const stop = subscribeInfectionFrame(() => calls++);
  updateInfectionFrame({ progress: 0, visible: false });
  assert.equal(calls, 0);
  updateInfectionFrame({ progress: 0.5, visible: true, width: 390 });
  assert.equal(calls, 1);
  const snapshot = getInfectionFrame();
  updateInfectionFrame({ pointerActive: 1 });
  assert.equal(snapshot.pointerActive, 0);
  assert.equal(calls, 2);
  stop();
  resetInfectionFrame();
  assert.equal(calls, 2);
  assert.equal(getInfectionFrame().visible, false);
  assert.equal(getInfectionFrame().pointerActive, 0);
});
