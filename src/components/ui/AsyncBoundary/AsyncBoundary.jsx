import { friendlyError } from '../../../utils/errors.js'
import Button from '../Button/Button.jsx'
import EmptyState from '../EmptyState/EmptyState.jsx'

/**
 * Resuelve de una vez los 4 estados de una carga: cargando, error, vacío y con datos.
 *
 *   const result = useAsyncData(...)
 *   <AsyncBoundary result={result} skeleton={<Skeleton …/>} empty={<EmptyState …/>}>
 *     {(data) => <Lista items={data} />}
 *   </AsyncBoundary>
 *
 * isEmpty(data): opcional; por defecto un array vacío o null cuenta como "vacío".
 */
export default function AsyncBoundary({ result, skeleton = null, empty = null, isEmpty, children }) {
  if (result.loading) return skeleton

  if (result.error) {
    return (
      <EmptyState
        tone="error"
        icon="error"
        title="No pudimos cargar esto"
        description={friendlyError(result.error)}
        action={
          <Button variant="tonal" onClick={result.reload}>
            Reintentar
          </Button>
        }
      />
    )
  }

  const nothing = isEmpty ? isEmpty(result.data) : result.data == null || (Array.isArray(result.data) && result.data.length === 0)
  if (nothing) return empty

  return children(result.data)
}
