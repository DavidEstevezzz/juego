# Black Tides: Draga's Wake — presentación web

Base técnica para una landing cinematográfica por capítulos dirigida a socios e
inversores. Es una web React; Three.js se reserva para escenas visuales
concretas y no convierte el proyecto en un videojuego.

## Arranque local

```bash
npm install
npm run dev
```

## Comprobaciones

```bash
npm run build
npm run lint
```

## Estado

El núcleo de la experiencia (capítulos, canvas persistente y diferido, métricas
de scroll únicas, integración central de GSAP, tiers gráficos, visibilidad de
pestaña y movimiento reducido) está implementado. Cada capítulo se desarrolla
después con su propio prompt de `docs/PROMPTS-BY-SECTION.md`.

La estructura detallada está en `docs/ARCHITECTURE.md`, el guion en
`docs/EXPERIENCE-BLUEPRINT.md`, la petición de materiales en
`docs/ASSET-HANDOFF.md` y el sistema visual en `docs/VISUAL-DIRECTION.md`.
