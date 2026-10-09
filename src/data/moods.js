// Vocabulario de moods: cada uno traduce palabras (español e inglés) a tags de Last.fm.
//
//   id        identificador estable
//   label     cómo se muestra en el chip
//   kind      feeling | activity | genre | era (agrupa las sugerencias)
//   tags      tags de Last.fm, del más al menos representativo (se usan los dos primeros)
//   keywords  palabras que activan el mood. Van sin tildes y en minúsculas.
//             Un "*" al final significa "cualquier terminación": "trist*" encuentra triste, tristeza…
//             Se pueden usar frases ("buen humor").
//
// Para sumar un mood alcanza con agregar un objeto a esta lista.
// Los géneros viven en genres.js y se unen al final de MOODS (se interpretan igual, pero se respetan al 100%).
import { GENRES } from './genres.js'

const SOFT_MOODS = [
  // --- Estados de ánimo ---
  {
    id: 'sad',
    label: 'Triste',
    kind: 'feeling',
    tags: ['sad', 'melancholic'],
    keywords: ['trist*', 'bajon', 'bajoneado*', 'deprimid*', 'depre', 'llorar', 'lloro', 'lagrimas', 'sad', 'cry', 'crying', 'down', 'angustia*', 'dolor'],
  },
  {
    id: 'melancholic',
    label: 'Melancólico',
    kind: 'feeling',
    tags: ['melancholic', 'melancholy'],
    keywords: ['melanco*', 'melancholy', 'nostalgic', 'agridulce', 'bittersweet', 'gris'],
  },
  {
    id: 'happy',
    label: 'Feliz',
    kind: 'feeling',
    tags: ['happy', 'feel good'],
    keywords: ['feliz', 'felices', 'alegre*', 'alegria', 'content*', 'contento', 'genial', 'happy', 'joy*', 'buen humor', 'buena onda', 'eufori*', 'sonriendo', 'de lujo'],
  },
  {
    id: 'energetic',
    label: 'Con energía',
    kind: 'feeling',
    tags: ['energetic', 'upbeat'],
    keywords: ['energi*', 'activ*', 'enchufad*', 'pilas', 'con ganas', 'arriba', 'energy', 'upbeat', 'hyper', 'acelerad*'],
  },
  {
    id: 'chill',
    label: 'Tranqui',
    kind: 'feeling',
    tags: ['chillout', 'chill'],
    keywords: ['relaj*', 'tranqui*', 'chill*', 'calma*', 'calm', 'paz', 'descans*', 'relax*', 'sereno', 'sereni*', 'suave', 'mellow', 'sin apuro'],
  },
  {
    id: 'romantic',
    label: 'Romántico',
    kind: 'feeling',
    tags: ['romantic', 'love'],
    keywords: ['amor', 'enamorad*', 'romant*', 'romance', 'cita', 'love', 'pareja', 'beso*', 'mariposas', 'crush', 'conquista'],
  },
  {
    id: 'heartbreak',
    label: 'Desamor',
    kind: 'feeling',
    tags: ['heartbreak', 'breakup'],
    keywords: ['ruptura', 'terminamos', 'me dejo', 'ex', 'corazon roto', 'roto', 'desamor', 'despecho', 'heartbreak', 'breakup', 'extranar*', 'extrano', 'extrano a'],
  },
  {
    id: 'angry',
    label: 'Enojo',
    kind: 'feeling',
    tags: ['angry', 'aggressive'],
    keywords: ['enoj*', 'bronca', 'furi*', 'rabia', 'harto*', 'angry', 'mad', 'cabreado*', 'indignad*', 'odio'],
  },
  {
    id: 'anxious',
    label: 'Para calmar la ansiedad',
    kind: 'feeling',
    tags: ['calm', 'ambient'],
    keywords: ['ansied*', 'ansios*', 'estres*', 'nervios*', 'anxiety', 'anxious', 'stress*', 'agobi*', 'abrumad*', 'panico'],
  },
  {
    id: 'lonely',
    label: 'Introspectivo',
    kind: 'feeling',
    tags: ['introspective', 'lonely'],
    keywords: ['soledad', 'solitari*', 'lonely', 'introspec*', 'pensativ*', 'reflexi*', 'pensando', 'ensimismad*', 'aislad*'],
  },
  {
    id: 'epic',
    label: 'Épico',
    kind: 'feeling',
    tags: ['epic', 'motivational'],
    keywords: ['motiv*', 'epic*', 'superar*', 'logro*', 'imparable', 'poderos*', 'ganador*', 'confianza', 'empoderad*'],
  },
  {
    id: 'nostalgic',
    label: 'Nostalgia',
    kind: 'feeling',
    tags: ['nostalgia', 'oldies'],
    keywords: ['nostalg*', 'recuerd*', 'infancia', 'viejos tiempos', 'de antes', 'adolescencia', 'colegio', 'secundaria', 'throwback'],
  },

  // --- Momentos y actividades ---
  {
    id: 'rain',
    label: 'Día de lluvia',
    kind: 'activity',
    tags: ['rainy day', 'mellow'],
    keywords: ['lluvi*', 'llueve', 'lloviendo', 'rain*', 'nublad*', 'tormenta', 'frio', 'otono', 'gris'],
  },
  {
    id: 'night',
    label: 'De noche',
    kind: 'activity',
    tags: ['late night', 'night'],
    keywords: ['noche', 'madrugada', 'trasnoche', 'insomnio', 'desvelad*', 'night', 'midnight', 'medianoche', 'luna'],
  },
  {
    id: 'sleep',
    label: 'Para dormir',
    kind: 'activity',
    tags: ['sleep', 'ambient'],
    keywords: ['dormir', 'sueno', 'sleep', 'siesta', 'descansar', 'acostar*', 'cama'],
  },
  {
    id: 'focus',
    label: 'Concentración',
    kind: 'activity',
    tags: ['study', 'instrumental'],
    keywords: ['estudi*', 'concentr*', 'foco', 'focus', 'trabaj*', 'work', 'programar', 'programando', 'leer', 'lectura', 'study', 'examen', 'parcial', 'tesis'],
  },
  {
    id: 'workout',
    label: 'Entrenar',
    kind: 'activity',
    tags: ['workout', 'gym'],
    keywords: ['gym', 'gimnasio', 'entren*', 'workout', 'correr', 'corriendo', 'running', 'ejercicio', 'fitness', 'cardio', 'pesas', 'crossfit', 'deporte'],
  },
  {
    id: 'party',
    label: 'Fiesta',
    kind: 'activity',
    tags: ['party', 'dance'],
    keywords: ['fiesta*', 'bailar', 'baile', 'bailando', 'party', 'dance', 'boliche', 'previa', 'joda', 'cumple*', 'salir', 'festejar', 'celebr*'],
  },
  {
    id: 'summer',
    label: 'Verano',
    kind: 'activity',
    tags: ['summer', 'beach'],
    keywords: ['verano', 'playa', 'sol', 'summer', 'beach', 'pileta', 'vacaciones', 'calor', 'mar', 'asado', 'terraza'],
  },
  {
    id: 'roadtrip',
    label: 'Viaje en auto',
    kind: 'activity',
    tags: ['road trip', 'driving'],
    keywords: ['viaje*', 'ruta', 'road trip', 'roadtrip', 'manejar', 'manejando', 'conducir', 'auto', 'carretera', 'colectivo', 'tren'],
  },
  {
    id: 'sunday',
    label: 'Domingo tranqui',
    kind: 'activity',
    tags: ['acoustic', 'mellow'],
    keywords: ['domingo*', 'mate', 'desayun*', 'cafe', 'manana', 'sobremesa', 'limpiar', 'cocinar', 'cocinando', 'ordenar'],
  },

  // --- Épocas ---
  { id: '70s', label: 'Años 70', kind: 'era', tags: ['70s', 'classic rock'], keywords: ['70s', 'setentas', 'anos 70', 'decada del 70'] },
  { id: '80s', label: 'Años 80', kind: 'era', tags: ['80s', 'new wave'], keywords: ['80s', 'ochentas', 'anos 80', 'decada del 80'] },
  { id: '90s', label: 'Años 90', kind: 'era', tags: ['90s', 'alternative'], keywords: ['90s', 'noventas', 'anos 90', 'decada del 90'] },
  { id: '2000s', label: 'Años 2000', kind: 'era', tags: ['00s', '2000s'], keywords: ['2000s', '00s', 'dosmiles', 'anos 2000', 'y2k'] },
]

export const MOODS = [...SOFT_MOODS, ...GENRES]

export const MOODS_BY_ID = Object.fromEntries(MOODS.map((mood) => [mood.id, mood]))

/** Moods que se ofrecen como atajo en la pantalla principal. */
export const SUGGESTED_MOOD_IDS = ['rain', 'workout', 'nostalgic', 'chill', 'party', 'focus', 'heartbreak', 'roadtrip', 'sunday', 'night']

/** Frases de ejemplo para el placeholder y los atajos de texto. */
export const EXAMPLE_PHRASES = [
  'Domingo de lluvia, con mate y ganas de no hacer nada',
  'Me siento con pilas y quiero salir a correr',
  'Estoy un poco triste pero con nostalgia de los 90',
  'Viaje en auto con amigos, verano y buena onda',
]
