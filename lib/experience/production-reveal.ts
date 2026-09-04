import { isDocumentVisible, subscribeVisibility } from './visibility';
import {
  prefersReducedMotion,
  subscribeReducedMotion,
} from './motion-preferences';
import {
  sampleTrailMovement,
  trailOpacity,
  trimTrail,
  type TrailPoint,
  type TrailStamp,
} from './production-trail';

/** Local 2D enhancement; no extra WebGL context, global scroll driver or React frames. */
export function createProductionReveal(
  surface: HTMLElement,
  canvas: HTMLCanvasElement,
  finalImage: HTMLImageElement,
  maxWidth: number,
  onFailure: () => void,
): () => void {
  const context = canvas.getContext('2d');
  const mask = document.createElement('canvas');
  const maskContext = mask.getContext('2d');
  const brush = document.createElement('canvas');
  const brushContext = brush.getContext('2d');
  if (!context || !maskContext || !brushContext) {
    onFailure();
    return () => {};
  }

  // One cached soft stamp. No per-frame filters, readbacks or image encoding.
  brush.width = brush.height = 256;
  const gradient = brushContext.createRadialGradient(
    128,
    128,
    0,
    128,
    128,
    128,
  );
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.98)');
  gradient.addColorStop(0.65, 'rgba(255,255,255,0.58)');
  gradient.addColorStop(0.85, 'rgba(255,255,255,0.15)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  brushContext.fillStyle = gradient;
  brushContext.fillRect(0, 0, 256, 256);

  let disposed = false;
  let failed = false;
  let inView = false;
  let visible = isDocumentVisible();
  let reduced = prefersReducedMotion();
  let raf: number | null = null;
  let stamps: TrailStamp[] = [];
  let target: TrailPoint | null = null;
  let previous: TrailPoint | null = null;
  let painted: TrailPoint | null = null;
  let lastFrame = 0;
  let aspect = 1920 / 996;
  let radius = 0.115;

  const active = () => !disposed && !failed && visible && inView && !reduced;
  const clear = () => {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    stamps = [];
    target = previous = painted = null;
    lastFrame = 0;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  function wake() {
    if (raf === null && active()) raf = requestAnimationFrame(draw);
  }

  function draw(now: number) {
    raf = null;
    if (!active()) return;
    const elapsed = lastFrame ? Math.min(64, now - lastFrame) : 16.7;
    lastFrame = now;
    if (target) {
      const origin = previous ?? target;
      const mix = 1 - Math.exp(-elapsed / 42);
      const next = {
        x: origin.x + (target.x - origin.x) * mix,
        y: origin.y + (target.y - origin.y) * mix,
      };
      const distance = Math.hypot(
        target.x - next.x,
        (target.y - next.y) / aspect,
      );
      if (!painted) {
        stamps.push({ ...next, time: now });
        painted = next;
      } else {
        // A 144/240 Hz screen must not fill the buffer faster than a 60 Hz one.
        // Keep the spatial remainder rather than adding a stamp every frame.
        for (const point of sampleTrailMovement(
          painted,
          next,
          radius * 0.18,
          aspect,
        )) {
          stamps.push({ ...point, time: now });
          painted = point;
        }
      }
      previous = next;
      if (distance < 0.0005) target = null;
    }
    stamps = trimTrail(stamps, now);
    maskContext!.clearRect(0, 0, mask.width, mask.height);
    const r = radius * mask.width;
    for (const stamp of stamps) {
      maskContext!.globalAlpha = trailOpacity(now - stamp.time);
      maskContext!.drawImage(
        brush,
        stamp.x * mask.width - r,
        stamp.y * mask.height - r,
        r * 2,
        r * 2,
      );
    }
    maskContext!.globalAlpha = 1;
    context!.clearRect(0, 0, canvas.width, canvas.height);
    if (stamps.length) {
      try {
        context!.globalCompositeOperation = 'source-over';
        context!.drawImage(finalImage, 0, 0, canvas.width, canvas.height);
        context!.globalCompositeOperation = 'destination-in';
        context!.drawImage(mask, 0, 0, canvas.width, canvas.height);
        context!.globalCompositeOperation = 'source-over';
      } catch {
        // A decode/context failure must never remove the underlying DOM scene.
        context!.globalCompositeOperation = 'source-over';
        failed = true;
        clear();
        onFailure();
        return;
      }
    }
    if (stamps.length || target) wake();
    else lastFrame = 0;
  }

  const resize = () => {
    const rect = surface.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const width = Math.max(
      1,
      Math.round(
        Math.min(maxWidth, rect.width * Math.min(devicePixelRatio || 1, 1.25)),
      ),
    );
    const height = Math.max(1, Math.round((width * rect.height) / rect.width));
    aspect = rect.width / rect.height;
    radius = Math.min(160, Math.max(85, rect.width * 0.115)) / rect.width;
    if (canvas.width === width && canvas.height === height) return;
    clear();
    canvas.width = width;
    canvas.height = height;
    mask.width = Math.min(640, width);
    mask.height = Math.max(1, Math.round(mask.width / aspect));
  };
  const move = (event: PointerEvent) => {
    if (
      !active() ||
      (event.pointerType !== 'mouse' && event.pointerType !== 'pen')
    )
      return;
    // Read on input, not cached through scrolling. No new scroll listener.
    const rect = surface.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    target = {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
    wake();
  };
  const leave = () => {
    target = previous = painted = null;
  };
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (!inView) clear();
  });
  const resizeObserver = new ResizeObserver(resize);
  const stopVisibility = subscribeVisibility((value) => {
    visible = value;
    if (!value) clear();
  });
  const stopMotion = subscribeReducedMotion((value) => {
    reduced = value;
    if (value) clear();
  });
  observer.observe(surface);
  resizeObserver.observe(surface);
  surface.addEventListener('pointermove', move, { passive: true });
  surface.addEventListener('pointerleave', leave, { passive: true });
  surface.addEventListener('pointercancel', leave, { passive: true });
  resize();

  return () => {
    disposed = true;
    clear();
    observer.disconnect();
    resizeObserver.disconnect();
    stopVisibility();
    stopMotion();
    surface.removeEventListener('pointermove', move);
    surface.removeEventListener('pointerleave', leave);
    surface.removeEventListener('pointercancel', leave);
    mask.width = mask.height = brush.width = brush.height = 0;
    canvas.width = canvas.height = 0;
  };
}
