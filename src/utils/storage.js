// Envoltorios seguros de localStorage / sessionStorage.
// Pueden lanzar errores (modo privado, cookies bloqueadas), así que nunca se usan "a pelo".

function createStore(getStorage) {
  const attempt = (fn, fallback) => {
    try {
      return fn(getStorage())
    } catch {
      return fallback
    }
  }

  return {
    get: (key) => attempt((s) => s.getItem(key), null),
    set: (key, value) => attempt((s) => (s.setItem(key, value), true), false),
    remove: (key) => attempt((s) => (s.removeItem(key), true), false),
    getJson(key, fallback = null) {
      const raw = attempt((s) => s.getItem(key), null)
      if (raw === null) return fallback
      try {
        return JSON.parse(raw)
      } catch {
        return fallback
      }
    },
    setJson: (key, value) => attempt((s) => (s.setItem(key, JSON.stringify(value)), true), false),
  }
}

export const local = createStore(() => window.localStorage)
export const session = createStore(() => window.sessionStorage)
