import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  sampleWorld,
  WORLD_TIMELINE_LENGTH,
} from '../lib/experience/world-timeline.ts';

const KEYS = [
  'progress',
  'whiteout',
  'sceneMix',
  'rain',
  'squall',
  'shipMix',
  'lensMix',
  'firstDolly',
  'secondDolly',
  'shipDolly',
  'exitShadow',
];

await test('montage has exact endpoints and clamps outside the chapter', () => {
  assert.deepEqual(sampleWorld(-1), sampleWorld(0));
  assert.deepEqual(sampleWorld(2), sampleWorld(1));

  const start = sampleWorld(0);
  const end = sampleWorld(1);
  for (const key of KEYS) {
    assert.equal(start[key], 0, `${key} at the start`);
  }
  assert.equal(end.sceneMix, 1);
  assert.equal(end.shipMix, 1);
  assert.equal(end.whiteout, 0);
  assert.equal(end.rain, 0);
  assert.equal(end.squall, 0);
});

await test('every value stays bounded and the trip back is exact', () => {
  const forward = Array.from({ length: 2001 }, (_, i) => sampleWorld(i / 2000));
  const backward = Array.from({ length: 2001 }, (_, i) =>
    sampleWorld((2000 - i) / 2000),
  ).reverse();
  assert.deepEqual(forward, backward);

  forward.forEach((frame, i) => {
    for (const key of KEYS) {
      assert.ok(frame[key] >= 0 && frame[key] <= 1, `${key} at ${i}`);
    }
    if (i) {
      // Los cruces y los avances de cámara nunca retroceden; los sobres sí.
      for (const key of ['sceneMix', 'shipMix', 'lensMix', 'shipDolly']) {
        assert.ok(frame[key] >= forward[i - 1][key], `${key} at ${i}`);
      }
    }
  });
});

await test('each cut stays buried under its own weather', () => {
  for (let i = 0; i <= 2000; i++) {
    const frame = sampleWorld(i / 2000);

    // El primer corte ocurre dentro de la meseta de la ventisca: mientras la
    // máscara A→B se mueve, la nieve está en su punto máximo de principio a
    // fin. No es "casi": si la cola del cruce se sale de la meseta, sus
    // últimos centésimos se ven ocurrir sobre la imagen ya despejada.
    const crossing = frame.sceneMix > 0 && frame.sceneMix < 1;
    if (crossing) assert.equal(frame.whiteout, 1, `whiteout at ${i}`);

    // El segundo, dentro de la racha, y con el agua ya en su meseta. Aquí el
    // cruce sí es un fundido liso, así que el margen se mide en sus extremos.
    const boarding = frame.shipMix > 0 && frame.shipMix < 1;
    if (boarding) {
      assert.equal(frame.rain, 1, `rain at ${i}`);
      assert.ok(frame.squall > 0.85, `squall at ${i}`);
    }

    // Las gotas van por delante del plano: enseñan el barco antes.
    assert.ok(frame.lensMix >= frame.shipMix, `lens lead at ${i}`);

    // Las dos ventanas de tiempo no se tocan en ningún punto del recorrido.
    assert.ok(
      frame.whiteout < 0.001 || frame.rain < 0.001,
      `weather overlap at ${i}`,
    );
  }
});

await test('the timeline length the section writes against is the sampled one', () => {
  assert.equal(WORLD_TIMELINE_LENGTH, 100);
});
