import { Button, EmptyState } from '../../components/ui'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import styles from './NotFound.module.css'

export default function NotFound() {
  useDocumentTitle('Página no encontrada')
  return (
    <main className={styles.page}>
      <EmptyState
        icon="explore"
        title="Esta página no existe"
        description="El link está mal escrito o la página se movió."
        action={<Button to="/">Volver al inicio</Button>}
      />
    </main>
  )
}
