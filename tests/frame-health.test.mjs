import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  IDLE_GAP_MS,
  SLOW_FRAME_MS,
  SLOW_WINDOWS_BEFORE_DECLINE,
  WARMUP_WINDOWS,
  WINDOW_FRAMES,
  createFrameHealth,
} from '../lib/experience/frame-health.ts';

/** Ventanas necesarias para que un ritmo lento llegue a avisar. */
const WINDOWS_TO_DECLINE = WARMUP_WINDOWS + SLOW_WINDOWS_BEFORE_DECLINE;

/** Reloj continuo: el monitor mide huecos, así que el tiempo no se reinicia. */
function clock(health) {
  let now = 0;
  let declines = 0;
  return {
    /** Dibuja `count` fotogramas seguidos separados por `step` ms. */
    draw(count, step) {
      for (let i = 0; i < count; i++) {
        now += step;
        if (health.sample(now)) declines++;
      }
      return this;
    },
    /** El visitante se queda quieto: el bucle bajo demanda deja de dibujar. */
    pause(ms) {
      now += ms;
      return this;
    },
    get declines() {
      return declines;
    },
    clear() {
      declines = 0;
      return this;
    },
  };
}

await test('a browsing session of scroll bursts and pauses never declines', () => {
  const time = clock(createFrameHealth());
  // Veinte rachas de scroll a 60 fps, cada una seguida de una pausa larga:
  // exactamente lo que hace quien lee la secuencia plano a plano.
  for (let burst = 0; burst < 20; burst++) time.draw(30, 16.7).pause(3000);
  assert.equal(time.declines, 0);
});

await test('an idle gap breaks the window instead of counting as a slow frame', () => {
  const time = clock(createFrameHealth());
  // Fotogramas sanos, pero nunca WINDOW_FRAMES seguidos: no hay veredicto.
  for (let burst = 0; burst < 40; burst++)
    time.draw(WINDOW_FRAMES - 1, 16.7).pause(IDLE_GAP_MS + 1);
  assert.equal(time.declines, 0);
});

await test('sustained slow rendering declines once, after the warm-up', () => {
  const time = clock(createFrameHealth());
  const step = SLOW_FRAME_MS + 6;
  // El primer fotograma no tiene hueco anterior, así que no cuenta.
  time.draw(1 + WINDOW_FRAMES * (WINDOWS_TO_DECLINE - 1), step);
  assert.equal(time.declines, 0);
  time.draw(WINDOW_FRAMES, step);
  assert.equal(time.declines, 1);
});

await test('a healthy rate never declines, however long it runs', () => {
  const time = clock(createFrameHealth()).draw(WINDOW_FRAMES * 40, 16.7);
  assert.equal(time.declines, 0);
});

await test('isolated hitches inside a healthy window are ignored', () => {
  const health = createFrameHealth();
  const time = clock(health);
  for (let window = 0; window < WINDOWS_TO_DECLINE + 2; window++)
    // Un fotograma de cada ocho cuesta el triple: la mediana no se mueve.
    for (let i = 0; i < WINDOW_FRAMES / 8; i++)
      time.draw(1, SLOW_FRAME_MS * 3).draw(7, 16.7);
  assert.equal(time.declines, 0);
});

await test('reset restores the warm-up so a tier change starts clean', () => {
  const health = createFrameHealth();
  const step = SLOW_FRAME_MS + 6;
  const time = clock(health).draw(1 + WINDOW_FRAMES * WARMUP_WINDOWS, step);
  health.reset();
  time.clear().draw(1 + WINDOW_FRAMES * (WINDOWS_TO_DECLINE - 1), step);
  assert.equal(time.declines, 0);
  time.draw(WINDOW_FRAMES, step);
  assert.equal(time.declines, 1);
});
