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
  webgl/                Canvas compartido: WorldScene e InfectionScene
lib/experience/
  store.ts              Estado mínimo compartido (zustand)
  scroll-metrics.ts     Driver ÚNICO de scroll
  graphics-tier.ts      Tier gráfico y soporte WebGL, sin user-agent sniffing
  motion-preferences.ts prefers-reduced-motion
  visibility.ts         Visibilidad de la pestaña
  gsap.ts               Registro central de GSAP/ScrollTrigger y hook de timelines
  infection-frame.ts    Bounds, puntero y progreso no reactivos para el shader
  infection-timeline.ts Curvas deterministas de las tres revelaciones
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
   sitio donde se llama a `gsap.registerPlugin`. `resize` sale de
   `autoRefreshEvents` porque el refresco lo dispara el runtime desde
   `subscribeLayoutChange` (debounced, reutilizando los listeners del driver),
   que además cubre los cambios de altura del documento y la carga de fuentes.
3. **Timelines con cleanup.** Toda timeline vive dentro de un `gsap.context`
   acotado a un elemento y se revierte al desmontar.
4. **Estado mínimo.** El store comparte `chapter`, `progress`, `direction`,
   `velocity`, `graphicsTier` y las condiciones de entorno. Ningún componente de
   React se suscribe a `progress`/`velocity` con un selector: se leen sin
   reactividad dentro del bucle de render.
5. **El canvas es opcional.** Es `fixed`, decorativo y `aria-hidden`; el DOM es
   completo y legible si no llega a montarse. No se monta sin WebGL, en tier C,
   con movimiento reducido ni antes de que el hilo principal esté libre.
   `PerformanceMonitor` degrada un escalón por caída sostenida (A → B → C); al
   llegar a C la capa WebGL se desmonta y el tier no vuelve a subir en toda la
   sesión.
6. **Pausa por visibilidad.** Al ocultar la pestaña el canvas pasa a
   `frameloop="never"` y el driver de scroll cancela su `requestAnimationFrame`.
7. **Los tokens visuales mandan.** La jerarquía negro-rojo de
   `docs/VISUAL-DIRECTION.md` vive en `app/globals.css`: negro como masa
   dominante, `scarlet` para estado activo, CTA y dirección, `blood` para
   profundidad e infección, `ember` solo para luz intensa y latón como detalle
   naval. La regla global de `border-color` va en `@layer base` para que las
   utilidades `border-*` puedan ganarle.
8. **Sin user-agent sniffing.** El tier se deduce de soporte WebGL, `saveData`,
   `prefers-reduced-data`, núcleos, memoria y tipo de puntero.

## Estado de las secciones

Siete capítulos activos: The Wake 01, Driftwood 02, Gameplay 03, Draga 04,
Infection 05, Production 06 y Signal 07. Crew queda en `deferredCrewChapter`,
sin montaje ni navegación; el total visible se deriva del registro activo.

Hero, World, Gameplay, Draga e Infection tienen dirección visual implementada.
Production y Signal conservan sus contenedores provisionales. Los números de
prompt son históricos: Prompt 06 implementa ahora Deck 05.

## Infection

Un único playhead GSAP 0..1 se mueve desde el driver existente, sin pin JS ni
listener nuevo. CSS define el stage sticky y una alternativa editorial estática
para scripting deshabilitado, reduced motion y alturas inferiores a 600 px.
`infection-frame.ts` publica progreso, bounds reales del área de imagen y
puntero sin renders de React. `infection-timeline.ts` mantiene pausas entre las
revelaciones y un final inmóvil; se verifica con las pruebas de runtime.

Una malla y un material de tres texturas en el canvas existente. Carga diferida
al entrar en Draga, texturas 1920/960 según tier y material estable al degradar.
La mezcla erosiona la imagen desde puntos de origen; el desplazamiento total
no supera 12 px CSS y protege el rostro final. El puntero modifica filamentos
solo dentro del frente. No existe reloj ni auto-invalidación en esta escena.

El DOM sigue presente hasta el primer frame renderizado y reaparece de forma
inmediata si fallan texturas, shader o contexto. Las mallas de capítulos
inactivos se ocultan realmente para evitar draw calls transparentes.

Pruebas de lógica: `node --experimental-strip-types --test tests/infection-runtime.test.mjs`.
Los objetivos de FPS requieren una medición de navegador; build y pruebas de
lógica no sustituyen esa medición.
