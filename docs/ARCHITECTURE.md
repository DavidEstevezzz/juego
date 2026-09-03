# Arquitectura de la experiencia

## Objetivo

Web narrativa para presentar **Black Tides: Draga's Wake**. No contiene lógica
de juego: las escenas WebGL, el audio y las animaciones son recursos de
comunicación. La estructura de capítulos y el presupuesto de calidad están
definidos en `docs/EXPERIENCE-BLUEPRINT.md`.

## Mapa de archivos

```text
app/
  layout.tsx            Tipografías (Cinzel, IBM Plex Sans, Share Tech Mono) y metadatos
  globals.css           Tokens de VISUAL-DIRECTION y capa del canvas
  page.tsx              Monta ExperienceShell
components/experience/
  experience-shell.tsx  Raíz: arranca el runtime, monta canvas, navegación y capítulos
  experience-canvas.tsx Capa WebGL persistente, diferida y aria-hidden
  chapter-navigation.tsx Índice de cubierta accesible
  sections/             Un archivo por capítulo + ChapterSection común
  webgl/                Escena persistente (vacía en esta fase)
lib/experience/
  store.ts              Estado mínimo compartido (zustand)
  scroll-metrics.ts     Driver ÚNICO de scroll
  graphics-tier.ts      Tier gráfico y soporte WebGL, sin user-agent sniffing
  motion-preferences.ts prefers-reduced-motion
  visibility.ts         Visibilidad de la pestaña
  gsap.ts               Registro central de GSAP/ScrollTrigger y hook de timelines
  use-experience-runtime.ts  Conecta las fuentes anteriores con el store
  use-chapter-observer.ts    Capítulo activo con un único IntersectionObserver
content/
  chapters.ts           Registro de capítulos (orden narrativo y navegación)
  site-content.ts       Copy general de la portada
  media.ts              Rutas de medios optimizados
```

## Reglas del núcleo

1. **Un solo driver de scroll.** Ningún componente añade listeners de `scroll`.
   Quien necesite progreso se suscribe a `subscribeScrollMetrics` o crea un
   ScrollTrigger a través de `useExperienceTimeline`.
2. **Un solo registro de GSAP.** `registerGsap()` es idempotente y es el único
   sitio donde se llama a `gsap.registerPlugin`.
3. **Timelines con cleanup.** Toda timeline vive dentro de un `gsap.context`
   acotado a un elemento y se revierte al desmontar.
4. **Estado mínimo.** El store comparte `chapter`, `progress`, `direction`,
   `velocity`, `graphicsTier` y las condiciones de entorno. Ningún componente de
   React se suscribe a `progress`/`velocity` con un selector: se leen sin
   reactividad dentro del bucle de render.
5. **El canvas es opcional.** Es `fixed`, decorativo y `aria-hidden`; el DOM es
   completo y legible si no llega a montarse. No se monta sin WebGL, en tier C,
   con movimiento reducido ni antes de que el hilo principal esté libre.
6. **Pausa por visibilidad.** Al ocultar la pestaña el canvas pasa a
   `frameloop="never"` y el driver de scroll cancela su `requestAnimationFrame`.
7. **Sin user-agent sniffing.** El tier se deduce de soporte WebGL, `saveData`,
   `prefers-reduced-data`, núcleos, memoria y tipo de puntero.

## Estado de las secciones

Los ocho capítulos existen como contenedores semánticos con anchors y
navegación. Su dirección visual se implementa en los prompts 01–08 de
`docs/PROMPTS-BY-SECTION.md`; hasta entonces muestran su objetivo narrativo y la
etiqueta de contenedor provisional.
