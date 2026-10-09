import IconButton from '../IconButton/IconButton.jsx'
import styles from './Snackbar.module.css'

/**
 * Snackbar de M3. No se usa directo: lo muestra <SnackbarProvider /> y se dispara con
 *   const { show } = useSnackbar();  show('Playlist creada', { action: { label: 'Abrir', onClick } })
 * La región "en vivo" existe siempre para que los lectores de pantalla anuncien los mensajes nuevos.
 */
export default function Snackbar({ message, onDismiss }) {
  return (
    <div className={styles.host} role="status" aria-live="polite">
      {message && (
        <div key={message.id} className={styles.snackbar}>
          <span className={styles.text}>{message.text}</span>
          {message.action && (
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                message.action.onClick?.()
                onDismiss()
              }}
            >
              {message.action.label}
            </button>
          )}
          <IconButton icon="close" label="Cerrar aviso" className={styles.close} onClick={onDismiss} />
        </div>
      )}
    </div>
  )
}
