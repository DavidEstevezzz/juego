export const siteContent = {
  projectLabel: '[ Nombre del juego ]',
  eyebrow: 'Presentación interactiva / Base 01',
  headline: 'El mundo empieza aquí.',
  introduction:
    'Estructura inicial de una presentación cinematográfica para comunicar el universo, la experiencia y la ambición del videojuego a futuros socios e inversores.',
} as const;

export const chapters = [
  { id: '01', title: 'Universo', description: 'El tono, las reglas del mundo y la premisa que hacen reconocible al proyecto.' },
  { id: '02', title: 'Experiencia', description: 'La fantasía del jugador, las mecánicas esenciales y el ritmo de juego.' },
  { id: '03', title: 'Personajes', description: 'Modelos, facciones y figuras clave presentados como piezas interactivas.' },
  { id: '04', title: 'Visión', description: 'Equipo, hoja de ruta, oportunidad y una vía directa para continuar la conversación.' },
] as const;
