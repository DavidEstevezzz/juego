# Material que debemos solicitar al equipo del videojuego

## Prioridad alta

1. Logotipo en SVG o PNG transparente de alta resolución.
2. Key art horizontal sin texto y, si existe, una versión por capas.
3. Capturas o clips de gameplay sin interfaz confidencial.
4. Guía de color, tipografías y tratamiento de marca.
5. Sinopsis corta, premisa, pilares de juego y biografías aprobadas.

## Modelos 3D

No necesitamos los archivos maestros del juego. Hay que pedir exportaciones específicas para web:

- Formato preferido: `.glb` o `.gltf`.
- Un personaje o criatura protagonista y, como máximo, dos secundarios para la primera fase.
- Pose neutra y, si aporta valor, una animación idle breve.
- Malla simplificada, materiales PBR y texturas separadas.
- Texturas de 2K como base; 4K solo cuando una toma cercana lo justifique.
- Sin rigs, nombres internos, nodos, armas o elementos que no deban publicarse.
- Confirmación escrita de que el material puede mostrarse públicamente a inversores.

El equipo web comprimirá después geometría y texturas para el navegador. Nunca se publicarán directamente los modelos de producción.

## Vídeo y audio

- Máster de vídeo limpio para generar WebM/MP4 y pósteres optimizados.
- Música y ambiente en pistas independientes, con permiso para uso web.
- El sonido solo se activará tras una acción explícita del visitante.

## Flujo local de optimización

- Los archivos maestros se guardan en `source-assets/` y no se suben a Git.
- Los archivos listos para navegador se generan en `public/assets/media/`.
- `npm run assets:optimize` regenera imágenes AVIF/WebP, el loop del hero,
  el póster y el teaser 1080p.
- Los derivados sí pueden versionarse y desplegarse con la web.
