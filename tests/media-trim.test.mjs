import assert from 'node:assert/strict';
import { test } from 'node:test';
import { media } from '../content/media.ts';

/**
 * Barra negra medida en `organic-growth`, como fracción del ancho.
 *
 * Tomada del propio archivo publicado, en sus cuatro variantes: tras el filo
 * de captura hay 30-32 px negros sobre 1920 y 12 px sobre 960, es decir un
 * 1,87-1,98 % por lado contando el filo. El recorte tiene que pasar de ahí.
 */
const GROWTH_BAR = 0.0198;

await test('every image declares a capture trim within a sane range', () => {
  for (const [name, image] of Object.entries(media.images)) {
    assert.equal(typeof image.trim, 'number', name);
    assert.ok(image.trim >= 0, `${name}: recorte negativo`);
    // Más de un 5 % por lado ya no es un filo de captura: es un reencuadre, y
    // ese se hace reexportando la imagen, no escalándola en pantalla.
    assert.ok(image.trim <= 0.05, `${name}: recorte desproporcionado`);
  }
});

await test('the growth plate is trimmed past its black bars', () => {
  assert.ok(
    media.images.growth.trim > GROWTH_BAR,
    'la barra negra volvería a verse en cuanto la ventana sea más ancha que 1,75:1',
  );
});

await test('the other infection plates keep the plain capture edge', () => {
  // Solo una de las tres tomas llegó apaisada. Si algún día otra necesita más
  // recorte, que sea una decisión escrita, no un valor arrastrado.
  assert.equal(media.images.blubberRoom.trim, 0.005);
  assert.equal(media.images.vessel.trim, 0.005);
});
