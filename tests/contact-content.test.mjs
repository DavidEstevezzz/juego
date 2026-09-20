import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contactChannels, contactContent } from '../content/contact.ts';

await test('every channel points somewhere real and reachable', () => {
  const ids = new Set();
  for (const channel of contactChannels) {
    assert.equal(ids.has(channel.id), false, `duplicate channel ${channel.id}`);
    ids.add(channel.id);

    const url = new URL(channel.url);
    // Enlaces externos que se abren en otra pestaña: sin `https` no se abren
    // siquiera, y un dominio de ejemplo olvidado llegaría a producción.
    assert.equal(url.protocol, 'https:', channel.id);
    assert.doesNotMatch(
      url.hostname,
      /example|placeholder|localhost/,
      channel.id,
    );

    // El nombre accesible del enlace se compone con estos tres campos.
    for (const field of ['name', 'handle', 'description'])
      assert.ok(channel[field]?.trim().length, `${channel.id}.${field}`);
  }
  assert.deepEqual(
    [...ids],
    ['steam', 'linkedin', 'x', 'instagram', 'youtube'],
  );
});

await test('the studio address is a single usable mailto target', () => {
  const { email } = contactContent;
  assert.match(email, /^[^\s@]+@[^\s@.]+\.[^\s@]+$/);
  assert.equal(email, email.trim().toLowerCase());
  assert.doesNotMatch(email, /example|placeholder/);
});

await test('the card names every state the copy button can reach', () => {
  const labels = [
    contactContent.copyLabel,
    contactContent.copiedLabel,
    contactContent.copyFailedLabel,
  ];
  // Tres textos distintos: si dos coinciden, el acuse no se anuncia como
  // cambio y quien usa lector de pantalla no sabe si se copió.
  assert.equal(new Set(labels).size, 3);
  for (const label of labels) assert.ok(label.trim().length);
});
