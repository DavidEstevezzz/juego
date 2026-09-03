# Dirección visual — Black Tides: Draga's Wake

## Idea rectora

**Flesh, steel and the black sea.**

La web debe sentirse como entrar en la Ormora: un espacio industrial, húmedo y claustrofóbico donde el hierro del barco y el horror orgánico parecen formar un mismo cuerpo. La dirección no debe apoyarse en un steampunk genérico ni en códigos de interfaz futurista.

Fuentes visuales de referencia:

- https://store.steampowered.com/app/4810650/Black_Tides_Dragas_Wake/
- https://strangecreaturefactory.com/

## Principios

1. Oscuridad con detalle: fondos casi negros, pero con profundidad, humedad y textura.
2. Periodo sin nostalgia: 1900 alternativo, hierro remachado y maquinaria naval; evitar el sepia decorativo.
3. Dualidad negro-rojo: el negro construye el mundo y el rojo le da identidad, tensión y dirección. El rojo tiene presencia continua, pero nunca ocupa más masa que la oscuridad.
4. Tipografía editorial: el título tiene solemnidad clásica; la información técnica recuerda a placas, registros y señales del barco.
5. Imágenes protagonistas: el diseño enmarca el material del juego, no compite con él.

## Paleta principal

Los seis primeros colores proceden de la identidad actual del estudio y se convierten en los tokens centrales de la nueva web.

| Token | Valor | Uso |
| --- | --- | --- |
| `void` | `#050A07` | Fondo principal y negro de mar profundo |
| `charcoal` | `#080807` | Fondos alternos y zonas completamente oscuras |
| `hull` | `#0D1613` | Paneles, navegación y superficies elevadas |
| `ivory` | `#EDE7D3` | Texto principal, titulares y marcas sobre fondo oscuro |
| `steel` | `#9EAEAC` | Texto secundario, datos y acero frío |
| `blood` | `#7A1515` | Fondos rojos profundos, sangre, ritual e infección |
| `scarlet` | `#A82024` | Títulos, CTA principal, navegación activa y transiciones |
| `ember` | `#D24732` | Luz roja intensa y momentos de máxima tensión |
| `brass` | `#B89840` | Detalle naval, numeración, líneas secundarias y metal |
| `oxidation` | `#17322C` | Veladuras verdes, agua, corrosión y profundidad |
| `rust` | `#6C3828` | Texturas metálicas y acentos secundarios |
| `frost` | `#C6D2CE` | Bruma, hielo y destellos fríos muy limitados |

### Proporción recomendada

- 55% `void`, `charcoal` y `hull`.
- 18% `blood`, `scarlet` y apariciones muy localizadas de `ember`.
- 17% `ivory` y `steel`.
- 7% `oxidation`, `frost` y luz fría procedente de las imágenes.
- 3% `brass` y `rust`.

El negro siempre conserva la mayor masa visual. El rojo puede ocupar títulos, CTA, líneas activas, máscaras, fondos parciales y transiciones, pero no debe usarse para párrafos pequeños sobre negro. El latón pasa a ser un material secundario: aporta época y carácter naval sin competir con la firma negro-rojo de la portada.

### Tokens CSS propuestos

```css
:root {
  --color-void: #050a07;
  --color-charcoal: #080807;
  --color-hull: #0d1613;
  --color-ivory: #ede7d3;
  --color-steel: #9eaeac;
  --color-blood: #7a1515;
  --color-scarlet: #a82024;
  --color-ember: #d24732;
  --color-brass: #b89840;
  --color-oxidation: #17322c;
  --color-rust: #6c3828;
  --color-frost: #c6d2ce;

  --surface-glass: rgb(5 10 7 / 82%);
  --border-subtle: rgb(237 231 211 / 14%);
  --border-scarlet: rgb(168 32 36 / 58%);
  --border-brass: rgb(184 152 64 / 28%);
  --glow-red: 0 0 64px rgb(168 32 36 / 24%);
  --shadow-deep: 0 32px 90px rgb(0 0 0 / 58%);
}
```

## Tipografía

### Logotipo

El logotipo oficial de **Black Tides** debe tratarse como un activo gráfico y no reconstruirse con una fuente web. Hasta recibir el archivo oficial se puede usar Cinzel como sustituto provisional.

### Display — Cinzel

- Pesos: 400 y 600.
- Uso: hero, nombres de capítulos, personajes y frases dramáticas.
- Preferencia por mayúsculas con tracking moderado.
- No usar en párrafos ni en tamaños pequeños.

### Lectura — IBM Plex Sans

- Pesos: 400 y 500.
- Uso: sinopsis, descripciones de personajes, propuesta del proyecto y contacto.
- Ancho de columna recomendado: 52–68 caracteres.
- Interlineado: 1.55–1.7.

### Sistema — Share Tech Mono

- Peso: 400.
- Uso: numeración de cubierta, coordenadas, capítulos, navegación, estados y metadatos.
- Siempre en mayúsculas para etiquetas cortas.
- Tracking entre `0.12em` y `0.24em`.
- Nunca emplearla para cuerpos de texto largos.

```css
--font-display: 'Cinzel', Georgia, serif;
--font-body: 'IBM Plex Sans', Arial, sans-serif;
--font-system: 'Share Tech Mono', monospace;
```

## Jerarquía tipográfica

| Rol | Tamaño orientativo | Familia |
| --- | --- | --- |
| Hero | `clamp(4rem, 10vw, 10rem)` | Cinzel 400 |
| Título de capítulo | `clamp(2.75rem, 6vw, 6rem)` | Cinzel 400 |
| Titular secundario | `clamp(1.75rem, 3vw, 3.25rem)` | Cinzel 600 |
| Entradilla | `clamp(1.15rem, 1.6vw, 1.5rem)` | IBM Plex Sans 400 |
| Cuerpo | `1rem–1.125rem` | IBM Plex Sans 400 |
| Etiqueta | `0.68rem–0.78rem` | Share Tech Mono 400 |

## Composición

- Retícula de 12 columnas, con contenido editorial en 5–7 columnas y arte ocupando el resto.
- Secciones amplias, de una a dos alturas de viewport, en lugar de tarjetas pequeñas.
- Asimetría controlada: personajes cortados por el encuadre, textos que entran desde los márgenes y masas de oscuridad deliberadas.
- Bordes de 1 px, esquinas rectas o con un radio máximo de 2–4 px.
- Líneas rojas para estado y dirección; latón, placas numeradas y marcas de calibración como detalles materiales.
- El espacio vacío debe sentirse como oscuridad del barco, no como aire limpio de una landing corporativa.

## Materiales y textura

- Hierro ennegrecido y remaches.
- Pintura naval desconchada.
- Sal, escarcha, condensación y cristales húmedos.
- Latón opaco y arañado, nunca dorado brillante.
- Carne o tejido ritual usados de manera localizada.
- Grano cinematográfico y niebla en capas de baja opacidad.

Evitar engranajes decorativos, marcos barrocos, pergaminos, tentáculos genéricos y ruido visual constante.

## Imagen y vídeo

- Contraste bajo en sombras y altas luces muy localizadas.
- Alternar temperaturas: verde/cian enfermo para el barco y rojo cálido para la amenaza ritual.
- No aplicar filtros globales que destruyan el color original del material del juego.
- Mantener rostros y siluetas legibles; las texturas pueden invadir los bordes, no el punto focal.
- Vídeo siempre con póster estático y carga diferida.

## Movimiento

- Movimiento ambiental lento: niebla, vapor, vibración mecánica y deriva del barco.
- Transiciones de capítulo como puertas, mamparos o descensos entre cubiertas.
- Máscaras de luz que revelan contenido, en vez de simples fades corporativos.
- Parallax leve y cámara pesada; nada debe sentirse elástico o flotante.
- Microinteracciones entre 180 y 300 ms; entradas narrativas entre 700 y 1400 ms.
- El rojo puede permanecer de forma continua en elementos estructurales pequeños. Su superficie e intensidad aumentan al acercarse a la infección.
- Respetar `prefers-reduced-motion` y ofrecer una versión estática completa.

## Sonido

El sonido es opcional y solo se activa después de una acción explícita. La capa ambiental ideal combina casco, metal sometido a presión, agua, viento, calderas y respiración. Debe acompañar, no crear un susto automático.

## Componentes básicos

### CTA principal

- Fondo transparente o `hull`.
- Borde `scarlet` o fondo negro con línea roja.
- Texto Share Tech Mono en mayúsculas.
- Hover: relleno `scarlet`, texto `ivory`, pequeño desplazamiento de una línea o indicador.
- El latón se reserva para el CTA secundario o detalles mecánicos.

### Navegación

- Fija o contextual, mínima.
- Número de capítulo + nombre corto.
- Estado activo en `scarlet`; latón para numeración o marcas auxiliares.
- El logotipo del juego siempre tiene prioridad sobre el del estudio.

### Panel informativo

- Fondo oscuro translúcido.
- Sin grandes radios ni sombras de producto SaaS.
- Línea superior técnica, numeración y uno o dos datos, no decoración gratuita.

## Cambios respecto a la maqueta actual

1. Sustituir el verde ácido `#C7FF4A` por `scarlet` `#A82024` como acento principal y conservar el latón como detalle secundario.
2. Cambiar el grid digital limpio por una estructura naval más irregular y tenue.
3. Introducir Cinzel en titulares y Share Tech Mono en etiquetas.
4. Mantener el negro, pero desplazarlo hacia el verde profundo `#050A07`.
5. Construir una relación constante entre negro y rojo: `#7A1515` para profundidad e infección, `#A82024` para interfaz y títulos, y `#D24732` solo para luz intensa.
6. Eliminar el aspecto de prototipo tecnológico cuando se integren las primeras imágenes oficiales.

## Material prioritario que falta

- Logotipo oficial en SVG o PNG transparente.
- Key art sin texto y, si es posible, separado en fondo/personaje/atmósfera.
- Una imagen de Draga y otra de la Ormora con suficiente resolución para pantalla completa.
- Referencias de interfaz del juego, si existen, para reutilizar placas, símbolos y numeración.
- Modelo GLB web de Draga o de una criatura solo después de fijar el primer capítulo visual.
