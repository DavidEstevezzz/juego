import type { ScrollDirection, ScrollMetrics } from '@/types/experience';
import { isDocumentVisible, subscribeVisibility } from './visibility';

/**
 * Driver único de métricas de scroll.
 *
 * Toda la experiencia lee el scroll desde aquí: un solo listener `scroll`
 * pasivo, un solo listener `resize`, un solo `ResizeObserver` y un solo bucle
 * de `requestAnimationFrame`. Los componentes no pueden crear listeners de
 * scroll propios; si necesitan progreso por sección, deben usar ScrollTrigger
 * (que mantiene su propio listener compartido) o el observador de capítulos.
 *
 * El bucle solo corre mientras hay movimiento y la pestaña está visible; al
 * quedarse quieto se detiene por completo en vez de rondar a 60 fps.
 *
 * El mismo `resize` y el mismo `ResizeObserver` alimentan `subscribeLayoutChange`,
 * la señal centralizada y debounced que usa el runtime para refrescar
 * ScrollTrigger. Ninguna sección debe observar el viewport por su cuenta.
 */

type Listener = (metrics: ScrollMetrics) => void;
type LayoutListener = () => void;

/** Velocidad considerada máxima, en píxeles por milisegundo (~2400 px/s). */
const MAX_SPEED = 2.4;
/** Suavizado exponencial de la velocidad. */
const SMOOTHING = 0.18;
/** Tiempo sin eventos de scroll tras el cual se deja de bombear frames. */
const IDLE_MS = 240;
/** Desplazamiento mínimo, en píxeles, para considerar un cambio de dirección. */
const DIRECTION_THRESHOLD = 0.5;
/** Espera tras el último cambio de medidas antes de avisar del nuevo layout. */
const LAYOUT_DEBOUNCE_MS = 160;

const listeners = new Set<Listener>();
const layoutListeners = new Set<LayoutListener>();

let started = false;
let rafId: number | null = null;
let resizeObserver: ResizeObserver | null = null;
let unsubscribeVisibility: (() => void) | null = null;

let maxScroll = 0;
let viewportWidth = 0;
let viewportHeight = 0;
let layoutTimeout: number | null = null;
let lastY = 0;
let lastTime = 0;
let lastScrollTime = 0;

const metrics: ScrollMetrics = { progress: 0, direction: 0, velocity: 0 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Recalcula la altura desplazable y el viewport. Se cachea para no forzar
 * reflow en cada frame y, si algo cambió de verdad, agenda el aviso de layout.
 */
function measure() {
  const nextMaxScroll = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    0,
  );
  const nextWidth = window.innerWidth;
  const nextHeight = window.innerHeight;

  const changed =
    nextMaxScroll !== maxScroll ||
    nextWidth !== viewportWidth ||
    nextHeight !== viewportHeight;

  maxScroll = nextMaxScroll;
  viewportWidth = nextWidth;
  viewportHeight = nextHeight;

  if (changed) scheduleLayoutChange();
}

/**
 * Agrupa ráfagas de cambios (arrastrar el borde de la ventana, girar el
 * dispositivo, cargar fuentes o medios) en un único aviso.
 */
function scheduleLayoutChange() {
  if (layoutListeners.size === 0) return;
  if (layoutTimeout !== null) window.clearTimeout(layoutTimeout);

  layoutTimeout = window.setTimeout(() => {
    layoutTimeout = null;
    for (const listener of layoutListeners) listener();
  }, LAYOUT_DEBOUNCE_MS);
}

function publish() {
  for (const listener of listeners) listener(metrics);
}

function requestFrame() {
  if (rafId !== null || !isDocumentVisible()) return;
  rafId = window.requestAnimationFrame(tick);
}

function tick(now: number) {
  rafId = null;

  const y = window.scrollY;
  const deltaTime = Math.max(now - lastTime, 1);
  const deltaY = y - lastY;

  const instantVelocity = clamp(deltaY / deltaTime / MAX_SPEED, -1, 1);
  let velocity =
    metrics.velocity + (instantVelocity - metrics.velocity) * SMOOTHING;
  if (Math.abs(velocity) < 0.001) velocity = 0;

  let direction: ScrollDirection = metrics.direction;
  if (deltaY > DIRECTION_THRESHOLD) direction = 1;
  else if (deltaY < -DIRECTION_THRESHOLD) direction = -1;
  else if (velocity === 0) direction = 0;

  metrics.progress = maxScroll > 0 ? clamp(y / maxScroll, 0, 1) : 0;
  metrics.direction = direction;
  metrics.velocity = velocity;
  publish();

  lastY = y;
  lastTime = now;

  const idle = now - lastScrollTime > IDLE_MS;
  if (!idle || velocity !== 0) requestFrame();
}

function handleScroll() {
  lastScrollTime = performance.now();
  requestFrame();
}

function handleResize() {
  measure();
  handleScroll();
}

function handleVisibility(visible: boolean) {
  if (visible) {
    // Se resincroniza para que el primer frame tras volver no calcule una
    // velocidad enorme con el tiempo transcurrido en segundo plano.
    lastY = window.scrollY;
    lastTime = performance.now();
    lastScrollTime = lastTime;
    measure();
    requestFrame();
    return;
  }

  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }
  metrics.velocity = 0;
  metrics.direction = 0;
  publish();
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;

  lastY = window.scrollY;
  lastTime = performance.now();
  lastScrollTime = lastTime;
  measure();

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });

  resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(document.documentElement);

  unsubscribeVisibility = subscribeVisibility(handleVisibility);

  // Primer valor coherente para quien se suscriba antes de mover el scroll.
  metrics.progress = maxScroll > 0 ? clamp(lastY / maxScroll, 0, 1) : 0;
  publish();
}

function stop() {
  if (!started) return;
  started = false;

  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleResize);
  resizeObserver?.disconnect();
  resizeObserver = null;
  unsubscribeVisibility?.();
  unsubscribeVisibility = null;

  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (layoutTimeout !== null) {
    window.clearTimeout(layoutTimeout);
    layoutTimeout = null;
  }
}

/**
 * Suscribe un consumidor a las métricas. El driver arranca con el primer
 * suscriptor y se apaga con el último, de modo que remontar la experiencia no
 * deja listeners huérfanos ni los duplica.
 */
export function subscribeScrollMetrics(listener: Listener): () => void {
  if (typeof window === 'undefined') return () => {};

  listeners.add(listener);
  start();
  listener(metrics);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

/**
 * Suscribe un consumidor a los cambios de medidas del documento o del viewport.
 *
 * Reutiliza los listeners del driver, así que no añade ninguno: es el punto
 * único desde el que se refresca ScrollTrigger.
 */
export function subscribeLayoutChange(listener: LayoutListener): () => void {
  if (typeof window === 'undefined') return () => {};

  layoutListeners.add(listener);
  const stopMetrics = subscribeScrollMetrics(noopMetrics);

  return () => {
    layoutListeners.delete(listener);
    if (layoutListeners.size === 0 && layoutTimeout !== null) {
      window.clearTimeout(layoutTimeout);
      layoutTimeout = null;
    }
    stopMetrics();
  };
}

/** Suscriptor vacío: mantiene vivo el driver mientras alguien observe el layout. */
function noopMetrics() {}

/** Lectura no reactiva de las métricas actuales. */
export function getScrollMetrics(): Readonly<ScrollMetrics> {
  return metrics;
}

/** Fuerza una remedición; útil tras cargar medios que cambian la altura. */
export function refreshScrollMetrics() {
  if (!started) return;
  measure();
  handleScroll();
}
