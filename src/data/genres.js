// Géneros musicales que la app reconoce. A diferencia de los moods, un género se RESPETA AL 100%:
// si aparece uno en el texto (o lo agrega el usuario), la playlist solo lleva canciones de ese género.
//
//   tags      nombres equivalentes del género en Last.fm (se usan todos, son sinónimos)
//   keywords  cómo lo puede escribir la gente (sin tildes, minúsculas; "*" = cualquier terminación).
//             Las frases más largas ganan: "indie pop" se reconoce completo y no como "indie" + "pop".
//
// Para sumar un género alcanza con agregar un objeto a esta lista.
const genre = (id, label, tags, keywords) => ({ id, label, kind: 'genre', tags, keywords })

export const GENRES = [
  // Rock y derivados
  genre('rock', 'Rock', ['rock'], ['rock', 'roquero', 'rockero']),
  genre('rock-es', 'Rock en español', ['rock en español', 'rock nacional'], ['rock nacional', 'rock en espanol', 'rock argentino', 'rock latino']),
  genre('alternative', 'Alternativo', ['alternative'], ['alternativ*', 'alternative']),
  genre('indie', 'Indie', ['indie'], ['indie', 'independiente']),
  genre('indie-rock', 'Indie rock', ['indie rock'], ['indie rock']),
  genre('punk', 'Punk', ['punk'], ['punk']),
  genre('pop-punk', 'Pop punk', ['pop punk'], ['pop punk', 'poppunk']),
  genre('post-punk', 'Post-punk', ['post-punk'], ['post punk', 'postpunk']),
  genre('emo', 'Emo', ['emo'], ['emo']),
  genre('grunge', 'Grunge', ['grunge'], ['grunge']),
  genre('shoegaze', 'Shoegaze', ['shoegaze'], ['shoegaze']),
  genre('psychedelic', 'Psicodélico', ['psychedelic'], ['psicodelic*', 'psychedelic', 'psicodelia']),
  genre('metal', 'Metal', ['metal'], ['metal', 'metalero']),
  genre('heavy-metal', 'Heavy metal', ['heavy metal'], ['heavy metal']),
  genre('death-metal', 'Death metal', ['death metal'], ['death metal']),
  genre('black-metal', 'Black metal', ['black metal'], ['black metal']),
  genre('hardcore', 'Hardcore', ['hardcore'], ['hardcore']),

  // Pop
  genre('pop', 'Pop', ['pop'], ['pop']),
  genre('hyperpop', 'Hyperpop', ['hyperpop'], ['hyperpop', 'hyper pop']),
  genre('k-pop', 'K-pop', ['k-pop', 'kpop'], ['k pop', 'kpop']),
  genre('j-pop', 'J-pop', ['j-pop', 'jpop'], ['j pop', 'jpop']),
  genre('synthpop', 'Synth-pop', ['synthpop'], ['synth pop', 'synthpop']),
  genre('electropop', 'Electropop', ['electropop'], ['electro pop', 'electropop']),
  genre('indie-pop', 'Indie pop', ['indie pop'], ['indie pop']),
  genre('dream-pop', 'Dream pop', ['dream pop'], ['dream pop', 'dreampop']),
  genre('latin-pop', 'Pop latino', ['latin pop'], ['pop latino', 'latin pop']),
  genre('new-wave', 'New wave', ['new wave'], ['new wave', 'newwave']),
  genre('city-pop', 'City pop', ['city pop'], ['city pop', 'citypop']),

  // Urbano
  genre('hiphop', 'Hip hop', ['hip-hop', 'hip hop'], ['hip hop', 'hiphop']),
  genre('rap', 'Rap', ['rap'], ['rap', 'rapero', 'rimas']),
  genre('trap', 'Trap', ['trap'], ['trap']),
  genre('drill', 'Drill', ['drill'], ['drill']),
  genre('phonk', 'Phonk', ['phonk'], ['phonk']),
  genre('rnb', 'R&B', ['rnb', 'r&b'], ['r&b', 'rnb', 'rhythm and blues']),
  genre('reggaeton', 'Reggaetón', ['reggaeton'], ['reggaeton', 'reguetón', 'regueton', 'perreo']),
  genre('dembow', 'Dembow', ['dembow'], ['dembow']),

  // Electrónica
  genre('electronic', 'Electrónica', ['electronic', 'electronica'], ['electronic*', 'electronica', 'electro']),
  genre('house', 'House', ['house'], ['house']),
  genre('techno', 'Techno', ['techno'], ['techno']),
  genre('trance', 'Trance', ['trance'], ['trance']),
  genre('dubstep', 'Dubstep', ['dubstep'], ['dubstep']),
  genre('dnb', 'Drum and bass', ['drum and bass'], ['drum and bass', 'drum n bass', 'drum n bass', 'dnb']),
  genre('edm', 'EDM', ['edm'], ['edm']),
  genre('synthwave', 'Synthwave', ['synthwave'], ['synthwave', 'synth wave']),
  genre('vaporwave', 'Vaporwave', ['vaporwave'], ['vaporwave']),
  genre('lofi', 'Lo-fi', ['lo-fi', 'lofi'], ['lo fi', 'lofi']),
  genre('ambient', 'Ambient', ['ambient'], ['ambient']),
  genre('trip-hop', 'Trip hop', ['trip-hop', 'trip hop'], ['trip hop', 'triphop']),
  genre('disco', 'Disco', ['disco'], ['disco']),

  // Raíces, jazz y clásica
  genre('jazz', 'Jazz', ['jazz'], ['jazz', 'jazzero']),
  genre('blues', 'Blues', ['blues'], ['blues']),
  genre('soul', 'Soul', ['soul'], ['soul']),
  genre('funk', 'Funk', ['funk'], ['funk']),
  genre('reggae', 'Reggae', ['reggae'], ['reggae']),
  genre('ska', 'Ska', ['ska'], ['ska']),
  genre('folk', 'Folk', ['folk'], ['folk']),
  genre('country', 'Country', ['country'], ['country']),
  genre('folklore', 'Folklore', ['folklore'], ['folklore', 'folclor*']),
  genre('singer-songwriter', 'Cantautor', ['singer-songwriter'], ['cantautor*', 'singer songwriter']),
  genre('acoustic', 'Acústico', ['acoustic'], ['acustic*', 'acoustic', 'unplugged']),
  genre('classical', 'Clásica', ['classical'], ['clasica', 'classical', 'musica clasica']),
  genre('piano', 'Piano', ['piano'], ['piano']),

  // Latinoamérica
  genre('cumbia', 'Cumbia', ['cumbia'], ['cumbia']),
  genre('cuarteto', 'Cuarteto', ['cuarteto'], ['cuarteto']),
  genre('salsa', 'Salsa', ['salsa'], ['salsa']),
  genre('bachata', 'Bachata', ['bachata'], ['bachata']),
  genre('merengue', 'Merengue', ['merengue'], ['merengue']),
  genre('tango', 'Tango', ['tango'], ['tango']),
  genre('bossa-nova', 'Bossa nova', ['bossa nova'], ['bossa nova', 'bossanova']),
  genre('flamenco', 'Flamenco', ['flamenco'], ['flamenco']),
  genre('afrobeats', 'Afrobeats', ['afrobeats'], ['afrobeat*']),
]

export const GENRES_BY_ID = Object.fromEntries(GENRES.map((item) => [item.id, item]))

/** Géneros que se ofrecen como atajo al elegir qué evitar. */
export const SUGGESTED_AVOID_GENRE_IDS = ['reggaeton', 'trap', 'metal', 'country', 'cumbia', 'pop', 'electronic', 'rap']

/** Géneros que se ofrecen como atajo al elegir uno a respetar. */
export const SUGGESTED_GENRE_IDS = ['hyperpop', 'indie', 'rock-es', 'lofi', 'jazz', 'synthwave', 'k-pop', 'trip-hop']
