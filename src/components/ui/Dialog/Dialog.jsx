import { useEffect, useId, useRef } from 'react'
import { cn } from '../../../utils/cn.js'
import Icon from '../Icon/Icon.jsx'
import Text from '../Text/Text.jsx'
import styles from './Dialog.module.css'

/**
 * Diálogo básico de M3 sobre el elemento nativo <dialog> (foco atrapado, Esc y fondo bloqueado incluidos).
 *   <Dialog open={abierto} onClose={cerrar} title="Crear playlist" icon="playlistAdd"
 *           actions={<><Button variant="text">Cancelar</Button><Button>Crear</Button></>}>
 *     …contenido…
 *   </Dialog>
 *
 * dismissible={false}: no se cierra con Esc ni haciendo clic afuera (por ejemplo mientras guarda).
 */
export default function Dialog({ open, onClose, title, icon, children, actions, dismissible = true }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (dismissible) onClose?.()
      }}
      onClick={(event) => {
        // Un clic directo sobre <dialog> (y no sobre su contenido) es un clic en el fondo
        if (dismissible && event.target === dialogRef.current) onClose?.()
      }}
    >
      {open && (
        <div className={cn(styles.surface, icon && styles.withIcon)}>
          {icon && <Icon name={icon} size={24} className={styles.icon} />}
          <Text as="h2" id={titleId} variant="headline-small" className={styles.title}>
            {title}
          </Text>
          <div className={styles.body}>{children}</div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
    </dialog>
  )
}
