/** Limita cuántas tareas asíncronas corren a la vez. Devuelve una función `run(tarea)`. */
export function createLimiter(max) {
  let active = 0
  const queue = []

  const next = () => {
    if (active >= max || queue.length === 0) return
    active += 1
    const { task, resolve, reject } = queue.shift()
    task()
      .then(resolve, reject)
      .finally(() => {
        active -= 1
        next()
      })
  }

  return (task) =>
    new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject })
      next()
    })
}

/** Como Promise.all(items.map(fn)) pero con un tope de tareas simultáneas. */
export function mapLimit(items, max, fn) {
  const run = createLimiter(max)
  return Promise.all(items.map((item, index) => run(() => fn(item, index))))
}
