# Black Tides: Draga's Wake — Experience Blueprint

## 1. Qué estamos construyendo

No es un videojuego dentro del navegador ni una landing convencional. Es una
presentación cinematográfica interactiva del juego: debe comunicar universo,
personajes, propuesta jugable y ambición de producción mientras la propia web
demuestra excelencia técnica.

Audiencias principales:

1. Editores, inversores y socios estratégicos.
2. Prensa, creadores y posibles colaboradores.
3. Jugadores que llegan desde Steam o redes sociales.

La primera visita debe producir tres ideas en menos de un minuto:

- El mundo de Black Tides es reconocible y tiene una identidad propia.
- Existe material de juego real y una visión de producto concreta.
- El equipo puede ejecutar una producción visual y técnica ambiciosa.

## 2. Conclusiones de los referentes

### Project Great Wall

Funciona por composición artística, contraste y claridad del mensaje. Su
estructura es una landing lineal de WordPress/Elementor con ilustraciones de
gran formato, entradas laterales y CTA visible. Es una buena referencia de
jerarquía, pero no de complejidad interactiva.

### Kaidan

Funciona por key art, vídeo, textura y consistencia temática. Está construido
sobre Squarespace y combina parallax, vídeo embebido, contenido editorial y
FAQ. Es una buena referencia de atmósfera y lectura rápida, pero la experiencia
sigue siendo una sucesión de bloques independientes.

### Decisión para Black Tides

Conservamos de ambos:

- una propuesta legible en el primer viewport;
- arte oficial a gran escala;
- CTA hacia Steam y contacto;
- una narrativa que no necesita conocer previamente el juego.

Subimos el listón con:

- una escena visual continua que evoluciona durante todo el scroll;
- transiciones WebGL entre vídeo, imágenes y futuras piezas 3D;
- animaciones controladas por progreso, velocidad y dirección del usuario;
- composición editorial sobre una capa gráfica en tiempo real;
- estados adaptativos para escritorio, móvil, bajo rendimiento y movimiento
  reducido.

## 3. Concepto rector: «Descender bajo la superficie»

La página empieza en una cubierta azotada por el frío y termina dentro de una
presencia orgánica que parece haber infectado el propio documento. El scroll no
solo desplaza contenido: representa un descenso físico y psicológico.

La experiencia alterna tres estados:

1. **Observación:** planos amplios, ritmo lento y texto mínimo.
2. **Descubrimiento:** cámara, luz y capas reaccionan al scroll o al puntero.
3. **Amenaza:** distorsión, materia orgánica y sonido opcional aumentan sin
   perjudicar la lectura.

La portada establece la relación cromática general: negro como masa dominante,
rojo como segundo color reconocible y marfil como contraste tipográfico. El
rojo está presente desde el hero, pero gana superficie e intensidad durante el
descenso hasta la infección.

No habrá animaciones decorativas aisladas. Cada movimiento debe cumplir al
menos una función: revelar, orientar, crear tensión, explicar una mecánica o
conectar dos capítulos.

## 4. Arquitectura narrativa

### 00 — Umbral / precarga silenciosa

Objetivo: preparar los recursos esenciales sin mostrar una pantalla de carga
artificialmente larga.

- Primer render inmediato con el póster del teaser.
- El vídeo y la experiencia gráfica avanzada se activan progresivamente.
- Una línea breve de estado puede formar parte del universo, pero no bloquear.
- Si JavaScript o WebGL fallan, la página continúa siendo completa y legible.

### 01 — Hero: The Wake

Objetivo: presentar título, tono y primera decisión del visitante.

- Vídeo ambiental a pantalla completa con póster como fallback.
- Título en dos niveles: `BLACK TIDES` / `DRAGA'S WAKE`.
- Una frase de género y fantasía del jugador, no un párrafo de marketing.
- CTA principal: ver teaser. CTA secundario: Steam.
- Movimiento sutil de profundidad; nada compite con el título.
- Al iniciar el scroll, el hero no desaparece: se hunde y se transforma.

### 02 — El mundo: Driftwood

Objetivo: establecer aislamiento, clima y localización.

- Transición de vídeo a imagen mediante displacement/noise, no un simple fade.
- La cámara virtual recorre la imagen en varios planos de profundidad.
- Tres datos breves aparecen como observaciones del mundo, no como tarjetas.
- Nieve, niebla o partículas deben responder a velocidad y dirección del scroll.

### 03 — La promesa jugable

Objetivo: explicar qué hace el jugador.

- Tres pilares: explorar, sobrevivir y confrontar/descubrir.
- Cada pilar activa un cambio visual dentro de una misma escena fijada.
- El contenido se lee en DOM semántico; WebGL refuerza, nunca contiene, el texto.
- Las capturas con HUD solo aparecen en contexto de gameplay.

### 04 — Draga

Objetivo: convertir a la protagonista en el centro emocional.

- Retrato lateral de Draga con luz fría y espacio negativo para texto.
- Revelado por máscara orgánica o condensación sobre cristal.
- El puntero modifica ligeramente luz, enfoque y separación de planos.
- Preparado para sustituir el retrato por un modelo GLB optimizado en una fase
  posterior sin cambiar la composición ni el contenido.

### 05 — Ecos humanos / Izzy y la tripulación

Objetivo: demostrar que el horror tiene relaciones y consecuencias.

- Composición editorial horizontal con dos o tres personajes como máximo.
- Cambio de foco por hover, teclado o swipe; no carrusel automático.
- Microfragmentos de voz, diálogo o biografía aprobada.
- La interfaz utiliza señales náuticas y de archivo, no paneles futuristas.

### 06 — La infección

Objetivo: realizar el gran giro visual de la página.

- `Growth`, `Blubber Room` y `Vessel` forman una secuencia, no una galería.
- El negro-rojo presente desde el inicio se desplaza hacia tonos `blood` y
  `ember`, reduciendo progresivamente la luz fría.
- Un shader de distorsión de baja amplitud reacciona a scroll y proximidad.
- La criatura se revela por partes; nunca mediante un susto o flash agresivo.

### 07 — Evidencia de producción

Objetivo: comunicar alcance y credibilidad sin convertir la web en un pitch
deck público.

- Gameplay real, datos aprobados y logros de producción.
- Formato de bitácora: plataformas previstas, estado, equipo y visión.
- Puede incluir un módulo de trailer completo y galería manual.
- Sin cifras financieras públicas salvo aprobación expresa.

### 08 — Señal final

Objetivo: cerrar con una imagen memorable y una acción clara.

- La escena recupera silencio y oscuridad.
- CTA principal: visitar Steam / añadir a deseados.
- CTA profesional secundario: contactar con Strange Creature Factory.
- Créditos, redes y accesibilidad quedan visibles sin romper la atmósfera.

## 5. Sistema de movimiento

### Capas

1. **Capa DOM:** tipografía, navegación, botones y contenido accesible.
2. **Capa media:** vídeo e imágenes responsive.
3. **Capa WebGL:** transiciones, partículas, profundidad y futuros modelos 3D.
4. **Capa atmosférica:** grano, viñeta, aberración muy sutil y niebla.

### Orquestación

- GSAP controla timelines, ScrollTrigger, entradas y salidas.
- React Three Fiber mantiene un único canvas persistente.
- Zustand comparte únicamente el capítulo activo, progreso normalizado,
  dirección, velocidad y tier gráfico.
- Los componentes no crean listeners de scroll independientes.
- Las timelines se crean dentro de contextos con cleanup completo.

### Lenguaje de animación

- Entradas de texto: 500–900 ms, desplazamiento máximo 24 px.
- Transiciones de capítulo: 1,2–2,4 s según la distancia narrativa.
- Parallax de puntero: máximo 1–2 grados o 12–20 px.
- Escala de imagen: nunca superior a 1.08 para evitar aspecto de plantilla.
- Distorsión cromática: solo durante transición y por debajo de 2 px visuales.
- Nada rebota. Las curvas deben sentirse pesadas, húmedas y mecánicas.

## 6. Arquitectura técnica propuesta

```text
app/page.tsx
components/experience/
  experience-shell.tsx
  experience-canvas.tsx
  chapter-navigation.tsx
  sections/
    hero-section.tsx
    world-section.tsx
    gameplay-section.tsx
    draga-section.tsx
    crew-section.tsx
    infection-section.tsx
    production-section.tsx
    final-signal-section.tsx
  webgl/
    media-plane.tsx
    atmosphere.tsx
    transition-material.ts
  motion/
    use-chapter-timeline.ts
    use-scroll-metrics.ts
    motion-preferences.ts
content/
  site-content.ts
  media.ts
  chapters.ts
```

Decisiones:

- Una sola ruta narrativa en la primera fase.
- HTML semántico y contenido real antes de añadir WebGL.
- Canvas persistente y lazy-loaded después del contenido crítico.
- Imágenes AVIF con WebP fallback y `srcset` 960/1920.
- Vídeo del hero silencioso, `playsInline`, con póster y pausa fuera de viewport.
- El teaser completo solo se descarga cuando el usuario lo solicita.
- Los modelos 3D serán GLB con Draco/Meshopt y texturas KTX2.

## 7. Presupuesto de calidad

### Rendimiento

- LCP p75: máximo 2,5 s.
- INP p75: máximo 200 ms.
- CLS p75: máximo 0,1.
- Hero inicial: póster primero; loop de vídeo después.
- JavaScript del canvas fuera del paquete crítico.
- 60 fps objetivo en escritorio; nunca menos de 30 fps sostenidos en móvil.
- DPR del canvas adaptativo entre 1 y 1.5.
- Pausar renderizado, vídeo y partículas cuando la pestaña no está visible.

### Tiers gráficos

- **Tier A:** escritorio potente, WebGL completo y postprocesado sutil.
- **Tier B:** portátil/móvil moderno, menos partículas y sin efectos costosos.
- **Tier C:** ahorro de datos, WebGL inestable o dispositivo limitado; imágenes,
  vídeo opcional y animación DOM esencial.
- **Reduced motion:** orden y contenido idénticos, sin scrubbing, pinning largo,
  movimientos de cámara ni parallax continuo.

### Accesibilidad

- Navegación completa por teclado.
- Contraste suficiente incluso sobre vídeo.
- Botones de sonido y vídeo con estado comunicado.
- Ningún texto importante dibujado dentro del canvas.
- Sin flashes, vibraciones ni desplazamientos grandes inevitables.
- La experiencia respeta `prefers-reduced-motion` desde el primer render.

## 8. Criterio para usar 3D

El 3D debe reservarse para momentos donde aporte algo que vídeo e imagen no
pueden ofrecer: inspeccionar a Draga, revelar una criatura o mantener una escena
continua entre capítulos. No se pedirán modelos de producción completos.

Para la primera pieza 3D solicitar:

- Draga o una criatura emblemática en pose controlada;
- GLB dedicado a web, entre 50k y 150k triángulos;
- una animación idle corta;
- texturas PBR 2K, con una variante 1K;
- aprobación explícita para publicación.

Hasta recibirlo, la arquitectura debe funcionar con planos de imagen y shaders,
sin falsificar profundidad con arte nuevo no aprobado.

## 9. Regla de implementación

Cada sección se construye como una entrega cerrada. Antes de iniciar la
siguiente debe cumplir:

1. contenido legible sin JavaScript;
2. responsive en móvil y escritorio;
3. variante reduced motion;
4. cleanup de timelines/listeners;
5. pausa de recursos fuera de viewport;
6. build y lint correctos;
7. ninguna regresión en secciones anteriores.
