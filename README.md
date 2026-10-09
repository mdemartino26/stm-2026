

Readme · MD
# Set the Mood
 
**Contás cómo te sentís y la app te arma la playlist.**
 
Escribís algo como *"domingo de lluvia, con mate y nostalgia, quiero hyperpop, sin trap"* y Set the Mood interpreta tu mood, busca música que encaje y guarda la lista como una playlist privada en tu Spotify.
 
Es un proyecto de portfolio: una app React pensada para jugar con APIs de música y con un diseño basado en Material Design 3.
 
## Qué se puede hacer
 
- **Set the mood:** describís tu estado de ánimo con tus palabras (en español o en inglés). La app detecta moods, géneros y lo que querés evitar, y arma la playlist. Si nombrás un género, todas las canciones son de ese género.
- **Mezclar:** elegís 2 o 3 artistas y la playlist sale del cruce de sus similares.
- **Descubrir:** buscás un artista o una canción y encontrás música parecida.
- **Mi música:** ves los últimos artistas y las canciones más escuchadas de un usuario de Last.fm.
- **Lo que no querés escuchar:** géneros y artistas que se dejan siempre afuera, y que la app recuerda.
- **Modo demo:** se puede recorrer sin cuenta de Spotify (solo falta guardar la playlist).
## Cómo funciona
 
| Para qué | Qué usa |
| --- | --- |
| Login y guardar playlists | Spotify (PKCE, sin secret) |
| Búsqueda, fotos y portadas | Spotify |
| Música de cada mood o género, similares e historial | Last.fm (solo lectura, con API key) |
 
Desde 2026 Spotify quitó de su API las recomendaciones y los artistas relacionados, por eso la música sale de Last.fm. El texto se interpreta con un vocabulario propio de moods y géneros (`src/data`), sin IA y sin servidor.
 
**Stack:** React 18 · Vite · React Router · CSS Modules · Material Design 3.