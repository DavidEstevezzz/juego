# Arquitectura de la presentación web

## Objetivo

Esta aplicación es una web narrativa para presentar un videojuego. No contiene lógica de juego. Las escenas 3D, el audio y las animaciones son recursos de comunicación dentro del navegador.

## Capas

- `app/`: rutas, metadatos y estilos globales.
- `components/experience/`: componentes visuales y puntos de entrada de la experiencia.
- `content/`: textos y orden narrativo editables sin tocar los componentes.
- `lib/experience/`: estado global, detección de calidad y coordinación futura de animaciones.
- `public/assets/`: material aprobado para web, separado por tipo.
- `types/`: contratos compartidos de TypeScript.

## Tecnología instalada

- React y TypeScript sobre Vite/Vinext.
- GSAP para timelines y animaciones ligadas al scroll.
- Three.js, React Three Fiber y Drei para escenas 3D aisladas.
- Zustand para coordinar capítulo activo, calidad visual y sonido.
- Cloudflare como destino de despliegue; R2 se activará solo cuando existan recursos pesados.

## Regla de rendimiento

La portada debe mostrar texto y navegación antes de descargar escenas 3D o vídeo. Cada recurso pesado se cargará al acercarse su capítulo. Siempre existirán modos completo, reducido y accesible.
