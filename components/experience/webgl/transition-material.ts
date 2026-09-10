import * as THREE from 'three';

/**
 * Material cinematográfico de Driftwood.
 *
 * El capítulo tiene dos cortes y ninguno es un fundido. El primero lo tapa una
 * ventisca que además lo transporta: el mismo campo decide dónde la nieve es
 * más espesa y hasta dónde ha llegado el cambio de fotografía. El segundo
 * ocurre cuando el temporal alcanza la lente y el agua se agarra al cristal.
 * No existen sprites ni geometría: niebla, copos, refracción, condensación y
 * gotas se resuelven en una sola pasada de fragmento. La escena y el montaje
 * dependen del scroll; el tiempo solo mueve la atmósfera y el agua, que nunca
 * deciden qué imagen corresponde a cada punto del recorrido.
 */

const VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D uTextureA;
uniform sampler2D uTextureB;
uniform sampler2D uTextureC;
uniform float uAspectA;
uniform float uAspectB;
uniform float uAspectC;
uniform vec2 uFocalA;
uniform vec2 uFocalB;
uniform vec2 uFocalC;
uniform vec2 uPanA;
uniform vec2 uPanB;
uniform vec2 uPanC;
uniform float uPlaneAspect;

uniform float uSceneMix;
uniform float uShipMix;
uniform float uLensMix;
uniform float uWhiteout;
uniform float uRain;
uniform float uSquall;
uniform float uDetail;
uniform float uDisplacement;
uniform float uZoomA;
uniform float uZoomB;
uniform float uZoomC;
uniform float uFog;
uniform float uLight;
uniform float uOpacity;
uniform vec3 uFogColor;
uniform vec3 uWhiteColor;

/**
 * Los tres relojes del capítulo.
 *
 * uTime avanza sin más y solo sostiene el grano. uDrift es el mismo reloj
 * integrado con la velocidad del scroll: mueve los campos de ruido, que no son
 * periódicos y por tanto nunca se pueden reiniciar. uStormPhase es ese mismo
 * recorrido envuelto en un múltiplo exacto del periodo de las rejillas de
 * celdas —gotas y copos—, que sí vuelven a su sitio y permiten reiniciarlo sin
 * que se vea. Separarlos es lo que evita el salto: multiplicar un reloj por un
 * factor que cambia con la rueda teletransporta la atmósfera entera.
 */
uniform float uTime;
uniform float uDrift;
uniform float uStormPhase;

varying vec2 vUv;

float hash21(vec2 point) {
  point = fract(point * vec2(123.34, 456.21));
  point += dot(point, point + 45.32);
  return fract(point.x * point.y);
}

float noise21(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  local = local * local * (3.0 - 2.0 * local);

  float a = hash21(cell);
  float b = hash21(cell + vec2(1.0, 0.0));
  float c = hash21(cell + vec2(0.0, 1.0));
  float d = hash21(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
}

float fbm(vec2 point) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 turn = mat2(0.84, -0.54, 0.54, 0.84);

  for (int octave = 0; octave < 4; octave++) {
    value += noise21(point) * amplitude;
    point = turn * point * 2.03 + 17.17;
    amplitude *= 0.5;
  }

  return value / 0.9375;
}

/** Tres aleatorios decorrelacionados por celda, en una sola pasada. */
vec3 cellRandom(vec2 cell) {
  vec3 seed = fract(
    vec3(cell.x, cell.y, cell.x * 0.517 + cell.y * 0.318) * 0.1031
  );
  seed += dot(seed, seed.yzx + 31.32);
  return fract((seed.xxy + seed.yzz) * seed.zyx);
}

/** Rampa con meseta corta: sube hasta el punto pedido, toca techo y cae. */
float saw(float hold, float t) {
  return smoothstep(0.0, hold, t) * smoothstep(1.0, hold, t);
}

/** Ciclos de celda por unidad de fase. Ver uStormPhase. */
const float STORM_RATE = 0.62;

// Encuadre cover alrededor de un punto focal, con dolly y deriva independientes.
vec2 coverUv(
  vec2 uv,
  float textureAspect,
  vec2 focal,
  vec2 pan,
  float zoom
) {
  vec2 scale = uPlaneAspect > textureAspect
    ? vec2(1.0, textureAspect / uPlaneAspect)
    : vec2(uPlaneAspect / textureAspect, 1.0);
  return (uv - focal) * scale / zoom + focal + pan;
}

vec3 samplePlate(
  sampler2D image,
  vec2 uv,
  float aspect,
  vec2 focal,
  vec2 pan,
  float zoom
) {
  return texture2D(
    image,
    clamp(coverUv(uv, aspect, focal, pan, zoom), 0.002, 0.998)
  ).rgb;
}

// ---------------------------------------------------------------------------
// Primer corte: la ventisca.
//
// La masa que oculta el cambio de Driftwood al asentamiento no es una capa de
// opacidad. Tiene frentes y huecos, la luz de las ventanas se reparte dentro
// de ella en lugar de recortarse contra su borde, y por delante cruzan copos
// lo bastante cerca del objetivo como para ser trazos y no puntos.
//
// Lo que de verdad la convierte en montaje es que el corte viaja dentro del
// frente: la máscara que decide qué fotografía se ve en cada punto se
// construye con el mismo campo que la densidad, así que la nieve más espesa es
// la que trae el asentamiento consigo. Donde queda un hueco siempre se ve una
// sola imagen, nunca las dos superpuestas, que es exactamente lo que separa un
// corte de un fundido encadenado.
// ---------------------------------------------------------------------------

/**
 * Copos cercanos, convertidos en trazo por su propia velocidad.
 *
 * Son pocos y grandes: a esta distancia del objetivo no hay copo que se lea
 * como un punto. Dan la escala que a la masa de niebla le falta —sin ellos no
 * hay forma de saber si la ventisca está a un metro o a cien— y su rejilla
 * vuelve a su sitio exactamente al reiniciarse la fase.
 */
float flurry(vec2 uv, float scale, float lift) {
  vec2 domain = vec2(uv.x * uPlaneAspect, uv.y) * scale;
  domain += vec2(-uStormPhase * STORM_RATE * 2.0, uStormPhase * STORM_RATE * 0.5);

  vec2 cell = floor(domain);
  vec3 rnd = cellRandom(cell);
  vec2 local = fract(domain) - 0.5 - (rnd.xy - 0.5) * vec2(0.14, 0.86);
  local.y -= lift;

  // Semiejes del trazo, en unidades de celda, con el calibre repartido por
  // celda: todos iguales, la rejilla se lee como un estampado de topos. El
  // copo se alarga mucho en la dirección del viento —a esta velocidad
  // relativa el obturador no deja un punto, deja una raya— pero tiene que
  // caber dentro de su celda con el desplazamiento incluido: si se sale, la
  // rejilla lo recorta y lo que se dibuja es un rectángulo de bordes duros.
  float grade = 0.4 + rnd.z * rnd.z * 1.1;
  vec2 streak = vec2(0.38, 0.04) * grade;

  return smoothstep(1.0, 0.05, length(local / streak))
    * step(0.62, fract(rnd.z * 7.0))
    * (0.55 + rnd.x * 0.45);
}

/**
 * Luz difusa del plano bajo la ventisca.
 *
 * La niebla no recorta las farolas: las reparte. Tres lecturas muy separadas
 * bastan para saber cuánta luz hay alrededor del punto, porque lo que se busca
 * es un halo y no una imagen. Se lee un solo plano —el que domina en ese
 * momento del cruce— porque el resultado acaba completamente disuelto dentro
 * de la masa y la diferencia entre uno y otro no llega a verse.
 */
vec3 blizzardGlow(vec2 uv, float dither) {
  vec3 sum = vec3(0.0);
  float angle = dither * 6.2831853;

  for (int tap = 0; tap < 3; tap++) {
    angle += 2.3999632;
    vec2 offset = vec2(cos(angle), sin(angle))
      * (0.022 + float(tap) * 0.019)
      * vec2(1.0 / uPlaneAspect, 1.0);

    if (uSceneMix < 0.5) {
      sum += samplePlate(uTextureA, uv + offset, uAspectA, uFocalA, uPanA, uZoomA);
    } else {
      sum += samplePlate(uTextureB, uv + offset, uAspectB, uFocalB, uPanB, uZoomB);
    }
  }

  return sum / 3.0;
}

// ---------------------------------------------------------------------------
// Segundo corte: el temporal contra el cristal.
//
// A partir de aquí la primera fotografía ya no interviene —su cruce terminó en
// el 0.48 del recorrido y el agua no llega hasta el 0.60—, así que el plano se
// reduce a dos texturas: el asentamiento y la Ormora. Todo el relieve del agua
// vive en un campo de altura que se evalúa tres veces por fragmento —centro y
// dos vecinos— para obtener su pendiente. Esa pendiente es lo único que hace
// falta: refracta, ilumina y da volumen. No hay buffers de realimentación ni
// una segunda pasada; sigue siendo una única llamada de dibujo.
// ---------------------------------------------------------------------------

/** Ciclos que tarda la rejilla en avanzar una celda entera. */
const float DROP_LAPS = 3.0;
/** Celdas por unidad de flujo: una gota y su estela por celda. */
const vec2 DROP_CELLS = vec2(8.0, 2.4);

/** Apertura del flujo a esa altura del encuadre. Ver glassFlow. */
float glassSpread(vec2 uv) {
  return 0.52 + uv.y * 0.78;
}

/**
 * Espacio de flujo del cristal.
 *
 * El aire no deja caer el agua: la lanza hacia arriba y la abre hacia los
 * lados, igual que en un parabrisas a velocidad de autovía. Comprimir la
 * coordenada horizontal en proporción a la altura hace que una columna recta
 * de este espacio se dibuje abierta en pantalla, así que las estelas divergen
 * solas y crecen conforme se alejan del centro bajo. La corrección de aspecto
 * mantiene las gotas redondas en cualquier formato.
 */
vec2 glassFlow(vec2 uv) {
  return vec2((uv.x - 0.5) * uPlaneAspect / glassSpread(uv), uv.y);
}

/**
 * Una capa de gotas arrastradas por el aire.
 *
 * Devuelve en X el relieve —lo que refracta y brilla— y en Y la lámina fina
 * que la gota deja detrás: no tiene volumen, pero sí limpia el vaho, que es
 * por lo que el rastro de cada gota se ve más nítido que el resto del cristal.
 *
 * La rejilla avanza despacio en la dirección del aire mientras cada gota
 * recorre su celda a tirones: aguanta agarrada, se suelta de golpe y vuelve a
 * pararse arriba hasta reabsorberse. El avance nunca retrocede —un ciclo en
 * diente de sierra hace que la gota vuelva hacia atrás y se ve— y el nacimiento
 * y la reabsorción se resuelven con el radio, no con la opacidad: el agua se
 * junta y se consume, no se desvanece.
 */
vec2 dropLayer(vec2 flow, float rain, float spread) {
  float snakeAxis = flow.y;

  flow.y += uStormPhase * (STORM_RATE / (DROP_CELLS.y * DROP_LAPS));

  // Cada columna arranca en un punto distinto de su ciclo; sin esto las gotas
  // se alinean en filas y se lee la rejilla por debajo del agua.
  flow.y += hash21(vec2(floor(flow.x * DROP_CELLS.x), 4.31)) * 3.7;

  vec2 cell = floor(flow * DROP_CELLS);
  vec3 rnd = cellRandom(cell);
  vec2 local = fract(flow * DROP_CELLS);

  float cycle = fract(uStormPhase * STORM_RATE + rnd.z);
  float head = smoothstep(0.3, 0.74, cycle) * 0.9 + 0.05;
  float life = smoothstep(0.0, 0.1, cycle) * smoothstep(1.0, 0.9, cycle);

  // Serpenteo: el agua busca el camino ya mojado en lugar de subir recta.
  float lateral = (rnd.x - 0.5) * 0.62;
  lateral += sin(snakeAxis * 19.0 + sin(snakeAxis * 8.0))
    * (0.34 - abs(lateral))
    * (rnd.z - 0.5);
  lateral += 0.5;

  // El cristal se moja por partes: cada celda tiene su propio umbral, así que
  // las gotas no aparecen todas en el mismo fotograma del recorrido.
  float born = smoothstep(rnd.y * 0.7, rnd.y * 0.7 + 0.3, rain);

  // El tamaño se reparte al cuadrado: muchas gotas pequeñas y unas pocas
  // grandes, que es como cae el agua de verdad. Repartido de forma plana, todo
  // el cristal sale del mismo calibre y se lee como vaho, no como lluvia.
  // El suelo del radio no es cosmético: con los dos bordes iguales, smoothstep
  // divide entre cero y la gota se convierte en un NaN.
  float grade = rnd.y * rnd.y;
  float radius = max((0.006 + grade * 0.03) * born * life, 1e-5);

  // La medida vuelve a pantalla —de ahí el factor de apertura en X—, así que
  // una gota es redonda y del mismo tamaño en cualquier punto del encuadre
  // aunque la rejilla que la contiene se abra hacia arriba.
  vec2 toHead = (local - vec2(lateral, head)) / DROP_CELLS * vec2(spread, 1.0);

  // El aire estira la gota hacia atrás. La cabeza se mantiene redonda y la
  // cola se alarga hasta fundirse con la estela: es una sola masa de agua
  // arrastrada, no una esfera con un hilo cosido por detrás.
  vec2 shaped = vec2(toHead.x, toHead.y * (toHead.y < 0.0 ? 0.42 : 1.0));
  float body = smoothstep(radius, radius * 0.12, length(shaped));

  // Estela: se estrecha y se seca cuanto más atrás queda de la cabeza.
  float behind = smoothstep(0.03, -0.01, local.y - head);
  float taper = sqrt(clamp(local.y / max(head, 0.02), 0.0, 1.0));
  float width = max(radius * taper, 1e-4);
  float trail = smoothstep(width * 1.25, width * 0.2, abs(toHead.x));
  trail *= behind * taper * taper * 0.8;

  // El rastro nunca es una línea continua: va soltando cuentas por el camino.
  vec2 toBead = vec2(toHead.x, (fract(local.y * 3.0) - 0.5) / DROP_CELLS.y);
  float beads = smoothstep(radius * 0.5, 0.0, length(toBead))
    * behind
    * taper
    * rnd.y;

  return vec2(body + beads * 0.55, trail);
}

/**
 * Altura del agua sobre el cristal.
 *
 * X es el relieve —gotas y cuentas— e Y la lámina de las estelas. La capa
 * fina solo existe en tier A: el gradiente es lo caro del efecto y duplicarlo
 * en un portátil no compensa el detalle que añade.
 */
vec2 glassHeight(vec2 uv, float rain) {
  vec2 flow = glassFlow(uv);
  float spread = glassSpread(uv);

  // Cuentas fijas: agua pulverizada que se queda agarrada al vidrio, aparece y
  // se seca sin moverse. Es lo que separa un cristal batido de uno limpio.
  vec2 mistCell = flow * 39.0;
  vec3 mistRnd = cellRandom(floor(mistCell));
  vec2 mistLocal = (fract(mistCell) - 0.5 - (mistRnd.xy - 0.5) * 0.94)
    * vec2(spread, 1.0);
  float mist = smoothstep(0.3, 0.05, length(mistLocal))
    * saw(0.09, fract(uStormPhase * (STORM_RATE / DROP_LAPS) + mistRnd.z))
    * step(0.58, fract(mistRnd.z * 9.0))
    * smoothstep(0.1, 0.55, rain);

  vec2 near = dropLayer(flow, rain, spread);
  float height = near.x + mist * 0.4;
  float film = near.y;

  if (uDetail > 0.5) {
    // La capa fina aporta gotas, pero su estela se queda en un apunte: dos
    // rastros completos por celda llenan el cristal de rayas y el agua deja de
    // tener escala.
    vec2 far = dropLayer(flow * 1.83 + vec2(11.3, 2.7), rain, spread * 1.83);
    height += far.x * 0.8;
    film = max(film, far.y * 0.45);
  }

  return vec2(min(height, 1.0), min(film, 1.0));
}

/**
 * Reparto del relieve.
 *
 * La estela pesa menos que la gota pero no es plana: es una lámina ancha y
 * baja que sigue desviando la luz. Con un peso simbólico el rastro deja de
 * refractar y de recoger brillo, y lo único que queda de él es una franja algo
 * más nítida que nadie llega a leer como agua.
 */
const vec2 GLASS_RELIEF = vec2(1.0, 0.45);

float glassRelief(vec2 uv, float rain) {
  return dot(glassHeight(uv, rain), GLASS_RELIEF);
}

/** El plano del segundo corte: asentamiento y Ormora en un solo muestreo. */
vec3 stormPlate(vec2 uv, float shipAmount) {
  // Las dos guardas dependen solo de uniforms, así que ningún fragmento se
  // separa del resto: fuera del segundo corte el barco no se llega a leer, y
  // en la cola del capítulo tampoco se lee ya el asentamiento.
  if (shipAmount > 0.999) {
    return samplePlate(uTextureC, uv, uAspectC, uFocalC, uPanC, uZoomC);
  }

  vec3 village = samplePlate(uTextureB, uv, uAspectB, uFocalB, uPanB, uZoomB);
  if (shipAmount < 0.001) return village;

  vec3 ship = samplePlate(uTextureC, uv, uAspectC, uFocalC, uPanC, uZoomC);
  return mix(village, ship, shipAmount);
}

/**
 * Desenfoque disperso del plano, estirado en la dirección del aire.
 *
 * Cuatro muestras repartidas por ángulo áureo y giradas por fragmento: con un
 * anillo fijo, tan pocas muestras dejan fantasmas; girándolo por píxel se leen
 * como grano, que es exactamente la textura que tiene un cristal mojado. El
 * valor central sale aparte porque el compuesto necesita la diferencia entre
 * el plano nítido y el desenfocado, no el desenfocado suelto.
 */
vec3 stormPlateBlur(
  vec2 uv,
  vec2 radius,
  vec2 stretch,
  float shipAmount,
  float dither,
  out vec3 centre
) {
  centre = stormPlate(uv, shipAmount);

  vec3 sum = centre;
  float taken = 1.0;
  float angle = dither * 6.2831853;
  float budget = uDetail > 0.5 ? 4.0 : 2.0;

  for (int tap = 0; tap < 4; tap++) {
    if (float(tap) >= budget) break;

    angle += 2.3999632;
    float spread = sqrt((float(tap) + 0.5) * 0.25);
    vec2 offset = vec2(cos(angle), sin(angle)) * spread + stretch * spread;
    sum += stormPlate(uv + offset * radius, shipAmount);
    taken += 1.0;
  }

  return sum / taken;
}

void main() {
  float dither = hash21(gl_FragCoord.xy + floor(uTime * 24.0));

  // El dominio está muy comprimido en X y estirado en Y: aparecen lenguas de
  // niebla arrastradas lateralmente, no una nube isotrópica ni copos repetidos.
  // El sesgo en X las inclina: con los frentes horizontales, la ventisca se
  // lee como un telón que sube y baja en lugar de como algo que cruza.
  vec2 windDomain = vec2(
    vUv.x * 1.18 - uDrift * 0.045,
    vUv.y * 6.4 + vUv.x * 1.3
  );
  float warp = fbm(windDomain * 0.58 + vec2(8.2, -3.4));
  float bands = fbm(windDomain + vec2(warp * 0.82, uDrift * 0.012));
  float fineWind = fbm(vec2(
    vUv.x * 2.6 - uDrift * 0.085,
    (vUv.y + vUv.x * 0.075) * 21.0
  ));

  // El frente de la ventisca. Un único campo decide dos cosas a la vez: dónde
  // la nieve es más espesa y hasta dónde ha llegado el cambio de fotografía.
  // Por eso el corte no se ve: ocurre siempre detrás del punto más denso.
  float front = bands * 0.72 + warp * 0.5;
  float threshold = mix(1.26, -0.06, uSceneMix);
  float sceneMask = smoothstep(threshold - 0.1, threshold + 0.1, front);

  vec2 refraction = vec2(bands - 0.5, warp - 0.5)
    * uDisplacement
    * (0.42 + uWhiteout * 1.35);

  // El plano del segundo corte comparte esta coordenada con el cristal: si el
  // agua muestreara sin la deriva atmosférica, el relieve dibujaría un doble
  // contorno sobre la imagen a la que se supone que pertenece.
  vec2 plateUv = vUv - refraction * (1.35 - uSceneMix);
  vec3 color = stormPlate(plateUv, uShipMix);

  if (uSceneMix < 0.998) {
    vec3 colorA = samplePlate(
      uTextureA,
      vUv + refraction * (0.35 + uSceneMix),
      uAspectA,
      uFocalA,
      uPanA,
      uZoomA
    );
    color = mix(colorA, color, sceneMask);
  }

  // Una niebla baja y oscura integra las fotografías sin teñirlas de forma
  // plana. Aumenta ligeramente al avanzar hacia el asentamiento.
  float ground = smoothstep(0.92, 0.04, vUv.y);
  float lowFog = clamp(
    uFog * (0.18 + ground * 0.48) * (0.78 + bands * 0.22),
    0.0,
    0.52
  );
  color = mix(color, uFogColor, lowFog);

  // La ventisca. Fuera de su ventana el bloque no se ejecuta: la condición
  // depende de un uniform, así que no hay divergencia entre fragmentos.
  if (uWhiteout > 0.002) {
    // La densidad se construye sobre un suelo bajo y una variación ancha. Con
    // el suelo alto que tenía antes, la masa alcanzaba su punto opaco de forma
    // uniforme y lo que se veía era un fundido a blanco, no tiempo atmosférico.
    // El mismo campo que lleva el corte decide la espesura, y con una ventana
    // ancha: donde la ráfaga aprieta la masa es opaca y donde afloja se ve el
    // fondo. El suelo tiene que quedar bajo o la nieve alcanza su punto ciego
    // de forma uniforme y lo que se ve es un fundido a blanco, no una ventisca.
    float gust = smoothstep(0.42, 0.86, front);
    float density = clamp(uWhiteout * (0.08 + gust * 1.25), 0.0, 1.0);

    // Gris frío de temporal, nunca blanco puro: el capítulo entero está
    // construido sobre verdes apagados y una masa blanca lo perfora.
    vec3 storm = mix(uFogColor, uWhiteColor, 0.76);

    // La luz de las ventanas se dispersa dentro de la masa en vez de
    // recortarse contra ella, y la tiñe de su propio color.
    if (uDetail > 0.5) {
      vec3 glow = blizzardGlow(vUv, dither);
      float halo = clamp(dot(glow, vec3(0.32, 0.56, 0.12)) * 2.4, 0.0, 1.0);
      storm = mix(storm, uWhiteColor, halo * 0.8);
      storm = mix(storm, glow, halo * 0.34);
    }

    color = mix(color, storm, density);

    // Nieve barrida: filamentos que cruzan por delante de la masa, no dentro.
    // Son lo que da dirección al viento cuando la densidad ya lo tapa todo.
    float lash = smoothstep(0.58, 0.97, fineWind) * uWhiteout;
    color = mix(color, storm * 1.12, lash * 0.3);

    // Dos capas de copos cercanos a distinta escala y altura: la parallax es
    // lo que convierte una cortina en un volumen por el que se está pasando.
    float flakes = flurry(vUv, 4.3, 0.0) * 0.72;
    if (uDetail > 0.5) flakes = max(flakes, flurry(vUv, 7.9, 0.41) * 0.44);
    color = mix(color, uWhiteColor, flakes * uWhiteout);

    // Condensación irregular en los bordes de la lente.
    float edge = smoothstep(0.34, 0.76, length((vUv - 0.5) * vec2(0.82, 1.0)));
    float condensation = edge
      * smoothstep(0.4, 0.92, fbm(vUv * 4.2 + vec2(13.7, -5.1)))
      * uWhiteout;
    color = mix(color, storm, condensation * 0.32);
  }

  // El agua sobre el cristal. Se salta igual que la ventisca cuando no toca, y
  // las dos ventanas no se solapan en ningún punto del recorrido.
  if (uRain > 0.004) {
    // Todo lo que el cristal añade se expresa como diferencia sobre el plano
    // que ya está compuesto y con niebla. Así el revelado hereda la gradación
    // exacta del fotograma y, cuando el agua vale cero, la diferencia también.
    float plateGain = 1.0 - lowFog;
    vec2 toUv = vec2(1.0 / uPlaneAspect, 1.0);

    // Pendiente del agua por diferencias finitas. El paso se toma en píxeles
    // —de ahí la corrección de aspecto en X—, de modo que la inclinación no
    // depende del formato de la ventana. Son las tres únicas evaluaciones del
    // campo de altura que se hacen por fragmento, y el centro se reaprovecha.
    vec2 water = glassHeight(plateUv, uRain);
    float probe = 0.0022;
    float centre = dot(water, GLASS_RELIEF);
    vec2 tilt = vec2(
      glassRelief(plateUv + vec2(probe * toUv.x, 0.0), uRain) - centre,
      glassRelief(plateUv + vec2(0.0, probe), uRain) - centre
    ) * (0.013 / probe);

    // Dirección del aire en este punto: arriba y hacia fuera, abriéndose desde
    // el centro bajo del encuadre, como el agua sobre un parabrisas.
    vec2 windDir = normalize(vec2((vUv.x - 0.5) * 1.6, 0.72));

    // Cuatro muestras solo desenfocan mientras el radio se mantenga corto: en
    // cuanto crece, cada muestra se lee por separado y lo que sale son copias
    // de la imagen, no un fuera de foco. El estirado en la dirección del aire
    // se queda por debajo del propio radio por la misma razón.
    vec2 blurRadius = (0.0035 + uSquall * 0.006) * (0.4 + uRain * 0.6) * toUv;

    vec3 sharp;
    vec3 soft = stormPlateBlur(
      plateUv,
      blurRadius,
      windDir * uSquall * 0.55,
      uShipMix,
      dither,
      sharp
    );

    // El agua saca el foco fuera del cristal, salvo donde una estela acaba de
    // limpiarlo: el rastro de cada gota es la única parte que sigue nítida.
    float defocus = clamp(
      uRain * (0.5 + uSquall * 0.55) - water.y * 0.45,
      0.0,
      1.0
    );
    vec3 wet = color + (soft - sharp) * defocus * plateGain;

    // Dentro de la gota el plano vuelve a estar nítido, deformado en gran
    // angular y adelantado: la silueta de la Ormora aparece antes en el agua
    // que en el cristal. Cada gota es una lente y enseña lo que viene.
    vec3 lens = stormPlate(plateUv + tilt * 0.055 * toUv, uLensMix);
    float body = smoothstep(0.08, 0.42, water.x + water.y * 0.45);
    color = mix(wet, color + (lens - sharp) * plateGain, body);

    // El agua enfría y apaga el plano: el cristal deja de ser del todo
    // transparente antes de que aparezca un solo brillo.
    color = mix(color, color * vec3(0.8, 0.87, 0.95), uRain * 0.5);

    // Relieve: contacto oscuro en el borde y un brillo frío arriba a la
    // izquierda. Sin esas dos cosas el agua se lee como una calcomanía.
    float contact = smoothstep(0.02, 0.2, water.x)
      * (1.0 - smoothstep(0.24, 0.62, water.x));
    color *= 1.0 - contact * 0.22 * uRain;

    vec3 surface = normalize(vec3(-tilt * 0.9, 1.0));
    float sheen = pow(
      clamp(dot(surface, normalize(vec3(-0.42, 0.58, 0.7))), 0.0, 1.0),
      24.0
    );
    color += uWhiteColor * sheen * body * (0.26 + uSquall * 0.22) * uRain;

    // Vaho: el cristal se empaña donde el agua no ha pasado todavía, y cada
    // estela lo abre a su paso. Es lo que hace legible el rastro de una gota:
    // sin nada que limpiar, un reguero de agua sobre vidrio limpio no se ve.
    float haze = clamp(uRain * 0.62 - water.y * 0.55 - water.x * 0.7, 0.0, 1.0);
    color = mix(color, mix(uFogColor, uWhiteColor, 0.3), haze * 0.12);

    // Salpicadura: no son gotas, es velocidad. Pulverización fina arrastrada
    // por el aire, corta y sin cuerpo; estirada de extremo a extremo dejaba de
    // leerse como agua y empezaba a parecer un arañazo en la lente.
    vec2 sprayDomain = glassFlow(vUv);
    float spray = smoothstep(0.62, 0.97, fbm(vec2(
      sprayDomain.x * 34.0,
      sprayDomain.y * 11.0 - uDrift * 3.4
    )));
    color = mix(color, mix(uFogColor, uWhiteColor, 0.72), spray * uSquall * 0.11);
  }

  color *= uLight;

  // Viñeta amplia y grano de luminancia: textura óptica, no ruido protagonista.
  float vignette = smoothstep(0.88, 0.28, length((vUv - 0.5) * vec2(0.9, 1.0)));
  color *= mix(0.68, 1.0, vignette);
  color += (dither - 0.5) * (0.008 + uWhiteout * 0.009);

  gl_FragColor = vec4(color, uOpacity);

  #include <colorspace_fragment>
}
`;

/**
 * Periodo de `uStormPhase`.
 *
 * Las rejillas de celdas —gotas, cuentas y copos— son exactamente periódicas
 * en la fase: todas tardan `DROP_LAPS` ciclos en volver a su sitio. Envolver
 * la fase en un múltiplo de este valor mantiene la precisión de `float` en
 * sesiones largas sin que se vea un solo salto. Los campos de ruido, que no
 * son periódicos, leen `uDrift`, que por eso no se envuelve nunca.
 */
export const STORM_PHASE_PERIOD = 3 / 0.62;

export type TransitionUniforms = {
  uTextureA: { value: THREE.Texture | null };
  uTextureB: { value: THREE.Texture | null };
  uTextureC: { value: THREE.Texture | null };
  uAspectA: { value: number };
  uAspectB: { value: number };
  uAspectC: { value: number };
  uFocalA: { value: THREE.Vector2 };
  uFocalB: { value: THREE.Vector2 };
  uFocalC: { value: THREE.Vector2 };
  uPanA: { value: THREE.Vector2 };
  uPanB: { value: THREE.Vector2 };
  uPanC: { value: THREE.Vector2 };
  uPlaneAspect: { value: number };
  uSceneMix: { value: number };
  uShipMix: { value: number };
  uLensMix: { value: number };
  uWhiteout: { value: number };
  uRain: { value: number };
  uSquall: { value: number };
  uDetail: { value: number };
  uDisplacement: { value: number };
  uZoomA: { value: number };
  uZoomB: { value: number };
  uZoomC: { value: number };
  uFog: { value: number };
  uLight: { value: number };
  uOpacity: { value: number };
  uTime: { value: number };
  uDrift: { value: number };
  uStormPhase: { value: number };
  uFogColor: { value: THREE.Color };
  uWhiteColor: { value: THREE.Color };
};

export type TransitionMaterial = THREE.ShaderMaterial & {
  uniforms: TransitionUniforms;
};

export function createTransitionMaterial(fogColor: string): TransitionMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTextureA: { value: null },
      uTextureB: { value: null },
      uTextureC: { value: null },
      uAspectA: { value: 16 / 9 },
      uAspectB: { value: 16 / 9 },
      uAspectC: { value: 16 / 9 },
      uFocalA: { value: new THREE.Vector2(0.5, 0.48) },
      uFocalB: { value: new THREE.Vector2(0.5, 0.5) },
      uFocalC: { value: new THREE.Vector2(0.5, 0.5) },
      uPanA: { value: new THREE.Vector2(0, 0) },
      uPanB: { value: new THREE.Vector2(0, 0) },
      uPanC: { value: new THREE.Vector2(0, 0) },
      uPlaneAspect: { value: 16 / 9 },
      uSceneMix: { value: 0 },
      uShipMix: { value: 0 },
      uLensMix: { value: 0 },
      uWhiteout: { value: 0 },
      uRain: { value: 0 },
      uSquall: { value: 0 },
      uDetail: { value: 1 },
      uDisplacement: { value: 0.008 },
      uZoomA: { value: 1.015 },
      uZoomB: { value: 1.02 },
      uZoomC: { value: 1.04 },
      uFog: { value: 0.08 },
      uLight: { value: 1 },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uDrift: { value: 0 },
      uStormPhase: { value: 0 },
      uFogColor: { value: new THREE.Color(fogColor) },
      uWhiteColor: { value: new THREE.Color('#d7e0dd') },
    },
  }) as TransitionMaterial;
}
