import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registerHooks } from 'node:module';
import {
  interpolateTrail,
  sampleTrailMovement,
  trailOpacity,
  trimTrail,
  MAX_TRAIL_STAMPS,
  TRAIL_HOLD_MS,
  TRAIL_LIFETIME_MS,
} from '../lib/experience/production-trail.ts';

// Let Node's native TS stripping resolve the browser module's extensionless imports.
registerHooks({
  resolve(specifier, context, next) {
    if (
      context.parentURL?.includes('/lib/experience/') &&
      specifier.startsWith('./') &&
      !specifier.endsWith('.ts')
    )
      return next(`${specifier}.ts`, context);
    return next(specifier, context);
  },
});

await test('trail holds, fades monotonically and expires in real time', () => {
  assert.equal(trailOpacity(-100), 0);
  assert.equal(trailOpacity(0), 0);
  assert.equal(trailOpacity(140), 1);
  assert.equal(trailOpacity(TRAIL_HOLD_MS), 1);
  assert.equal(trailOpacity(TRAIL_LIFETIME_MS), 0);
  assert.equal(trailOpacity(100000), 0);
  let previous = 1;
  for (let time = 140; time < 5000; time += 16.7) {
    const value = trailOpacity(time);
    assert.ok(value >= 0 && value <= previous);
    previous = value;
  }
  assert.ok(Math.abs(trailOpacity(TRAIL_HOLD_MS + 1) - 1) < 0.00001);
});

await test('fast movement is interpolated, aspect-correct and bounded', () => {
  const from = { x: 0.1, y: 0.2 },
    to = { x: 0.9, y: 0.8 };
  const points = interpolateTrail(from, to, 0.02, 2);
  let previous = from;
  for (const point of points) {
    assert.ok(
      Math.hypot(point.x - previous.x, (point.y - previous.y) / 2) <= 0.02001,
    );
    previous = point;
  }
  assert.deepEqual(points.at(-1), to);
  assert.equal(interpolateTrail(from, to, 0, 2).length, 64);
});

await test('expired stamps are discarded and buffer is capped to newest input', () => {
  const stamps = Array.from({ length: 900 }, (_, time) => ({
    x: 0.5,
    y: 0.5,
    time,
  }));
  assert.equal(trimTrail(stamps, 900).length, MAX_TRAIL_STAMPS);
  assert.equal(trimTrail(stamps, 900).at(-1).time, 899);
  assert.equal(trimTrail(stamps, TRAIL_LIFETIME_MS + 900).length, 0);
  assert.equal(stamps.length, 900);
});

await test('sampling density does not grow with display refresh rate', () => {
  const countAt = (fps) => {
    let painted = { x: 0, y: 0.5 },
      count = 1;
    for (let frame = 1; frame <= fps * 3; frame++) {
      const x = frame / (fps * 3);
      for (const point of sampleTrailMovement(
        painted,
        { x, y: 0.5 },
        0.018,
        2,
      )) {
        count++;
        painted = point;
      }
    }
    return count;
  };
  assert.equal(countAt(30), countAt(60));
  assert.equal(countAt(60), countAt(144));
  assert.equal(countAt(144), countAt(240));
  assert.ok(countAt(240) < MAX_TRAIL_STAMPS);
});

await test('runtime is demand-driven, pauses, respects motion and cleans up after remount', async () => {
  const frames = new Map();
  let nextFrame = 1,
    now = 0,
    draws = 0;
  const documentListeners = new Map();
  const motionListeners = new Set();
  const motion = {
    matches: false,
    addEventListener: (_name, callback) => motionListeners.add(callback),
    removeEventListener: (_name, callback) => motionListeners.delete(callback),
  };
  const intersections = [],
    resizes = [];
  class Context {
    globalAlpha = 1;
    globalCompositeOperation = 'source-over';
    clearRect() {}
    fillRect() {}
    drawImage() {
      draws++;
    }
    createRadialGradient() {
      return { addColorStop() {} };
    }
  }
  class Canvas {
    width = 0;
    height = 0;
    context = new Context();
    getContext() {
      return this.context;
    }
  }
  const saved = new Map();
  const install = (key, value) => {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  };
  install('document', {
    visibilityState: 'visible',
    createElement: () => new Canvas(),
    addEventListener: (name, callback) => documentListeners.set(name, callback),
    removeEventListener: (name) => documentListeners.delete(name),
  });
  install('window', { matchMedia: () => motion });
  install('devicePixelRatio', 3);
  install('requestAnimationFrame', (callback) => {
    const id = nextFrame++;
    frames.set(id, callback);
    return id;
  });
  install('cancelAnimationFrame', (id) => frames.delete(id));
  install(
    'IntersectionObserver',
    class {
      constructor(callback) {
        this.callback = callback;
        intersections.push(this);
      }
      observe() {}
      disconnect() {
        this.disconnected = true;
      }
    },
  );
  install(
    'ResizeObserver',
    class {
      constructor(callback) {
        this.callback = callback;
        resizes.push(this);
      }
      observe() {}
      disconnect() {
        this.disconnected = true;
      }
    },
  );
  try {
    const { createProductionReveal } =
      await import('../lib/experience/production-reveal.ts');
    const listeners = new Map();
    const surface = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 1800,
        height: 934,
      }),
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: (name) => listeners.delete(name),
    };
    const canvas = new Canvas();
    let failures = 0;
    const mount = () =>
      createProductionReveal(surface, canvas, {}, 1600, () => failures++);
    const frame = (step = 16.7) => {
      now += step;
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((callback) => callback(now));
    };
    const move = () =>
      listeners.get('pointermove')({
        pointerType: 'mouse',
        clientX: 450,
        clientY: 300,
      });
    const dispose = mount();
    assert.equal(
      canvas.width,
      1600,
      'DPR must not exceed the backing resolution cap',
    );
    assert.equal(frames.size, 0, 'no perpetual frame at mount');
    move();
    assert.equal(frames.size, 0, 'no input offscreen');
    intersections.at(-1).callback([{ isIntersecting: true }]);
    listeners.get('pointermove')({
      pointerType: 'touch',
      clientX: 450,
      clientY: 300,
    });
    assert.equal(frames.size, 0, 'touch scroll is not painted/captured');
    move();
    frame();
    assert.ok(draws > 0);
    assert.equal(frames.size, 1, 'one outstanding RAF, not one per input');
    for (let i = 0; i < 250; i++) frame();
    assert.equal(frames.size, 0, 'fully idle when stationary trail expires');
    move();
    frame();
    document.visibilityState = 'hidden';
    documentListeners.get('visibilitychange')();
    assert.equal(frames.size, 0);
    const stoppedDraws = draws;
    frame(10000);
    assert.equal(draws, stoppedDraws);
    document.visibilityState = 'visible';
    documentListeners.get('visibilitychange')();
    assert.equal(frames.size, 0, 'old trail must not resume');
    move();
    frame();
    intersections.at(-1).callback([{ isIntersecting: false }]);
    assert.equal(frames.size, 0);
    intersections.at(-1).callback([{ isIntersecting: true }]);
    move();
    frame();
    motion.matches = true;
    motionListeners.forEach((callback) => callback({ matches: true }));
    assert.equal(frames.size, 0);
    move();
    assert.equal(frames.size, 0);
    dispose();
    assert.equal(listeners.size, 0);
    assert.equal(motionListeners.size, 0);
    assert.equal(documentListeners.size, 0);
    assert.ok(intersections.every((observer) => observer.disconnected));
    assert.ok(resizes.every((observer) => observer.disconnected));
    assert.equal(canvas.width, 0);
    motion.matches = false;
    const disposeAgain = mount();
    assert.equal(documentListeners.size, 1);
    disposeAgain();
    assert.equal(documentListeners.size, 0);
    assert.equal(failures, 0);
    const brokenCanvas = { getContext: () => null };
    createProductionReveal(surface, brokenCanvas, {}, 1600, () => failures++)();
    assert.equal(
      failures,
      1,
      '2D unavailability preserves the static alternative',
    );
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
