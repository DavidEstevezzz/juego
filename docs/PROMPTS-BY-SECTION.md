# Prompts de implementación por secciones

Estos prompts están pensados para ejecutarse en orden. Cada uno limita el
alcance para que la calidad de movimiento, rendimiento y responsive pueda
validarse antes de ampliar la experiencia.

## Prompt 00 — Núcleo de la experiencia

```text
Trabaja sobre el proyecto existente de Black Tides: Draga's Wake. No rediseñes
todavía las secciones ni añadas contenido ficticio. Lee primero
docs/EXPERIENCE-BLUEPRINT.md, docs/VISUAL-DIRECTION.md, content/media.ts y la
implementación actual.

Objetivo: crear la arquitectura base de una landing cinematográfica por
capítulos, preparada para animación avanzada sin convertir la web en un juego.

Implementa:
- ExperienceShell con un único main semántico y capítulos identificables.
- Un canvas React Three Fiber persistente, lazy-loaded y aria-hidden.
- Estado global mínimo: chapter, progress, direction, velocity y graphicsTier.
- Un único sistema de métricas de scroll; ningún listener duplicado.
- Registro central de GSAP ScrollTrigger y cleanup correcto.
- Detección temprana de prefers-reduced-motion, visibilidad de pestaña y tier
  gráfico. No uses user-agent sniffing.
- Navegación accesible por capítulos y skip link.
- Contenedores provisionales para todas las secciones, manteniendo visibles los
  medios y contenido existentes.

Restricciones:
- No añadas un preloader bloqueante.
- No uses smooth scrolling todavía.
- No añadas shaders, modelos 3D, audio ni postprocesado.
- El DOM debe funcionar si el canvas no carga.
- Preserva la paleta y tipografías definidas en VISUAL-DIRECTION.

Criterios de aceptación:
- Build y lint pasan.
- No hay cambios de layout al montar el canvas.
- Reduced motion evita timelines ligadas al scroll.
- Al ocultar la pestaña, el canvas deja de renderizar.
- En móvil no hay scroll horizontal ni secciones fijadas.
```

## Prompt 01 — Hero cinematográfico

```text
Implementa únicamente el hero de Black Tides sobre la arquitectura existente.
No trabajes aún las secciones posteriores.

Usa:
- /assets/media/video/hero-poster.webp como primer render.
- /assets/media/video/hero-loop.mp4 como vídeo ambiental.
- /assets/media/video/teaser-1080p.mp4 solo al abrir el trailer.

Dirección:
- Full viewport oscuro y cinematográfico.
- Título BLACK TIDES dominante y DRAGA'S WAKE como subtítulo editorial.
- Reproduce la jerarquía de la portada: negro como masa principal, BLACK TIDES
  o su acento estructural en rojo y marfil para el contraste de lectura. El
  rojo debe sentirse importante desde el primer viewport, no cubrirlo entero.
- Una línea breve de propuesta jugable; no inventes lore no aprobado.
- CTA principal “Watch teaser” y secundario “View on Steam”.
- Composición inspirada en cine de horror marítimo, no en interfaz sci-fi.

Movimiento:
- El póster aparece inmediatamente.
- El loop hace crossfade al estar listo, sin provocar CLS.
- Introducción del título con máscara vertical y ligera separación de letras.
- Parallax de puntero limitado a 12 px; desactivado en touch y reduced motion.
- El primer 20 % del scroll reduce luz, desplaza el título y prepara una
  transición descendente. No hagas un simple fade-out global.
- CTA y estado activo usan `scarlet`; el latón queda como detalle naval
  secundario.
- El vídeo se pausa cuando sale del viewport o la pestaña pierde visibilidad.

Modal de trailer:
- Usa un primitive accesible existente para dialog.
- No precargues el teaser completo antes de abrirlo.
- Focus trap, Escape para cerrar, devolución de foco y botón de sonido claro.

Criterios de aceptación:
- Texto y CTA siguen siendo legibles con vídeo desactivado.
- Autoplay silencioso, playsInline y sin controles en el loop.
- Mobile usa póster primero y puede evitar autoplay en ahorro de datos.
- Reduced motion mantiene composición estática y solo disuelve opacidad.
- No hay salto visual al cargar fuentes o vídeo.
```

## Prompt 02 — Descenso hacia Driftwood

```text
Implementa únicamente la transición Hero → World y la sección World. Preserva
sin regresiones el hero existente.

Medios:
- driftwood-outskirts-960/1920 en AVIF y WebP.
- frozen-village-960/1920 en AVIF y WebP.

Concepto: el visitante abandona la superficie y entra en Driftwood. La sección
debe sentirse como una única toma que evoluciona, no como dos banners.

Técnica:
- Crea un MediaPlane WebGL reutilizable para dos texturas.
- Realiza la transición con un displacement procedural de baja frecuencia.
- Sincroniza mix, cámara, niebla y luz con una timeline ScrollTrigger.
- Usa scroll velocity solo para modular intensidad dentro de límites; el estado
  final depende del progreso, por lo que debe ser determinista al volver atrás.
- Añade partículas de nieve/agua con geometría instanciada y presupuesto fijo.
- El texto permanece en DOM: título del mundo, premisa y tres observaciones
  breves preparadas en content/chapters.ts.

Fallback:
- Tier C y reduced motion usan picture + crossfade CSS.
- En móvil no fijes la sección más de 140vh y reduce partículas al menos 70 %.

Criterios de aceptación:
- La transición es reversible sin saltos al hacer scroll hacia arriba.
- No se crean texturas o materiales en cada render.
- Se liberan GPU resources al desmontar.
- La imagen nunca pierde el punto focal de Draga en 16:9, 4:3 y móvil.
```

## Prompt 03 — Pilares de gameplay

```text
Implementa únicamente la sección de promesa jugable. No añadas estadísticas ni
mecánicas no confirmadas.

Estructura:
- Una escena fijada en escritorio con tres estados editoriales.
- Cada estado representa un pilar aprobado: Explore, Endure y Confront
  (mantén los textos en un archivo de contenido para poder sustituirlos).
- Usa ship-corridor, ship-atrium y frozen-deck como medios temporales.
- Las capturas con HUD deben mostrarse como evidencia de gameplay, no como key
  art, y su recorte no debe ocultar información relevante.

Movimiento:
- El progreso de scroll cambia foco, escala y luz entre estados.
- El estado activo tiene una transición clara también sin hover.
- Indicador 01/03 accesible y sincronizado con aria-current.
- En móvil sustituye el pinning por capítulos verticales con snap opcional solo
  si no perjudica la navegación.

Calidad:
- No animes propiedades que fuercen layout cuando transform/opacity sirvan.
- No uses filtros blur grandes sobre elementos de pantalla completa.
- El contenido se puede recorrer por teclado y con lector de pantalla.
- Reduced motion presenta los tres pilares como bloques editoriales estáticos.
```

## Prompt 04 — Retrato de Draga

```text
Implementa únicamente el capítulo de Draga usando draga-profile-960/1920.

Dirección:
- Retrato frío, íntimo y casi inmóvil después del ritmo de gameplay.
- Texto en el espacio negativo de la imagen.
- Información: nombre, rol y una cita o descripción marcada como pendiente si
  el equipo aún no ha aprobado el copy. No inventes biografía.

Movimiento:
- Revela la imagen con una máscara inspirada en condensación o sal sobre cristal.
- Crea separación de tres planos a partir de una sola imagen solo mediante
  recorte y transformaciones discretas; evita aspecto de recorte de cartón.
- Puntero/touch inclina luz y foco con amplitud mínima.
- Prepara una interfaz MediaSubject para sustituir más adelante la imagen por un
  GLB sin cambiar layout ni API de la sección.

No implementes todavía el modelo 3D.

Criterios:
- El rostro conserva nitidez.
- El texto mantiene contraste en todos los breakpoints.
- Reduced motion elimina máscara animada y parallax.
- No se descarga ningún asset 3D inexistente.
```

## Prompt 05 — Izzy y ecos humanos

```text
Implementa únicamente la sección de personajes secundarios.

Usa izzy-protagonist y bill-dialogue. Diseña una composición editorial manual,
no un carrusel automático ni un grid de tarjetas.

Interacción:
- Dos focos narrativos seleccionables por botón, teclado y swipe.
- El cambio de foco modifica recorte, profundidad, luz y texto con una timeline
  reversible de 600–900 ms.
- Pausa cualquier avance cuando el usuario interactúa; no hay autoplay.
- Mantén nombres y textos en content/chapters.ts.

Dirección visual:
- Señales de cuaderno de bitácora, tipografía técnica secundaria y líneas de
  navegación naval muy contenidas.
- Nada de glassmorphism, neón o paneles holográficos.

Criterios:
- Focus visible y orden lógico.
- Alt text específico para cada imagen.
- Mobile conserva el punto focal y no oculta controles bajo el pulgar.
- Reduced motion usa cambio instantáneo o disolución corta.
```

## Prompt 06 — La infección

```text
Implementa únicamente el gran capítulo de horror orgánico usando, en este orden,
organic-growth, blubber-room y vessel-creature.

Objetivo: construir una escalada visual continua. No lo presentes como galería.

Técnica:
- Una timeline principal normalizada 0..1 controla las tres revelaciones.
- WebGL mezcla texturas con ruido orgánico, erosión de bordes y desplazamiento
  máximo de 10–14 px visuales.
- La paleta transita gradualmente de steel/oxidation a ritual red.
- El capítulo amplía una presencia roja que ya existía desde el hero: no debe
  parecer que la web cambia repentinamente a una identidad diferente.
- Un campo de partículas o filamentos reacciona a la proximidad del puntero,
  pero nunca bloquea enlaces ni captura input.
- La criatura final se revela por regiones, sin flashes ni jumpscare.
- El shader debe compilar una vez y usar uniforms; no recrees materiales.

Rendimiento y seguridad:
- Tier B reduce resolución del render target y partículas.
- Tier C usa imágenes y clip-path CSS.
- No uses vídeo adicional ni texturas superiores a 1920.
- Pausa toda actualización fuera de viewport.
- Incluye alternativa reduced motion sin deformaciones continuas.

Criterios:
- 60 fps objetivo en escritorio y 30 fps sostenidos en móvil medio.
- Reversión perfecta al subir.
- Texto y navegación permanecen estables sobre el efecto.
```

## Prompt 07 — Evidencia de producción

```text
Implementa únicamente la sección de evidencia de producción. Debe convencer a
un socio profesional sin parecer una petición pública de financiación.

Incluye:
- Trailer completo bajo acción explícita.
- Galería manual de capturas aprobadas.
- Campos de contenido para estado del proyecto, plataformas, pilares de
  producción y equipo; usa “Pending approval” cuando falten datos.
- CTA discreto para solicitar información profesional.

Diseño:
- Formato de bitácora de expedición, no dashboard SaaS.
- Jerarquía sobria, datos concretos y fondos oscuros.
- Animaciones breves de lectura: líneas, contadores solo si son cifras reales y
  cambios de foco. No uses números ficticios.

Criterios:
- El teaser no se descarga hasta interacción.
- Galería navegable por teclado, botones y swipe.
- Ninguna cifra financiera se publica sin estar en content/chapters.ts.
- Mobile mantiene botones y vídeo dentro del viewport.
```

## Prompt 08 — Señal final y navegación global

```text
Implementa el cierre de la experiencia y termina la navegación global.

Cierre:
- Oscurece progresivamente la infección hasta recuperar silencio visual.
- Título final, CTA a Steam y contacto con Strange Creature Factory.
- El CTA principal recupera `scarlet` sobre negro; el latón solo acompaña en
  numeración o detalles secundarios.
- Créditos, redes, política de privacidad y controles de accesibilidad.
- No inventes direcciones, premios, fechas ni socios.

Navegación:
- Indicador mínimo del capítulo activo.
- Menú completo accesible que permite saltar a capítulos sin romper timelines.
- Botón de sonido solo si existe audio aprobado; el estado inicial es mute.
- El historial y los anchors deben seguir siendo utilizables.

Movimiento:
- El cierre debe resolver la tensión; evita otra gran explosión visual.
- Al saltar entre capítulos, sincroniza ScrollTrigger sin saltos intermedios.
- Reduced motion usa navegación nativa y desplazamiento sin animación.

Criterios:
- Todos los enlaces son reales o están claramente pendientes.
- Focus, Escape y back del navegador funcionan de forma esperable.
- Footer completo visible incluso si WebGL falla.
```

## Prompt 09 — Pase técnico final

```text
No añadas nuevas ideas visuales. Audita y optimiza la experiencia completa de
Black Tides según docs/EXPERIENCE-BLUEPRINT.md.

Revisa:
- LCP, INP y CLS.
- Peso y orden de carga de JS, vídeo, imágenes, fuentes y canvas.
- Timelines duplicadas, listeners sin cleanup y recursos GPU sin dispose.
- Pausa fuera de viewport y al ocultar pestaña.
- Responsive real: 360x800, 768x1024, 1440x900 y ultrawide.
- Navegación por teclado, focus visible, diálogos, alt text y contraste.
- prefers-reduced-motion, ahorro de datos y fallo de WebGL.
- Recorrido completo hacia abajo, hacia arriba y saltando con anchors.

Objetivos:
- LCP p75 <= 2.5 s, INP p75 <= 200 ms, CLS p75 <= 0.1.
- 60 fps objetivo desktop, >=30 fps sostenidos en móvil medio.
- Ningún asset del teaser completo en la carga inicial.
- El contenido principal es usable sin canvas.

Entrega un informe breve de problemas encontrados, correcciones realizadas y
límites que requieran nuevos assets o decisiones del equipo. Build y lint deben
pasar al finalizar.
```
