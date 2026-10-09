import { cn } from '../../../utils/cn.js'

/**
 * Texto con la escala tipográfica de Material Design 3.
 *   <Text as="h1" variant="headline-large">Título</Text>
 *   <Text variant="body-medium" color="on-surface-variant" truncate>…</Text>
 *
 * variant: display|headline|title|body|label + large|medium|small  (ej. "title-medium")
 * color:   cualquier rol de color M3 sin prefijo (ej. "on-surface-variant", "primary", "error")
 * truncate: una línea con "…" · lines: recorta a N líneas
 */
export default function Text({
  as: Tag = 'span',
  variant = 'body-medium',
  color,
  weight,
  truncate = false,
  lines,
  className,
  style,
  ...rest
}) {
  const inlineStyle = {
    ...(color ? { color: `var(--md-sys-color-${color})` } : null),
    ...(weight ? { fontWeight: weight } : null),
    ...(lines ? { '--lines': lines } : null),
    ...style,
  }
  return (
    <Tag
      className={cn(`type-${variant}`, truncate && 'text-truncate', lines && 'text-clamp', className)}
      style={inlineStyle}
      {...rest}
    />
  )
}
