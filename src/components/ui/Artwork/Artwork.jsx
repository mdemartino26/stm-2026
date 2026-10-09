import { useState } from 'react'
import { cn } from '../../../utils/cn.js'
import { hashString, initials } from '../../../utils/format.js'
import styles from './Artwork.module.css'

// Fondos para el avatar de iniciales (tonos de la paleta de marca).
const TONES = ['#4a2a1e', '#5a2f1d', '#3b2923', '#6b3320', '#4d2c26', '#58301f']

/**
 * Imagen de portada o foto de artista. Si no hay imagen (o falla al cargar), muestra las iniciales.
 *   <Artwork src={url} name="Radiohead" shape="circle" />
 *
 * shape: rounded (esquinas M3) | circle | square
 * size:  px (número) o cualquier medida CSS. Sin `size`, ocupa el 100% del ancho disponible.
 */
export default function Artwork({ src, name = '', alt = '', shape = 'rounded', size, className }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = Boolean(src) && failedSrc !== src

  const style = {
    ...(size ? { width: size, height: size } : null),
    ...(showImage ? null : { background: TONES[hashString(name) % TONES.length] }),
  }

  return (
    <span
      className={cn(styles.artwork, styles[shape], className)}
      style={style}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      {showImage ? (
        <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailedSrc(src)} />
      ) : (
        <span className={styles.initials}>{initials(name)}</span>
      )}
    </span>
  )
}
