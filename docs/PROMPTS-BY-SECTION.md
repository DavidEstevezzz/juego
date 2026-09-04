# Prompts de implementación por secciones

Estos prompts están pensados para ejecutarse en orden. Cada uno limita el
alcance para que la calidad de movimiento, rendimiento y responsive pueda
validarse antes de ampliar la experiencia.

Recorrido activo: The Wake 01 → Driftwood 02 → Gameplay 03 → Draga 04 →
Infection 05 → Production 06 → Signal 07. Crew queda aplazado. Los números de
prompt se conservan como referencias históricas: Prompt 06 corresponde ahora
a Deck 05, Prompt 07 a Deck 06 y Prompt 08 a Deck 07.

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
- Una sección de altura natural con tres aperturas editoriales contiguas. No
  uses pinning, scrubbing ni una distancia artificial de scroll.
- Cada estado representa un pilar aprobado: Explore, Endure y Confront
  (mantén los textos en un archivo de contenido para poder sustituirlos).
- Usa ship-corridor, ship-atrium y frozen-deck como medios temporales.
- Las capturas con HUD deben mostrarse como evidencia de gameplay, no como key
  art, y su recorte no debe ocultar información relevante.

Interacción:
- Explore empieza expandido. Hover, foco o toque expanden otro pilar y el estado
  elegido persiste al retirar el cursor.
- La transición combina anchura, máscara, encuadre, luz y una señal escarlata;
  no uses WebGL ni reconstruyas el HUD.
- GSAP se limita a una entrada breve al alcanzar la sección, sin progreso
  ligado al scroll.
- Cada panel es un control nativo con estado accesible y foco visible.
- En móvil usa un acordeón vertical, sin carrusel ni scroll horizontal.

Calidad:
- Mantén fija la altura del escenario en escritorio para evitar CLS al cambiar
  de pilar.
- No uses filtros blur grandes sobre elementos de pantalla completa.
- El contenido se puede recorrer por teclado y con lector de pantalla.
- Reduced motion presenta los tres pilares como bloques editoriales estáticos.
```

## Prompt 04 — Retrato de Draga

```text
Implementa únicamente el capítulo de Draga usando draga-profile-960/1920.

Dirección:
- Retrato frío, íntimo y casi inmóvil después del ritmo de gameplay.
- Collage editorial de láminas desiguales, inspirado en los distintos espesores
  de páginas mojadas y quemadas. No representar un libro literal, papel sepia
  ni un archivo ficticio; las superficies siguen siendo negras y frías.
- Retrato más vertical y cercano, una base ceniza con borde blood, una lámina
  ambiental fría visible en la parte superior derecha y un recorte del abrigo
  abajo. Tres escalas reales del mismo material; no duplicar el rostro.
- Nombre grande en el encuentro entre retrato y negro, sin tarjeta lateral vacía.
  Bordes irregulares y sombras estáticas separan las alturas.
- Texto en el espacio negativo de la imagen, sin invadir la cara. En móvil,
  retrato y texto se apilan con los bordes de las láminas aún visibles.
- Información: nombre, rol y una cita o descripción marcada como pendiente si
  el equipo aún no ha aprobado el copy. Todo en inglés, sin inventar biografía.

Movimiento:
- Flujo natural, sin pin, scrub, secuencia por scroll ni altura artificial.
- Una sola entrada breve: las láminas periféricas se asientan y desaparece una
  veladura tenue de condensación. El retrato y los textos nunca se ocultan.
- Solo un puntero fino desplaza las láminas exteriores hasta 6 px en horizontal
  y 4 px en vertical. Cara y texto inmóviles. En touch, tier C y reduced motion,
  composición estática completa; no añadir controles decorativos.
- Un frame por lote de entrada, sin bucle permanente. Cancelar el frame pendiente
  al salir, cancelar el gesto, desmontar o deshabilitar el efecto.
- Prepara un slot MediaSubject independiente del layout, extensible a un GLB
  futuro. La API actual solo acepta la imagen disponible.

No implementes todavía el modelo 3D.

Criterios:
- El rostro conserva nitidez.
- El texto mantiene contraste en todos los breakpoints.
- Reduced motion elimina máscara animada y parallax.
- El contenido sigue visible sin JavaScript. Las imágenes decorativas no repiten
  el texto alternativo; AVIF/WebP y dimensiones explícitas en ambos usos.
- No se descarga ningún asset 3D inexistente.
```

## Prompt 05 — Izzy y ecos humanos (aplazado, fuera del recorrido)

No ejecutar por ahora. Se conserva el borrador y los medios, sin montaje ni
entrada en navegación.

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

## Prompt 06 — La infección (Deck 05)

```text
Implementa únicamente el gran capítulo de horror orgánico usando, en este orden,
organic-growth, blubber-room y vessel-creature.

Objetivo: construir una escalada visual continua. No lo presentes como galería.

Técnica:
- Una timeline principal normalizada 0..1 controla las tres revelaciones.
- El driver de scroll existente mide el stage y lleva esa única timeline al
  progreso correcto. No hay listeners de scroll adicionales ni inercia acumulada.
- WebGL mezcla texturas con ruido orgánico, erosión de bordes y desplazamiento
  máximo de 12 px CSS, con dirección y puntos de origen reconocibles.
- Growth y Blubber conservan su rojo real. Vessel mantiene la luz fría y sus
  ojos azules; el rojo queda en los bordes, sin teñir la criatura.
- El capítulo amplía una presencia roja que ya existía desde el hero: no debe
  parecer que la web cambia repentinamente a una identidad diferente.
- Un campo de filamentos en el frente de transición reacciona al puntero,
  pero nunca bloquea enlaces ni captura input.
- La criatura final se revela por regiones, sin flashes ni jumpscare.
- El shader debe compilar una vez y usar uniforms; no recrees materiales.
- Los tramos de reposo y el plano final quedan inmóviles. Ruido determinista,
  sin bucle atmosférico permanente ni salto aleatorio al invertir el scroll.

Rendimiento y seguridad:
- Reutiliza el canvas existente. Tier B reduce el framebuffer mediante su DPR,
  carga texturas 960 y reduce los octaves/filamentos, sin render target adicional.
- Tier C usa imágenes y clip-path CSS.
- Sin JavaScript, con reduced motion o en viewports de menos de 600 px de alto,
  las tres imágenes y sus textos se presentan en flujo editorial estático.
- No uses vídeo adicional ni texturas superiores a 1920.
- Pausa toda actualización fuera de viewport.
- Empieza a precargar en Draga. No ocultes las imágenes DOM hasta el primer
  frame WebGL; error de textura, shader o pérdida de contexto restaura el fallback.
- Oculta realmente las mallas inactivas, no solo su alpha. Libera incluso las
  texturas que terminen de cargar después de cancelar o fallar una carga hermana.
- Incluye alternativa reduced motion sin deformaciones continuas.

Criterios:
- 60 fps objetivo en escritorio y 30 fps sostenidos en móvil medio.
- Reversión perfecta al subir.
- Texto y navegación permanecen estables sobre el efecto.
```

## Prompt 07 — Evidencia de producción (Deck 06)

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

## Prompt 08 — Señal final y navegación global (Deck 07)

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
