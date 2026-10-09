import { describe, expect, it } from 'vitest'
import {
  customGenre,
  interpretMood,
  normalizeText,
  playlistNameForMoods,
  tagsForGenres,
  tagsForMoods,
} from './moodInterpreter.js'

const ids = (text) => interpretMood(text).moods.map((mood) => mood.id)

describe('normalizeText', () => {
  it('saca tildes, signos y mayúsculas', () => {
    expect(normalizeText('¡Estoy FELIZ, año 90!')).toBe('estoy feliz ano 90')
  })
})

describe('interpretMood', () => {
  it('devuelve vacío para texto vacío o sin coincidencias', () => {
    expect(ids('')).toEqual([])
    expect(ids('asdfgh qwerty')).toEqual([])
  })

  it('reconoce moods con distintas terminaciones', () => {
    expect(ids('me siento muy triste')).toContain('sad')
    expect(ids('hay mucha tristeza hoy')).toContain('sad')
  })

  it('combina varios moods de una misma frase', () => {
    const result = ids('Domingo de lluvia, con mate y nostalgia')
    expect(result).toEqual(expect.arrayContaining(['rain', 'sunday', 'nostalgic']))
  })

  it('reconoce frases de varias palabras y épocas', () => {
    expect(ids('quiero rock nacional de los años 90')).toEqual(expect.arrayContaining(['rock-es', '90s']))
  })

  it('no confunde palabras que solo contienen la raíz dentro', () => {
    expect(ids('sol')).toEqual(['summer'])
    expect(ids('solo quiero escuchar algo')).not.toContain('summer')
    expect(ids('exactamente')).not.toContain('heartbreak')
  })

  it('ignora el mood cuando está negado', () => {
    expect(ids('no estoy triste')).not.toContain('sad')
    expect(ids('nada de tristeza, quiero fiesta')).toEqual(['party'])
  })

  it('funciona en inglés', () => {
    expect(ids('feeling sad and lonely at night')).toEqual(expect.arrayContaining(['sad', 'lonely', 'night']))
  })

  it('ordena por cantidad de coincidencias y limita a 4', () => {
    const result = interpretMood('triste triste triste, con lluvia, de noche, con nostalgia y ganas de bailar')
    expect(result.moods).toHaveLength(4)
    expect(result.moods[0].id).toBe('sad')
  })
})

describe('tagsForMoods y playlistNameForMoods', () => {
  const { moods } = interpretMood('lluvia y nostalgia')

  it('junta los dos primeros tags de cada mood sin repetir', () => {
    const tags = tagsForMoods(moods)
    expect(tags).toEqual(expect.arrayContaining(['rainy day', 'nostalgia']))
    expect(new Set(tags).size).toBe(tags.length)
  })

  it('arma un nombre con los moods', () => {
    expect(playlistNameForMoods(moods)).toMatch(/^Mood · /)
    expect(playlistNameForMoods([])).toBe('Mi mood')
  })
})

describe('géneros (se respetan al 100%)', () => {
  const genreIds = (text) => interpretMood(text).moods.filter((m) => m.kind === 'genre').map((m) => m.id)
  const excludedIds = (text) => interpretMood(text).excludedGenres.map((m) => m.id)

  it('hyperpop es hyperpop y no pop', () => {
    expect(genreIds('quiero hyperpop para correr')).toEqual(['hyperpop'])
    expect(genreIds('hyper pop')).toEqual(['hyperpop'])
  })

  it('las frases largas ganan sobre sus palabras sueltas', () => {
    expect(genreIds('algo de indie pop')).toEqual(['indie-pop'])
    expect(genreIds('k-pop y j-pop')).toEqual(expect.arrayContaining(['k-pop', 'j-pop']))
    expect(genreIds('k-pop')).not.toContain('pop')
    expect(genreIds('heavy metal')).toEqual(['heavy-metal'])
    expect(genreIds('hip-hop')).toEqual(['hiphop'])
    expect(genreIds('lo-fi para estudiar')).toEqual(['lofi'])
  })

  it('los géneros van primero y no se mezclan con los moods', () => {
    const { moods } = interpretMood('estoy triste, quiero hyperpop')
    expect(moods[0]).toMatchObject({ id: 'hyperpop', kind: 'genre' })
    expect(moods.map((m) => m.id)).toContain('sad')
  })

  it('un género negado pasa a la lista de géneros a evitar', () => {
    expect(excludedIds('quiero rock pero sin reggaeton')).toEqual(['reggaeton'])
    expect(genreIds('quiero rock pero sin reggaeton')).toEqual(['rock'])
    expect(excludedIds('nada de trap')).toEqual(['trap'])
    expect(excludedIds('no quiero escuchar reggaeton')).toEqual(['reggaeton'])
  })

  it('una lista negada ("sin A y B") evita a todos', () => {
    expect(excludedIds('sin reggaeton y trap')).toEqual(expect.arrayContaining(['reggaeton', 'trap']))
    expect(excludedIds('ni jazz ni rock')).toEqual(expect.arrayContaining(['jazz', 'rock']))
  })

  it('una negación de otra frase no afecta al género', () => {
    expect(genreIds('no tengo ganas de nada, quiero rock')).toEqual(['rock'])
    expect(genreIds('no estoy triste y quiero jazz')).toEqual(['jazz'])
  })

  it('limita a 3 géneros', () => {
    expect(genreIds('rock jazz blues soul funk')).toHaveLength(3)
  })

  it('tagsForMoods ignora los géneros y tagsForGenres usa todos los sinónimos', () => {
    const { moods } = interpretMood('lluvia y rock nacional')
    expect(tagsForMoods(moods)).toEqual(expect.arrayContaining(['rainy day']))
    expect(tagsForMoods(moods)).not.toContain('rock nacional')
    expect(tagsForGenres(moods.filter((m) => m.kind === 'genre'))).toEqual(['rock en español', 'rock nacional'])
  })

  it('el nombre de la playlist pone el género primero', () => {
    expect(playlistNameForMoods(interpretMood('triste, hyperpop').moods)).toBe('Mood · Hyperpop + Triste')
  })

  it('customGenre arma un género a partir de un tag', () => {
    expect(customGenre('  dark   wave ')).toMatchObject({ id: 'tag:dark wave', label: 'Dark wave', kind: 'genre', tags: ['dark wave'] })
  })
})
